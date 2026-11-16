import Link from 'next/link';
import React from 'react';
import { useT } from '@/i18n';

interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'AI Research Lab', href: '/lab' },
  { label: 'Support', href: '/dashboard/support' },
  { label: 'Company', href: '/about' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy', href: '#' },
];

/**
 * Clean Tailwind footer shared by all dashboard, task flow, studio, and support screens.
 */
const DashboardFooter = () => {
  const { t } = useT();
  return (
    <footer className="border-t border-[rgba(8,13,53,0.08)] bg-surface py-5">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-4 text-[13px] text-ink-secondary sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="m-0 text-[13px] text-ink-muted">
          {t('© 2026 Zenvinus Labs, Inc. All rights reserved.')}
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((item) =>
            item.href === '#' ? (
              <a
                key={item.label}
                href="#"
                className="text-[13px] text-ink-secondary no-underline hover:text-teal-ink transition-colors"
              >
                {t(item.label)}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-[13px] text-ink-secondary no-underline hover:text-teal-ink transition-colors"
              >
                {t(item.label)}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
};

export default DashboardFooter;
