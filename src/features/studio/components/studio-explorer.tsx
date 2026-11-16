import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ParsedUrlQuery } from 'querystring';
import type { UrlObject } from 'url';
import {
  ArrowLeft,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Hash,
  Headphones,
  Image as ImageIcon,
  Pencil,
  Table2,
  ToggleLeft,
  Type,
} from 'lucide-react';
import { ViewerCell } from '@/features/catalog';
import { ApiError } from '@/services/api';
import { getStudioDataset, getStudioRows, getStudioStats } from '../services/studio-api';
import { STUDIO_PAGE_SIZE, studioBase } from '../constants';
import { getPageItems, pageQuery, parsePage, totalPages } from '@/utils/pagination';
import { currentLocale, useT } from '@/i18n';
import {
  Badge,
  BentoSkeleton,
  Button,
  EmptyState,
  ErrorState,
  SearchInput,
  SegmentedControl,
  TableSkeleton,
  type BadgeTone,
} from '@/components/ui';

type ColGlyph = typeof Type;

const TYPE_ICON: Readonly<Record<string, ColGlyph>> = {
  string: Type,
  int: Hash,
  float: Hash,
  bool: ToggleLeft,
  image: ImageIcon,
  audio: Headphones,
};

const ColumnGlyph = ({ type }: { type: string }) => {
  const Icon = TYPE_ICON[type] || Type;
  return <Icon className="h-3.5 w-3.5 shrink-0 text-[#00B2A9]" strokeWidth={1.75} aria-hidden="true" />;
};

const fmt = (n: unknown): string =>
  typeof n === 'number' ? n.toLocaleString(currentLocale(), { maximumFractionDigits: 2 }) : '—';

const STATUS_LABEL: Readonly<Record<string, string>> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_TONE: Readonly<Record<string, BadgeTone>> = {
  draft: 'amber',
  published: 'mint',
  archived: 'neutral',
};

type ExplorerView = 'rows' | 'stats';

/** Query changes; undefined or '' removes the key */
type ExplorerChanges = Readonly<Record<string, string | undefined>>;

interface ExplorerQuery {
  slug: string;
  split: string;
  search: string;
  page: number;
  view: ExplorerView;
  query: ParsedUrlQuery;
  pathname: string;
  set: (changes: ExplorerChanges) => void;
}

/** The URL holds the split, search text, page and view, so a view can be shared and Back works. */
function useExplorerQuery(): ExplorerQuery {
  const router = useRouter();
  const q = router.query;
  const set = (changes: ExplorerChanges) => {
    const next: Record<string, string | string[] | undefined> = { ...q, ...changes };
    Object.keys(next).forEach((k) => {
      if (next[k] === undefined || next[k] === '') delete next[k];
    });
    router.push({ pathname: router.pathname, query: next }, undefined, { shallow: true, scroll: false });
  };
  return {
    slug: typeof q.slug === 'string' ? q.slug : '',
    split: typeof q.split === 'string' ? q.split : '',
    search: typeof q.q === 'string' ? q.q : '',
    page: parsePage(q.page),
    view: q.view === 'stats' ? 'stats' : 'rows',
    query: q,
    pathname: router.pathname,
    set,
  };
}

interface PaginationProps {
  page: number;
  pages: number;
  hrefFor: (page: number) => UrlObject;
}

