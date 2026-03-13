import React from 'react'

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export interface Heading { id: string; level: 2 | 3; text: string }

export function extractHeadings(content: string): Heading[] {
  const out: Heading[] = []
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) out.push({ id: slugify(line.slice(3)), level: 2, text: line.slice(3) })
    else if (line.startsWith('### ')) out.push({ id: slugify(line.slice(4)), level: 3, text: line.slice(4) })
  }
  return out
}

// Parse inline markdown: **bold**, *italic*, [text](url)
function renderInline(text: string, keyPrefix: string): React.ReactNode {
  // Pattern: **bold** | *italic* | [text](url)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/)
  if (parts.length === 1) return text

  return (
    <>
      {parts.map((part, idx) => {
        const key = `${keyPrefix}-${idx}`
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={key} className="font-semibold text-white/90">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={key}>{part.slice(1, -1)}</em>
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
          const isExternal = linkMatch[2].startsWith('http')
          return (
            <a
              key={key}
              href={linkMatch[2]}
              className="text-iw-accent hover:text-iw-accent-light underline underline-offset-2"
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {linkMatch[1]}
            </a>
          )
        }
        return part
      })}
    </>
  )
}

export function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      const text = line.slice(3)
      nodes.push(
        <h2 key={i} id={slugify(text)} className="mt-8 scroll-mt-28 text-xl font-bold text-white">
          {renderInline(text, `h2-${i}`)}
        </h2>
      )
      i++
    } else if (line.startsWith('### ')) {
      const text = line.slice(4)
      nodes.push(
        <h3 key={i} id={slugify(text)} className="mt-6 scroll-mt-28 text-base font-semibold text-white/90">
          {renderInline(text, `h3-${i}`)}
        </h3>
      )
      i++
    } else if (line.startsWith('> ')) {
      // Collect consecutive blockquote lines
      const start = i
      const bqLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        bqLines.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <blockquote
          key={start}
          className="my-4 border-l-4 border-iw-accent/40 pl-4 text-iw-text-muted italic"
        >
          {bqLines.map((t, j) => (
            <p key={j} className="leading-relaxed">{renderInline(t, `bq-${start}-${j}`)}</p>
          ))}
        </blockquote>
      )
    } else if (line.startsWith('- ')) {
      const start = i
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={start} className="ml-4 list-disc space-y-1 text-iw-text-secondary">
          {items.map((t, j) => (
            <li key={j}>{renderInline(t, `li-${start}-${j}`)}</li>
          ))}
        </ul>
      )
    } else if (line.trim() === '') {
      i++
    } else {
      nodes.push(
        <p key={i} className="leading-relaxed text-iw-text-secondary">
          {renderInline(line, `p-${i}`)}
        </p>
      )
      i++
    }
  }
  return nodes
}
