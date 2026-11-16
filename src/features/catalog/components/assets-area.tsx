import React, { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Building2,
  Cpu,
  Database,
  Download,
  Scale,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Badge,
  Button,
  CustomCheckbox,
  CustomSelect,
  Drawer,
  EmptyState,
  SearchInput,
  cn,
} from '@/components/ui';
import type { BadgeTone, SelectOption } from '@/components/ui';
import { SkeletonRows } from '@/components/ui/skeleton';
import { DATA_TYPES, isDataType, type DataType } from '@/config/data-types';
import { useT } from '@/i18n';
import { fetchAssets } from '../services/catalog-api';
import type { AssetKind, AssetListParams } from '../types/asset';

const DTYPE_LABELS: Readonly<Record<DataType, string>> = {
  image: 'Image',
  text: 'Text',
  audio: 'Audio',
  video: 'Video',
  '3d': '3D',
  document: 'Document',
  tabular: 'Tabular',
  geospatial: 'Geospatial',
  time_series: 'Time Series',
};

const TONE_MAP: Readonly<Record<string, BadgeTone>> = {
  blue: 'blue',
  mint: 'mint',
  green: 'mint',
  purple: 'purple',
  orange: 'orange',
  amber: 'amber',
  red: 'red',
};

const ICON_SURFACE: Readonly<Record<string, string>> = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  green: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-purple-bg text-tone-purple-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
};

export interface AssetsAreaProps {
  /** Shared catalog view for both Dataset and Model listings. */
  res?: AssetKind;
}

/**
 * Shared Marketplace Catalog for Datasets (/datasets, /dashboard/datasets) and Models (/models).
 */
