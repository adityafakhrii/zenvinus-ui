import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import useMounted from '@/hooks/use-mounted';
import Button from './button';
import { cn } from './cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeLabel?: string;
  className?: string;
}

const SIZE_MAX_WIDTH = {
  sm: 'sm:max-w-[420px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[760px]',
} as const;

/**
 * Custom accessible Modal Dialog (renders as a Bottom Sheet on mobile < 640px).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeLabel = 'Close',
  className,
}: ModalProps) {
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
      className="fixed inset-0 z-1300 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className="fixed inset-0 bg-[rgba(2,6,38,0.45)] zv-animate-fade"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex w-full max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface shadow-[var(--shadow-modal)] focus:outline-none zv-animate-slide-up',
          SIZE_MAX_WIDTH[size],
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h3 id={titleId} className="m-0 text-base font-semibold text-ink leading-snug">
                  {title}
                </h3>
              )}
              {description && <p className="mt-1 mb-0 text-[13px] text-ink-secondary">{description}</p>}
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
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line-subtle px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
}

/**
 * Custom confirmation dialog replacing window.confirm / native alerts.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="m-0 text-sm leading-relaxed text-ink-secondary">{description}</p>}
    </Modal>
  );
}
