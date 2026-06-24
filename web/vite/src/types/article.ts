/**
 * FILE: src/types/article.ts
 * PURPOSE: TypeScript types for islamwiki editor — matches iw_ Hasura schema (§6.1).
 *   Includes article status machine states and editor-specific types.
 * REF: P2-E3-W02-S02-T01 · spec §6.1 §5.3
 */

export type ArticleStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';

export type ArticleLanguage = 'en' | 'ar';

export type TheologyCheckStatus = 'pending' | 'passed' | 'failed' | 'needs_review';

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
  article_id: string;
  content_md: string;
  content_html: string;
  created_at: string;
  author?: IwAuthor | null;
  reviewed_by?: string | null;
  review_note?: string | null;
}

export interface IwTheologyCheck {
  id: string;
  revision_id: string;
  status: TheologyCheckStatus;
  flags?: string[];
  created_at: string;
  completed_at?: string | null;
}

export interface IwArticle {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  language: ArticleLanguage;
  category_id?: string | null;
  created_at: string;
  published_revision_id?: string | null;
  published_revision?: IwRevision | null;
  category?: IwCategory | null;
  tags?: Array<{ tag: IwTag }>;
  revisions?: IwRevision[];
}

/** Editor draft state — kept in component state, not persisted until SaveDraft */
export interface EditorDraft {
  title: string;
  slug: string;
  language: ArticleLanguage;
  category_id: string | null;
  content_md: string;
  content_html: string;
  tags: string[];
}

/** Article status machine transition map */
export const STATUS_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['approved', 'rejected'],
  approved: ['published'],
  published: ['draft'],     // unpublish back to draft
  rejected: ['draft'],      // revise and resubmit
};
