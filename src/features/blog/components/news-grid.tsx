import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Badge, Button, EmptyState } from '@/components/ui';
import { SkeletonNews } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { fetchPostPage } from '../services/posts-api';
import type { PostPage } from '../types/post';
import PostCard from './post-card';

export interface NewsGridProps {
  /** News list preloaded on the server; null when the API failed. */
  initialData?: PostPage | null;
}

/**
 * Editorial /news layout featuring a spotlight release banner followed by a uniform 16:10 grid.
 */
const NewsGrid = ({ initialData }: NewsGridProps) => {
  const { t } = useT();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', 'news'],
    queryFn: () => fetchPostPage('news'),
    initialData: initialData ?? undefined,
    refetchOnMount: false,
  });

  const posts = data?.cards || [];
  const [featured, ...rest] = posts;

  return (
    <section className="min-h-screen bg-canvas py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-2xl">
          <h1 className="m-0 text-[30px] font-semibold tracking-[-0.025em] text-ink sm:text-[38px]">
            {t('News')}
          </h1>
          <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
            {t('Announcements and updates from Zenvinus.')}
          </p>
        </header>

        {(isLoading || isError) && <SkeletonNews label={t('Loading')} />}

        {!isLoading && !isError && !featured && (
          <EmptyState title={t('No news published yet.')} />
        )}

        {featured && (
          <article className="mb-10 grid grid-cols-1 overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface shadow-[0_1px_2px_rgba(2,6,38,0.04)] lg:grid-cols-12">
            <Link
              href={`/news-details?slug=${featured.slug}`}
              className="relative block aspect-[16/10] bg-canvas lg:col-span-6 lg:aspect-auto lg:min-h-[340px]"
            >
              {featured.thumb && (
                <Image
                  src={featured.thumb}
                  alt={featured.title}
                  width={1170}
                  height={650}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              )}
            </Link>

            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                  {featured.category && <Badge tone="blue">{featured.category}</Badge>}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{featured.date}</span>
                  </span>
                  {featured.readTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{featured.readTime}</span>
                    </span>
                  )}
                </div>

                <h2 className="m-0 text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-[26px]">
                  <Link
                    href={`/news-details?slug=${featured.slug}`}
                    className="text-ink no-underline transition-colors hover:text-teal-ink"
                  >
                    {featured.title}
                  </Link>
                </h2>

                {featured.excerpt && (
                  <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
                    {featured.excerpt}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Button
                  href={`/news-details?slug=${featured.slug}`}
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
                >
                  {t('Read More')}
                </Button>
              </div>
            </div>
          </article>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((item, i) => (
              <PostCard key={item.slug || i} item={item} base="/news" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsGrid;
