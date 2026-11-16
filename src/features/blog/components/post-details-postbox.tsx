import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Link2, Share2 } from 'lucide-react';
import CardMarkdown from '@/components/common/card-markdown';
import { Badge, EmptyState } from '@/components/ui';
import { SkeletonArticle } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { ApiError } from '@/services/api';
import { fetchPostBySlug, fetchPostPage } from '../services/posts-api';
import type { PostKind } from '../types/post';
import PostCard, { initials } from './post-card';

function ShareBar({ title }: { title: string }) {
  const { t } = useT();
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted mr-1">
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span>{t('Share')}</span>
      </span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-line-subtle bg-surface px-2.5 text-xs font-medium text-ink-secondary no-underline transition-colors hover:bg-canvas hover:text-ink"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${u}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-line-subtle bg-surface px-2.5 text-xs font-medium text-ink-secondary no-underline transition-colors hover:bg-canvas hover:text-ink"
      >
        X
      </a>
      <a
        href={`https://wa.me/?text=${text}%20${u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-line-subtle bg-surface px-2.5 text-xs font-medium text-ink-secondary no-underline transition-colors hover:bg-canvas hover:text-ink"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-subtle bg-surface px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-canvas hover:text-ink cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />
            <span className="text-teal-ink">{t('Link copied')}</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{t('Copy link')}</span>
          </>
        )}
      </button>
    </div>
  );
}

export interface PostDetailsPostboxProps {
  kind?: PostKind;
  /** From ?slug=; null until the router has read the URL. */
  slug: string | null;
}

/**
 * Centered single reading column (~720px) for /blog-details and /news-details with dark code blocks & teal author card.
 */
const PostDetailsPostbox = ({ kind = 'blog', slug }: PostDetailsPostboxProps) => {
  const { t } = useT();
  const base = `/${kind}`;
  const backLabel = kind === 'news' ? t('Back to news') : t('Back to blog');

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post', kind, slug],
    queryFn: () => fetchPostBySlug(kind, slug ?? ''),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const { data: latest } = useQuery({
    queryKey: ['posts', kind, { limit: 4, offset: 0 }],
    queryFn: () => fetchPostPage(kind, { limit: 4, offset: 0 }),
    enabled: !!slug,
    staleTime: 60_000,
  });

  if (!slug) {
    return (
      <section className="min-h-[60vh] bg-surface py-16">
        <div className="mx-auto max-w-[720px] px-4">
          <EmptyState
            title={t('Post not found.')}
            action={
              <Link
                href={base}
                className="inline-flex h-9 items-center rounded-[8px] bg-navy px-4 text-xs font-medium text-white no-underline"
              >
                {backLabel}
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const notFound = isError && error instanceof ApiError && error.status === 404;
  const author = post?.authorBox;
  const more = (latest?.cards || []).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <div className="mx-auto max-w-[760px] px-4 sm:px-6">
          <Link
            href={base}
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{backLabel}</span>
          </Link>

          {(isLoading || (isError && !notFound)) && <SkeletonArticle label={t('Loading')} />}

          {notFound && (
            <EmptyState
              title={t('This post was not found.')}
              action={
                <Link
                  href={base}
                  className="inline-flex h-9 items-center rounded-[8px] bg-navy px-4 text-xs font-medium text-white no-underline"
                >
                  {backLabel}
                </Link>
              }
            />
          )}

          {post && (
            <article>
              <header className="mb-8">
                {post.category && (
                  <Link
                    href={{ pathname: base, query: { category: post.categorySlug } }}
                    className="mb-3 inline-block no-underline"
                  >
                    <Badge tone="mint">{post.category}</Badge>
                  </Link>
                )}

                <h1 className="m-0 text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink sm:text-[36px]">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-3 mb-0 text-base leading-relaxed text-ink-secondary">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-line-subtle py-3.5 text-xs text-ink-muted">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white"
                      aria-hidden="true"
                    >
                      {initials(author?.name)}
                    </span>
                    <div>
                      <div className="font-semibold text-ink">{author?.name}</div>
                      {author?.designation && <div className="text-[11px] text-ink-muted">{author.designation}</div>}
                    </div>
                  </div>
                  <span className="h-3.5 w-px bg-line" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{post.date}</span>
                  </span>
                  {post.readTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{post.readTime}</span>
                    </span>
                  )}
                </div>
              </header>

              {post.thumb && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas">
                  <Image
                    src={post.thumb}
                    alt={post.title}
                    width={1200}
                    height={675}
                    unoptimized
                    priority
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}

              {/* Clean Markdown Prose Styling */}
              <div className="text-[15px] leading-[1.75] text-ink-prose sm:text-base [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-ink [&_h5]:mt-5 [&_h5]:mb-2 [&_h5]:text-base [&_h5]:font-semibold [&_h5]:text-ink [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-ink [&_blockquote]:pl-4 [&_blockquote]:text-ink-secondary [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0B1220] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_pre]:text-[#E6EDF3] [&_code]:font-mono [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-canvas [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[13px] [&_:not(pre)>code]:text-ink">
                <CardMarkdown markdown={post.content} />
              </div>

              <footer className="mt-10 flex flex-col gap-4 border-t border-line-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={{ pathname: base, query: { tag } }}
                        className="no-underline"
                      >
                        <Badge tone="neutral">#{tag}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
                <ShareBar title={post.title} />
              </footer>

              {author?.name && (
                <div className="mt-8 flex items-start gap-4 rounded-2xl border border-teal-ink/20 bg-tint-mint p-6">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white"
                    aria-hidden="true"
                  >
                    {initials(author.name)}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-teal-ink">
                      {t('Written by')}
                    </span>
                    <h4 className="mt-0.5 mb-0 text-base font-semibold text-ink">{author.name}</h4>
                    {author.designation && (
                      <p className="mt-0.5 mb-0 text-xs font-medium text-ink-secondary">
                        {author.designation}
                      </p>
                    )}
                    {author.bio && (
                      <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                        {author.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </section>

      {more.length > 0 && (
        <section className="border-t border-line-subtle bg-canvas py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="m-0 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {kind === 'news' ? t('More news') : t('More articles')}
              </h2>
              <Link
                href={base}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-ink no-underline hover:underline"
              >
                <span>{kind === 'news' ? t('All news') : t('All articles')}</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {more.map((item) => (
                <PostCard key={item.id || item.slug} item={item} base={base} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PostDetailsPostbox;
