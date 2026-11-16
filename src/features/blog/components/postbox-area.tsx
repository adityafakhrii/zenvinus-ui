import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge, EmptyState, SearchInput, cn } from '@/components/ui';
import { SkeletonFilterBar, SkeletonPostGrid } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { getPageItems, pageQuery, totalPages } from '@/utils/pagination';
import { POSTS_PER_PAGE, fetchPostPage, postListParams } from '../services/posts-api';
import type { PostKind, PostPage } from '../types/post';
import PostCard from './post-card';

export interface PostboxAreaProps {
  /** Route prefix of the page using this area ("/blog" or "/news"). */
  base?: string;
  kind?: PostKind;
  /** First page from SSR; null when the API was down. */
  initialData?: PostPage | null;
}

interface PostSearchProps {
  base: string;
  initial: string;
}

function PostSearch({ base, initial }: PostSearchProps) {
  const { t } = useT();
  const router = useRouter();
  const [q, setQ] = useState(initial);

  useEffect(() => {
    setQ(initial);
  }, [initial]);

  const handleChange = (next: string) => {
    setQ(next);
    if (next === '' && initial) {
      router.push({ pathname: base });
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? { pathname: base, query: { q: term } } : { pathname: base });
  };

  return (
    <form onSubmit={submit} role="search" className="w-full sm:w-64">
      <SearchInput
        value={q}
        onChange={handleChange}
        placeholder={t('Search')}
        size="sm"
        maxLength={200}
      />
    </form>
  );
}

/**
 * Editorial list layout for /blog with pill category filters, custom search, 3-col 16:10 grid & pagination.
 */
const PostboxArea = ({ base = '/blog', kind = 'blog', initialData }: PostboxAreaProps) => {
  const { t } = useT();
  const isNews = kind === 'news';
  const router = useRouter();
  const { page, params } = postListParams(router.query);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['posts', kind, params],
    queryFn: () => fetchPostPage(kind, params),
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
    <section className="min-h-screen bg-canvas py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <header className="max-w-2xl">
          <Badge tone="mint" dot>
            {isNews ? t('News') : t('Blog')}
          </Badge>
          <h1 className="mt-3 mb-0 text-[30px] font-semibold tracking-[-0.025em] text-ink sm:text-[38px]">
            {isNews ? t('News') : t('Blog')}
          </h1>
          <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
            {isNews
              ? t('Announcements and updates from Zenvinus.')
              : t(
                  'Guides and notes from the Zenvinus team on preparing AI data: annotation, dataset quality and working with Indonesian languages.',
                )}
          </p>
        </header>

        {/* Toolbar */}
        {!data && (
          <div className="mt-8">
            <SkeletonFilterBar />
          </div>
        )}
        {data && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <nav
              aria-label={t('Category')}
              className="flex flex-wrap items-center gap-1.5"
            >
              <Link
                href={base}
                className={cn(
                  'inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium no-underline transition-colors',
                  !activeCategory && !activeTag && !activeQuery
                    ? 'bg-navy text-white'
                    : 'bg-canvas text-ink-secondary hover:text-ink',
                )}
              >
                {t('All')}
              </Link>
              {(sidebar?.categories || []).map((c) => {
                const isActive = activeCategory === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={{ pathname: base, query: { category: c.slug } }}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium no-underline transition-colors',
                      isActive
                        ? 'bg-navy text-white'
                        : 'bg-canvas text-ink-secondary hover:text-ink',
                    )}
                  >
                    <span>{c.name}</span>
                    <span
                      className={cn(
                        'font-mono text-[11px] tabular-nums',
                        isActive ? 'text-teal' : 'text-ink-muted',
                      )}
                    >
                      {c.count}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-medium text-ink-muted tabular-nums">
                {t('{count} articles', { count: total })}
              </span>
              <PostSearch base={base} initial={activeQuery} />
            </div>
          </div>
        )}

        {(activeQuery || activeTag) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
            <span>
              {activeQuery
                ? t('Results for "{query}"', { query: activeQuery })
                : t('Tag: {tag}', { tag: activeTag })}
            </span>
            <Link
              href={base}
              className="inline-flex items-center gap-1 rounded-md border border-line-subtle bg-surface px-2 py-1 font-medium text-ink no-underline hover:bg-canvas"
            >
              <X className="h-3 w-3" strokeWidth={1.75} />
              <span>{t('Clear filter')}</span>
            </Link>
          </div>
        )}

        {/* Loading & Empty / Out of Range */}
        {(isLoading || isError) && (
          <div className="mt-8">
            <SkeletonPostGrid count={6} label={t('Loading')} />
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && !outOfRange && (
          <div className="mt-8">
            <EmptyState
              title={isNews ? t('No news published yet.') : t('No posts published yet.')}
              description={t('Check back soon for new engineering guides and dataset notes.')}
            />
          </div>
        )}

        {outOfRange && (
          <div className="mt-8">
            <EmptyState
              title={t('This page does not exist.')}
              action={
                <Link
                  href={pageHref(pages)}
                  className="inline-flex h-9 items-center rounded-[8px] bg-navy px-4 text-xs font-medium text-white no-underline"
                >
                  {t('Go to the last page')}
                </Link>
              }
            />
          </div>
        )}

        {/* 3-Column Post Grid */}
        {!isLoading && !isError && posts.length > 0 && (
          <div
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-150"
            style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
          >
            {posts.map((item, i) => (
              <PostCard key={item.id || i} item={item} base={base} />
            ))}
          </div>
        )}

        {/* Custom Pagination */}
        {!isLoading && !isError && pages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center"
            aria-label={isNews ? t('News pages') : t('Blog pages')}
          >
            <ul className="m-0 flex list-none items-center gap-1.5 p-0">
              <li>
                {page > 1 ? (
                  <Link
                    href={pageHref(Math.min(page - 1, pages))}
                    aria-label={t('Previous page')}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink no-underline hover:bg-canvas"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line-subtle bg-canvas text-ink-subtle"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                )}
              </li>

              {getPageItems(Math.min(page, pages), pages).map((item, i) => (
                <li key={item === '…' ? `gap-${i}` : item}>
                  {item === '…' ? (
                    <span className="px-2 text-xs text-ink-muted" aria-hidden="true">
                      …
                    </span>
                  ) : item === page ? (
                    <span
                      aria-current="page"
                      className="flex h-9 min-w-9 items-center justify-center rounded-[10px] bg-navy px-3 font-mono text-xs font-semibold text-white tabular-nums"
                    >
                      {item}
                    </span>
                  ) : (
                    <Link
                      href={pageHref(item)}
                      aria-label={t('Page {page}', { page: item })}
                      className="flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-[rgba(8,13,53,0.10)] bg-surface px-3 font-mono text-xs font-medium text-ink-secondary no-underline tabular-nums hover:bg-canvas hover:text-ink"
                    >
                      {item}
                    </Link>
                  )}
                </li>
              ))}

              <li>
                {page < pages ? (
                  <Link
                    href={pageHref(page + 1)}
                    aria-label={t('Next page')}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink no-underline hover:bg-canvas"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line-subtle bg-canvas text-ink-subtle"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
};

export default PostboxArea;
