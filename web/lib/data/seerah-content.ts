import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'data', 'seerah', 'content')

/**
 * Returns the full markdown content for a seerah event, or null if no file exists.
 * Called at build time in Server Components — safe to use fs directly.
 */
export function getSeerahContent(slug: string): string | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`)
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
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
