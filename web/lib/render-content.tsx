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
          {text}
        </h2>
      )
      i++
    } else if (line.startsWith('### ')) {
      const text = line.slice(4)
      nodes.push(
        <h3 key={i} id={slugify(text)} className="mt-6 scroll-mt-28 text-base font-semibold text-white/90">
          {text}
        </h3>
      )
      i++
    } else if (line.startsWith('- ')) {
      const start = i
      const texts: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        texts.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={start} className="ml-4 list-disc space-y-1 text-iw-text-secondary">
          {texts.map((t, j) => <li key={j}>{t}</li>)}
        </ul>
      )
    } else if (line.trim() === '') {
      nodes.push(<br key={i} />)
      i++
    } else {
      nodes.push(
        <p key={i} className="leading-relaxed text-iw-text-secondary">
          {line}
        </p>
      )
      i++
    }
  }
  return nodes
}
