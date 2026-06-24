/**
 * FILE: components/editor/EditorToolbar.tsx
 * PURPOSE: Rich text editor toolbar with formatting controls + Islamic extension buttons.
 *   Buttons: Bold, Italic, Heading, List, Link, | ArabicQuote, QuranVerse, HadithBlock, Citation, | Save
 * INPUTS: editor (TipTap Editor instance), onSave (callback)
 * REF: P2-E3-W02-S02-T01 · spec §7.1
 */

import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor;
  onSave?: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={[
        'px-2 py-1.5 rounded text-sm font-medium transition-colors',
        isActive
          ? 'bg-brand-mid text-white'
          : 'text-gray-700 hover:bg-gray-100',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" aria-hidden="true" />;
}

export default function EditorToolbar({ editor, onSave }: EditorToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50"
      role="toolbar"
      aria-label="Text formatting"
    >
      {/* Standard formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        isActive={editor.isActive('link')}
        title="Insert Link"
      >
        Link
      </ToolbarButton>

      <Divider />

      {/* Islamic extensions */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setArabicQuoteBlock().run()}
        isActive={editor.isActive('arabicQuoteBlock')}
        title="Arabic Quote Block (RTL blockquote)"
      >
        <span className="font-arabic">ع</span> Quote
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const verse = prompt('Enter Quran verse (Arabic):');
          const surah = prompt('Surah name or number:');
          const ayahStr = prompt('Ayah number:');
          const translation = prompt('Translation (optional):');
          if (verse && surah && ayahStr) {
            editor.chain().focus().insertQuranVerse({
              verse,
              surah,
              ayah: parseInt(ayahStr, 10),
              translation: translation || null,
            }).run();
          }
        }}
        title="Insert Quran Verse"
      >
        ☪ Verse
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const matn = prompt('Hadith text (Arabic matn):');
          const collection = prompt('Collection (e.g. Bukhari, Muslim):');
          const grading = prompt('Grading (sahih/hasan/da_if/muttafaq_alayh):') ?? 'sahih';
          const chain = prompt('Narrator chain (optional):');
          if (matn && collection) {
            editor.chain().focus().insertHadithBlock({
              matn,
              collection,
              grading: grading as 'sahih',
              chain: chain || null,
            }).run();
          }
        }}
        title="Insert Hadith Block"
      >
        ﷺ Hadith
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const source_title = prompt('Source title:');
          const source_url = prompt('Source URL (optional):');
          const source_type = prompt('Type (quran/hadith/scholar/book/web):') ?? 'other';
          if (source_title) {
            // Count existing footnotes for the index
            const index = (editor.getHTML().match(/data-type="citation-footnote"/g) ?? []).length + 1;
            editor.chain().focus().insertCitationFootnote({
              index,
              source_type: source_type as 'other',
              source_title,
              source_url: source_url || null,
            }).run();
          }
        }}
        title="Insert Citation Footnote"
      >
        [n] Cite
      </ToolbarButton>

      <Divider />

      {/* Save */}
      {onSave && (
        <ToolbarButton onClick={onSave} title="Save draft (Ctrl+S)">
          Save
        </ToolbarButton>
      )}
    </div>
  );
}
