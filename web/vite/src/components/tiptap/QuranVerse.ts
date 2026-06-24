/**
 * FILE: components/tiptap/QuranVerse.ts
 * PURPOSE: TipTap extension for structured Quran verse nodes.
 *   Renders: verse text (Arabic) + surah name + ayah number + optional translation.
 *   A structured node — not editable inline; edited via a sidebar panel.
 * INPUTS: verse (Arabic text), surah (surah name/number), ayah (number), translation (optional)
 * OUTPUTS: ProseMirror node, rendered as semantic <figure> with proper dir/lang
 * CONSTRAINTS:
 *   - Verse text rendered dir="rtl" lang="ar" always.
 *   - Translation rendered dir="ltr" (default).
 *   - surah and ayah are required — block creation is rejected without them.
 * REF: P2-E3-W02-S02-T01 · spec §7.1 · theology-standards.md (authentic Quran text only)
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface QuranVerseOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface QuranVerseAttrs {
  verse: string;
  surah: string | number;
  ayah: number;
  translation?: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    quranVerse: {
      insertQuranVerse: (attrs: QuranVerseAttrs) => ReturnType;
    };
  }
}

export const QuranVerse = Node.create<QuranVerseOptions>({
  name: 'quranVerse',

  group: 'block',

  atom: true,     // Cannot be split or partially selected

  addAttributes() {
    return {
      verse: { default: '' },
      surah: { default: '' },
      ayah: { default: 0 },
      translation: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="quran-verse"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { verse, surah, ayah, translation } = HTMLAttributes as QuranVerseAttrs & Record<string, unknown>;

    return [
      'figure',
      mergeAttributes({ 'data-type': 'quran-verse', class: 'quran-verse my-6 rounded-lg bg-brand-light/10 p-4' }),
      // Arabic verse text
      [
        'p',
        {
          dir: 'rtl',
          lang: 'ar',
          class: 'font-arabic text-2xl leading-loose text-gray-900 text-right mb-3',
        },
        verse,
      ],
      // Reference line
      [
        'cite',
        { class: 'block text-sm text-brand-dark font-medium' },
        `Surah ${surah}, Ayah ${ayah}`,
      ],
      // Optional translation
      ...(translation
        ? [
            [
              'p',
              { class: 'text-sm text-gray-600 mt-2 italic', dir: 'ltr' },
              `"${translation}"`,
            ],
          ]
        : []),
    ];
  },

  addCommands() {
    return {
      insertQuranVerse:
        (attrs: QuranVerseAttrs) =>
        ({ commands }) => {
          if (!attrs.surah || !attrs.ayah || !attrs.verse) return false;
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
