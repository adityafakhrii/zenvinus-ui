import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useT } from '@/i18n';
import { POSTS_PER_PAGE, fetchPostPage, postListParams } from '../services/posts-api';
import type { PostKind, PostPage } from '../types/post';
import { getPageItems, pageQuery, totalPages } from '@/utils/pagination';

import PostCard from './post-card';
import blog_shape from '@assets/img/blog/shaep-2.png';
import { SkeletonFilterBar, SkeletonPostGrid } from '@/components/ui/skeleton';

export interface PostboxAreaProps {
  /** Route prefix of the page using this area ("/blog" or "/news") */
  base?: string;
  kind?: PostKind;
  /** First page from SSR; null when the API was down */
  initialData?: PostPage | null;
}

const PostboxArea = ({ base = '/blog', kind = 'blog', initialData }: PostboxAreaProps) => {
  const { t } = useT();
  const isNews = kind === 'news';
  const router = useRouter();
  const { page, params } = postListParams(router.query);

  const { data, isLoading, isError, isFetching } = useQuery({
    // WHY: The key carries the filters and page, so each page is its own cache entry and changing pages refetches
    queryKey: ['posts', kind, params],
    queryFn: () => fetchPostPage(kind, params),
    // SSR sends null when the API was down; undefined lets the client fetch instead of showing an empty list
    initialData: initialData ?? undefined,
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const posts = data?.cards || [];
  const sidebar = data?.sidebar;
  const total = data?.total || 0;
  const pages = totalPages(total, POSTS_PER_PAGE);
  const outOfRange = !isLoading && !isError && total > 0 && page > pages;
  const pageHref = (n: number) => ({ pathname: base, query: pageQuery(router.query, n) });

  const activeCategory = typeof router.query.category === 'string' ? router.query.category : '';
  const activeTag = typeof router.query.tag === 'string' ? router.query.tag : '';
  const activeQuery = typeof router.query.q === 'string' ? router.query.q : '';

  return (
    <>
      {/* WHY: Same card grid as the "IT Solutions" blog block on the About page; the sidebar became a filter bar */}
      <section className="tp-blog-3-area zv-post-grid p-relative fix pt-80 pb-90">
        <div className="tp-blog-3-shape">
          <Image className="shape-1" src={blog_shape} alt="" aria-hidden="true" />
          <Image className="shape-2" src={blog_shape} alt="" aria-hidden="true" />
        </div>
        <div className="container">
          {/* Page heading, so visitors can tell at a glance this is the blog (as on mangoboost.io/resources/blog) */}
          <header className="zv-post-head">
            <h1>{isNews ? t('News') : t('Blog')}</h1>
            <p>
              {isNews
                ? t('Announcements and updates from Zenvinus.')
                : t('Guides and notes from the Zenvinus team on preparing AI data: annotation, dataset quality and working with Indonesian languages.')}
            </p>
          </header>

          {/* Filters need the categories from the API; until they arrive show their skeleton */}
          {!data && <SkeletonFilterBar />}
          {data && (
          <div className="zv-post-toolbar">
            <nav className="zv-post-cats" aria-label={t('Category')}>
              <Link href={base} className={!activeCategory && !activeTag && !activeQuery ? 'is-active' : undefined}>{t('All')}</Link>
              {(sidebar?.categories || []).map((c) => (
                <Link key={c.slug} href={{ pathname: base, query: { category: c.slug } }} className={activeCategory === c.slug ? 'is-active' : undefined}>
                  {c.name} <span>{c.count}</span>
                </Link>
              ))}
            </nav>
            <div className="zv-post-tools">
              <span className="zv-post-count">{t('{count} articles', { count: total })}</span>
              <PostSearch base={base} initial={activeQuery} />
            </div>
          </div>
          )}

          {(activeQuery || activeTag) && (
            <p className="zv-post-filter">
              {activeQuery ? t('Results for "{query}"', { query: activeQuery }) : t('Tag: {tag}', { tag: activeTag })}
              {' · '}<Link href={base}>{t('Clear filter')}</Link>
            </p>
          )}

          {/* Loading, or the service is down and retrying in the background: keep the skeleton */}
          {(isLoading || isError) && <SkeletonPostGrid count={6} label={t('Loading')} />}
          {!isLoading && !isError && posts.length === 0 && !outOfRange && (
            <p className="pf2-empty">{isNews ? t('No news published yet.') : t('No posts published yet.')}</p>
          )}
          {outOfRange && (
            <p className="pf2-empty">
              {t('This page does not exist.')} <Link href={pageHref(pages)}>{t('Go to the last page')}</Link>.
            </p>
          )}

          <div className="row" style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}>
            {!isLoading && !isError && posts.map((item, i) => (
              <div key={item.id || i} className="col-xl-4 col-md-6">
                <PostCard item={item} base={base} />
              </div>
            ))}
          </div>

          {!isLoading && !isError && pages > 1 && (
            <nav className="basic-pagination text-center mt-20" aria-label={isNews ? t('News pages') : t('Blog pages')}>
              <ul>
                <li>
                  {page > 1 ? (
                    <Link href={pageHref(Math.min(page - 1, pages))} aria-label={t('Previous page')}>
                      <i className="fa-regular fa-angles-left"></i>
                    </Link>
                  ) : (
                    <span className="pagination-disabled" aria-disabled="true">
                      <i className="fa-regular fa-angles-left"></i>
                    </span>
                  )}
                </li>
                {getPageItems(Math.min(page, pages), pages).map((item, i) => (
                  <li key={item === '…' ? `gap-${i}` : item}>
                    {item === '…' ? (
                      <span className="pagination-gap" aria-hidden="true">…</span>
                    ) : item === page ? (
                      <span className="current" aria-current="page">{item}</span>
                    ) : (
                      <Link href={pageHref(item)} aria-label={t('Page {page}', { page: item })}>{item}</Link>
                    )}
                  </li>
                ))}
                <li>
                  {page < pages ? (
                    <Link href={pageHref(page + 1)} aria-label={t('Next page')}>
                      <i className="fa-regular fa-angles-right"></i>
                    </Link>
                  ) : (
                    <span className="pagination-disabled" aria-disabled="true">
                      <i className="fa-regular fa-angles-right"></i>
                    </span>
                  )}
                </li>
              </ul>
            </nav>
          )}
        </div>
      </section>
    </>
  );
};


/** Search box for the filter bar; keeps the typed text and resets to page 1 */
interface PostSearchProps {
  base: string;
  initial: string;
}

function PostSearch({ base, initial }: PostSearchProps) {
  const { t } = useT();
  const router = useRouter();
  const [q, setQ] = React.useState(initial);
  React.useEffect(() => setQ(initial), [initial]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? { pathname: base, query: { q: term } } : { pathname: base });
  };
  return (
    <form className="zv-post-search" onSubmit={submit} role="search">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search')} aria-label={t('Search')} maxLength={200} />
      <button type="submit" aria-label={t('Search')}><i className="far fa-search"></i></button>
    </form>
  );
}

export default PostboxArea;
