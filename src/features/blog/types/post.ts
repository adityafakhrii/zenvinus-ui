/**
 * Blog and news posts. `*Dto` types are the JSON of GET /api/{blog|news}/page and /posts/{slug}
 * (zenvinus-backend/internal/catalog/dto.go); the others are what the components render (post-mappers.ts).
 */
import type { ApiItemResponse, ApiListResponse, IsoDateString, NameRef, SlugRef, TagRef } from '@/types/api';

/** Which list a post belongs to; also the API path segment and the route prefix (/blog, /news). */
export type PostKind = 'blog' | 'news';

export interface PostCardDto {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  category: SlugRef | null;
  publishedAt: IsoDateString | null;
  readTimeMinutes: number | null;
  author: NameRef | null;
}

export interface AuthorDto {
  name: string;
  headline?: string;
  bio?: string;
  image?: string;
  socialLinks?: Record<string, string>;
}

export interface PostDetailDto extends Omit<PostCardDto, 'author'> {
  content: string;
  tags: TagRef[];
  author: AuthorDto | null;
}

export interface SidebarDto {
  recent: Array<{ slug: string; title: string; coverImageUrl?: string; publishedAt: IsoDateString | null }>;
  categories: Array<{ slug: string; name: string; articleCount: number }>;
  tags: TagRef[];
}

export interface PostPageResponse extends ApiListResponse<PostCardDto> {
  sidebar?: SidebarDto;
}

export type PostDetailResponse = ApiItemResponse<PostDetailDto>;

/** A post card in the lists */
export interface PostCard {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  thumb: string | null;
  category: string | null;
  categorySlug: string | null;
  /** Formatted in the current language */
  date: string;
  readTime: string;
  author: string;
  kind: PostKind;
  href: string;
}

export interface PostAuthorBox {
  name: string;
  designation: string;
  bio: string;
  image: string | null;
  socialLinks: Record<string, string>;
}

export interface PostDetail extends PostCard {
  content: string;
  tags: string[];
  authorBox: PostAuthorBox;
}

export interface BlogSidebar {
  recent: Array<{ slug: string; title: string; thumb: string | null; date: string }>;
  categories: Array<{ slug: string; name: string; count: number }>;
  tags: string[];
}

/** One page of a post list, ready to render */
export interface PostPage {
  cards: PostCard[];
  total: number;
  sidebar: BlogSidebar;
}
