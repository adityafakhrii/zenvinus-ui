import React from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RotateCw } from 'lucide-react';
import Button from './button';
import { cn } from './cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Calm empty state card per ai-guidelines/design-revamp-guide.md.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-muted">
        {icon ?? <Inbox className="w-5 h-5" strokeWidth={1.5} />}
      </span>
      <div className="max-w-md">
        <h4 className="m-0 text-base font-semibold text-ink">{title}</h4>
        {description && <p className="mt-1 mb-0 text-sm text-ink-secondary">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load data',
  message,
  retryLabel = 'Try again',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-between gap-4 rounded-xl border border-tone-red-fg/25 bg-tone-red-bg/40 p-5 sm:flex-row',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-tone-red-ink" strokeWidth={1.5} />
        <div>
          <h4 className="m-0 text-sm font-semibold text-tone-red-ink">{title}</h4>
          <p className="mt-0.5 mb-0 text-[13px] text-ink-secondary">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCw className="w-3.5 h-3.5" strokeWidth={1.5} />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export interface BentoSkeletonProps {
  label?: string;
  className?: string;
}

/**
 * Tailwind Bento Dashboard loading skeleton matching the asymmetric reference rhythm.
 */
export function BentoSkeleton({ label = 'Loading dashboard', className }: BentoSkeletonProps) {
  return (
    <div role="status" aria-label={label} className={cn('grid grid-cols-1 gap-4 lg:grid-cols-12', className)}>
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 lg:col-span-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="zv-shimmer block h-3.5 w-28 rounded" />
            <span className="zv-shimmer block h-8 w-40 rounded-md" />
          </div>
          <span className="zv-shimmer block h-8 w-36 rounded-[8px]" />
        </div>
        <span className="zv-shimmer mt-6 block h-56 w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 lg:col-span-4">
        <span className="zv-shimmer block h-40 w-full rounded-xl" />
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="zv-shimmer block h-14 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 lg:col-span-4">
        <span className="zv-shimmer block h-4 w-32 rounded" />
        <span className="zv-shimmer mt-4 block h-36 w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 lg:col-span-4">
        <span className="zv-shimmer block h-4 w-32 rounded" />
        <span className="zv-shimmer mt-4 block h-36 w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 lg:col-span-4">
        <span className="zv-shimmer block h-4 w-32 rounded" />
        <span className="zv-shimmer mt-4 block h-36 w-full rounded-xl" />
      </div>
    </div>
  );
}

export interface TableSkeletonProps {
  rows?: number;
  label?: string;
  className?: string;
}

export function TableSkeleton({ rows = 5, label = 'Loading rows', className }: TableSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-4', className)}
    >
      <span className="zv-shimmer mb-3 block h-9 w-full rounded-[8px]" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className="zv-shimmer block h-12 w-full rounded-[8px]" />
        ))}
      </div>
    </div>
  );
}
