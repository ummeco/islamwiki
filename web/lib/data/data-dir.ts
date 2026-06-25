/**
 * lib/data/data-dir.ts — Resolve the on-disk content data directory.
 *
 * PURPOSE: Central, build-tracer-opaque accessor for the `data/` content corpus root.
 *
 * WHY THIS EXISTS (critical): The fs-backed readers in lib/data/* read per-record JSON
 *   with calls like `join(process.cwd(), 'data', 'quran', 'ayahs', '001.json')`. When such
 *   a call uses only STATIC, statically-resolvable arguments, Vercel's static file tracer
 *   (@vercel/nft) folds the path, decides the entire `data/` subtree is a required asset,
 *   and copies all ~1GB of it into every serverless function that transitively imports the
 *   reader (api/graphql, api/seerah, daily, etc.) — blowing the function past the 250MB
 *   limit. By sourcing the base directory through this indirection (an env var read +
 *   string concat that nft cannot constant-fold), nft stops auto-bundling `data/`.
 *
 *   Build-time prerendering is UNAFFECTED: at `astro build` the data files are read from
 *   the real project root (process.cwd()), exactly as before — static pages still embed
 *   their content at build. The two on-demand SSR content pages and the runtime API
 *   routes that need per-request reads instead fetch from the static `/content-data/`
 *   assets via lib/data/runtime-data.ts; they no longer rely on bundled files.
 *
 * INPUTS: optional CONTENT_DATA_DIR env override.
 * OUTPUTS: absolute path to the data corpus root.
 * CONSTRAINTS: server-only; the returned value MUST stay non-constant-foldable so nft
 *   never treats `data/**` as a traced asset. Do not inline this back to a literal.
 * REF: P2 fix — externalize content corpus from the Vercel function · D-P2-STACK-CANON
 */
import 'server-only'
import { join } from 'path'

/**
 * Returns the content data root. The `process.env` read keeps the expression dynamic so
 * the Vercel/nft tracer cannot statically resolve downstream join() paths into `data/`
 * and therefore will not bundle the corpus into the function.
 */
export function dataDir(): string {
  const override = process.env.CONTENT_DATA_DIR
  if (override) return override
  // Non-foldable concat (cwd + runtime-chosen segment) defeats nft static path analysis.
  const seg = process.env.CONTENT_DATA_SUBDIR || 'data'
  return join(process.cwd(), seg)
}
