import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '../services/catalog-api';
import type { AssetKind, AssetListParams } from '../types/asset';
import { DATA_TYPES, type DataType } from '@/config/data-types';
import { useT } from '@/i18n';
import Button from "@/components/ui/button";
import { SkeletonRows } from '@/components/ui/skeleton';

const DTYPE_LABELS: Readonly<Record<DataType, string>> = {
  image: 'Image', text: 'Text', audio: 'Audio', video: 'Video',
  '3d': '3D', document: 'Document', tabular: 'Tabular',
  geospatial: 'Geospatial', time_series: 'Time Series',
};

const SORTS = [
  { value: 'popular', label: 'Popular First' },
  { value: 'quality', label: 'Highest Quality' },
] as const;

export interface AssetsAreaProps {
  /** One component for both the datasets and the models list */
  res?: AssetKind;
}

const DatasetsArea = ({ res = 'Dataset' }: AssetsAreaProps) => {
  const { t, locale } = useT();
  const isDataset = res === 'Dataset';
  const pageTitle = res === 'Dataset' ? 'Datasets' : 'Models';
  // WHY: The same list is used on the public site and in the dashboard; each opens the detail in its own layout
  const router = useRouter();
  const detailBase = `${router.pathname.startsWith('/dashboard') ? '/dashboard' : ''}/${res.toLowerCase()}-details`;
  const pageSub = res === 'Dataset'
    ? 'Free, quality-scored datasets contributed by the community.'
    : 'Community-contributed models for Indonesian language and data.';

  const [query, setQuery] = useState('');
  const [selDtypes, setSelDtypes] = useState<Set<string>>(new Set());
  const [selLic, setSelLic] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<string>('popular');

  const toggleSet = (setter: Dispatch<SetStateAction<Set<string>>>) => (value: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  const toggleDtype = toggleSet(setSelDtypes);
  const toggleLic = toggleSet(setSelLic);

  const params = useMemo(() => {
    const p: AssetListParams = { sort: sort === 'quality' ? 'quality' : undefined };
    if (query.trim()) p.q = query.trim();
    if (selDtypes.size) p.dataType = [...selDtypes];
    if (selLic.size) p.license = [...selLic];
    return p;
  }, [query, selDtypes, selLic, sort]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['assets', res, params],
    queryFn: () => fetchAssets(res, params),
    placeholderData: (prev) => prev,
  });

  const assets = data?.cards || [];
  const facets = data?.facets;

  const licenseFacets = facets?.licenses?.filter((l) => l.count > 0) || [];
  const hasFilters = query.trim() !== '' || selDtypes.size > 0 || selLic.size > 0;
  const countByDtype = (d: string) => facets?.dataTypes?.find((x) => x.value === d)?.count || 0;

  const clearAll = () => {
    setSelDtypes(new Set());
    setSelLic(new Set());
    setQuery('');
  };

  return (
    <section className="tp-portfolio-area pt-120 pb-90">
      <div className="container">
        <div className="pf2-head">
          <div>
            <h3 className="pf2-title">{t(pageTitle)}</h3>
            <p className="pf2-sub">{t(pageSub)}</p>
          </div>
          <div className="pf2-controls">
            <div className="pf2-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder={isDataset ? t('Search datasets, or keywords...') : t('Search models, or keywords...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="pf2-sort">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pf2-layout">
          <aside className="pf2-sidebar">
            <div className="pf2-side-head">
              <h4><i className="fa-solid fa-filter"></i> {t('Filters')}</h4>
              <button type="button" className="pf2-clear" onClick={clearAll}>{t('Clear All')}</button>
            </div>

            <div className="pf2-group">
              <h5>{t('Data Type')}</h5>
              {DATA_TYPES.map((d) => (
                <label key={d} className="pf2-check">
                  <input
                    type="checkbox"
                    checked={selDtypes.has(d)}
                    onChange={() => toggleDtype(d)}
                  />
                  <span>{t(DTYPE_LABELS[d])}</span>
                  <em>{countByDtype(d)}</em>
                </label>
              ))}
            </div>

            <div className="pf2-group">
              <h5>{t('License')}</h5>
              {licenseFacets.length > 0 ? licenseFacets.map((l) => (
                <label key={l.slug} className="pf2-check">
                  <input
                    type="checkbox"
                    checked={selLic.has(l.slug)}
                    onChange={() => toggleLic(l.slug)}
                  />
                  <span>{l.name}</span>
                  <em>{l.count}</em>
                </label>
              )) : <p className="pf2-empty">{isLoading ? t('Loading licenses…') : isError ? '—' : t('No licenses yet.')}</p>}
            </div>
          </aside>

          <div className="pf2-list">
            {(isLoading || isError) && <SkeletonRows count={4} label={t('Loading')} />}
            {!isLoading && !isError && assets.map((asset) => (
              <article key={asset.slug} className="pf2-row">
                <div className={`pf2-thumb pf2-tone-${asset.tone}`}>
                  <i className={res === 'Model' ? 'fa-solid fa-microchip' : 'fa-solid fa-database'}></i>
                </div>
                <div className="pf2-main">
                  <h4 className="pf2-task-title">
                    <Link href={`${detailBase}?slug=${asset.slug}`}>{asset.title}</Link>
                  </h4>
                  <div className="pf2-tags">
                    {asset.tags.map((tag) => <span key={tag} className="pf2-tag">{tag}</span>)}
                  </div>
                  <p className="pf2-desc">{asset.desc}</p>
                  <div className="pf2-meta">
                    {asset.unit && <span><i className="fa-solid fa-database"></i> {asset.unit}</span>}
                    <span><i className="fa-solid fa-download"></i> {t('{count} downloads', { count: asset.downloads.toLocaleString(locale) })}</span>
                    {asset.quality > 0 && <span><i className="fa-solid fa-certificate"></i> {t('Quality {score}', { score: asset.quality })}</span>}
                    {asset.license && <span><i className="fa-solid fa-scale-balanced"></i> {asset.license}</span>}
                  </div>
                </div>
                <div className="pf2-side">
                  <div className="pf2-price">
                    <strong>{asset.price > 0 ? `Rp ${asset.price.toLocaleString(locale)}` : t('Free')}</strong>
                    <span>{t('from community')}</span>
                  </div>
                  <div className="pf2-people">
                    <em><i className="fa-solid fa-download"></i> {asset.downloads.toLocaleString(locale)}</em>
                  </div>
                  <Link href={`${detailBase}?slug=${asset.slug}`} className="pf2-join">{t('Details')}</Link>
                </div>
              </article>
            ))}
            {!isLoading && !isError && assets.length === 0 && (
              <p className="pf2-empty">
                {hasFilters
                  ? (isDataset ? t('No datasets match your filters. Try clearing some filters.') : t('No models match your filters. Try clearing some filters.'))
                  : (isDataset ? t('No datasets published yet.') : t('No models published yet.'))}
              </p>
            )}
          </div>
        </div>

        <div className="pf2-enterprise">
          <div className="pf2-enterprise-icon">
            <i className="fa-solid fa-building"></i>
          </div>
          <div className="pf2-enterprise-copy">
            <span className="pf2-eyebrow">{t('FOR ENTERPRISE')}</span>
            <h3>{t('Need Custom Datasets or Models?')}</h3>
            <p>{t('Get custom-built datasets, models, and AI research with dedicated experts and a community workforce — with custom pricing and licensing for your organization.')}</p>
          </div>
          <Button href="/contact">{t('Get a Quote')}</Button>
        </div>
      </div>
    </section>
  );
};

export default DatasetsArea;
