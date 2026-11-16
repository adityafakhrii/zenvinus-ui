import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Database, Lock } from 'lucide-react';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import HeaderOne from '@/components/layout/header/header';
import FooterThree from '@/components/layout/footer/footer';
import { useAuth } from '@/features/auth';
import { STUDIO_PERMS } from '../constants';
import { useT } from '@/i18n';
import { BentoSkeleton, Button } from '@/components/ui';

/**
 * Layout for the dataset studio. Under /studio it uses the public site header and footer; under /dashboard/studio
 * it uses the dashboard ones. Either way it shows the page only to signed-in users with datasets.explore, and
 * everyone else gets a sign-in link or a no-access message. The API enforces the same rule on every request.
 */
export interface StudioLayoutProps {
  /** Page title (English i18n key), shown in the dashboard layout */
  title?: string;
  children: ReactNode;
}

const StudioLayout = ({ title, children }: StudioLayoutProps) => {
  const router = useRouter();
  const { user, can, isLoading } = useAuth();
  const { t } = useT();
  const isPublic = !router.pathname.startsWith('/dashboard');

  let body: ReactNode = children;
  if (isLoading) {
    body = <BentoSkeleton />;
  } else if (!user) {
    body = (
      <div className="mx-auto max-w-lg rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-8 text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-navy">
          <Database className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <h4 className="text-lg font-semibold text-ink">{t('Sign in to use the Dataset Studio')}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {t('With the studio you can look through the rows of every dataset, and add and publish your own.')}
        </p>
        <div className="mt-5 flex justify-center">
          <Button variant="primary" href={`/login?next=${encodeURIComponent(router.asPath)}`}>
            {t('Sign in')}
          </Button>
        </div>
        <p className="mt-4 text-xs text-ink-muted">
          {t('Only want to browse?')}{' '}
          <Link href="/datasets" className="font-medium text-teal-ink hover:underline">
            {t('See the public datasets')}
          </Link>
          .
        </p>
      </div>
    );
  } else if (!can(STUDIO_PERMS.explore)) {
    body = (
      <div className="mx-auto max-w-lg rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-8 text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink-secondary">
          <Lock className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <h4 className="text-lg font-semibold text-ink">{t('No access to the Dataset Studio yet')}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {t('Your account does not have a role with studio access. Ask an administrator to give you one.')}
        </p>
        <div className="mt-5 flex justify-center">
          <Button variant="secondary" href="/datasets">
            {t('See the public datasets')}
          </Button>
        </div>
      </div>
    );
  }

  const content = (
    <section
      className={`min-h-[calc(100vh-220px)] bg-canvas ${
        isPublic ? 'pt-8 pb-20 sm:pt-10' : 'pt-6 pb-24 sm:py-10'
      }`}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        {(isPublic || title) && (
          <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t(title || 'Dataset Studio')}
          </h1>
        )}
        {body}
      </div>
    </section>
  );

  if (isPublic) {
    return (
      <>
        <HeaderOne />
        <main>{content}</main>
        <FooterThree />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main>{content}</main>
      <DashboardFooter />
    </>
  );
};

export default StudioLayout;
