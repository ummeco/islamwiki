/**
 * FILE: components/tiptap/ArabicQuoteBlock.ts
 * PURPOSE: TipTap extension for right-to-left Arabic blockquotes with source attribution.
 *   Renders as <blockquote dir="rtl" class="arabic-quote"> with optional source field.
 *   Used for Arabic text citations in Islamic articles.
 * INPUTS: content (Arabic text), source (attribution string, optional)
 * OUTPUTS: ProseMirror node serialized to HTML + Markdown
 * CONSTRAINTS:
 *   - dir="rtl" MUST be set on the rendered element (not CSS-only).
 *   - Source attribution must be in the rendered HTML for accessibility.
 * REF: P2-E3-W02-S02-T01 · spec §7.1
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface ArabicQuoteBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    arabicQuoteBlock: {
      setArabicQuoteBlock: (attrs?: { source?: string }) => ReturnType;
    };
  }
}

export const ArabicQuoteBlock = Node.create<ArabicQuoteBlockOptions>({
  name: 'arabicQuoteBlock',

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      source: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-source'),
        renderHTML: (attributes) => {
          if (!attributes.source) return {};
          return { 'data-source': attributes.source };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'blockquote[data-type="arabic-quote"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { source, ...rest } = HTMLAttributes as { source?: string; [key: string]: unknown };
    return [
      'figure',
      { class: 'arabic-quote-block my-6' },
      [
        'blockquote',
        mergeAttributes(rest, {
          'data-type': 'arabic-quote',
          dir: 'rtl',
          lang: 'ar',
          class: 'font-arabic text-xl leading-relaxed text-gray-800 border-r-4 border-brand-mid pr-4 py-2',
        }),
        0,
      ],
      ...(source
        ? [
            [
              'figcaption',
              { class: 'text-sm text-gray-500 mt-2 text-right font-arabic', dir: 'rtl' },
              `— ${source}`,
            ],
          ]
        : []),
    ];
  },

  addCommands() {
    return {
      setArabicQuoteBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attrs);
        },
    };
  },
});
