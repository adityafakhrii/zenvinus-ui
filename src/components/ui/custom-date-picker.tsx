import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import useMounted from '@/hooks/use-mounted';
import { cn } from './cn';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const pad2 = (n: number): string => String(n).padStart(2, '0');

function parseDateValue(value: string): { date: Date | null; hour: number; minute: number } {
  if (!value) return { date: null, hour: 9, minute: 0 };
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(value.trim());
  if (!match) return { date: null, hour: 9, minute: 0 };
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = match[4] ? Number(match[4]) : 9;
  const minute = match[5] ? Number(match[5]) : 0;
  const parsed = new Date(year, month, day);
  if (Number.isNaN(parsed.getTime())) return { date: null, hour: 9, minute: 0 };
  return { date: parsed, hour, minute };
}

function formatIsoValue(date: Date, withTime: boolean, hour: number, minute: number): string {
  const base = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  return withTime ? `${base}T${pad2(hour)}:${pad2(minute)}` : base;
}

function formatDisplay(date: Date, withTime: boolean, hour: number, minute: number): string {
  const monthShort = MONTHS[date.getMonth()]?.slice(0, 3) ?? '';
  const dateText = `${pad2(date.getDate())} ${monthShort} ${date.getFullYear()}`;
  return withTime ? `${dateText} · ${pad2(hour)}:${pad2(minute)}` : dateText;
}

export interface CustomDatePickerProps {
  label?: string;
  hint?: string;
  error?: string;
  /** Value in YYYY-MM-DD (or YYYY-MM-DDTHH:mm when includeTime is true). */
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  ariaLabel?: string;
  containerClassName?: string;
}

/**
 * Custom popover Calendar + optional Time stepper replacing browser-native <input type="date"> / datetime controls.
 */