const DatasetsArea = ({ res = 'Dataset' }: AssetsAreaProps) => {
  const { t, locale } = useT();
  const router = useRouter();
  const isDataset = res === 'Dataset';
  const pageTitle = isDataset ? 'Datasets' : 'Models';
  const pageSub = isDataset
    ? 'Free, quality-scored datasets contributed by the community.'
    : 'Community-contributed models for Indonesian language and data.';
  const detailBase = `${router.pathname.startsWith('/dashboard') ? '/dashboard' : ''}/${res.toLowerCase()}-details`;

  const [query, setQuery] = useState('');
  const [selDtypes, setSelDtypes] = useState<Set<string>>(new Set());
  const [selLic, setSelLic] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<string>('popular');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleSet = (setter: Dispatch<SetStateAction<Set<string>>>) => (value: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  const toggleDtype = toggleSet(setSelDtypes);
  const toggleLic = toggleSet(setSelLic);

  const sortOptions: SelectOption[] = useMemo(
    () => [
      { value: 'popular', label: t('Popular First') },
      { value: 'quality', label: t('Highest Quality') },
    ],
    [t],
  );

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
  const activeFilterCount = selDtypes.size + selLic.size;

  const clearAll = () => {
    setSelDtypes(new Set());
    setSelLic(new Set());
    setQuery('');
  };

  const renderFilterGroups = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
          {t('Data Type')}
        </h3>
        <div className="flex flex-col gap-2.5">
          {DATA_TYPES.map((d) => (
            <div key={d} className="flex items-center justify-between gap-2">
              <CustomCheckbox
                checked={selDtypes.has(d)}
                onChange={() => toggleDtype(d)}
                label={t(DTYPE_LABELS[d])}
              />
              <span className="font-mono text-xs text-ink-muted tabular-nums">
                {countByDtype(d)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line-subtle pt-5">
        <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
          {t('License')}
        </h3>
        {licenseFacets.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {licenseFacets.map((l) => (
              <div key={l.slug} className="flex items-center justify-between gap-2">
                <CustomCheckbox
                  checked={selLic.has(l.slug)}
                  onChange={() => toggleLic(l.slug)}
                  label={l.name}
                />
                <span className="font-mono text-xs text-ink-muted tabular-nums">{l.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-xs text-ink-muted">
            {isLoading ? t('Loading licenses…') : isError ? '—' : t('No licenses yet.')}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-canvas py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Header & Search/Sort Toolbar */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m-0 text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[34px]">
              {t(pageTitle)}
            </h1>
            <p className="mt-1.5 mb-0 text-sm text-ink-secondary">{t(pageSub)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={
                isDataset ? t('Search datasets') : t('Search models')
              }
              size="sm"
              containerClassName="w-full sm:w-64"
            />
            <CustomSelect
              value={sort}
              onChange={setSort}
              options={sortOptions}
              size="sm"
              ariaLabel={t('Sort by')}
              containerClassName="w-44"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="lg:hidden"
              leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />}
              onClick={() => setMobileFiltersOpen(true)}
            >
              {t('Filters')}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>
        </div>

        {/* Sidebar + Main Catalog Layout */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-22 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <div className="mb-5 flex items-center justify-between border-b border-line-subtle pb-3">
                <h2 className="m-0 text-sm font-semibold text-ink">{t('Filters')}</h2>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-medium text-teal-ink hover:underline cursor-pointer"
                  >
                    {t('Clear All')}
                  </button>
                )}
              </div>
              {renderFilterGroups()}
            </div>
          </aside>

          {/* Cards Column */}
          <div className="flex flex-col gap-4">
            {(isLoading || isError) && <SkeletonRows count={4} label={t('Loading')} />}

            {!isLoading &&
              !isError &&
              assets.map((asset) => {
                const badgeTone = TONE_MAP[asset.tone] ?? 'neutral';
                const iconClass = ICON_SURFACE[asset.tone] ?? 'bg-canvas text-ink-secondary';
                const dtypeLabel = isDataType(asset.dtype) ? DTYPE_LABELS[asset.dtype] : asset.dtype;
                const Icon = isDataset ? Database : Cpu;
                return (
                  <article
                    key={asset.slug}
                    className="flex flex-col justify-between gap-5 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] transition-colors hover:border-teal-ink/40 sm:flex-row sm:items-center sm:p-6"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                          iconClass,
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="m-0 text-base font-semibold text-ink sm:text-[17px]">
                            <Link
                              href={`${detailBase}?slug=${asset.slug}`}
                              className="text-ink no-underline transition-colors hover:text-teal-ink"
                            >
                              {asset.title}
                            </Link>
                          </h2>
                          {dtypeLabel && <Badge tone={badgeTone}>{t(dtypeLabel)}</Badge>}
                        </div>

                        {asset.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {asset.tags.map((tag) => (
                              <Badge key={tag} tone="neutral">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                          {asset.desc}
                        </p>

                        <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-muted">
                          {asset.unit && (
                            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                              <Database className="h-3.5 w-3.5" strokeWidth={1.5} />
                              <span>{asset.unit}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span>{t('{count} downloads', { count: asset.downloads.toLocaleString(locale) })}</span>
                          </span>
                          {asset.quality > 0 && (
                            <span className="inline-flex items-center gap-1.5 font-medium text-teal-ink">
                              <Award className="h-3.5 w-3.5" strokeWidth={1.6} />
                              <span>{t('Quality {score}', { score: asset.quality })}</span>
                            </span>
                          )}
                          {asset.license && (
                            <span className="inline-flex items-center gap-1.5">
                              <Scale className="h-3.5 w-3.5" strokeWidth={1.5} />
                              <span>{asset.license}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-line-subtle pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-base font-semibold text-ink tabular-nums">
                          {asset.price > 0 ? `Rp ${asset.price.toLocaleString(locale)}` : t('Free')}
                        </div>
                        <div className="text-[11px] text-ink-muted">{t('from community')}</div>
                      </div>

                      <Button
                        href={`${detailBase}?slug=${asset.slug}`}
                        variant="secondary"
                        size="sm"
                      >
                        {t('Details')}
                      </Button>
                    </div>
                  </article>
                );
              })}

            {!isLoading && !isError && assets.length === 0 && (
              <EmptyState
                title={
                  hasFilters
                    ? isDataset
                      ? t('No datasets match your filters. Try clearing some filters.')
                      : t('No models match your filters. Try clearing some filters.')
                    : isDataset
                      ? t('No datasets published yet.')
                      : t('No models published yet.')
                }
                action={
                  hasFilters ? (
                    <Button type="button" variant="secondary" size="sm" onClick={clearAll}>
                      {t('Clear All')}
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>

        {/* Bottom Enterprise Custom CTA */}
        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-navy p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal">
              <Building2 className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div>
              <span className="text-xs font-medium text-teal">
                {t('For enterprise')}
              </span>
              <h3 className="mt-1 mb-0 text-lg font-semibold text-white">
                {t('Need Custom Datasets or Models?')}
              </h3>
              <p className="mt-1.5 mb-0 max-w-2xl text-[13px] leading-relaxed text-white/75">
                {t(
                  'Get custom-built datasets, models, and AI research with dedicated experts and a community workforce — with custom pricing and licensing for your organization.',
                )}
              </p>
            </div>
          </div>

          <Button href="/contact" variant="teal" size="md" className="shrink-0">
            {t('Get a Quote')}
          </Button>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        side="left"
        title={t('Filters')}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              {t('Clear All')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setMobileFiltersOpen(false)}
            >
              {t('Apply')}
            </Button>
          </div>
        }
      >
        {renderFilterGroups()}
      </Drawer>
    </section>
  );
};

export default DatasetsArea;
