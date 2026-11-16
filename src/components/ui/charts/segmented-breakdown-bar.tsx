import React from 'react';
import { cn } from '../cn';

export interface BreakdownItem {
  id: string;
  label: string;
  percent: number;
  color: string;
}

export interface SegmentedBreakdownBarProps {
  items: ReadonlyArray<BreakdownItem>;
  className?: string;
}

/**
 * Horizontal multi-segment breakdown bar paired with a 2-column tabular legend.
 */
export function SegmentedBreakdownBar({ items, className }: SegmentedBreakdownBarProps) {
  const total = Math.max(
    1,
    items.reduce((sum, item) => sum + Math.max(0, item.percent), 0),
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex h-6 w-full items-stretch gap-1" role="img" aria-label="Breakdown distribution">
        {items.map((item) => {
          const widthPct = (Math.max(0, item.percent) / total) * 100;
          if (widthPct <= 0) return null;
          return (
            <div
              key={item.id}
              style={{ width: `${widthPct}%`, backgroundColor: item.color }}
              aria-label={`${item.label}: ${item.percent}%`}
              className="rounded-[5px] transition-opacity duration-150 hover:opacity-85"
            />
          );
        })}
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-2 p-0 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2 text-[13px]">
            <span className="inline-flex min-w-0 items-center gap-2 text-ink-secondary">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="font-medium text-ink tabular-nums">{item.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
