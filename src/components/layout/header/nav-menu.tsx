import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/components/ui';
import { useT } from '@/i18n';
import menu_data, { isMenuItemActive, sectionOf } from './menu-data';

/**
 * Quiet Tailwind public desktop menu with active-route tracking via sectionOf().
 * Keeps the `active` class matching hover states per AGENTS.md page conventions.
 */
const NavMenu = () => {
  const { t } = useT();
  const router = useRouter();
  const current = sectionOf(router.pathname);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const closeAll = () => setOpenMenuId(null);
    router.events.on('routeChangeStart', closeAll);
    return () => router.events.off('routeChangeStart', closeAll);
  }, [router.events]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <ul ref={rootRef} className="m-0 flex list-none items-center gap-1 p-0">
      {menu_data.map((menu_item) => {
        const active = isMenuItemActive(menu_item, current);
        const isDropdownOpen = openMenuId === menu_item.id;

        if (menu_item.has_dropdown && menu_item.sub_menus) {
          return (
            <li
              key={menu_item.id}
              className={cn('relative', active && 'active')}
              onMouseEnter={() => setOpenMenuId(menu_item.id)}
              onMouseLeave={() => setOpenMenuId((prev) => (prev === menu_item.id ? null : prev))}
            >
              <div className="flex items-center">
                <Link
                  href={menu_item.link}
                  aria-current={menu_item.link === current ? 'page' : undefined}
                  aria-expanded={isDropdownOpen}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium no-underline transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
                    active || isDropdownOpen
                      ? 'active bg-canvas text-ink font-semibold'
                      : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                  )}
                >
                  <span>{t(menu_item.title)}</span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-ink-muted transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      isDropdownOpen && 'rotate-180 text-teal-ink',
                    )}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-40 pt-1.5">
                  <ul className="m-0 min-w-[184px] list-none rounded-xl border border-[rgba(8,13,53,0.08)] bg-surface p-1.5 shadow-[var(--shadow-popover)] zv-animate-pop">
                    {menu_item.sub_menus.map((sub_menu) => {
                      const subActive = sub_menu.link === current;
                      return (
                        <li key={sub_menu.link} className={subActive ? 'active' : undefined}>
                          <Link
                            href={sub_menu.link}
                            aria-current={subActive ? 'page' : undefined}
                            onClick={() => setOpenMenuId(null)}
                            className={cn(
                              'group flex items-center rounded-lg px-3 py-2 text-[13px] font-medium no-underline transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
                              subActive
                                ? 'active bg-tint-mint text-teal-ink font-semibold'
                                : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                            )}
                          >
                            <span className="transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
                              {t(sub_menu.title)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        }

        return (
          <li key={menu_item.id} className={active ? 'active' : undefined}>
            <Link
              href={menu_item.link}
              aria-current={menu_item.link === current ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 items-center rounded-[10px] px-3 text-[13px] font-medium no-underline transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
                active
                  ? 'active bg-canvas text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-canvas hover:text-ink',
              )}
            >
              <span>{t(menu_item.title)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavMenu;
