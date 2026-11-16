import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { ChevronDown, LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { useT } from '@/i18n';
import { useAuth } from '../auth-provider';

export interface AccountMenuLink {
  href: string;
  /** Legacy Font Awesome class fallback */
  icon?: string;
  /** Preferred lucide-react icon element */
  lucideIcon?: ReactNode;
  /** English i18n key */
  label: string;
}

export interface AccountMenuProps {
  /** Name and email shown on the chip and in the menu */
  name: string;
  email: string;
  /** Tooltip/aria description of the chip */
  title?: string;
  /** Links above Logout */
  links: readonly AccountMenuLink[];
  /** Compact mode hides the name beside the avatar */
  compact?: boolean;
}

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'Z';

function resolveLinkIcon(link: AccountMenuLink): ReactNode {
  if (link.lucideIcon) return link.lucideIcon;
  if (link.href.includes('settings')) return <Settings className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />;
  if (link.href.includes('dashboard')) return <LayoutDashboard className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />;
  return <User className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />;
}

/**
 * Custom Tailwind Account Menu chip + dropdown used across dashboard and site headers.
 */
const AccountMenu = ({ name, email, title, links, compact = false }: AccountMenuProps) => {
  const { t } = useT();
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    setOpen(false);
    try {
      await signOut();
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="relative inline-flex shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={title ?? name}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-[10px] border bg-surface px-1.5 pr-2.5 text-left cursor-pointer',
          'transition-[border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink/40',
          open
            ? 'border-teal-ink bg-canvas'
            : 'border-[rgba(8,13,53,0.10)] hover:border-ink/25',
        )}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-navy text-[11px] font-semibold text-white">
          {initialsOf(name)}
        </span>
        {!compact && (
          <span className="hidden xl:flex flex-col leading-tight min-w-0 max-w-[140px]">
            <span className="truncate text-[13px] font-medium text-ink">{name}</span>
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-ink-muted shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open && 'rotate-180 text-teal-ink',
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-1200 w-60 rounded-xl border border-[rgba(8,13,53,0.10)] bg-surface p-1.5 shadow-[var(--shadow-popover)] zv-animate-pop"
        >
          <div className="border-b border-line-subtle px-2.5 py-2 mb-1">
            <strong className="block truncate text-[13px] font-semibold text-ink">{name}</strong>
            <span className="block truncate text-xs text-ink-muted">{email}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-ink no-underline hover:bg-canvas transition-colors"
              >
                {resolveLinkIcon(l)}
                <span>{t(l.label)}</span>
              </Link>
            ))}
          </div>
          <div className="mt-1 border-t border-line-subtle pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-tone-red-ink hover:bg-tone-red-bg/50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>{t('Logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
