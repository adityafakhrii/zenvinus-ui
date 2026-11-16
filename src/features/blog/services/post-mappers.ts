/** Blog/news API payloads -> the shapes the post components render. */
import { mediaUrl } from '@/services/api';
import { translate as tr } from '@/i18n';
import { formatDate } from '@/utils/format';
import type { BlogSidebar, PostCard, PostCardDto, PostDetail, PostDetailDto, PostKind, SidebarDto } from '../types/post';

const DEFAULT_AUTHOR = 'Zenvinus Team';

/** Card from GET /api/{blog|news}/posts (or data[] inside /page). */
export function mapPostCard(post: PostCardDto | PostDetailDto, kind: PostKind = 'blog'): PostCard {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    thumb: mediaUrl(post.coverImageUrl),
    category: post.category?.name || null,
    categorySlug: post.category?.slug || null,
    date: formatDate(post.publishedAt),
    readTime: post.readTimeMinutes ? tr('{minutes} min read', { minutes: post.readTimeMinutes }) : '',
    author: post.author?.name || DEFAULT_AUTHOR,
    kind,
    href: `/${kind}-details?slug=${post.slug}`,
  };
}

/** Detail from GET /api/{blog|news}/posts/{slug}. */
export function mapPostDetail(post: PostDetailDto, kind: PostKind = 'blog'): PostDetail {
  return {
    ...mapPostCard(post, kind),
    content: post.content || post.excerpt || '',
    tags: (post.tags || []).map((t) => t.name),
    authorBox: {
      name: post.author?.name || DEFAULT_AUTHOR,
      designation: post.author?.headline || DEFAULT_AUTHOR,
      bio: post.author?.bio || '',
      image: mediaUrl(post.author?.image),
      socialLinks: post.author?.socialLinks || {},
    },
  };
}

/** Sidebar payload from GET /api/{blog|news}/page. */
export function mapSidebar(sidebar: Partial<SidebarDto> = {}): BlogSidebar {
  return {
    recent: (sidebar.recent || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      thumb: mediaUrl(p.coverImageUrl),
      date: formatDate(p.publishedAt),
    })),
    categories: (sidebar.categories || []).map((c) => ({ slug: c.slug, name: c.name, count: c.articleCount ?? 0 })),
    tags: (sidebar.tags || []).map((t) => t.name),
  };
}
