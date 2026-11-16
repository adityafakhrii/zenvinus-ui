import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import Logo from '@assets/img/logo/logo.png';
import { Button, Drawer, cn } from '@/components/ui';
import { AccountMenu, useAuth } from '@/features/auth';
import { STUDIO_PERMS } from '@/config/permissions';
import useMounted from '@/hooks/use-mounted';
import { LanguageSwitch, useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCompanyProfile } from '../data/company-dashboard';
import {
  getNavItemsForRole,
  getPersonaCta,
  type NavItem,
} from '../data/navigation';
import {
  selectNavMode,
  selectSidebarCollapsed,
  sidebarCollapsedToggled,
} from '../store/layout-slice';
import { isDashboardRole, type DashboardRole } from '../types/dashboard';
import { NotificationsPopover } from './notifications-popover';
import { NavLucideIcon, QuickSearchModal } from './quick-search-modal';
import RoleSwitch from './role-switch';

const isNavActive = (match: string, pathname: string): boolean => pathname.startsWith(match);

const resolveActiveNavItem = (items: ReadonlyArray<NavItem>, pathname: string): NavItem | undefined =>
  items
    .flatMap((item) => item.matches.map((m) => ({ item, m })))
    .filter(({ m }) => isNavActive(m, pathname))
    .sort((a, b) => b.m.length - a.m.length)[0]?.item;

