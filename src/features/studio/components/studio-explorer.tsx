import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ParsedUrlQuery } from 'querystring';
import type { UrlObject } from 'url';
import { ViewerCell } from '@/features/catalog';
import { ApiError } from '@/services/api';
import { getStudioDataset, getStudioRows, getStudioStats } from '../services/studio-api';
import { STUDIO_PAGE_SIZE, studioBase } from '../constants';
import { getPageItems, pageQuery, parsePage, totalPages } from '@/utils/pagination';
import { currentLocale, useT } from '@/i18n';

const TYPE_ICON: Readonly<Record<string, string>> = {
  string: 'fa-solid fa-font', int: 'fa-solid fa-hashtag', float: 'fa-solid fa-hashtag',
  bool: 'fa-solid fa-toggle-on', image: 'fa-regular fa-image', audio: 'fa-solid fa-headphones',
};

const fmt = (n: unknown): string => (typeof n === 'number' ? n.toLocaleString(currentLocale(), { maximumFractionDigits: 2 }) : '—');
const STATUS_LABEL: Readonly<Record<string, string>> = { draft: 'Draft', published: 'Published', archived: 'Archived' };

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
    <nav className="basic-pagination text-center" aria-label={t('Row pages')}>
      <ul>
        <li>
          {page > 1
            ? <Link href={hrefFor(page - 1)} shallow scroll={false} aria-label={t('Previous page')}><i className="fa-regular fa-angles-left"></i></Link>
            : <span className="pagination-disabled" aria-disabled="true"><i className="fa-regular fa-angles-left"></i></span>}
        </li>
        {getPageItems(Math.min(page, pages), pages).map((item, i) => (
          <li key={item === '…' ? `gap-${i}` : item}>
            {item === '…' ? <span className="pagination-gap" aria-hidden="true">…</span>
              : item === page ? <span className="current" aria-current="page">{item}</span>
                : <Link href={hrefFor(item)} shallow scroll={false} aria-label={t('Page {n}', { n: item })}>{item}</Link>}
          </li>
        ))}
        <li>
          {page < pages
            ? <Link href={hrefFor(page + 1)} shallow scroll={false} aria-label={t('Next page')}><i className="fa-regular fa-angles-right"></i></Link>
            : <span className="pagination-disabled" aria-disabled="true"><i className="fa-regular fa-angles-right"></i></span>}
        </li>
      </ul>
    </nav>
  );
}

