import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n';
import RightArrowTwo from '@/components/icons/right-arrow-2';
import type { PostCard as PostCardModel } from '../types/post';

/** Up to two initials for the author avatar; "Z" when there is no name */
export const initials = (name = ''): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'Z';

/**
 * One blog or news card in the About page "IT Solutions" style (.tp-blog-3-*). Used by the post list and by
 * "More articles" under an article, so both always look the same.
 */
export interface PostCardProps {
  /** A card from mapPostCard */
  item: PostCardModel;
  /** "/blog" or "/news" */
  base?: string;
}

const PostCard = ({ item, base = '/blog' }: PostCardProps) => {
  const { t } = useT();
  const href = `${base}-details?slug=${item.slug}`;
  return (
    <article className="tp-blog-3-wrapper zv-post-card mb-30">
      <div className="tp-blog-3-thumb">
        <Link href={href} aria-label={item.title}>
          {item.thumb
            ? <Image src={item.thumb} alt={item.title} width={770} height={430} unoptimized />
            : <span className="zv-post-noimg" aria-hidden="true"><i className="fa-regular fa-image"></i></span>}
        </Link>
        <div className="tp-blog-3-user">
          <span className="zv-post-avatar" aria-hidden="true">{initials(item.author)}</span>
          <p>{t('By: {name}', { name: item.author })}</p>
        </div>
      </div>
      <div className="tp-blog-3-content">
        <div className="tp-blog-date">
          <span><i className="fa-light fa-calendar-days"></i>{item.date}</span>
          {item.readTime && <><span>-</span><span><i className="fa-regular fa-clock"></i>{item.readTime}</span></>}
        </div>
        <h3 className="tp-blog-3-title">
          <Link href={href}>{item.title}</Link>
        </h3>
        {item.excerpt && <p className="zv-post-excerpt">{item.excerpt}</p>}
      </div>
      <div className="tp-blog-3-btn d-flex justify-content-between align-items-center">
        <div className="read-more p-relative">
          <Link href={href}>{t('Read More')} <span><RightArrowTwo /></span></Link>
        </div>
        {item.category && (
          <Link href={{ pathname: base, query: { category: item.categorySlug } }} className="zv-post-cat">{item.category}</Link>
        )}
      </div>
    </article>
  );
};

export default PostCard;
