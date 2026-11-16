import React from 'react';
import type { CSSProperties } from 'react';
import { cn } from './cn';

/**
 * Pure Tailwind loading skeletons shaped like the content they stand for (blog/news cards, catalog rows, articles)
 * using `.zv-shimmer` from src/styles/tailwind.css.
 */

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
  <span
    className={cn('zv-shimmer block rounded', className)}
    style={{ width, height }}
    aria-hidden="true"
  />
);

/** Card like the blog / news cards: 16:10 image, meta, two-line title, summary */
export const SkeletonCard = () => (
  <div
    className="flex flex-col overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface"
    aria-hidden="true"
  >
    <span className="zv-shimmer block aspect-16/10 w-full" />
    <div className="flex flex-col gap-3 p-5">
      <SkeletonLine width="45%" height={12} />
      <SkeletonLine width="90%" height={20} />
      <SkeletonLine width="70%" height={20} />
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
    </div>
  </div>
);

/** Grid of cards matching blog / news grid layout */
export const SkeletonCardGrid = ({
  count = 6,
  colClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  label = 'Loading',
}: RepeatProps & { colClass?: string }) => (
  <div className={cn('grid gap-6', colClass)} role="status" aria-label={label}>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/** List rows like dataset, model and task catalog results */
export const SkeletonRows = ({ count = 4, label = 'Loading' }: RepeatProps) => (
  <div className="flex flex-col gap-4" role="status" aria-label={label}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="flex gap-4 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5"
        aria-hidden="true"
      >
        <span className="zv-shimmer h-16 w-20 shrink-0 rounded-xl sm:h-20 sm:w-28" />
        <div className="flex flex-1 flex-col justify-center gap-2.5">
          <SkeletonLine width="55%" height={18} />
          <SkeletonLine width="35%" height={12} />
          <SkeletonLine width="85%" />
        </div>
      </div>
    ))}
  </div>
);

/** Article detail skeleton: pill, title lines, 16:9 cover and paragraphs */
export const SkeletonArticle = ({ label = 'Loading' }: LoadingLabelProps) => (
  <div className="mx-auto flex max-w-[740px] flex-col gap-3.5" role="status" aria-label={label}>
    <SkeletonLine width={90} height={26} className="rounded-full" />
    <SkeletonLine width="85%" height={36} />
    <SkeletonLine width="60%" height={36} />
    <SkeletonLine width="75%" height={16} />
    <span className="zv-shimmer my-4 block aspect-16/9 w-full rounded-2xl" aria-hidden="true" />
    {[100, 95, 98, 70].map((w, i) => (
      <SkeletonLine key={i} width={`${w}%`} height={16} />
    ))}
  </div>
);

/** News page skeleton: featured story split + 3-column grid */
export const SkeletonNews = ({ label = 'Loading' }: LoadingLabelProps) => (
  <div className="space-y-10" role="status" aria-label={label}>
    <div
      className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 lg:grid-cols-12"
      aria-hidden="true"
    >
      <div className="lg:col-span-7">
        <span className="zv-shimmer block aspect-16/10 w-full rounded-xl" />
      </div>
      <div className="flex flex-col justify-center gap-3 lg:col-span-5">
        <SkeletonLine width="40%" height={12} />
        <SkeletonLine width="88%" height={28} />
        <SkeletonLine width="58%" height={28} />
        <SkeletonLine width="95%" />
        <SkeletonLine width="78%" />
        <SkeletonLine width={144} height={42} className="mt-2 rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

/** Blog card skeleton matching PostCard framing */
export const SkeletonPostCard = () => <SkeletonCard />;

/** Grid of blog cards */
export const SkeletonPostGrid = ({ count = 6, label = 'Loading' }: RepeatProps) => (
  <SkeletonCardGrid count={count} label={label} />
);

/** Category pills and search box of the blog filter bar */
export const SkeletonFilterBar = () => (
  <div className="mb-8 flex flex-wrap items-center justify-between gap-4" aria-hidden="true">
    <div className="flex flex-wrap gap-2">
      {[64, 104, 96].map((w, i) => (
        <SkeletonLine key={i} width={w} height={38} className="rounded-full" />
      ))}
    </div>
    <SkeletonLine width={280} height={40} className="w-full sm:w-[280px] rounded-xl" />
  </div>
);
