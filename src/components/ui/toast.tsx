import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import useMounted from '@/hooks/use-mounted';
import { cn } from './cn';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
}

export interface ToastViewportProps {
  items: ReadonlyArray<ToastItem>;
  onDismiss: (id: string) => void;
}

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
} as const;

const TONE_STYLE = {
  info: 'border-line text-teal-ink',
  success: 'border-tone-mint-fg/30 text-tone-mint-fg',
  warning: 'border-tone-amber-accent/40 text-tone-amber-fg',
  error: 'border-tone-red-fg/30 text-tone-red-fg',
} as const satisfies Record<ToastTone, string>;

/**
 * Floating bottom-right toast stack rendered via portal.
 */
export function ToastViewport({ items, onDismiss }: ToastViewportProps) {
  const mounted = useMounted();
  if (!mounted || items.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-1400 flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
      aria-live="polite"
    >
      {items.map((item) => {
        const tone = item.tone ?? 'info';
        const Icon = TONE_ICON[tone];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-[var(--shadow-popover)] zv-animate-slide-up',
              TONE_STYLE[tone],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-medium text-ink">{item.title}</p>
              {item.description && <p className="mt-0.5 mb-0 text-xs text-ink-secondary">{item.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              aria-label="Dismiss notification"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
