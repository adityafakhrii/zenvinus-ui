/** Blog and news dummy data service (local UI/UX mode). */
import type { ParsedUrlQuery } from 'querystring';
import { ApiError } from '@/services/api';
import type { ApiFetchOptions } from '@/services/api';
import { pageToRange, parsePage } from '@/utils/pagination';
import { buildDummySidebar, getDummyPosts } from '../data/dummy-posts';
import { mapPostCard, mapPostDetail, mapSidebar } from './post-mappers';
import type { PostDetail, PostKind, PostPage } from '../types/post';

export const POSTS_PER_PAGE = 6;

/** Query params of a post list request */
export interface PostListParams {
  q?: string;
  category?: string;
  tag?: string;
  limit: number;
  offset: number;
}

const firstValue = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value);

/** Params for the listing in the URL: search, category, tag and page. */
export function postListParams(query: ParsedUrlQuery = {}): { page: number; params: PostListParams } {
  const page = parsePage(query.page);
  return {
    page,
    params: {
      q: firstValue(query.q),
      category: firstValue(query.category),
      tag: firstValue(query.tag),
      ...pageToRange(page, POSTS_PER_PAGE),
    },
  };
}

export async function fetchPostPage(
  kind: PostKind,
  params: Partial<PostListParams> = {},
  _ctx?: ApiFetchOptions['ctx'],
): Promise<PostPage> {
  const all = getDummyPosts(kind);
  const q = params.q?.trim().toLowerCase();
  const category = params.category?.trim().toLowerCase();
  const tag = params.tag?.trim().toLowerCase();

  const filtered = all.filter((post) => {
    if (q) {
      const hay = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (category && post.category?.slug.toLowerCase() !== category) {
      return false;
    }
    if (tag && !post.tags.some((t) => t.name.toLowerCase() === tag)) {
      return false;
    }
    return true;
  });

  const offset = params.offset ?? 0;
  const limit = params.limit ?? POSTS_PER_PAGE;
  const pageItems = filtered.slice(offset, offset + limit);

  return {
    cards: pageItems.map((p) => mapPostCard(p, kind)),
    total: filtered.length,
    sidebar: mapSidebar(buildDummySidebar(kind)),
  };
}

export async function fetchPostBySlug(kind: PostKind, slug: string): Promise<PostDetail> {
  const found = getDummyPosts(kind).find((p) => p.slug === slug);
  if (!found) {
    throw new ApiError(404, 'Post not found.', null);
  }
  return mapPostDetail(found, kind);
}
