import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useT } from '@/i18n';
import type { PostCard as PostCardModel } from '../types/post';

export const initials = (name = ''): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'Z';

export interface PostCardProps {
  /** A card model returned by mapPostCard. */
  item: PostCardModel;
  /** Route prefix ("/blog" or "/news"). */
  base?: string;
}

/**
 * Editorial blog/news card with strict 16:10 thumbnail framing and Tailwind hierarchy.
 */
const PostCard = ({ item, base = '/blog' }: PostCardProps) => {
  const { t } = useT();
  const href = `${base}-details?slug=${item.slug}`;

  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface shadow-[0_1px_2px_rgba(2,6,38,0.03)] transition-[border-color,box-shadow] duration-150 hover:border-teal-ink/40 hover:shadow-[0_6px_18px_rgba(2,6,38,0.06)]">
      <div>
        <Link
          href={href}
          aria-label={item.title}
          className="relative block aspect-[16/10] w-full overflow-hidden bg-canvas"
        >
          {item.thumb ? (
            <Image
              src={item.thumb}
              alt={item.title}
              width={770}
              height={481}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-ink-subtle"
              aria-hidden="true"
            >
              <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
            </span>
          )}
        </Link>

        <div className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{item.date}</span>
            </span>
            {item.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{item.readTime}</span>
              </span>
            )}
          </div>

          <h3 className="m-0 text-base font-semibold leading-snug text-ink sm:text-[17px]">
            <Link
              href={href}
              className="text-ink no-underline transition-colors group-hover:text-teal-ink"
            >
              {item.title}
            </Link>
          </h3>

          {item.excerpt && (
            <p className="mt-2 mb-0 line-clamp-3 text-[13px] leading-relaxed text-ink-secondary">
              {item.excerpt}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line-subtle px-5 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-semibold text-white"
            aria-hidden="true"
          >
            {initials(item.author)}
          </span>
          <span className="truncate text-xs font-medium text-ink-secondary">
            {t('By: {name}', { name: item.author })}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {item.category && (
            <Link
              href={{ pathname: base, query: { category: item.categorySlug } }}
              className="no-underline"
            >
              <Badge tone="neutral">{item.category}</Badge>
            </Link>
          )}
          <Link
            href={href}
            aria-label={t('Read More')}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted no-underline transition-colors hover:bg-tint-mint hover:text-teal-ink"
          >
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