export function CustomDatePicker({
  label,
  hint,
  error,
  value,
  onChange,
  includeTime = false,
  minDate,
  maxDate,
  placeholder,
  clearable = true,
  disabled = false,
  size = 'md',
  id,
  ariaLabel,
  containerClassName,
}: CustomDatePickerProps) {
  const mounted = useMounted();
  const autoId = useId();
  const controlId = id ?? autoId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseDateValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => parsed.date ?? new Date(2026, 10, 1));
  const [hour, setHour] = useState<number>(parsed.hour);
  const [minute, setMinute] = useState<number>(parsed.minute);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (parsed.date) {
      setViewDate(new Date(parsed.date.getFullYear(), parsed.date.getMonth(), 1));
    }
    setHour(parsed.hour);
    setMinute(parsed.minute);
  }, [parsed.date, parsed.hour, parsed.minute]);

  const placePopover = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popWidth = includeTime ? 320 : 292;
    const popHeight = includeTime ? 390 : 340;
    const openUp = window.innerHeight - rect.bottom < popHeight && rect.top > popHeight;
    setCoords({
      top: openUp ? Math.max(8, rect.top - popHeight - 6) : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - popWidth - 8)),
    });
  }, [includeTime]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('resize', placePopover);
    window.addEventListener('scroll', placePopover, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', placePopover);
      window.removeEventListener('scroll', placePopover, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, placePopover]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: Array<Date | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const isDisabledDay = (d: Date): boolean => {
    const iso = formatIsoValue(d, false, 0, 0);
    if (minDate && iso < minDate.slice(0, 10)) return true;
    if (maxDate && iso > maxDate.slice(0, 10)) return true;
    return false;
  };

  const selectDay = (d: Date) => {
    if (isDisabledDay(d)) return;
    onChange(formatIsoValue(d, includeTime, hour, minute));
    if (!includeTime) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const updateTime = (nextH: number, nextM: number) => {
    const h = (nextH + 24) % 24;
    const m = (nextM + 60) % 60;
    setHour(h);
    setMinute(m);
    if (parsed.date) {
      onChange(formatIsoValue(parsed.date, true, h, m));
    }
  };

  const displayPlaceholder = placeholder ?? (includeTime ? 'Select date and time' : 'Select date');

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={controlId} className="text-[13px] font-medium text-ink leading-snug">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <button
          ref={triggerRef}
          id={controlId}
          type="button"
          aria-label={ariaLabel ?? label}
          aria-expanded={open}
          disabled={disabled}
          onClick={() => {
            if (open) setOpen(false);
            else {
              placePopover();
              setOpen(true);
            }
          }}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-[10px] border bg-surface text-left cursor-pointer',
            'transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted',
            size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-[42px] px-3.5 text-sm',
            clearable && parsed.date ? 'pr-10' : '',
            error
              ? 'border-tone-red-fg focus:ring-3 focus:ring-tone-red-fg/15'
              : open
                ? 'border-teal-ink ring-3 ring-teal-ink/15'
                : 'border-line-input hover:border-ink-subtle focus:border-teal-ink',
          )}
        >
          <span className={cn('flex items-center gap-2 truncate tabular-nums', parsed.date ? 'text-ink' : 'text-ink-subtle')}>
            <Calendar className="w-4 h-4 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
            <span className="truncate">
              {parsed.date ? formatDisplay(parsed.date, includeTime, parsed.hour, parsed.minute) : displayPlaceholder}
            </span>
          </span>
        </button>
        {clearable && parsed.date && !disabled && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => onChange('')}
            className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {error ? (
        <p className="m-0 text-xs text-tone-red-ink">{error}</p>
      ) : hint ? (
        <p className="m-0 text-xs text-ink-muted">{hint}</p>
      ) : null}

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={label ?? 'Calendar'}
            style={{ top: coords.top, left: coords.left, width: includeTime ? 320 : 292 }}
            className="fixed z-1200 rounded-2xl border border-[rgba(8,13,53,0.10)] bg-surface p-4 shadow-[var(--shadow-popover)] zv-animate-pop"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-secondary hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <span className="text-sm font-semibold text-ink tabular-nums">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-secondary hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center">
              {WEEKDAYS.map((wd) => (
                <span key={wd} className="py-1 text-[11px] font-medium text-ink-muted">
                  {wd}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, idx) => {
                if (!cell) return <span key={`empty-${idx}`} />;
                const isSelected =
                  parsed.date !== null &&
                  cell.getFullYear() === parsed.date.getFullYear() &&
                  cell.getMonth() === parsed.date.getMonth() &&
                  cell.getDate() === parsed.date.getDate();
                const isToday =
                  cell.getFullYear() === today.getFullYear() &&
                  cell.getMonth() === today.getMonth() &&
                  cell.getDate() === today.getDate();
                const dayDisabled = isDisabledDay(cell);

                return (
                  <button
                    key={cell.toISOString()}
                    type="button"
                    disabled={dayDisabled}
                    onClick={() => selectDay(cell)}
                    className={cn(
                      'flex h-8 w-full items-center justify-center rounded-[8px] text-[13px] font-medium tabular-nums transition-colors cursor-pointer',
                      'disabled:opacity-35 disabled:cursor-not-allowed',
                      isSelected
                        ? 'bg-navy text-white'
                        : isToday
                          ? 'border border-teal-ink text-teal-ink hover:bg-tint-mint'
                          : 'text-ink hover:bg-tint-mint hover:text-teal-deep',
                    )}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>

            {includeTime && (
              <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Time
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center rounded-[8px] border border-line bg-canvas p-0.5">
                    <button
                      type="button"
                      aria-label="Decrease hour"
                      onClick={() => updateTime(hour - 1, minute)}
                      className="h-6 w-6 rounded text-xs text-ink-secondary hover:bg-surface hover:text-ink cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-medium text-ink tabular-nums">
                      {pad2(hour)}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase hour"
                      onClick={() => updateTime(hour + 1, minute)}
                      className="h-6 w-6 rounded text-xs text-ink-secondary hover:bg-surface hover:text-ink cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-mono text-xs text-ink-muted">:</span>
                  <div className="flex items-center rounded-[8px] border border-line bg-canvas p-0.5">
                    <button
                      type="button"
                      aria-label="Decrease minute"
                      onClick={() => updateTime(hour, minute - 5)}
                      className="h-6 w-6 rounded text-xs text-ink-secondary hover:bg-surface hover:text-ink cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-medium text-ink tabular-nums">
                      {pad2(minute)}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase minute"
                      onClick={() => updateTime(hour, minute + 5)}
                      className="h-6 w-6 rounded text-xs text-ink-secondary hover:bg-surface hover:text-ink cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="ml-1 rounded-[8px] bg-navy px-2.5 py-1 text-xs font-medium text-white hover:bg-navy-hover cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
