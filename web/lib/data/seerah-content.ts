import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'data', 'seerah', 'content')
const HISTORY_CONTENT_DIR = path.join(process.cwd(), 'data', 'history', 'content')

/**
 * Returns the full markdown content for a seerah/history event.
 * Tries locale-specific file first ({slug}.{locale}.md), falls back to {slug}.md.
 * Called at build time in Server Components — safe to use fs directly.
 */
export function getSeerahContent(slug: string, locale?: string): string | null {
  if (locale && locale !== 'en') {
    const localizedPath = path.join(CONTENT_DIR, `${slug}.${locale}.md`)
    try {
      return fs.readFileSync(localizedPath, 'utf-8')
    } catch {
      // Fall through to default
    }
  }
  const filePath = path.join(CONTENT_DIR, `${slug}.md`)
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Returns the full markdown content for a history event.
 * Tries locale-specific file ({slug}.{locale}.md), falls back to {slug}.md.
 * Falls back to seerah content dir if not found in history dir (some events share slugs).
 */
export function getHistoryContent(slug: string, locale?: string): string | null {
  const dirs = [HISTORY_CONTENT_DIR, CONTENT_DIR]
  for (const dir of dirs) {
    if (locale && locale !== 'en') {
      const localizedPath = path.join(dir, `${slug}.${locale}.md`)
      try {
        return fs.readFileSync(localizedPath, 'utf-8')
      } catch {
        // Fall through
      }
    }
    const filePath = path.join(dir, `${slug}.md`)
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch {
      // Try next dir
    }
  }
  return null
}

/**
 * Returns a list of all slugs that have a content file.
 */
export function getSeerahContentSlugs(): string[] {
  try {
    return fs
      .readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  } catch {
    return []
  }
}
