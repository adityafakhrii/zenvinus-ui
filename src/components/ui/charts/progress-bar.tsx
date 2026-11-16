import React from 'react';
import { cn } from '../cn';

export interface CustomProgressBarProps {
  /** Percentage from 0 to 100. */
  value: number;
  tone?: 'teal' | 'navy' | 'amber';
  leftLabel?: string;
  rightLabel?: string;
  height?: 'sm' | 'md';
  className?: string;
}

const FILL_CLASSES = {
  teal: 'bg-teal-ink',
  navy: 'bg-navy',
  amber: 'bg-tone-amber-accent',
} as const;

/**
 * Linear horizontal progress bar with Zenvinus surface track and tabular labels.
 */
export function CustomProgressBar({
  value,
  tone = 'teal',
  leftLabel,
  rightLabel,
  height = 'md',
  className,
}: CustomProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'w-full overflow-hidden rounded-md bg-surface-muted',
          height === 'sm' ? 'h-2' : 'h-3',
        )}
      >
        <div
          style={{ width: `${pct}%` }}
          className={cn(
            'h-full rounded-md transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            FILL_CLASSES[tone],
          )}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex items-center justify-between gap-2 text-xs text-ink-secondary tabular-nums">
          <span>{leftLabel}</span>
          <span className="font-medium text-ink">{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
