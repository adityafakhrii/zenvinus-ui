import React from 'react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import SEO from '@/components/common/seo';
import FooterThree from '@/components/layout/footer/footer';
import HeaderOne from '@/components/layout/header/header';
import { Badge, Button } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Calm Tailwind 404 Not Found screen aligned to the Zenvinus design system.
 */
const NotFoundPage = () => {
  const { t } = useT();

  return (
    <>
      <SEO pageTitle="Page Not Found" />
      <HeaderOne />
      <main className="flex min-h-[calc(100vh-16rem)] items-center justify-center bg-canvas px-4 py-16 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-8 text-center shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-10">
          <Badge tone="neutral" mono>
            404
          </Badge>
          <h1 className="mt-4 mb-2 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            {t('Page not found')}
          </h1>
          <p className="m-0 text-sm leading-relaxed text-ink-secondary">
            {t('The page you are looking for does not exist or may have been moved.')}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              href="/"
              variant="primary"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('Back To Home')}
            </Button>
            <Button
              href="/dashboard"
              variant="secondary"
              size="md"
              leftIcon={<LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Dashboard')}
            </Button>
          </div>
        </div>
      </main>
      <FooterThree />
    </>
  );
};

export default NotFoundPage;
