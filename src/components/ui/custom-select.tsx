import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyboardEvent, ReactNode } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import useMounted from '@/hooks/use-mounted';
import { cn } from './cn';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

interface FloatingCoords {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
}

function measureTrigger(el: HTMLElement | null, estimatedHeight = 260): FloatingCoords {
  if (!el) return { top: 0, left: 0, width: 220, maxHeight: 240, openUp: false };
  const rect = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  const spaceAbove = rect.top - 12;
  const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
  const available = openUp ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(140, Math.min(280, available));
  const top = openUp ? Math.max(8, rect.top - Math.min(estimatedHeight, maxHeight) - 6) : rect.bottom + 6;
  return {
    top,
    left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 200) - 8)),
    width: rect.width,
    maxHeight,
    openUp,
  };
}

export interface CustomSelectProps<T extends string = string> {
  label?: string;
  hint?: string;
  error?: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Custom dropdown select replacing native browser <select> everywhere.
 * Renders its listbox into a portal so it never clips inside cards or modals.
 */
export function CustomSelect<T extends string = string>({
  label,
  hint,
  error,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  searchable = false,
  searchPlaceholder = 'Search',
  emptyText = 'No options found',
  size = 'md',
  disabled = false,
  id,
  ariaLabel,
  className,
  containerClassName,
}: CustomSelectProps<T>) {
  const mounted = useMounted();
  const autoId = useId();
  const controlId = id ?? autoId;
  const listboxId = `${controlId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [coords, setCoords] = useState<FloatingCoords>(() => ({
    top: 0,
    left: 0,
    width: 220,
    maxHeight: 240,
    openUp: false,
  }));

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.description && o.description.toLowerCase().includes(q)),
    );
  }, [options, query]);

  const openMenu = () => {
    if (disabled) return;
    setCoords(measureTrigger(triggerRef.current));
    const idx = filtered.findIndex((o) => o.value === value && !o.disabled);
    setHighlighted(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => setCoords(measureTrigger(triggerRef.current));
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    if (searchable) {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, searchable]);

  const commit = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    closeMenu();
    triggerRef.current?.focus();
  };

  const moveHighlight = (delta: 1 | -1) => {
    if (!filtered.length) return;
    let next = highlighted;
    for (let step = 0; step < filtered.length; step++) {
      next = (next + delta + filtered.length) % filtered.length;
      if (!filtered[next]?.disabled) {
        setHighlighted(next);
        return;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[highlighted];
      if (target) commit(target);
    } else if (e.key === 'Tab') {
      closeMenu();
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={controlId} className="text-[13px] font-medium text-ink leading-snug">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        role="combobox"
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-[10px] border bg-surface text-left cursor-pointer',
          'transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted',
          size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-[42px] px-3.5 text-sm',
          error
            ? 'border-tone-red-fg focus:ring-3 focus:ring-tone-red-fg/15'
            : open
              ? 'border-teal-ink ring-3 ring-teal-ink/15'
              : 'border-line-input hover:border-ink-subtle focus:border-teal-ink focus:ring-3 focus:ring-teal-ink/15',
          className,
        )}
      >
        <span className={cn('flex items-center gap-2 truncate', selected ? 'text-ink' : 'text-ink-subtle')}>
          {selected?.icon}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-ink-muted transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open && 'rotate-180 text-teal-ink',
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {error ? (
        <p className="m-0 text-xs text-tone-red-ink">{error}</p>
      ) : hint ? (
        <p className="m-0 text-xs text-ink-muted">{hint}</p>
      ) : null}

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            style={{ top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 180) }}
            className="fixed z-1200 rounded-xl border border-[rgba(8,13,53,0.10)] bg-surface p-1.5 shadow-[var(--shadow-popover)] zv-animate-pop"
            onKeyDown={handleKeyDown}
          >
            {searchable && (
              <div className="relative mb-1.5 flex items-center">
                <Search className="pointer-events-none absolute left-2.5 w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlighted(0);
                  }}
                  placeholder={searchPlaceholder}
                  className="h-8 w-full rounded-[8px] border border-line bg-canvas pl-8 pr-2.5 text-[13px] text-ink placeholder:text-ink-subtle focus:border-teal-ink focus:bg-surface focus:outline-none"
                />
              </div>
            )}
            <div style={{ maxHeight: coords.maxHeight }} className="overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[13px] text-ink-muted">{emptyText}</div>
              ) : (
                filtered.map((option, idx) => {
                  const isSelected = option.value === value;
                  const isActive = idx === highlighted;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onMouseEnter={() => setHighlighted(idx)}
                      onClick={() => commit(option)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] cursor-pointer transition-colors duration-100',
                        'disabled:opacity-45 disabled:cursor-not-allowed',
                        isSelected
                          ? 'bg-tint-mint text-teal-deep font-medium'
                          : isActive
                            ? 'bg-canvas text-ink'
                            : 'text-ink hover:bg-canvas',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {option.icon}
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className="truncate text-[11px] text-ink-muted">{option.description}</span>
                          )}
                        </span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-teal-ink" strokeWidth={1.75} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export interface CustomMultiSelectProps<T extends string = string> {
  label?: string;
  value: ReadonlyArray<T>;
  onChange: (next: T[]) => void;
  options: ReadonlyArray<SelectOption<T>>;
  placeholder?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  ariaLabel?: string;
  containerClassName?: string;
}

/** Multi-select dropdown rendered with custom chips and portal listbox. */
export function CustomMultiSelect<T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select options',
  size = 'md',
  disabled = false,
  ariaLabel,
  containerClassName,
}: CustomMultiSelectProps<T>) {
  const mounted = useMounted();
  const autoId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<FloatingCoords>(() => ({
    top: 0,
    left: 0,
    width: 220,
    maxHeight: 240,
    openUp: false,
  }));

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggleValue = (val: T) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={autoId} className="text-[13px] font-medium text-ink leading-snug">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={autoId}
        type="button"
        aria-label={ariaLabel ?? label}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (open) setOpen(false);
          else {
            setCoords(measureTrigger(triggerRef.current));
            setOpen(true);
          }
        }}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-[10px] border bg-surface text-left cursor-pointer',
          'transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:opacity-50',
          size === 'sm' ? 'min-h-9 px-3 py-1 text-[13px]' : 'min-h-[42px] px-3.5 py-1.5 text-sm',
          open
            ? 'border-teal-ink ring-3 ring-teal-ink/15'
            : 'border-line-input hover:border-ink-subtle focus:border-teal-ink',
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-ink-subtle">{placeholder}</span>
          ) : (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-md bg-tint-mint px-2 py-0.5 text-xs font-medium text-teal-deep"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${opt.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(opt.value);
                  }}
                  className="rounded hover:bg-teal-ink/15 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" strokeWidth={1.75} />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-ink-muted transition-transform duration-150',
            open && 'rotate-180 text-teal-ink',
          )}
          strokeWidth={1.5}
        />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-multiselectable="true"
            style={{ top: coords.top, left: coords.left, minWidth: Math.max(coords.width, 200) }}
            className="fixed z-1200 rounded-xl border border-[rgba(8,13,53,0.10)] bg-surface p-1.5 shadow-[var(--shadow-popover)] zv-animate-pop"
          >
            <div style={{ maxHeight: coords.maxHeight }} className="overflow-y-auto overscroll-contain">
              {options.map((option) => {
                const checked = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    disabled={option.disabled}
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] cursor-pointer transition-colors duration-100',
                      checked ? 'bg-tint-mint text-teal-deep font-medium' : 'text-ink hover:bg-canvas',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                        checked ? 'border-navy bg-navy text-white' : 'border-line-input bg-surface',
                      )}
                    >
                      {checked && <Check className="w-3 h-3" strokeWidth={1.75} />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
