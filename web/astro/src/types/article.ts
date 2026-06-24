/**
 * FILE: types/article.ts
 * PURPOSE: TypeScript types for islamwiki article data from iw_ Hasura schema.
 *   These are hand-crafted types matching the iw_ data model (§6.1 of spec).
 *   Replace with codegen output once @ummat/hasura-codegen-config is wired.
 * REF: P2-E3-W02-S02-T01 · p2-islamwiki-astro-vite-spec.md §6.1
 */

export type ArticleStatus = 'draft' | 'pending_review' | 'approved' | 'published';

export interface IwCategory {
  id: string;
  slug: string;
  name: string;
  parent_id?: string | null;
}

export interface IwTag {
  id: string;
  slug: string;
  name: string;
}

export interface IwAuthor {
  id: string;
  display_name: string;
}

export interface IwRevision {
  id: string;
  content_md: string;
  content_html: string;
  created_at: string;
  author?: IwAuthor | null;
  reviewed_by?: string | null;
  review_note?: string | null;
}

export interface IwCitation {
  id: string;
  source_type: 'quran' | 'hadith' | 'scholar' | 'book' | 'web' | 'other';
  source_url?: string | null;
  source_title: string;
  verified_at?: string | null;
}

export interface IwArticle {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  language: 'en' | 'ar';
  created_at: string;
  published_revision?: IwRevision | null;
  category?: IwCategory | null;
  tags?: Array<{ tag: IwTag }>;
  citations?: IwCitation[];
}

export interface IwArticleSummary {
  id: string;
  slug: string;
  title: string;
  language: 'en' | 'ar';
  created_at: string;
  category?: IwCategory | null;
  tags?: Array<{ tag: IwTag }>;
  published_revision?: Pick<IwRevision, 'created_at' | 'author'> | null;
}
