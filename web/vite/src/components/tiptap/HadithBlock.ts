/**
 * FILE: components/tiptap/HadithBlock.ts
 * PURPOSE: TipTap extension for structured Hadith nodes.
 *   Fields: matn (text), chain (isnad/narrator chain), grading (sahih/hasan/da'if/etc.),
 *   collection (Bukhari/Muslim/etc.).
 *   Rendered as a styled figure with semantic markup.
 * INPUTS: matn, chain, grading, collection (all required)
 * OUTPUTS: ProseMirror atom node, rendered HTML
 * CONSTRAINTS:
 *   - grading must be one of the canonical grades — theology gate validates.
 *   - collection must reference a known hadith collection — no fabricated citations.
 *   - matn rendered dir="rtl" lang="ar" for Arabic text.
 * REF: P2-E3-W02-S02-T01 · spec §7.1 · theology-standards.md
 */

import { Node, mergeAttributes } from '@tiptap/core';

export type HadithGrading = 'sahih' | 'hasan' | 'da_if' | 'mawdu' | 'muttafaq_alayh' | 'hasan_sahih';

export interface HadithBlockAttrs {
  matn: string;
  chain?: string | null;
  grading: HadithGrading;
  collection: string;
}

export interface HadithBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hadithBlock: {
      insertHadithBlock: (attrs: HadithBlockAttrs) => ReturnType;
    };
  }
}

const GRADING_LABELS: Record<HadithGrading, string> = {
  sahih: 'Sahih (Authentic)',
  hasan: 'Hasan (Good)',
  da_if: "Da'if (Weak)",
  mawdu: "Mawdu' (Fabricated)",
  muttafaq_alayh: 'Muttafaq Alayh (Agreed Upon)',
  hasan_sahih: 'Hasan Sahih',
};

const GRADING_COLORS: Record<HadithGrading, string> = {
  sahih: 'text-green-700 bg-green-50',
  hasan: 'text-blue-700 bg-blue-50',
  da_if: 'text-yellow-700 bg-yellow-50',
  mawdu: 'text-red-700 bg-red-50',
  muttafaq_alayh: 'text-green-800 bg-green-100',
  hasan_sahih: 'text-teal-700 bg-teal-50',
};

export const HadithBlock = Node.create<HadithBlockOptions>({
  name: 'hadithBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      matn: { default: '' },
      chain: { default: null },
      grading: { default: 'sahih' },
      collection: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="hadith-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { matn, chain, grading, collection } = HTMLAttributes as HadithBlockAttrs & Record<string, unknown>;
    const gradingLabel = GRADING_LABELS[grading as HadithGrading] ?? grading;
    const gradingColor = GRADING_COLORS[grading as HadithGrading] ?? 'text-gray-700 bg-gray-50';

    return [
      'figure',
      mergeAttributes({
        'data-type': 'hadith-block',
        class: 'hadith-block my-6 border border-gray-200 rounded-lg overflow-hidden',
      }),
      // Header: collection + grading
      [
        'div',
        { class: 'flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200' },
        ['span', { class: 'font-semibold text-gray-700 text-sm' }, collection],
        [
          'span',
          { class: `text-xs font-medium px-2 py-0.5 rounded-full ${gradingColor}` },
          gradingLabel,
        ],
      ],
      // Matn (hadith text)
      [
        'blockquote',
        {
          dir: 'rtl',
          lang: 'ar',
          class: 'font-arabic text-lg leading-loose p-4 text-gray-900',
        },
        matn,
      ],
      // Chain (isnad) if provided
      ...(chain
        ? [
            [
              'p',
              { class: 'px-4 pb-3 text-xs text-gray-500 font-arabic', dir: 'rtl' },
              `السند: ${chain}`,
            ],
          ]
        : []),
    ];
  },

  addCommands() {
    return {
      insertHadithBlock:
        (attrs: HadithBlockAttrs) =>
        ({ commands }) => {
          if (!attrs.matn || !attrs.collection || !attrs.grading) return false;
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
