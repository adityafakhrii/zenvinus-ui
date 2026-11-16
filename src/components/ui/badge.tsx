import React from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export const BADGE_TONES = ['neutral', 'blue', 'mint', 'purple', 'orange', 'amber', 'red'] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

export interface BadgeProps {
  tone?: BadgeTone;
  /** Optional 6px status indicator dot matching the tone. */
  dot?: boolean;
  /** Monospaced tabular numbers style for counters & IDs. */
  mono?: boolean;
  className?: string;
  children: ReactNode;
}

const TONE_CLASSES = {
  neutral: 'bg-canvas text-ink-secondary border border-[rgba(8,13,53,0.08)]',
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-purple-bg text-tone-purple-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
  red: 'bg-tone-red-bg text-tone-red-fg',
} as const satisfies Record<BadgeTone, string>;

const DOT_CLASSES = {
  neutral: 'bg-ink-muted',
  blue: 'bg-tone-blue-fg',
  mint: 'bg-tone-mint-fg',
  purple: 'bg-tone-purple-fg',
  orange: 'bg-tone-orange-fg',
  amber: 'bg-tone-amber-accent',
  red: 'bg-tone-red-fg',
} as const satisfies Record<BadgeTone, string>;

/**
 * 6-tone semantic + neutral pill badge per ai-guidelines/color-system.md.
 */
export function Badge({ tone = 'neutral', dot = false, mono = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium leading-none whitespace-nowrap',
        mono && 'font-mono tabular-nums',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_CLASSES[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}
