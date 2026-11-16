/**
 * Display formatting shared by every feature. Dates follow the chosen site language (Nov 7, 2026 / 7 Nov 2026).
 */
import { currentLocale } from '@/i18n';
import type { IsoDateString } from '@/types/api';

const DATE_FORMATS: Record<string, Intl.DateTimeFormat> = {};
const dateFormat = (): Intl.DateTimeFormat => {
  const locale = currentLocale();
  DATE_FORMATS[locale] ||= new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  return DATE_FORMATS[locale];
};

/** "7 Nov 2026" in the current language; '' for a missing or invalid date. */
export function formatDate(iso: IsoDateString | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return dateFormat().format(d);
}

const DATE_TIME_FORMATS: Record<string, Intl.DateTimeFormat> = {};

/** "11 Nov 2026, 08.43" in the current language; '' for a missing or invalid date. */
export function formatDateTime(iso: IsoDateString | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = currentLocale();
  DATE_TIME_FORMATS[locale] ||= new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return DATE_TIME_FORMATS[locale].format(d);
}

/** Whole days until the date (0 once it has passed); null without a date. */
export function daysLeft(iso: IsoDateString | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** 1536 -> "1.5 KB"; '' when there is no size. */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
