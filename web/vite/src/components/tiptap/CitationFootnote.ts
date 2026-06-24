/**
 * FILE: components/tiptap/CitationFootnote.ts
 * PURPOSE: TipTap inline extension for structured source citations.
 *   Renders as a superscript footnote number inline; full citation in article footer.
 *   Metadata: source_type, source_url, source_title.
 * INPUTS: index (footnote number), source_type, source_title, source_url (optional)
 * OUTPUTS: ProseMirror inline node, rendered as <sup> with link
 * CONSTRAINTS:
 *   - index must be a positive integer assigned at render time.
 *   - source_title is required — no anonymous citations.
 * REF: P2-E3-W02-S02-T01 · spec §7.1
 */

import { Node, mergeAttributes } from '@tiptap/core';

export type CitationSourceType = 'quran' | 'hadith' | 'scholar' | 'book' | 'web' | 'other';

export interface CitationFootnoteAttrs {
  index: number;
  source_type: CitationSourceType;
  source_title: string;
  source_url?: string | null;
}

export interface CitationFootnoteOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citationFootnote: {
      insertCitationFootnote: (attrs: CitationFootnoteAttrs) => ReturnType;
    };
  }
}

export const CitationFootnote = Node.create<CitationFootnoteOptions>({
  name: 'citationFootnote',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      index: { default: 1 },
      source_type: { default: 'other' },
      source_title: { default: '' },
      source_url: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'sup[data-type="citation-footnote"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { index, source_type, source_title, source_url } =
      HTMLAttributes as CitationFootnoteAttrs & Record<string, unknown>;

    const inner = source_url
      ? [
          'a',
          {
            href: source_url,
            target: '_blank',
            rel: 'noopener noreferrer',
            title: `${source_type}: ${source_title}`,
            class: 'text-brand-mid hover:text-brand-dark',
          },
          `[${index}]`,
        ]
      : ['span', { title: `${source_type}: ${source_title}` }, `[${index}]`];

    return [
      'sup',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'citation-footnote',
        class: 'text-xs font-medium',
      }),
      inner,
    ];
  },

  addCommands() {
    return {
      insertCitationFootnote:
        (attrs: CitationFootnoteAttrs) =>
        ({ commands }) => {
          if (!attrs.source_title) return false;
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
