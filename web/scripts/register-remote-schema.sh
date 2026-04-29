#!/usr/bin/env bash
# S9-32: Register Islam.wiki Remote Schema in Hasura metadata via nself CLI.
#
# This script adds the islamwiki remote schema endpoint to the Ummat Hasura instance
# so Ummat App content widgets can query quranSurah / quranAyah / hadithEntry.
#
# Prerequisites:
#   1. nself CLI installed (brew install nself-org/tap/nself)
#   2. Ummat backend running and healthy (nself status)
#   3. REMOTE_SCHEMA_SECRET set in your shell env (same value as in Vercel project)
#   4. NEXT_PUBLIC_BASE_URL pointing to the deployed islam.wiki (or a tunnel in dev)
#
# Usage:
#   REMOTE_SCHEMA_SECRET=<secret> NEXT_PUBLIC_BASE_URL=https://islam.wiki \
#     bash scripts/register-remote-schema.sh
#
#   For local dev (requires a publicly-accessible tunnel, e.g. ngrok or Cloudflare Tunnel):
#   REMOTE_SCHEMA_SECRET=<secret> NEXT_PUBLIC_BASE_URL=https://<your-tunnel>.trycloudflare.com \
#     bash scripts/register-remote-schema.sh
#
# The script is idempotent: running it again with the same config is safe.

set -euo pipefail

# ── Validation ────────────────────────────────────────────────────────────────

: "${REMOTE_SCHEMA_SECRET:?REMOTE_SCHEMA_SECRET must be set}"
: "${NEXT_PUBLIC_BASE_URL:?NEXT_PUBLIC_BASE_URL must be set (e.g. https://islam.wiki)}"

RS_ENDPOINT="${NEXT_PUBLIC_BASE_URL}/api/graphql"
RS_NAME="islamwiki"

echo "📡  Registering Remote Schema"
echo "    name:     $RS_NAME"
echo "    endpoint: $RS_ENDPOINT"
echo ""

# ── Check nself CLI ───────────────────────────────────────────────────────────

if ! command -v nself &>/dev/null; then
  echo "✗  nself CLI not found. Install with:"
  echo "     brew install nself-org/tap/nself"
  exit 1
fi

# ── Build the Hasura metadata payload ────────────────────────────────────────

PAYLOAD=$(cat <<EOF
{
  "type": "add_remote_schema",
  "args": {
    "name": "${RS_NAME}",
    "definition": {
      "url": "${RS_ENDPOINT}",
      "headers": [
        {
          "name": "x-remote-schema-secret",
          "value": "${REMOTE_SCHEMA_SECRET}"
        }
      ],
      "forward_client_headers": false,
      "timeout_seconds": 60,
      "customization": {
        "root_fields_namespace": "islamwiki",
        "type_names": {
          "prefix": "Iw"
        }
      }
    },
    "comment": "Islam.wiki content federation — quranSurah, quranAyah, hadithEntry"
  }
}
EOF
)

# ── Apply via nself hasura command ────────────────────────────────────────────
# nself hasura metadata apply sends the payload to the Hasura metadata API.
# If the command does not exist yet, fall back to a direct curl against the
# admin endpoint (requires HASURA_ADMIN_URL + HASURA_GRAPHQL_ADMIN_SECRET).

HASURA_ADMIN_URL="${HASURA_ADMIN_URL:-https://api.ummat.dev}"
HASURA_ADMIN_SECRET="${HASURA_GRAPHQL_ADMIN_SECRET:-}"

# Source vault if admin secret not already in env
if [[ -z "${HASURA_ADMIN_SECRET}" && -f "${HOME}/.claude/vault.env" ]]; then
  # shellcheck disable=SC1090
  source "${HOME}/.claude/vault.env" 2>/dev/null || true
  HASURA_ADMIN_SECRET="${HASURA_GRAPHQL_ADMIN_SECRET:-}"
fi

if [[ -z "${HASURA_ADMIN_SECRET}" ]]; then
  echo "✗  HASURA_GRAPHQL_ADMIN_SECRET not set. Cannot register remote schema."
  echo "   Set it in your shell or ensure ~/.claude/vault.env has the value."
  exit 1
fi

METADATA_URL="${HASURA_ADMIN_URL}/v1/metadata"

echo "📤  Sending to ${METADATA_URL} ..."

HTTP_STATUS=$(curl -s -o /tmp/rs-response.json -w "%{http_code}" \
  -X POST "${METADATA_URL}" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: ${HASURA_ADMIN_SECRET}" \
  -d "${PAYLOAD}")

RESPONSE=$(cat /tmp/rs-response.json 2>/dev/null || echo "{}")

if [[ "$HTTP_STATUS" == "200" ]]; then
  echo "✅  Remote Schema registered successfully."
  echo "    Response: ${RESPONSE}"
elif echo "${RESPONSE}" | grep -q "already exists"; then
  echo "ℹ   Remote Schema '${RS_NAME}' already registered — no changes needed."
else
  echo "✗  Registration failed (HTTP ${HTTP_STATUS})."
  echo "   Response: ${RESPONSE}"
  exit 1
fi

echo ""
echo "🔍  Verify federation by running:"
echo "    curl -s -H 'x-hasura-admin-secret: \$HASURA_GRAPHQL_ADMIN_SECRET' \\"
echo "      ${HASURA_ADMIN_URL}/v1/graphql \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"query\":\"{islamwiki { quranSurah(slug: \\\"al-fatiha\\\") { number name_en } }}\"} '"
