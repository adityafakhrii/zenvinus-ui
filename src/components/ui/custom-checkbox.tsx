import React, { useId } from 'react';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from './cn';

export interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Custom accessible checkbox replacing browser-native checkbox controls.
 */
export function CustomCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: CustomCheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-start gap-2.5 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-[background-color,border-color,box-shadow] duration-150',
          'peer-focus-visible:ring-3 peer-focus-visible:ring-teal-ink/20',
          checked
            ? 'border-navy bg-navy text-white'
            : 'border-line-input bg-surface hover:border-ink-muted',
        )}
        aria-hidden="true"
      >
        {checked && <Check className="w-3 h-3" strokeWidth={2.25} />}
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-ink leading-snug">{label}</span>}
          {description && <span className="text-xs text-ink-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Custom toggle switch pill for boolean settings (notifications, 2FA, preferences).
 */
export function CustomSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: CustomSwitchProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-center justify-between gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-ink leading-snug">{label}</span>}
          {description && <span className="text-xs text-ink-muted">{description}</span>}
        </span>
      )}
      <span className="relative inline-flex shrink-0 items-center">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <span
          className={cn(
            'relative inline-flex h-[22px] w-10 items-center rounded-full p-0.5 transition-colors duration-150',
            'peer-focus-visible:ring-3 peer-focus-visible:ring-teal-ink/20',
            checked ? 'bg-teal-ink' : 'bg-line',
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'h-[18px] w-[18px] rounded-full bg-surface shadow-[0_1px_2px_rgba(2,6,38,0.16)] transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
              checked ? 'translate-x-[18px]' : 'translate-x-0',
            )}
          />
        </span>
      </span>
    </label>
  );
}