function StatsView({ slug, split }: { slug: string; split: string }) {
  const { t } = useT();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['studio', 'stats', slug, split], queryFn: () => getStudioStats(slug, split), enabled: !!split });
  if (isLoading) return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  if (isError) return <p className="pf2-empty">{t('Failed to load statistics: {error}', { error: t(error?.message ?? '') })}</p>;
  if (!data?.columns?.length) return <p className="pf2-empty">{t('This split has no columns yet.')}</p>;
  return (
    <>
      <p className="hf-viewer-note studio-note">
        {t('{rows} rows', { rows: fmt(data.rows) })}{data.sampled ? ` · ${t('statistics computed from the first {count} rows', { count: fmt(10000) })}` : ''}
      </p>
      <div className="studio-stats">
        {data.columns.map((c) => (
          <div key={c.name} className="hf-card studio-stat">
            <h5><i className={TYPE_ICON[c.type] || 'fa-solid fa-font'}></i> {c.name} <em>{c.type}</em></h5>
            <ul className="hf-meta">
              <li><span className="hf-meta-label">{t('Values')}</span><span className="hf-meta-value">{fmt(c.count)}</span></li>
              <li><span className="hf-meta-label">{t('Empty')}</span><span className="hf-meta-value">{fmt(c.nulls)}</span></li>
              <li><span className="hf-meta-label">{t('Distinct')}</span><span className="hf-meta-value">{fmt(c.distinct)}</span></li>
              {c.min != null && <li><span className="hf-meta-label">Min</span><span className="hf-meta-value">{fmt(c.min)}</span></li>}
              {c.max != null && <li><span className="hf-meta-label">Max</span><span className="hf-meta-value">{fmt(c.max)}</span></li>}
              {c.mean != null && <li><span className="hf-meta-label">{t('Mean')}</span><span className="hf-meta-value">{fmt(c.mean)}</span></li>}
              {c.minLength != null && <li><span className="hf-meta-label">{t('Length')}</span><span className="hf-meta-value">{t('{min}–{max} chars', { min: c.minLength, max: c.maxLength })}</span></li>}
            </ul>
            {(c.top?.length ?? 0) > 0 && (
              <div className="studio-top">
                {(c.top ?? []).map((top) => {
                  const pct = c.count ? Math.round((top.count / c.count) * 100) : 0;
                  return (
                    <div key={top.value} className="studio-top-row" title={`${top.value}: ${top.count}`}>
                      <span className="studio-top-label">{top.value}</span>
                      <span className="studio-top-bar"><span style={{ width: `${pct}%` }}></span></span>
                      <span className="studio-top-count">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

const StudioExplorer = () => {
  const ex = useExplorerQuery();
  const base = studioBase(ex.pathname);
  const { t } = useT();
  const [searchText, setSearchText] = useState(ex.search);
  useEffect(() => setSearchText(ex.search), [ex.search]);

  const datasetQuery = useQuery({ queryKey: ['studio', 'dataset', ex.slug], queryFn: () => getStudioDataset(ex.slug), enabled: !!ex.slug });
  const dataset = datasetQuery.data;
  const split = ex.split || dataset?.splits?.[0]?.name || '';

  const rowsQuery = useQuery({
    queryKey: ['studio', 'rows', ex.slug, split, ex.search, ex.page],
    queryFn: () => getStudioRows(ex.slug, { split, q: ex.search, page: ex.page }),
    enabled: !!ex.slug && !!split && ex.view === 'rows',
    placeholderData: keepPreviousData,
  });

  if (!ex.slug) return <p className="pf2-empty">{t('Choose a dataset from the {list}.', { list: <Link href={base}>{t('studio list')}</Link> })}</p>;
  if (datasetQuery.isLoading) return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  if (datasetQuery.isError) {
    const { error } = datasetQuery;
    return <p className="pf2-empty">{error instanceof ApiError && error.status === 404 ? t('Dataset not found.') : t('Failed to load the dataset: {error}', { error: t(error.message) })} <Link href={base}>{t('Back to the studio')}</Link></p>;
  }
  // Loaded without an error means the dataset is there
  if (!dataset) return null;

  const rows = rowsQuery.data;
  const columns = rows?.columns || dataset.columns || [];
  const pages = totalPages(rows?.total || 0, STUDIO_PAGE_SIZE);
  const offset = (ex.page - 1) * STUDIO_PAGE_SIZE;
  const hrefFor = (n: number): UrlObject => ({ pathname: ex.pathname, query: pageQuery({ ...ex.query, split }, n) });
  const features = Object.fromEntries(columns.filter((c) => c.type === 'image').map((c) => [c.name, 'image']));

  return (
    <>
      <div className="studio-toolbar">
        <div>
          <Link href={base} className="studio-back"><i className="fa-solid fa-arrow-left"></i> {t('All datasets')}</Link>
          <h4 className="studio-dataset-name">{dataset.name} <span className={`studio-status studio-status-${dataset.status}`}>{t(STATUS_LABEL[dataset.status] || dataset.status)}</span></h4>
        </div>
        <div className="studio-actions">
          {dataset.status === 'published' && <Link href={`/dataset-details?slug=${dataset.slug}`} className="studio-btn studio-btn-light"><i className="fa-solid fa-arrow-up-right-from-square"></i> {t('Public page')}</Link>}
          {dataset.canEdit && <Link href={`${base}/edit?slug=${dataset.slug}`} className="hf-primary studio-btn"><i className="fa-solid fa-pen"></i> {t('Edit')}</Link>}
        </div>
      </div>

      {dataset.splits.length === 0 ? (
        <p className="pf2-empty">
          {t('This dataset has no data yet.')}{dataset.canEdit && <> {t('{upload} to add some.', { upload: <Link href={`${base}/edit?slug=${dataset.slug}`}>{t('Upload a CSV file')}</Link> })}</>}
        </p>
      ) : (
        <>
          <p className="studio-hint studio-split-label">{t('Splits are parts of the dataset, such as {train} and {test}. Choose one to view:', { train: <b>train</b>, test: <b>test</b> })}</p>
          <nav className="hf-tabs" aria-label={t('Splits')}>
            {dataset.splits.map((s) => (
              <Link key={s.name} href={{ pathname: ex.pathname, query: { slug: ex.slug, split: s.name, ...(ex.view === 'stats' ? { view: 'stats' } : {}) } }}
                shallow scroll={false} className={s.name === split ? 'hf-active' : undefined} aria-current={s.name === split ? 'page' : undefined}>
                {s.name} <em className="studio-count">{fmt(s.rows)}</em>
              </Link>
            ))}
          </nav>

          <div className="studio-toolbar">
            <div className="studio-view-switch" role="tablist">
              <button type="button" role="tab" aria-selected={ex.view === 'rows'} className={ex.view === 'rows' ? 'is-active' : ''} onClick={() => ex.set({ view: undefined, split })}>
                <i className="fa-solid fa-table"></i> {t('Table')}
              </button>
              <button type="button" role="tab" aria-selected={ex.view === 'stats'} className={ex.view === 'stats' ? 'is-active' : ''} onClick={() => ex.set({ view: 'stats', split, page: undefined })}>
                <i className="fa-solid fa-chart-column"></i> {t('Column summary')}
              </button>
            </div>
            {ex.view === 'rows' && (
              <form className="studio-search" onSubmit={(e) => { e.preventDefault(); ex.set({ q: searchText.trim(), page: undefined, split }); }}>
                <input type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={t('Search in this split…')} aria-label={t('Search rows')} maxLength={200} />
                <button type="submit" aria-label={t('Search')}><i className="fa-solid fa-magnifying-glass"></i></button>
              </form>
            )}
          </div>

          {ex.view === 'stats' ? <StatsView slug={ex.slug} split={split} /> : (
            <div className="hf-card">
              {rowsQuery.isLoading && <div className="tflow-loading"><span className="spinner-border"></span></div>}
              {rowsQuery.isError && <p className="pf2-empty">{t('Failed to load rows: {error}', { error: t(rowsQuery.error?.message ?? '') })}</p>}
              {rows && (
                <>
                  <p className="hf-viewer-note studio-note">
                    {rows.total === 0
                      ? (ex.search ? t('No rows contain "{query}".', { query: ex.search }) : t('This split is empty.'))
                      : t(ex.search ? 'Rows {from}–{to} of {total} matching "{query}"' : 'Rows {from}–{to} of {total}', {
                        from: fmt(offset + 1), to: fmt(Math.min(offset + rows.data.length, rows.total)), total: fmt(rows.total), query: ex.search,
                      })}
                    {ex.search && <> · <button type="button" className="studio-link" onClick={() => ex.set({ q: undefined, page: undefined, split })}>{t('Clear search')}</button></>}
                  </p>
                  {rows.data.length > 0 && (
                    <div className="hf-viewer" style={{ opacity: rowsQuery.isFetching ? 0.6 : 1 }}>
                      <table>
                        <thead>
                          <tr>
                            <th className="studio-rownum">#</th>
                            {columns.map((c) => <th key={c.name} title={c.type}><i className={TYPE_ICON[c.type] || 'fa-solid fa-font'}></i> {c.name}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.data.map((row, i) => (
                            <tr key={offset + i}>
                              <td className="hf-mono studio-rownum">{offset + i}</td>
                              {row.map((cell, j) => <ViewerCell key={j} column={columns[j]?.name} value={cell} features={features} />)}
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
    </>
  );
};

export default StudioExplorer;
