/**
 * FILE: pages/editor/NewArticlePage.tsx
 * PURPOSE: Create new article — form for title, slug, language, category; then redirects to EditPage.
 * REF: P2-E3-W02-S02-T01 · spec §7.2
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'urql';

const LIST_CATEGORIES = `
  query ListCategories { iw_categories(order_by: { name: asc }) { id slug name } }
`;

const CREATE_ARTICLE = `
  mutation CreateArticle($title: String!, $slug: String!, $language: String!, $category_id: uuid!) {
    insert_iw_articles_one(object: {
      title: $title, slug: $slug, language: $language, category_id: $category_id, status: "draft"
    }) { id slug }
  }
`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function NewArticlePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [{ data: catData }] = useQuery({ query: LIST_CATEGORIES });
  const [, createArticle] = useMutation(CREATE_ARTICLE);

  const categories = (catData as { iw_categories: { id: string; slug: string; name: string }[] } | null)
    ?.iw_categories ?? [];

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !categoryId) {
      setError('Title, slug, and category are required.');
      return;
    }

    setCreating(true);
    setError(null);

    const result = await createArticle({
      title: title.trim(),
      slug: slug.trim(),
      language,
      category_id: categoryId,
    });

    if (result.error) {
      setError(result.error.message);
      setCreating(false);
      return;
    }

    const newSlug = (result.data as { insert_iw_articles_one: { slug: string } } | null)
      ?.insert_iw_articles_one?.slug;

    if (newSlug) {
      navigate(`/edit/${newSlug}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <a href="https://islam.wiki" className="text-brand-dark font-semibold text-sm">
          ← Islam.wiki
        </a>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">New Article</h1>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-mid focus:outline-none"
              placeholder="Article title"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span aria-hidden="true">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-mid focus:outline-none font-mono text-sm"
              placeholder="article-slug"
            />
            <p className="mt-1 text-xs text-gray-500">URL: islam.wiki/wiki/{slug || 'article-slug'}</p>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language <span aria-hidden="true">*</span>
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-mid focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span aria-hidden="true">*</span>
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-mid focus:outline-none"
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 bg-brand-mid text-white font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating…' : 'Create Article'}
          </button>
        </form>
      </main>
    </div>
  );
}