const DashboardHeader = () => {
  const router = useRouter();
  const mounted = useMounted();
  const dispatch = useAppDispatch();
  const navMode = useAppSelector(selectNavMode);
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);

  const company = getCompanyProfile();
  const { can, user } = useAuth();
  const { t } = useT();

  const asQuery = mounted ? router.query.as : undefined;
  const role: DashboardRole = isDashboardRole(asQuery) ? asQuery : 'enterprise';
  const profile = user ? { ...company, name: user.name || user.email, email: user.email } : company;

  const navItems = getNavItemsForRole(role, can(STUDIO_PERMS.explore));
  const activeMatch = resolveActiveNavItem(navItems, router.pathname);
  const cta = getPersonaCta(role);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMobileOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderCtaButton = (extraClassName?: string) => {
    if (!cta) return null;
    return (
      <Button
        href={cta.href}
        variant="teal"
        size="sm"
        className={extraClassName}
        leftIcon={
          cta.icon === 'plus' ? (
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          )
        }
      >
        {t(cta.label)}
      </Button>
    );
  };

  const mobileDrawer = (
    <Drawer
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      side="left"
      title={
        <Link href="/" className="inline-flex items-center no-underline" onClick={() => setMobileOpen(false)}>
          <Image src={Logo} alt="Zenvinus" className="h-7 w-auto" priority />
        </Link>
      }
      subtitle={t('Workspace')}
      footer={
        <div className="flex flex-col gap-3">
          {renderCtaButton('w-full')}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-ink-muted">{t('Language')}</span>
            <LanguageSwitch />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <nav className="flex flex-col gap-1" aria-label={t('Main menu')}>
          {navItems.map((item) => {
            const active = item === activeMatch;
            return (
              <div key={item.label} className="flex flex-col">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex h-10 items-center justify-between gap-2 rounded-[9px] px-3 text-sm font-medium no-underline transition-colors',
                    active ? 'bg-canvas text-ink font-semibold' : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <NavLucideIcon icon={item.icon} className={active ? 'text-teal-ink' : 'text-ink-muted'} />
                    <span>{t(item.label)}</span>
                  </span>
                  {typeof item.badgeCount === 'number' && (
                    <span className="rounded-md bg-navy px-1.5 py-0.5 font-mono text-[11px] text-white tabular-nums">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
                {item.children && (
                  <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-line pl-3">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex h-8 items-center justify-between rounded-[7px] px-2 text-[13px] text-ink-secondary no-underline hover:bg-canvas hover:text-ink"
                      >
                        <span>{t(sub.label)}</span>
                        {typeof sub.count === 'number' && (
                          <span className="font-mono text-[11px] text-ink-muted tabular-nums">{sub.count}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </Drawer>
  );

  if (navMode === 'sidebar') {
    return (
      <>
        <div
          className="zv-shell-sidebar-anchor"
          data-collapsed={sidebarCollapsed ? 'true' : 'false'}
        >
          {/* Fixed Desktop Sidebar */}
          <aside
            aria-label={t('Main menu')}
            className={cn(
              'fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col border-r border-[rgba(8,13,53,0.08)] bg-surface',
              'transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
              sidebarCollapsed ? 'w-[72px]' : 'w-[256px]',
            )}
          >
            <div
              className={cn(
                'flex h-16 shrink-0 items-center border-b border-line-subtle',
                sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4',
              )}
            >
              <Link href="/" className="inline-flex items-center no-underline">
                {sidebarCollapsed ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-navy text-sm font-semibold text-teal">
                    Z
                  </span>
                ) : (
                  <Image src={Logo} alt="Zenvinus" className="h-7 w-auto" priority />
                )}
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label={t('Main menu')}>
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = item === activeMatch;
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isOpen = expandedGroups[item.label] ?? active;

                  return (
                    <div key={item.label} className="flex flex-col">
                      <div className="relative flex items-center">
                        {active && (
                          <span
                            className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-navy"
                            aria-hidden="true"
                          />
                        )}
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          title={sidebarCollapsed ? t(item.label) : undefined}
                          className={cn(
                            'flex h-9 flex-1 items-center gap-2.5 rounded-[8px] px-2.5 text-[13px] font-medium no-underline',
                            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink/40',
                            sidebarCollapsed && 'justify-center px-0',
                            active
                              ? 'bg-canvas text-ink font-semibold'
                              : 'text-ink-secondary hover:bg-canvas/70 hover:text-ink',
                          )}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                            <NavLucideIcon
                              icon={item.icon}
                              className={active ? 'text-teal-ink' : 'text-ink-muted'}
                            />
                          </span>
                          {!sidebarCollapsed && <span className="flex-1 truncate">{t(item.label)}</span>}
                          {!sidebarCollapsed && typeof item.badgeCount === 'number' && (
                            <span className="rounded-full bg-navy px-2 py-0.5 font-mono text-[11px] leading-none text-white tabular-nums">
                              {item.badgeCount}
                            </span>
                          )}
                        </Link>
                        {!sidebarCollapsed && hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleGroup(item.label)}
                            aria-label={t(item.label)}
                            aria-expanded={isOpen}
                            className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-ink-muted hover:bg-canvas hover:text-ink cursor-pointer"
                          >
                            <ChevronDown
                              className={cn(
                                'h-3.5 w-3.5 transition-transform duration-150',
                                isOpen && 'rotate-180',
                              )}
                              strokeWidth={1.5}
                            />
                          </button>
                        )}
                      </div>

                      {!sidebarCollapsed && hasChildren && isOpen && item.children && (
                        <div className="ml-4 mt-1 mb-1 flex flex-col gap-0.5 border-l border-line pl-3">
                          {item.children.map((sub) => {
                            const subActive = router.asPath === sub.href || router.pathname === sub.href.split('?')[0];
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  'flex h-8 items-center justify-between rounded-[7px] px-2 text-[13px] no-underline transition-colors',
                                  subActive
                                    ? 'text-ink font-medium bg-canvas/70'
                                    : 'text-ink-secondary hover:bg-canvas/60 hover:text-ink',
                                )}
                              >
                                <span className="truncate">{t(sub.label)}</span>
                                {typeof sub.count === 'number' && (
                                  <span className="rounded-full bg-navy px-1.5 py-0.5 font-mono text-[10px] leading-none text-white tabular-nums">
                                    {sub.count}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-line-subtle p-3 flex flex-col gap-2">
              {!sidebarCollapsed && (
                <div className="rounded-xl border border-line bg-surface-soft p-3">
                  <p className="m-0 text-xs font-semibold text-ink">{t('Workspace layout')}</p>
                  <p className="mt-0.5 mb-2 text-[11px] leading-relaxed text-ink-secondary">
                    {t('Switch between Top Navbar and Sidebar any time in Settings.')}
                  </p>
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] bg-navy px-3 text-xs font-medium text-white no-underline hover:bg-navy-hover transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {t('Customize layout')}
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => dispatch(sidebarCollapsedToggled())}
                aria-label={sidebarCollapsed ? t('Expand sidebar') : t('Collapse sidebar')}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[13px] font-medium text-ink-secondary hover:bg-canvas hover:text-ink transition-colors cursor-pointer',
                  sidebarCollapsed && 'justify-center px-0',
                )}
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                ) : (
                  <>
                    <ChevronsLeft className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span>{t('Collapse sidebar')}</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Top Utility Bar (Sidebar Mode) */}
          <header
            className={cn(
              'sticky top-0 z-30 h-16 border-b border-[rgba(8,13,53,0.08)] bg-surface/95 backdrop-blur-sm',
              'transition-[padding-left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
              sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[256px]',
            )}
          >
            <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label={t('Open menu')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink hover:bg-canvas lg:hidden cursor-pointer"
                >
                  <Menu className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <Link href="/" className="inline-flex items-center no-underline lg:hidden">
                  <Image src={Logo} alt="Zenvinus" className="h-6 w-auto" priority />
                </Link>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label={t('Quick search')}
                  className="hidden sm:flex h-9 w-64 md:w-72 items-center justify-between gap-2 rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-canvas/70 px-3 text-[13px] text-ink-muted hover:border-ink/25 hover:bg-surface transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    <span>{t('Quick search')}</span>
                  </span>
                  <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                    Ctrl K
                  </kbd>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label={t('Quick search')}
                  className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink-secondary hover:text-ink sm:hidden cursor-pointer"
                >
                  <Search className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <LanguageSwitch className="hidden sm:inline-flex" />
                <NotificationsPopover />
                <Link
                  href="/dashboard/settings"
                  aria-label={t('Account Settings')}
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink-secondary hover:border-ink/25 hover:text-ink transition-colors no-underline"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.5} />
                </Link>
                <AccountMenu
                  name={profile.name}
                  email={profile.email}
                  title={`${profile.name} — ${t('{plan} plan', { plan: profile.plan })}`}
                  links={[{ href: '/dashboard/settings', label: 'Account Settings' }]}
                />
                {renderCtaButton('hidden md:inline-flex')}
              </div>
            </div>
          </header>
        </div>
        {mobileDrawer}
        <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <RoleSwitch as={role} />
      </>
    );
  }

  /* Default Mode: Top Navbar */
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[rgba(8,13,53,0.08)] bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4 2xl:gap-6">
            <Link href="/" className="inline-flex shrink-0 items-center no-underline">
              <Image src={Logo} alt="Zenvinus" className="h-7 w-auto" priority />
            </Link>

            <nav
              className="hidden min-w-0 xl:flex items-center gap-0.5 2xl:gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label={t('Main menu')}
            >
              {navItems.map((item) => {
                const active = item === activeMatch;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] px-2.5 2xl:px-3 text-[13px] font-medium no-underline whitespace-nowrap',
                      'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink/40',
                      active
                        ? 'bg-canvas text-ink font-semibold'
                        : 'text-ink-secondary hover:bg-canvas/60 hover:text-ink',
                    )}
                  >
                    <span>{t(item.label)}</span>
                    {typeof item.badgeCount === 'number' && (
                      <span className="rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink-secondary border border-line-subtle tabular-nums">
                        {item.badgeCount}
                      </span>
                    )}
                    {active && (
                      <span
                        className="absolute inset-x-2.5 2xl:inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-teal"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t('Quick search')}
              className="hidden 2xl:inline-flex h-9 items-center gap-2 rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-canvas/70 px-3 text-[13px] text-ink-muted hover:border-ink/25 hover:bg-surface transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>{t('Search')}</span>
              <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t('Quick search')}
              title={`${t('Quick search')} (Ctrl+K)`}
              className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink-secondary hover:border-ink/25 hover:text-ink transition-colors 2xl:hidden cursor-pointer"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <LanguageSwitch className="hidden sm:inline-flex" />
            <NotificationsPopover />

            {renderCtaButton('hidden lg:inline-flex')}

            <AccountMenu
              name={profile.name}
              email={profile.email}
              title={`${profile.name} — ${t('{plan} plan', { plan: profile.plan })}`}
              links={[{ href: '/dashboard/settings', label: 'Account Settings' }]}
            />

            <button
              type="button"
              aria-label={mobileOpen ? t('Close menu') : t('Open menu')}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-[rgba(8,13,53,0.10)] bg-surface text-ink hover:bg-canvas xl:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {mobileDrawer}
      <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <RoleSwitch as={role} />
    </>
  );
};

export default DashboardHeader;
