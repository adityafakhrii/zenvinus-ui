import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/i18n';
import { ApiError } from '@/services/api';
import { fetchPostBySlug, fetchPostPage } from '../services/posts-api';
import type { PostKind } from '../types/post';
import CardMarkdown from '@/components/common/card-markdown';

import PostCard, { initials } from './post-card';
import { SkeletonArticle } from '@/components/ui/skeleton';

/** Share links for the post; copy puts the address on the clipboard */
function ShareLinks({ title }: { title: string }) {
  const { t } = useT();
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  // WHY: The page address is only known in the browser; links render after mount so server and client markup match
  useEffect(() => setUrl(window.location.href), []);
  if (!url) return null;
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };
  return (
    <div className="zv-article-share">
      <span>{t('Share')}</span>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
      <a href={`https://twitter.com/intent/tweet?url=${u}&text=${text}`} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i className="fa-brands fa-twitter"></i></a>
      <a href={`https://wa.me/?text=${text}%20${u}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
      <button type="button" onClick={copy} aria-label={t('Copy link')} title={copied ? t('Link copied') : t('Copy link')}>
        <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-link'}></i>
      </button>
    </div>
  );
}

/**
 * Blog or news article page: a header (category, title, lead, author and date), the cover image, the article body
 * in one centered reading column, then tags, share links and the author card, and "More articles" as cards below.
 */
export interface PostDetailsPostboxProps {
  kind?: PostKind;
  /** From ?slug=; null until the router has read the URL */
  slug: string | null;
}

const PostDetailsPostbox = ({ kind = 'blog', slug }: PostDetailsPostboxProps) => {
  const { t } = useT();
  const base = `/${kind}`;
  const backLabel = kind === 'news' ? t('Back to news') : t('Back to blog');

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post', kind, slug],
    // `enabled` keeps this from running without a slug
    queryFn: () => fetchPostBySlug(kind, slug ?? ''),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  // Four newest posts, so three remain after leaving out the one being read
  const { data: latest } = useQuery({
    queryKey: ['posts', kind, { limit: 4, offset: 0 }],
    queryFn: () => fetchPostPage(kind, { limit: 4, offset: 0 }),
    enabled: !!slug,
    staleTime: 60_000,
  });

  if (!slug) {
    return (
      <section className="zv-article-area pt-80 pb-100">
        <div className="container"><p className="pf2-empty">{t('Post not found.')} <Link href={base}>{backLabel}</Link></p></div>
      </section>
    );
  }

  const notFound = isError && error instanceof ApiError && error.status === 404;
  const author = post?.authorBox;
  const more = (latest?.cards || []).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
    <section className="zv-article-area pt-80 pb-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-7 col-xl-8 col-lg-10">
            <Link href={base} className="zv-article-back"><i className="fa-solid fa-arrow-left"></i> {backLabel}</Link>

            {(isLoading || (isError && !notFound)) && <SkeletonArticle label={t('Loading')} />}
            {notFound && (
              <p className="pf2-empty">{t('This post was not found.')} <Link href={base}>{backLabel}</Link></p>
            )}

            {post && (
              <article className="zv-article">
                <header className="zv-article-head">
                  {post.category && (
                    <Link href={{ pathname: base, query: { category: post.categorySlug } }} className="zv-article-cat">{post.category}</Link>
                  )}
                  <h1 className="zv-article-title">{post.title}</h1>
                  {post.excerpt && <p className="zv-article-lead">{post.excerpt}</p>}
                  <div className="zv-article-meta">
                    <span className="zv-article-avatar" aria-hidden="true">{initials(author?.name)}</span>
                    <span className="zv-article-author">
                      <strong>{author?.name}</strong>
                      {author?.designation && <small>{author.designation}</small>}
                    </span>
                    <span className="zv-article-dot" aria-hidden="true"></span>
                    <span><i className="fa-light fa-calendar-days"></i> {post.date}</span>
                    {post.readTime && <span><i className="fa-regular fa-clock"></i> {post.readTime}</span>}
                  </div>
                </header>

                {post.thumb && (
                  <div className="zv-article-cover">
                    <Image src={post.thumb} alt={post.title} width={1200} height={675} unoptimized priority />
                  </div>
                )}

                <div className="zv-article-body">
                  <CardMarkdown markdown={post.content} />
                </div>

                <footer className="zv-article-foot">
                  {post.tags.length > 0 && (
                    <div className="zv-article-tags">
                      {post.tags.map((tag) => (
                        <Link key={tag} href={{ pathname: base, query: { tag } }}>#{tag}</Link>
                      ))}
                    </div>
                  )}
                  <ShareLinks title={post.title} />
                </footer>

                {author?.name && (
                  <div className="zv-article-authorbox">
                    <span className="zv-article-avatar zv-article-avatar-lg" aria-hidden="true">{initials(author.name)}</span>
                    <div>
                      <small>{t('Written by')}</small>
                      <h4>{author.name}</h4>
                      {author.designation && <p className="zv-article-role">{author.designation}</p>}
                      {author.bio && <p>{author.bio}</p>}
                    </div>
                  </div>
                )}
              </article>
            )}
          </div>

        </div>
      </div>
    </section>

    {more.length > 0 && (
      <section className="tp-blog-3-area zv-post-grid zv-article-more pt-80 pb-70">
        <div className="container">
          <div className="zv-article-more-head">
            <h2>{kind === 'news' ? t('More news') : t('More articles')}</h2>
            <Link href={base}>{kind === 'news' ? t('All news') : t('All articles')} <i className="fa-solid fa-arrow-right"></i></Link>
          </div>
          <div className="row">
            {more.map((item) => (
              <div key={item.id || item.slug} className="col-xl-4 col-md-6">
                <PostCard item={item} base={base} />
              </div>
            ))}
          </div>
        </div>
      </section>
    )}
    </>
  );
};

export default PostDetailsPostbox;
