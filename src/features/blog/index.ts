/** Public API of the blog feature (blog and news posts); pages and other features import from '@/features/blog'. */
export { default as PostCard } from './components/post-card';
export { POSTS_PER_PAGE, fetchPostBySlug, fetchPostPage, postListParams } from './services/posts-api';
export type { PostListParams } from './services/posts-api';
export type { BlogSidebar, PostDetail, PostKind, PostPage, PostCard as PostCardItem } from './types/post';
