import 'server-only'

const HASURA_URL = process.env.HASURA_ADMIN_URL ?? process.env.NEXT_PUBLIC_HASURA_URL!
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!

/**
 * Execute a GraphQL query/mutation against Hasura using the admin secret.
 * Server-only — never import this in client components.
 */
export async function hasuraAdmin<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}
