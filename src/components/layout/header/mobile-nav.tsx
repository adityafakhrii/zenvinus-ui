import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, Mail, Menu } from 'lucide-react';
import { Button, Drawer, cn } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { LanguageSwitch, useT } from '@/i18n';
import menu_data, { isMenuItemActive, sectionOf } from './menu-data';

/**
 * Responsive public site drawer below 1024px (`lg`), built on custom Drawer & Lucide icons.
 */
const MobileNav = () => {
  const { t } = useT();
  const { user } = useAuth();
  const router = useRouter();
  const current = sectionOf(router.pathname);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(
    () => menu_data.find((m) => m.has_dropdown && isMenuItemActive(m, current))?.title ?? null,
  );

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  const openDrawer = () => {
    setExpanded(menu_data.find((m) => m.has_dropdown && isMenuItemActive(m, current))?.title ?? null);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-label={open ? t('Close menu') : t('Open menu')}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-canvas active:scale-[0.97] lg:hidden cursor-pointer"
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={1.6} />
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title="Zenvinus"
        subtitle={t('AI Data & Intelligence Platform')}
        footer={
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-ink-muted">{t('Language')}</span>
              <LanguageSwitch />
            </div>
            {user ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 truncate text-xs font-medium text-ink-secondary">
                  {user.name || user.email}
                </p>
                <Button href="/dashboard" variant="primary" size="md" block onClick={() => setOpen(false)}>
                  {t('Dashboard')}
                </Button>
              </div>
            ) : (
              <Button href="/login" variant="primary" size="md" block onClick={() => setOpen(false)}>
                {t('Get Started Today')}
              </Button>
            )}
            <a
              href="mailto:info@zenvinus.co.id"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-ink-muted no-underline hover:text-ink"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>info@zenvinus.co.id</span>
            </a>
          </div>
        }
      >
        <nav aria-label={t('Main menu')} className="flex flex-col gap-1">
          {menu_data.map((item) => {
            const active = isMenuItemActive(item, current);
            if (item.sub_menus) {
              const isExpanded = expanded === item.title;
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpanded(isExpanded ? null : item.title)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-sm font-medium transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer',
                      active
                        ? 'bg-tint-mint text-teal-ink font-semibold'
                        : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                    )}
                  >
                    <span>{t(item.title)}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]', isExpanded && 'rotate-180 text-teal-ink')}
                      strokeWidth={1.6}
                    />
                  </button>
                  {isExpanded && (
                    <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-line pl-3 zv-animate-panel">
                      {item.sub_menus.map((sub) => {
                        const subActive = sub.link === current;
                        return (
                          <Link
                            key={sub.link}
                            href={sub.link}
                            aria-current={subActive ? 'page' : undefined}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'rounded-lg px-2.5 py-2 text-[13px] font-medium no-underline transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
                              subActive
                                ? 'bg-canvas text-teal-ink font-semibold'
                                : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                            )}
                          >
                            {t(sub.title)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.link}
                aria-current={item.link === current ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-[10px] px-3 py-2.5 text-sm font-medium no-underline transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
                  active
                    ? 'bg-tint-mint text-teal-ink font-semibold'
                    : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                )}
              >
                {t(item.title)}
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </>
  );
};

export default MobileNav;
