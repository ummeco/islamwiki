/**
 * Islam.wiki — Hasura Remote Schema endpoint
 *
 * Hasura calls this route at build time (introspection) and at query time to
 * resolve fields that live in the islamwiki Remote Schema. Every request from
 * Hasura includes x-remote-schema-secret for authentication.
 *
 * Phase 1 (stub): returns an empty but valid schema so Hasura can register the
 * remote schema without errors. Implement resolvers in IW v0.6+ when the
 * database content pipeline is ready.
 *
 * See: backend/docs/architecture.md — Hasura Remote Schemas
 */

import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.REMOTE_SCHEMA_SECRET

// Minimal valid GraphQL schema — expand in IW v0.6
const INTROSPECTION_RESPONSE = {
  data: {
    __schema: {
      queryType: { name: 'Query' },
      mutationType: null,
      subscriptionType: null,
      types: [
        {
          kind: 'OBJECT',
          name: 'Query',
          description: 'Islam.wiki Remote Schema',
          fields: [
            {
              name: '_islamwiki',
              description: 'Placeholder — expanded in v0.6',
              args: [],
              type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
              isDeprecated: false,
              deprecationReason: null,
            },
          ],
          inputFields: null,
          interfaces: [],
          enumValues: null,
          possibleTypes: null,
        },
      ],
      directives: [],
    },
  },
}

function unauthorized() {
  return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
}

export async function POST(req: NextRequest) {
  if (!SECRET || req.headers.get('x-remote-schema-secret') !== SECRET) {
    return unauthorized()
  }

  const body = await req.json()

  // Return empty schema for introspection queries
  if (
    typeof body.query === 'string' &&
    (body.query.includes('__schema') || body.query.includes('IntrospectionQuery'))
  ) {
    return NextResponse.json(INTROSPECTION_RESPONSE)
  }

  // Stub: return null for all fields until resolvers are implemented
  return NextResponse.json({ data: { _islamwiki: null } })
}

// Hasura also sends OPTIONS during schema registration
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-remote-schema-secret',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}
