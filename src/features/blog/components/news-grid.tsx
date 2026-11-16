import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPostPage } from '../services/posts-api';
import { useT } from '@/i18n';
import Button from "@/components/ui/button";
import { SkeletonNews } from '@/components/ui/skeleton';
import type { PostPage } from '../types/post';

export interface NewsGridProps {
  /** News page from SSR; null when the API was down */
  initialData?: PostPage | null;
}

const NewsGrid = ({ initialData }: NewsGridProps) => {
  const { t } = useT();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', 'news'],
    queryFn: () => fetchPostPage('news'),
    // WHY: SSR sends null when the API was down; null counts as data and showed "no news". undefined lets the browser fetch
    initialData: initialData ?? undefined,
    refetchOnMount: false,
  });

  const posts = data?.cards || [];
  const [featured, ...rest] = posts;

  return (
    <section className="news__area pt-120 pb-120">
      <div className="container">
        {/* Loading, or the service is down and retrying in the background: keep the skeleton */}
        {(isLoading || isError) && <SkeletonNews label={t('Loading')} />}
        {!isLoading && !isError && !featured && <p className="pf2-empty">{t('No news published yet.')}</p>}
        {featured && (
          <div className="news__featured mb-60">
            <article className="news__featured-item">
              <Link href={`/news-details?slug=${featured.slug}`} className="news__featured-thumb">
                {featured.thumb && <Image src={featured.thumb} alt={featured.title} width={1170} height={540} unoptimized />}
              </Link>
              <div className="news__featured-content">
                <div className="news__meta">
                  {featured.category && <span>{featured.category}</span>}
                  <span><i className="fa-light fa-calendar-days"></i>{featured.date}</span>
                  <span><i className="fa-regular fa-clock"></i>{featured.readTime}</span>
                </div>
                <h2 className="news__featured-title">
                  <Link href={`/news-details?slug=${featured.slug}`}>{featured.title}</Link>
                </h2>
                <p className="news__desc">{featured.excerpt}</p>
                <Button href={`/news-details?slug=${featured.slug}`}>{t('read more')}</Button>
              </div>
            </article>
          </div>
        )}
        <div className="row">
          {rest.map((item, i) =>
            <div key={item.slug || i} className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
              <article className="news__card mb-30">
                <Link href={`/news-details?slug=${item.slug}`} className="news__card-thumb">
                  {item.thumb && <Image src={item.thumb} alt={item.title} width={380} height={240} unoptimized />}
                </Link>
                <div className="news__card-content">
                  <div className="news__meta">
                    {item.category && <span>{item.category}</span>}
                    <span><i className="fa-light fa-calendar-days"></i>{item.date}</span>
                  </div>
                  <h3 className="news__card-title">
                    <Link href={`/news-details?slug=${item.slug}`}>{item.title}</Link>
                  </h3>
                  <Link href={`/news-details?slug=${item.slug}`} className="news__more">
                    {t('read more')} <i className="fa-regular fa-arrow-right"></i>
                  </Link>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
