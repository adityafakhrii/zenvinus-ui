import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useT } from '@/i18n';
import { useAuth } from '../auth-provider';

export interface AccountMenuLink {
  href: string;
  /** Font Awesome classes */
  icon: string;
  /** English i18n key */
  label: string;
}

export interface AccountMenuProps {
  /** Name and email shown on the chip and in the menu */
  name: string;
  email: string;
  /** Tooltip of the chip */
  title?: string;
  /** Links above Logout */
  links: readonly AccountMenuLink[];
}

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Account chip (initials, name, caret) with a dropdown: the account, the given links and Logout.
 * Used by the dashboard header and, for signed-in visitors, by the site header. Closes on outside click or Escape.
 */
const AccountMenu = ({ name, email, title, links }: AccountMenuProps) => {
  const { t } = useT();
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
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
    <div className="edash-account" ref={rootRef}>
      <button
        type="button"
        className={open ? 'edash-account-chip edash-account-chip-open' : 'edash-account-chip'}
        aria-haspopup="menu"
        aria-expanded={open}
        title={title ?? name}
        onClick={() => setOpen(!open)}
      >
        <span className="edash-avatar">{initialsOf(name)}</span>
        <span className="edash-account-name d-none d-xxl-inline">{name}</span>
        <i className="fa-solid fa-chevron-down edash-caret"></i>
      </button>

      {open && (
        <div className="edash-account-menu" role="menu">
          <div className="edash-account-menu-head">
            <strong>{name}</strong>
            <span>{email}</span>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" className="edash-account-menu-item" onClick={() => setOpen(false)}>
              <i className={l.icon}></i> {t(l.label)}
            </Link>
          ))}
          <button type="button" role="menuitem" className="edash-account-menu-item edash-account-menu-logout" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> {t('Logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
