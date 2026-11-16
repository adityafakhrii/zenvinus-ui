/**
 * Pagination helpers shared by list pages.
 * Pages are 1-based in the URL (?page=2) and turned into limit/offset for the API.
 */
import type { ParsedUrlQuery } from 'querystring';

/** A page button: a page number, or "…" where pages are skipped. */
export type PageItem = number | '…';

export interface PageRange {
  limit: number;
  offset: number;
}

/** Read a 1-based page number from a query value; anything invalid becomes 1. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** API paging for a page number. */
export function pageToRange(page: number, pageSize: number): PageRange {
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

export function totalPages(total: number | null | undefined, pageSize: number): number {
  return Math.max(1, Math.ceil((total || 0) / pageSize));
}

/**
 * Page buttons to show: first, last, the current page and `siblings` pages on each side,
 * with "…" where pages are skipped. E.g. (5, 10) -> [1, '…', 4, 5, 6, '…', 10].
 */
export function getPageItems(current: number, total: number, siblings = 1): PageItem[] {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total]);
  for (let p = current - siblings; p <= current + siblings; p += 1) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((p, i) => {
    if (i > 0) {
      const gap = p - sorted[i - 1];
      // A gap of one page is shown as that page rather than as "…"
      if (gap === 2) items.push(p - 1);
      else if (gap > 2) items.push('…');
    }
    items.push(p);
  });
  return items;
}

/** Query object for a page link, keeping the other filters and dropping page=1 so URLs stay canonical. */
export function pageQuery(query: ParsedUrlQuery | undefined, page: number): ParsedUrlQuery {
  const next: ParsedUrlQuery = {};
  for (const [key, value] of Object.entries(query || {})) {
    if (key !== 'page' && value !== undefined && value !== '') next[key] = value;
  }
  if (page > 1) next.page = String(page);
  return next;
}
