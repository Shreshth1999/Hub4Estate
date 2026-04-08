// ============================================
// Community & Knowledge Types
// ============================================

export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
}

export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  city: string | null;
  /** Discussion category */
  category: string | null;
  tags: string[];
  upvotes: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  /** Parent comment ID for nested/threaded comments */
  parentId: string | null;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityVote {
  id: string;
  userId: string;
  postId: string | null;
  commentId: string | null;
  /** +1 (upvote) or -1 (downvote) */
  value: number;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  /** Rich text / Markdown content */
  content: string;
  category: string;
  tags: string[];

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;

  coverImage: string | null;

  views: number;
  isPublished: boolean;
  /** Admin ID who authored the article */
  authorId: string;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
