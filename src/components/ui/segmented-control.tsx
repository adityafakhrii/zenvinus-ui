import React from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SegmentedOption<T>>;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  ariaLabel: string;
  className?: string;
}

/**
 * Custom segmented control & tab switcher (e.g. 7d / 30d, Rows / Stats, Card / Viewer / Files).
 */
export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth = false,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-[10px] border border-[rgba(8,13,53,0.08)] bg-canvas p-1',
        fullWidth && 'w-full',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[7px] font-medium whitespace-nowrap cursor-pointer',
              'transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink/40 disabled:opacity-45 disabled:cursor-not-allowed',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
              fullWidth && 'flex-1',
              active
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(2,6,38,0.06)]'
                : 'text-ink-secondary hover:text-ink',
            )}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={cn(
                  'font-mono text-[11px] tabular-nums',
                  active ? 'text-teal-ink' : 'text-ink-muted',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
