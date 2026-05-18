import 'server-only'

/**
 * FILE:     lib/ai/nself-ai-client.ts
 * PURPOSE:  nself-ai HTTP client — routes AI calls through the nself-ai action handler
 *           per D-P3-44. Replaces direct @anthropic-ai/sdk usage.
 *
 *           When NSELF_AI_URL is set, all chat() calls go through nself-ai.
 *           When unset (Track A6 not yet deployed), returns null and service.ts
 *           falls back to the direct SDK (transitional — remove fallback after Track A6).
 *
 * INVARIANTS:
 *   - Uses Hasura action handler, not direct Anthropic API
 *   - Server-only — never import in client components
 *   - NSELF_AI_URL must point to the nself-ai action endpoint (e.g. /api/actions/ai-chat)
 * DO NOT: Import @anthropic-ai/sdk here — this file IS the replacement
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface NselfAiResponse {
  content: string
  model: string
  provider: string
  tokens?: { input: number; output: number }
}

/**
 * Check whether the nself-ai action handler is configured.
 * Returns false when NSELF_AI_URL is not set (Track A6 not yet deployed).
 */
export function isNselfAiAvailable(): boolean {
  return Boolean(process.env.NSELF_AI_URL)
}

/**
 * Send a chat request to the nself-ai action handler.
 * Throws if the request fails or the endpoint is not configured.
 */
export async function nselfAiChat(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; model?: string }
): Promise<NselfAiResponse> {
  const url = process.env.NSELF_AI_URL
  if (!url) {
    throw new Error(
      'NSELF_AI_URL is not set. Configure the nself-ai action handler endpoint (Track A6).'
    )
  }

  const body = {
    messages,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.3,
    model: options?.model ?? process.env.NSELF_AI_MODEL ?? 'claude-sonnet-4-6',
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? '',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`nself-ai request failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<NselfAiResponse>
}
