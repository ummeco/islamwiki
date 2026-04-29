/**
 * S9-11: Meilisearch client factory.
 * - searchClient: public key — safe in browser/RSC for read-only search
 * - adminSearchClient: admin key — server-only for indexing operations
 *
 * The meilisearch package (already in dependencies) is used directly.
 */
import { MeiliSearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST ?? process.env.MEILISEARCH_URL ?? ''

/** Public search client — read-only, safe for browser use */
export const searchClient = new MeiliSearch({
  host,
  apiKey: process.env.MEILISEARCH_SEARCH_KEY ?? process.env.MEILISEARCH_KEY ?? '',
})

/**
 * Admin search client — for indexing operations only.
 * Never import this in client components or pages — server-only.
 */
export const adminSearchClient = new MeiliSearch({
  host,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY ?? process.env.MEILISEARCH_KEY ?? '',
})
