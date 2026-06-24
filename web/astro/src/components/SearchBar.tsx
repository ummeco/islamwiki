/**
 * FILE: components/SearchBar.tsx
 * PURPOSE: Client-side React island for search input.
 *   Submits to /search?q= on the Astro read surface.
 *   Used client:load / client:visible depending on placement.
 * INPUTS: defaultQuery (string), locale (string), placeholder (string)
 * REF: P2-E3-W02-S02-T01 · spec §11.1
 */

import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  defaultQuery?: string;
  locale?: string;
  placeholder?: string;
}

export default function SearchBar({
  defaultQuery = '',
  locale = 'en',
  placeholder = 'Search Islamic articles...',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    const params = new URLSearchParams({ q: query.trim() });
    if (locale !== 'en') params.set('locale', locale);
    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto" role="search">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search Islam.wiki"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-mid text-gray-900"
        minLength={2}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-brand-mid text-white rounded-lg hover:bg-brand-dark transition-colors font-medium"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
}
