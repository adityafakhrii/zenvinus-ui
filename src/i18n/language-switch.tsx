import React, { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import { useT } from './context';
import { LANGUAGES, type LangCode } from './languages';

// Small inline flags (no image requests): Indonesia, and the US flag for English as on vida.id
const FLAGS: Record<LangCode, ReactElement> = {
  id: (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="8" fill="#E70011" />
      <rect y="8" width="24" height="8" fill="#fff" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 16) / 13} width="24" height={16 / 13} fill="#B22234" />
      ))}
      <rect width="10.4" height={(7 * 16) / 13} fill="#3C3B6E" />
    </svg>
  ),
};

export interface LanguageSwitchProps {
  /** Extra classes for the wrapper (layout hooks such as d-none d-sm-inline-flex) */
  className?: string;
}

/**
 * Language picker for headers and menus: a button with the flag and code (ID / EN) that opens a short list
 * with flag and language name. Closes on choice, outside click, or Escape; arrow keys move through the list.
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
    // focus the current language so arrow keys start there
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
    <div ref={rootRef} className={`zv-lang ${open ? 'is-open' : ''} ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className="zv-lang-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('Language')}: ${active.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="zv-lang-flag">{FLAGS[active.code]}</span>
        <span className="zv-lang-code">{active.label}</span>
        <svg className="zv-lang-caret" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="zv-lang-menu" role="menu" aria-label={t('Language')} onKeyDown={onListKey}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === l.code}
              lang={l.code}
              className={lang === l.code ? 'is-active' : ''}
              onClick={() => choose(l.code)}
            >
              <span className="zv-lang-flag">{FLAGS[l.code]}</span>
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
