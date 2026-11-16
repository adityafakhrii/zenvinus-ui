import React from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui';
import { DeltaChip } from './kpi-grid';

export interface DashboardCanvasProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared outer container for every signed-in Bento dashboard view.
 */
export function DashboardCanvas({ children, className }: DashboardCanvasProps) {
  return (
    <section className={cn('min-h-screen bg-canvas pb-16 pt-6 sm:pt-7', className)}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export interface DashboardPageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

/**
 * Quiet editorial title bar sitting directly on the cool canvas above the Bento grid.
 */
export function DashboardPageHeader({ title, subtitle, actions }: DashboardPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px] leading-tight">
          {title}
        </h1>
        <p className="mt-1 mb-0 text-sm text-ink-secondary leading-relaxed">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export interface BentoCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Elevated surface card styled after the ACRU Bento layout on the Zenvinus canvas.
 */
export function BentoCard({ title, subtitle, action, children, className, id }: BentoCardProps) {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 sm:p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]',
        className,
      )}
    >
      {(title || subtitle || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="m-0 text-[15px] font-semibold text-ink leading-snug">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 mb-0 text-xs text-ink-muted leading-snug">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface StackedMetricProps {
  label: string;
  value: string | number;
  delta?: number | null;
  good?: boolean;
  helper?: string;
}

/**
 * Metric row inside the right rail of the Hero Bento Chart card (no decorative sparklines).
 */
export function StackedMetric({ label, value, delta, good = true, helper }: StackedMetricProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[22px] font-semibold tracking-tight text-ink tabular-nums leading-none">
          {value}
        </span>
        <DeltaChip delta={delta} good={good} />
      </div>
      {helper && <span className="text-[11px] text-ink-muted">{helper}</span>}
    </div>
  );
}

export interface QuickActionItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface QuickActionGridProps {
  items: ReadonlyArray<QuickActionItem>;
}

/**
 * ACRU-inspired square icon action row inside right-hand Bento object cards.
 */
export function QuickActionGrid({ items }: QuickActionGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          className="group flex flex-col items-center gap-1.5 rounded-xl p-1 text-center text-ink-secondary no-underline transition-[color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-ink active:scale-[0.97]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(8,13,53,0.08)] bg-canvas text-ink transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-teal-ink/40 group-hover:bg-tint-mint group-hover:text-teal-ink">
            {item.icon}
          </span>
          <span className="max-w-full truncate text-[11px] font-medium leading-tight">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

export interface KeyValueRow {
  label: string;
  value: ReactNode;
}

export interface KeyValueListProps {
  rows: ReadonlyArray<KeyValueRow>;
  className?: string;
}

/**
 * Clean hairline-divided key-value readout list with right-aligned tabular figures.
 */
export function KeyValueList({ rows, className }: KeyValueListProps) {
  return (
    <dl className={cn('m-0 divide-y divide-line-subtle text-[13px]', className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <dt className="font-normal text-ink-secondary">{row.label}</dt>
          <dd className="m-0 font-semibold text-ink tabular-nums text-right">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
