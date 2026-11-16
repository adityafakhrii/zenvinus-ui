import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import useMounted from '@/hooks/use-mounted';
import { cn } from './cn';

export interface PopoverProps {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
    close: () => void;
  }) => ReactNode;
  children: (helpers: { close: () => void }) => ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

/**
 * Floating Popover surface anchored below a trigger element.
 */
export function Popover({ trigger, children, align = 'end', className }: PopoverProps) {
  const mounted = useMounted();
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = panelRef.current?.offsetWidth ?? 260;
    const left = align === 'end' ? rect.right - width : rect.left;
    setCoords({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
    });
  }, [align]);

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, place]);

  return (
    <div ref={anchorRef} className="relative inline-flex">
      {trigger({
        open,
        toggle: () => setOpen((o) => !o),
        close: () => setOpen(false),
      })}
      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: coords.top, left: coords.left }}
            className={cn(
              'fixed z-1200 rounded-xl border border-[rgba(8,13,53,0.10)] bg-surface p-2 shadow-[var(--shadow-popover)] zv-animate-pop',
              className,
            )}
          >
            {children({ close: () => setOpen(false) })}
          </div>,
          document.body,
        )}
    </div>
  );
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Custom dark-navy Tooltip replacing native browser title tooltips on interactive controls.
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const mounted = useMounted();
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const show = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: side === 'top' ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  };

  return (
    <span
      ref={ref}
      aria-describedby={visible ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
      onFocus={show}
      onBlur={() => setVisible(false)}
      className={cn('inline-flex items-center', className)}
    >
      {children}
      {mounted &&
        visible &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{
              top: pos.top,
              left: pos.left,
              transform: side === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            }}
            className="pointer-events-none fixed z-1400 max-w-[260px] rounded-md bg-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-[var(--shadow-popover)] zv-animate-fade"
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