function Pagination({ page, pages, hrefFor }: PaginationProps) {
  const { t } = useT();
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-1.5 border-t border-[#EAEAEA] px-4 py-3.5" aria-label={t('Row pages')}>
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          shallow
          scroll={false}
          aria-label={t('Previous page')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAEAEA] bg-white text-[#52525B] transition-colors hover:bg-[#F9FAFB] hover:text-[#18181B]"
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.6} />
        </Link>
      ) : (
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAEAEA] bg-[#F9FAFB] text-[#D4D4D8]"
          aria-disabled="true"
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.6} />
        </span>
      )}

      {getPageItems(Math.min(page, pages), pages).map((item, i) =>
        item === '…' ? (
          <span key={`gap-${i}`} className="px-1.5 text-xs text-[#9CA3AF]" aria-hidden="true">
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#132B45] px-2 text-xs font-semibold tabular-nums text-white"
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            shallow
            scroll={false}
            aria-label={t('Page {n}', { n: item })}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#EAEAEA] bg-white px-2 text-xs font-medium tabular-nums text-[#52525B] transition-colors hover:bg-[#F9FAFB] hover:text-[#18181B]"
          >
            {item}
          </Link>
        ),
      )}

      {page < pages ? (
        <Link
          href={hrefFor(page + 1)}
          shallow
          scroll={false}
          aria-label={t('Next page')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAEAEA] bg-white text-[#52525B] transition-colors hover:bg-[#F9FAFB] hover:text-[#18181B]"
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.6} />
        </Link>
      ) : (
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAEAEA] bg-[#F9FAFB] text-[#D4D4D8]"
          aria-disabled="true"
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.6} />
        </span>
      )}
    </nav>
  );
}

