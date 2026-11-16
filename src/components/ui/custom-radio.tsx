import React, { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export interface RadioOption<T extends string = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  preview?: ReactNode;
}

export interface CustomRadioGroupProps<T extends string = string> {
  name?: string;
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<RadioOption<T>>;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'radio' | 'card';
  columnsClassName?: string;
  className?: string;
}

/**
 * Custom accessible RadioGroup and RadioCard replacing browser-native radio inputs.
 */
export function CustomRadioGroup<T extends string = string>({
  name,
  label,
  value,
  onChange,
  options,
  orientation = 'vertical',
  variant = 'radio',
  columnsClassName,
  className,
}: CustomRadioGroupProps<T>) {
  const autoName = useId();
  const groupName = name ?? autoName;

  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-[13px] font-medium text-ink">{label}</span>}
      <div
        className={cn(
          columnsClassName
            ? columnsClassName
            : variant === 'card'
              ? 'grid gap-3 sm:grid-cols-2'
              : orientation === 'horizontal'
                ? 'flex flex-wrap gap-4'
                : 'flex flex-col gap-2.5',
        )}
      >
        {options.map((opt) => {
          const checked = opt.value === value;
          if (variant === 'card') {
            return (
              <label
                key={opt.value}
                className={cn(
                  'relative flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-[border-color,background-color,box-shadow] duration-150',
                  opt.disabled && 'opacity-50 cursor-not-allowed',
                  checked
                    ? 'border-teal-ink bg-tint-mint shadow-[0_0_0_1px_var(--color-teal-ink)]'
                    : 'border-[rgba(8,13,53,0.10)] bg-surface hover:border-ink/25',
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={opt.value}
                  checked={checked}
                  disabled={opt.disabled}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                {opt.preview && <div className="mb-1">{opt.preview}</div>}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink">{opt.label}</span>
                    {opt.description && <span className="text-xs leading-relaxed text-ink-secondary">{opt.description}</span>}
                  </div>
                  <span
                    className={cn(
                      'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
                      checked ? 'border-teal-ink bg-surface' : 'border-line-input bg-surface',
                    )}
                    aria-hidden="true"
                  >
                    {checked && <span className="h-2.5 w-2.5 rounded-full bg-teal-ink" />}
                  </span>
                </div>
              </label>
            );
          }

          return (
            <label
              key={opt.value}
              className={cn(
                'inline-flex items-start gap-2.5 cursor-pointer select-none',
                opt.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={opt.value}
                checked={checked}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only peer"
              />
              <span
                className={cn(
                  'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-[border-color,box-shadow] duration-150',
                  'peer-focus-visible:ring-3 peer-focus-visible:ring-teal-ink/20',
                  checked ? 'border-teal-ink bg-surface' : 'border-line-input bg-surface',
                )}
                aria-hidden="true"
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-teal-ink" />}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-ink leading-snug">{opt.label}</span>
                {opt.description && <span className="text-xs text-ink-muted">{opt.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
