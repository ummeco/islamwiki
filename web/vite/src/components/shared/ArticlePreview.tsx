/**
 * FILE: components/shared/ArticlePreview.tsx
 * PURPOSE: Renders article HTML content for review preview.
 *   Applies RTL direction for Arabic articles.
 * INPUTS: contentHtml (string), language ('en'|'ar')
 * CONSTRAINTS:
 *   - dangerouslySetInnerHTML is acceptable here — content comes from trusted Hasura
 *     and was sanitized on write by the backend. No direct user input.
 * REF: P2-E3-W02-S02-T01 · spec §11.2
 */

interface ArticlePreviewProps {
  contentHtml: string;
  language?: 'en' | 'ar';
  className?: string;
}

export default function ArticlePreview({
  contentHtml,
  language = 'en',
  className = '',
}: ArticlePreviewProps) {
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      lang={language}
      className={`prose prose-lg max-w-none bg-white border border-gray-200 rounded-lg p-6 ${language === 'ar' ? 'font-arabic' : ''} ${className}`}
      // Content is from trusted Hasura source, sanitized on write
      dangerouslySetInnerHTML={{ __html: contentHtml }}
      aria-label="Article preview"
    />
  );
}
