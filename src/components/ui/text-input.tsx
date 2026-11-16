import React, { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from './cn';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md';
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  containerClassName?: string;
}

const CONTROL_BASE =
  'w-full rounded-[10px] border bg-surface text-ink placeholder:text-ink-subtle transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted';

/**
 * Custom text input aligned to the Zenvinus design system (42px default / 36px compact).
 */
export function TextInput({
  label,
  hint,
  error,
  size = 'md',
  leftAddon,
  rightAddon,
  className,
  containerClassName,
  id,
  ...rest
}: TextInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink leading-snug">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-ink-muted">{leftAddon}</span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            CONTROL_BASE,
            size === 'sm' ? 'h-9 text-[13px]' : 'h-[42px] text-sm',
            leftAddon ? 'pl-9' : 'pl-3.5',
            rightAddon ? 'pr-9' : 'pr-3.5',
            error
              ? 'border-tone-red-fg focus:border-tone-red-fg focus:ring-3 focus:ring-tone-red-fg/15'
              : 'border-line-input hover:border-ink-subtle focus:border-teal-ink focus:ring-3 focus:ring-teal-ink/15',
            className,
          )}
          {...rest}
        />
        {rightAddon && <span className="absolute right-3 flex items-center text-ink-muted">{rightAddon}</span>}
      </div>
      {error ? (
        <p className="m-0 text-xs text-tone-red-ink">{error}</p>
      ) : hint ? (
        <p className="m-0 text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  containerClassName,
  id,
  rows = 4,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink leading-snug">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL_BASE,
          'min-h-[104px] px-3.5 py-2.5 text-sm leading-relaxed resize-y',
          error
            ? 'border-tone-red-fg focus:border-tone-red-fg focus:ring-3 focus:ring-tone-red-fg/15'
            : 'border-line-input hover:border-ink-subtle focus:border-teal-ink focus:ring-3 focus:ring-teal-ink/15',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p className="m-0 text-xs text-tone-red-ink">{error}</p>
      ) : hint ? (
        <p className="m-0 text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value: string;
  onChange: (next: string) => void;
  size?: 'sm' | 'md';
  /** Optional shortcut hint rendered as a quiet mono keycap (e.g. "Ctrl K" or "/"). */
  shortcut?: string;
  clearLabel?: string;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  size = 'md',
  shortcut,
  clearLabel = 'Clear search',
  placeholder = 'Search',
  className,
  containerClassName,
  ...rest
}: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3 w-4 h-4 text-ink-muted"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          CONTROL_BASE,
          '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
          size === 'sm' ? 'h-9 text-[13px]' : 'h-[40px] text-sm',
          'pl-9 border-[rgba(8,13,53,0.10)] hover:border-ink-subtle focus:border-teal-ink focus:ring-3 focus:ring-teal-ink/15',
          value || shortcut ? 'pr-10' : 'pr-3.5',
          className,
        )}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={clearLabel}
          className="absolute right-2.5 flex items-center justify-center w-6 h-6 rounded-md text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute right-2.5 hidden sm:inline-flex items-center rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-muted">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}
