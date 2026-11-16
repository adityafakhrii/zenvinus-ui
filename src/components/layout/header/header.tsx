import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Search, Settings } from 'lucide-react';
import Logo from '@assets/img/logo/logo.png';
import { Button, cn } from '@/components/ui';
import { AccountMenu, type AccountMenuLink, useAuth } from '@/features/auth';
import { LanguageSwitch, useT } from '@/i18n';
import MobileNav from './mobile-nav';
import NavMenu from './nav-menu';
import SearchPopup from './search-popup';

const ACCOUNT_LINKS: readonly AccountMenuLink[] = [
  {
    href: '/dashboard',
    lucideIcon: <LayoutDashboard className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />,
    label: 'Dashboard',
  },
  {
    href: '/dashboard/settings',
    lucideIcon: <Settings className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />,
    label: 'Account Settings',
  },
];

/**
 * Sticky 64px Public Top Navbar matching the quiet ACRU / Zenvinus visual language.
 */
const HeaderOne = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useT();
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 h-16 border-b border-hairline bg-surface transition-shadow duration-150',
          scrolled && 'shadow-[0_4px_16px_rgba(2,6,38,0.06)]',
        )}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex shrink-0 items-center no-underline" aria-label="Zenvinus">
              <Image src={Logo} alt="Zenvinus" priority className="h-5 w-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center" aria-label={t('Main menu')}>
              <NavMenu />
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t('Search')}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(8,13,53,0.10)] bg-canvas text-ink-secondary transition-colors hover:border-ink/25 hover:text-ink cursor-pointer"
            >
              <Search className="h-4 w-4" strokeWidth={1.6} />
            </button>

            <div className="hidden sm:block">
              <LanguageSwitch />
            </div>

            {user ? (
              <div className="hidden lg:block">
                <AccountMenu
                  compact
                  name={user.name || user.email}
                  email={user.email}
                  links={ACCOUNT_LINKS}
                />
              </div>
            ) : (
              <div
                className="hidden lg:flex items-center gap-2"
                style={isLoading ? { visibility: 'hidden' } : undefined}
              >
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center rounded-[10px] px-3 text-[13px] font-medium text-ink-secondary no-underline transition-colors hover:bg-canvas hover:text-ink"
                >
                  {t('Sign in')}
                </Link>
                <Button href="/login" variant="primary" size="sm">
                  {t('Get Started Today')}
                </Button>
              </div>
            )}

            <MobileNav />
          </div>
        </div>
      </header>

      <SearchPopup searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
    </>
  );
};

export default HeaderOne;