function StatsView({ slug, split }: { slug: string; split: string }) {
  const { t } = useT();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['studio', 'stats', slug, split],
    queryFn: () => getStudioStats(slug, split),
    enabled: !!split,
  });

  if (isLoading) return <BentoSkeleton />;
  if (isError) {
    return (
      <ErrorState
        title={t('Failed to load statistics: {error}', { error: t(error?.message ?? '') })}
        message={t(error?.message ?? '')}
      />
    );
  }
  if (!data?.columns?.length) return <EmptyState title={t('This split has no columns yet.')} />;

  return (
    <div className="space-y-4">
      <p className="m-0 text-xs font-medium text-[#6B7280] tabular-nums">
        {t('{rows} rows', { rows: fmt(data.rows) })}
        {data.sampled ? ` · ${t('statistics computed from the first {count} rows', { count: fmt(10000) })}` : ''}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.columns.map((c) => (
          <div key={c.name} className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#F0F0F2] pb-2.5">
              <h5 className="m-0 flex items-center gap-2 text-sm font-semibold text-[#18181B]">
                <ColumnGlyph type={c.type} />
                <span className="truncate">{c.name}</span>
              </h5>
              <Badge tone="neutral" mono>
                {c.type}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#6B7280]">{t('Values')}</dt>
                <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">{fmt(c.count)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#6B7280]">{t('Empty')}</dt>
                <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">{fmt(c.nulls)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[#6B7280]">{t('Distinct')}</dt>
                <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">{fmt(c.distinct)}</dd>
              </div>
              {c.min != null && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-[#6B7280]">Min</dt>
                  <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">{fmt(c.min)}</dd>
                </div>
              )}
              {c.max != null && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-[#6B7280]">Max</dt>
                  <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">{fmt(c.max)}</dd>
                </div>
              )}
              {c.mean != null && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-[#6B7280]">{t('Mean')}</dt>
                  <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">{fmt(c.mean)}</dd>
                </div>
              )}
              {c.minLength != null && (
                <div className="col-span-2 flex items-center justify-between gap-2">
                  <dt className="text-[#6B7280]">{t('Length')}</dt>
                  <dd className="m-0 font-mono font-semibold tabular-nums text-[#18181B]">
                    {t('{min}–{max} chars', { min: c.minLength, max: c.maxLength })}
                  </dd>
                </div>
              )}
            </dl>

            {(c.top?.length ?? 0) > 0 && (
              <div className="mt-4 space-y-2 border-t border-[#F0F0F2] pt-3">
                {(c.top ?? []).map((top) => {
                  const pct = c.count ? Math.round((top.count / c.count) * 100) : 0;
                  return (
                    <div key={top.value} className="grid grid-cols-[minmax(0,1fr)_80px_34px] items-center gap-2 text-xs" title={`${top.value}: ${top.count}`}>
                      <span className="truncate font-medium text-[#52525B]">{top.value}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                        <span className="block h-full rounded-full bg-[#00B2A9]" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="text-right font-mono text-[11px] font-semibold tabular-nums text-[#18181B]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const StudioExplorer = () => {
  const ex = useExplorerQuery();
  const base = studioBase(ex.pathname);
  const { t } = useT();
  const [searchText, setSearchText] = useState(ex.search);
  useEffect(() => setSearchText(ex.search), [ex.search]);

  const datasetQuery = useQuery({
    queryKey: ['studio', 'dataset', ex.slug],
    queryFn: () => getStudioDataset(ex.slug),
    enabled: !!ex.slug,
  });
  const dataset = datasetQuery.data;
  const split = ex.split || dataset?.splits?.[0]?.name || '';

  const rowsQuery = useQuery({
    queryKey: ['studio', 'rows', ex.slug, split, ex.search, ex.page],
    queryFn: () => getStudioRows(ex.slug, { split, q: ex.search, page: ex.page }),
    enabled: !!ex.slug && !!split && ex.view === 'rows',
    placeholderData: keepPreviousData,
  });

  if (!ex.slug) {
    return (
      <EmptyState
        title={t('Dataset Studio')}
        action={
          <div className="flex flex-col items-center gap-3">
            <p className="m-0 text-sm text-ink-secondary">
              {t('Choose a dataset from the {list}.', {
                list: (
                  <Link href={base} className="text-[#008C85] underline">
                    {t('studio list')}
                  </Link>
                ),
              })}
            </p>
            <Button variant="secondary" href={base}>
              {t('All datasets')}
            </Button>
          </div>
        }
      />
    );
  }

  if (datasetQuery.isLoading) return <BentoSkeleton />;

  if (datasetQuery.isError) {
    const { error } = datasetQuery;
    return (
      <ErrorState
        title={
          error instanceof ApiError && error.status === 404
            ? t('Dataset not found.')
            : t('Failed to load the dataset: {error}', { error: t(error.message) })
        }
        message={t(error.message)}
        onRetry={() => datasetQuery.refetch()}
      />
    );
  }

  if (!dataset) return null;

  const rows = rowsQuery.data;
  const columns = rows?.columns || dataset.columns || [];
  const pages = totalPages(rows?.total || 0, STUDIO_PAGE_SIZE);
  const offset = (ex.page - 1) * STUDIO_PAGE_SIZE;
  const hrefFor = (n: number): UrlObject => ({ pathname: ex.pathname, query: pageQuery({ ...ex.query, split }, n) });
  const features = Object.fromEntries(columns.filter((c) => c.type === 'image').map((c) => [c.name, 'image']));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={base}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#18181B]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t('All datasets')}
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="m-0 text-xl font-bold tracking-tight text-[#18181B]">{dataset.name}</h2>
            <Badge tone={STATUS_TONE[dataset.status] || 'neutral'} dot>
              {t(STATUS_LABEL[dataset.status] || dataset.status)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dataset.status === 'published' && (
            <Button
              variant="secondary"
              size="sm"
              href={`/dataset-details?slug=${dataset.slug}`}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />}
            >
              {t('Public page')}
            </Button>
          )}
          {dataset.canEdit && (
            <Button
              variant="primary"
              size="sm"
              href={`${base}/edit?slug=${dataset.slug}`}
              leftIcon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.6} />}
            >
              {t('Edit')}
            </Button>
          )}
        </div>
      </div>

      {dataset.splits.length === 0 ? (
        <EmptyState
          title={t('This dataset has no data yet.')}
          action={
            dataset.canEdit ? (
              <Button variant="primary" href={`${base}/edit?slug=${dataset.slug}`}>
                {t('Upload a CSV file')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="rounded-2xl border border-[#EAEAEA] bg-white p-4">
            <p className="mb-2.5 text-xs text-[#6B7280]">
              {t('Splits are parts of the dataset, such as {train} and {test}. Choose one to view:', {
                train: <strong className="font-semibold text-[#18181B]">train</strong>,
                test: <strong className="font-semibold text-[#18181B]">test</strong>,
              })}
            </p>
            <nav className="flex flex-wrap gap-2" aria-label={t('Splits')}>
              {dataset.splits.map((s) => {
                const active = s.name === split;
                return (
                  <Link
                    key={s.name}
                    href={{
                      pathname: ex.pathname,
                      query: { slug: ex.slug, split: s.name, ...(ex.view === 'stats' ? { view: 'stats' } : {}) },
                    }}
                    shallow
                    scroll={false}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-[#132B45] bg-[#132B45] text-white'
                        : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#52525B] hover:border-[#D4D4D8] hover:bg-white hover:text-[#18181B]'
                    }`}
                  >
                    <span className="font-mono">{s.name}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${
                        active ? 'bg-white/15 text-white' : 'bg-white text-[#6B7280]'
                      }`}
                    >
                      {fmt(s.rows)}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl<ExplorerView>
              ariaLabel={t('Table')}
              value={ex.view}
              onChange={(next) =>
                ex.set(next === 'stats' ? { view: 'stats', split, page: undefined } : { view: undefined, split })
              }
              options={[
                {
                  value: 'rows',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Table2 className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {t('Table')}
                    </span>
                  ),
                },
                {
                  value: 'stats',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {t('Column summary')}
                    </span>
                  ),
                },
              ]}
            />

            {ex.view === 'rows' && (
              <form
                className="w-full sm:w-80"
                onSubmit={(e) => {
                  e.preventDefault();
                  ex.set({ q: searchText.trim(), page: undefined, split });
                }}
              >
                <SearchInput
                  size="sm"
                  value={searchText}
                  onChange={(next) => {
                    setSearchText(next);
                    if (!next && ex.search) ex.set({ q: undefined, page: undefined, split });
                  }}
                  placeholder={t('Search in this split…')}
                  aria-label={t('Search rows')}
                  clearLabel={t('Clear search')}
                  maxLength={200}
                />
              </form>
            )}
          </div>

          {ex.view === 'stats' ? (
            <StatsView slug={ex.slug} split={split} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white">
              {rowsQuery.isLoading && (
                <div className="p-4">
                  <TableSkeleton />
                </div>
              )}
              {rowsQuery.isError && (
                <div className="p-4">
                  <ErrorState
                    title={t('Failed to load rows: {error}', { error: t(rowsQuery.error?.message ?? '') })}
                    message={t(rowsQuery.error?.message ?? '')}
                  />
                </div>
              )}
              {rows && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAEAEA] bg-[#F9FAFB] px-4 py-2.5 text-xs text-[#6B7280] tabular-nums">
                    <span>
                      {rows.total === 0
                        ? ex.search
                          ? t('No rows contain "{query}".', { query: ex.search })
                          : t('This split is empty.')
                        : t(ex.search ? 'Rows {from}–{to} of {total} matching "{query}"' : 'Rows {from}–{to} of {total}', {
                            from: fmt(offset + 1),
                            to: fmt(Math.min(offset + rows.data.length, rows.total)),
                            total: fmt(rows.total),
                            query: ex.search,
                          })}
                    </span>
                    {ex.search && (
                      <button
                        type="button"
                        className="font-medium text-[#008C85] hover:underline"
                        onClick={() => ex.set({ q: undefined, page: undefined, split })}
                      >
                        {t('Clear search')}
                      </button>
                    )}
                  </div>

                  {rows.data.length > 0 && (
                    <div
                      className="overflow-x-auto transition-opacity"
                      style={{ opacity: rowsQuery.isFetching ? 0.6 : 1 }}
                    >
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA] font-semibold text-[#52525B]">
                            <th className="w-12 px-3 py-2.5 font-mono text-[#9CA3AF]">#</th>
                            {columns.map((c) => (
                              <th key={c.name} title={c.type} className="px-3 py-2.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5">
                                  <ColumnGlyph type={c.type} />
                                  {c.name}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F0F2]">
                          {rows.data.map((row, i) => (
                            <tr key={offset + i} className="hover:bg-[#FAFAFA]">
                              <td className="px-3 py-2 font-mono text-[11px] tabular-nums text-[#9CA3AF]">{offset + i}</td>
                              {row.map((cell, j) => (
                                <ViewerCell key={j} column={columns[j]?.name} value={cell} features={features} />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Pagination page={ex.page} pages={pages} hrefFor={hrefFor} />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudioExplorer;
