import React, { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { useT } from './context';
import { LANGUAGES, type LangCode } from './languages';

const FLAGS: Record<LangCode, ReactElement> = {
  id: (
    <svg viewBox="0 0 24 16" aria-hidden="true" className="h-full w-full block">
      <rect width="24" height="8" fill="#E70011" />
      <rect y="8" width="24" height="8" fill="#fff" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 24 16" aria-hidden="true" className="h-full w-full block">
      <rect width="24" height="16" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 16) / 13} width="24" height={16 / 13} fill="#B22234" />
      ))}
      <rect width="10.4" height={(7 * 16) / 13} fill="#3C3B6E" />
    </svg>
  ),
};

export interface LanguageSwitchProps {
  /** Extra layout classes (e.g. responsive spacing or visibility). */
  className?: string;
}

/**
 * Custom Tailwind language picker (ID / EN) shared across site and dashboard headers.
 */
export function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    rootRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code: LangCode) => {
    setLang(code);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])];
    const i = document.activeElement instanceof HTMLElement ? items.indexOf(document.activeElement) : -1;
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
  };

  return (
    <div ref={rootRef} className={cn('relative inline-flex shrink-0', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('Language')}: ${active.name}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-[9px] border bg-surface px-2.5 text-[13px] font-medium text-ink cursor-pointer',
          'transition-[border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink/40',
          open
            ? 'border-teal-ink bg-canvas'
            : 'border-[rgba(8,13,53,0.10)] hover:border-ink/25',
        )}
      >
        <span className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
          {FLAGS[active.code]}
        </span>
        <span className="font-mono text-xs">{active.label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-ink-muted transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open && 'rotate-180 text-teal-ink',
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('Language')}
          onKeyDown={onListKey}
          className="absolute right-0 top-[calc(100%+8px)] z-1200 min-w-[164px] rounded-xl border border-[rgba(8,13,53,0.10)] bg-surface p-1.5 shadow-[var(--shadow-popover)] zv-animate-pop"
        >
          {LANGUAGES.map((l) => {
            const isSelected = lang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                lang={l.code}
                onClick={() => choose(l.code)}
                className={cn(
                  'flex w-full items-center justify-between gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium cursor-pointer transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:bg-canvas',
                  isSelected
                    ? 'bg-tint-mint text-teal-deep'
                    : 'text-ink hover:bg-canvas',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
                    {FLAGS[l.code]}
                  </span>
                  <span>{l.name}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-teal-ink shrink-0" strokeWidth={1.75} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
