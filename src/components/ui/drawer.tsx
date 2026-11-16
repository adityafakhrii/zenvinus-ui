import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import useMounted from '@/hooks/use-mounted';
import { cn } from './cn';

export type DrawerSide = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  widthClassName?: string;
  className?: string;
}

const SIDE_POSITION = {
  left: 'inset-y-0 left-0 h-full border-r',
  right: 'inset-y-0 right-0 h-full border-l',
  bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t',
} as const satisfies Record<DrawerSide, string>;

/**
 * Slide-in Drawer / Sheet for mobile navigation, filter panels, and project detail inspectors.
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  subtitle,
  children,
  footer,
  closeLabel = 'Close',
  widthClassName = 'w-[min(380px,90vw)]',
  className,
}: DrawerProps) {
  const mounted = useMounted();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    const prevFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      prevFocused?.focus();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-1300"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className="fixed inset-0 bg-[rgba(2,6,38,0.45)] zv-animate-fade"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'fixed z-10 flex flex-col border-[rgba(8,13,53,0.08)] bg-surface shadow-[var(--shadow-modal)] focus:outline-none zv-animate-fade',
          SIDE_POSITION[side],
          side !== 'bottom' && widthClassName,
          className,
        )}
      >
        {side === 'bottom' && (
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        )}
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-3 border-b border-line-subtle px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h3 id={titleId} className="m-0 text-base font-semibold text-ink truncate">
                  {title}
                </h3>
              )}
              {subtitle && <p className="mt-0.5 mb-0 text-xs text-ink-secondary truncate">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-ink-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-line-subtle px-5 py-3.5">{footer}</div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
