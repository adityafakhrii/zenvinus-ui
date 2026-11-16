import React from 'react';
import type { CSSProperties } from 'react';

/**
 * Loading placeholders shaped like the content they stand for, instead of a spinner, so the page keeps its
 * layout while data loads. Hidden from screen readers; the containers announce "Loading" once.
 */

/** Accessible name of a loading region (pass the translated "Loading") */
interface LoadingLabelProps {
  label?: string;
}

interface RepeatProps extends LoadingLabelProps {
  count?: number;
}

export interface SkeletonLineProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}

export const SkeletonLine = ({ width = '100%', height = 14, className = '' }: SkeletonLineProps) => (
  <span className={`zv-skel ${className}`} style={{ width, height }} aria-hidden="true"></span>
);

/** Card like the blog / news cards: image, meta, two-line title, text */
export const SkeletonCard = () => (
  <div className="zv-skel-card" aria-hidden="true">
    <span className="zv-skel zv-skel-media"></span>
    <div className="zv-skel-body">
      <SkeletonLine width="45%" height={12} />
      <SkeletonLine width="90%" height={20} />
      <SkeletonLine width="70%" height={20} />
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
    </div>
  </div>
);

/** Grid of cards in the given Bootstrap column class */
export const SkeletonCardGrid = ({ count = 6, colClass = 'col-xl-4 col-md-6', label = 'Loading' }: RepeatProps & { colClass?: string }) => (
  <div className="row" role="status" aria-label={label}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={colClass}>
        <SkeletonCard />
      </div>
    ))}
  </div>
);

/** List rows like the dataset, model and task results */
export const SkeletonRows = ({ count = 4, label = 'Loading' }: RepeatProps) => (
  <div className="zv-skel-rows" role="status" aria-label={label}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="zv-skel-row" aria-hidden="true">
        <span className="zv-skel zv-skel-thumb"></span>
        <div className="zv-skel-body">
          <SkeletonLine width="55%" height={18} />
          <SkeletonLine width="35%" height={12} />
          <SkeletonLine width="85%" />
        </div>
      </div>
    ))}
  </div>
);

/** Article page: header, cover and paragraphs */
export const SkeletonArticle = ({ label = 'Loading' }: LoadingLabelProps) => (
  <div className="zv-skel-article" role="status" aria-label={label}>
    <SkeletonLine width={90} height={26} className="zv-skel-pill" />
    <SkeletonLine width="85%" height={38} />
    <SkeletonLine width="60%" height={38} />
    <SkeletonLine width="75%" height={16} />
    <span className="zv-skel zv-skel-cover" aria-hidden="true"></span>
    {[100, 95, 98, 70].map((w, i) => (
      <SkeletonLine key={i} width={`${w}%`} height={16} />
    ))}
  </div>
);

/** News page: the large featured story with its text box, then a row of news cards (same classes as the real one) */
export const SkeletonNews = ({ label = 'Loading' }: LoadingLabelProps) => (
  <div role="status" aria-label={label}>
    <div className="news__featured mb-60" aria-hidden="true">
      <div className="news__featured-item">
        <div className="news__featured-thumb">
          <span className="zv-skel zv-skel-news-hero"></span>
        </div>
        <div className="news__featured-content zv-skel-stack">
          <SkeletonLine width="40%" height={12} />
          <SkeletonLine width="85%" height={30} />
          <SkeletonLine width="55%" height={30} />
          <SkeletonLine width="95%" />
          <SkeletonLine width={150} height={52} className="zv-skel-btn" />
        </div>
      </div>
    </div>
    <div className="row" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
          <div className="news__card mb-30">
            <div className="news__card-thumb">
              <span className="zv-skel zv-skel-news-thumb"></span>
            </div>
            <div className="news__card-content zv-skel-stack">
              <SkeletonLine width="45%" height={12} />
              <SkeletonLine width="90%" height={20} />
              <SkeletonLine width="65%" height={20} />
              <SkeletonLine width={110} height={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Blog card: the same frame as PostCard (.tp-blog-3-wrapper), so nothing jumps when the posts arrive */
export const SkeletonPostCard = () => (
  <div className="tp-blog-3-wrapper zv-post-card zv-skel-post mb-30" aria-hidden="true">
    <div className="tp-blog-3-thumb">
      <span className="zv-skel zv-skel-post-media"></span>
      <span className="zv-skel zv-skel-post-avatar"></span>
    </div>
    <div className="tp-blog-3-content zv-skel-stack">
      <SkeletonLine width="55%" height={12} />
      <SkeletonLine width="92%" height={20} />
      <SkeletonLine width="68%" height={20} />
      <SkeletonLine width="100%" height={13} />
      <SkeletonLine width="80%" height={13} />
    </div>
    <div className="tp-blog-3-btn d-flex justify-content-between align-items-center">
      <SkeletonLine width={130} height={16} />
      <SkeletonLine width={70} height={12} />
    </div>
  </div>
);

/** Grid of blog cards, in the same columns as the blog list */
export const SkeletonPostGrid = ({ count = 6, label = 'Loading' }: RepeatProps) => (
  <div className="row" role="status" aria-label={label}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="col-xl-4 col-md-6">
        <SkeletonPostCard />
      </div>
    ))}
  </div>
);

/** Category pills and search box of the blog filter bar */
export const SkeletonFilterBar = () => (
  <div className="zv-post-toolbar" aria-hidden="true">
    <div className="zv-post-cats">
      {[64, 104, 96].map((w, i) => (
        <SkeletonLine key={i} width={w} height={38} className="zv-skel-pill" />
      ))}
    </div>
    <SkeletonLine width={280} height={44} className="zv-skel-search" />
  </div>
);
