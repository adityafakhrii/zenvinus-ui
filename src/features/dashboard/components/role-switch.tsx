import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronUp, Minus, Settings2, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { useT } from '@/i18n';
import type { DashboardRole } from '../types/dashboard';

interface RoleLink {
  key: DashboardRole;
  label: string;
  href: string;
}

const ROLES: ReadonlyArray<RoleLink> = [
  { key: 'enterprise', label: 'Enterprise', href: '/dashboard' },
  { key: 'community', label: 'Community', href: '/dashboard?as=community' },
  { key: 'internal', label: 'Internal', href: '/dashboard?as=internal' },
  { key: 'expert', label: 'Expert', href: '/dashboard?as=expert' },
];

const STORAGE_KEY = 'zv_qa_role_minimized';

function RoleIcon({ role, className }: { role: DashboardRole; className?: string }) {
  const cls = cn('h-4 w-4 shrink-0', className);
  switch (role) {
    case 'enterprise':
      return <Building2 className={cls} strokeWidth={1.75} aria-hidden="true" />;
    case 'community':
      return <Users className={cls} strokeWidth={1.75} aria-hidden="true" />;
    case 'internal':
      return <Settings2 className={cls} strokeWidth={1.75} aria-hidden="true" />;
    case 'expert':
      return <ShieldCheck className={cls} strokeWidth={1.75} aria-hidden="true" />;
  }
}

export interface RoleSwitchProps {
  as?: DashboardRole;
  className?: string;
}

/**
 * Floating role switcher anchored at the bottom-right corner so switching between Enterprise, Community,
 * Internal, and Expert stays 1–2 clicks away without cluttering the main header or sidebar chrome.
 */
const RoleSwitch = ({ as = 'enterprise', className }: RoleSwitchProps) => {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === '1') {
        setMinimized(true);
      }
    } catch {
      // sessionStorage may be restricted in private mode
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const setMinState = (next: boolean) => {
    setMinimized(next);
    if (next) setOpen(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  };

  const activeRole = ROLES.find((r) => r.key === as) ?? ROLES[0];

  return (
    <div ref={rootRef} className={cn('fixed bottom-5 right-5 z-50', className)}>
      {open && !minimized && (
        <div
          role="menu"
          aria-label={t('Switch role')}
          className="absolute bottom-[calc(100%+10px)] right-0 w-60 rounded-2xl border border-[rgba(8,13,53,0.12)] bg-surface p-2 shadow-[0_16px_38px_rgba(2,6,38,0.16)] zv-animate-pop"
        >
          <div className="mb-1.5 border-b border-line-subtle px-3 py-2 text-xs font-semibold text-ink-muted">
            {t('Switch role')}
          </div>
          <div className="flex flex-col gap-1">
            {ROLES.map((r) => {
              const active = as === r.key;
              return (
                <Link
                  key={r.key}
                  href={r.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium no-underline transition-colors',
                    active
                      ? 'bg-tint-mint text-teal-ink font-semibold'
                      : 'text-ink hover:bg-canvas',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={active ? 'text-teal-ink' : 'text-ink-muted'}>
                      <RoleIcon role={r.key} />
                    </span>
                    <span>{t(r.label)}</span>
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {minimized ? (
        <button
          type="button"
          onClick={() => setMinState(false)}
          aria-label={t('Show role switcher')}
          title={`${t('Switch role')}: ${t(activeRole.label)}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.16)] bg-navy pl-1.5 pr-2.5 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(2,6,38,0.24)] transition-[border-color,background-color] duration-150 hover:border-teal hover:bg-navy-hover cursor-pointer"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-navy">
            <RoleIcon role={activeRole.key} />
          </span>
          <ChevronUp className="h-4 w-4 text-white/75" strokeWidth={1.75} />
        </button>
      ) : (
        <div className="inline-flex h-11 items-center rounded-full border border-[rgba(255,255,255,0.16)] bg-navy text-white shadow-[0_12px_30px_rgba(2,6,38,0.24)]">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={t('Switch role')}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-full items-center gap-2.5 rounded-l-full pl-2 pr-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-navy">
              <RoleIcon role={activeRole.key} />
            </span>
            <span>{t(activeRole.label)}</span>
            <ChevronUp
              className={cn(
                'h-4 w-4 text-white/70 transition-transform duration-150',
                open && 'rotate-180 text-teal',
              )}
              strokeWidth={1.75}
            />
          </button>

          <span className="h-5 w-px bg-white/15" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setMinState(true)}
            aria-label={t('Minimize role switcher')}
            title={t('Minimize role switcher')}
            className="inline-flex h-full w-10 items-center justify-center rounded-r-full text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Minus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleSwitch;
