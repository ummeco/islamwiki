/**
 * Meilisearch filter sanitization
 *
 * Builds safe Meilisearch filter strings from structured clause objects.
 * Rejects raw filter strings — never pass user input directly to Meilisearch.
 *
 * Security rationale: Meilisearch filter syntax supports arbitrary field
 * names, geo functions, and boolean operators. Passing raw user strings allows
 * filter injection (field bypass, _geoRadius exploitation, information disclosure).
 * This module enforces a strict allowlist of fields and sanitizes all values.
 */

export type AllowedField = 'lang' | 'language' | 'type' | 'collection' | 'category' | 'source' | 'verified'

export type Op = '=' | '!=' | 'IN' | 'NOT IN'

export interface FilterClause {
  field: AllowedField
  op: Op
  value: string | string[]
}

const ALLOWED_FIELDS: readonly AllowedField[] = [
  'lang',
  'language',
  'type',
  'collection',
  'category',
  'source',
  'verified',
]

/**
 * Characters/patterns that must never appear inside a filter value.
 * Meilisearch filter strings are parsed by the engine — values inside
 * double quotes are treated literally, but we still strip double-quote
 * characters to prevent quote escaping attacks.
 */
const FORBIDDEN_VALUE_PATTERN = /["\\]/g

/**
 * Operator keywords that must not appear literally inside a value string.
 * These would only be dangerous if the value were not quoted, but we
 * reject them defensively.
 */
const FORBIDDEN_VALUE_KEYWORDS = /\b(AND|OR|NOT|IN|NULL|TRUE|FALSE)\b/i

/**
 * Sanitize a single filter value. Strips forbidden chars, rejects reserved keywords.
 * Throws if the value cannot be made safe.
 */
function sanitizeValue(raw: string): string {
  if (FORBIDDEN_VALUE_KEYWORDS.test(raw)) {
    throw new Error(
      `Filter value "${raw}" contains a reserved keyword. Use literal values only.`
    )
  }
  // Strip double-quotes and backslashes — values are always wrapped in double-quotes
  return raw.replace(FORBIDDEN_VALUE_PATTERN, '')
}

/**
 * Build a safe Meilisearch filter string from structured clauses joined with AND.
 *
 * Output examples:
 *   [{ field:'lang', op:'=', value:'en' }]
 *     → 'lang = "en"'
 *
 *   [{ field:'type', op:'IN', value:['quran','hadith'] }]
 *     → 'type IN ["quran", "hadith"]'
 *
 *   [{ field:'lang', op:'=', value:'en' }, { field:'category', op:'!=', value:'sect' }]
 *     → 'lang = "en" AND category != "sect"'
 *
 * @throws {Error} if any field is not in the allowlist or value contains injection payload
 */
export function buildSafeFilter(clauses: FilterClause[]): string {
  if (clauses.length === 0) return ''

  const parts: string[] = []

  for (const clause of clauses) {
    // Field allowlist check
    if (!(ALLOWED_FIELDS as readonly string[]).includes(clause.field)) {
      throw new Error(
        `Filter field "${clause.field}" is not allowed. Allowed fields: ${ALLOWED_FIELDS.join(', ')}.`
      )
    }

    const { field, op, value } = clause

    if (op === 'IN' || op === 'NOT IN') {
      if (!Array.isArray(value)) {
        throw new Error(`Filter op "${op}" requires an array value for field "${field}".`)
      }
      if (value.length === 0) {
        throw new Error(`Filter op "${op}" requires at least one value for field "${field}".`)
      }
      const sanitized = value.map(sanitizeValue)
      const list = sanitized.map((v) => `"${v}"`).join(', ')
      parts.push(`${field} ${op} [${list}]`)
    } else {
      // '=' or '!='
      if (Array.isArray(value)) {
        throw new Error(`Filter op "${op}" requires a scalar value for field "${field}".`)
      }
      const sanitized = sanitizeValue(value)
      parts.push(`${field} ${op} "${sanitized}"`)
    }
  }

  return parts.join(' AND ')
}

/**
 * Parse and validate a structured filters array from an API request body.
 * Returns the validated clauses or throws with a descriptive message.
 *
 * Expected input shape:
 *   [{ "field": "lang", "op": "=", "value": "en" }]
 */
export function parseFilterClauses(input: unknown): FilterClause[] {
  if (!Array.isArray(input)) {
    throw new Error('filters must be an array of filter clause objects.')
  }

  return input.map((item: unknown, i: number) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`filters[${i}] must be an object.`)
    }

    const obj = item as Record<string, unknown>

    if (typeof obj.field !== 'string' || !obj.field) {
      throw new Error(`filters[${i}].field must be a non-empty string.`)
    }
    if (typeof obj.op !== 'string' || !['=', '!=', 'IN', 'NOT IN'].includes(obj.op)) {
      throw new Error(`filters[${i}].op must be one of: =, !=, IN, NOT IN.`)
    }
    if (
      typeof obj.value !== 'string' &&
      !(Array.isArray(obj.value) && obj.value.every((v: unknown) => typeof v === 'string'))
    ) {
      throw new Error(`filters[${i}].value must be a string or array of strings.`)
    }

    return {
      field: obj.field as AllowedField,
      op: obj.op as Op,
      value: obj.value as string | string[],
    }
  })
}
