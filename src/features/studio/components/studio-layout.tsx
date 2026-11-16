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
import { Badge, BentoSkeleton, Button } from '@/components/ui';

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
      <div className="mx-auto max-w-lg rounded-2xl border border-[#EAEAEA] bg-white p-8 text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#132B45]">
          <Database className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <h4 className="text-lg font-semibold text-[#18181B]">{t('Sign in to use the Dataset Studio')}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
          {t('With the studio you can look through the rows of every dataset, and add and publish your own.')}
        </p>
        <div className="mt-5 flex justify-center">
          <Button variant="primary" href={`/login?next=${encodeURIComponent(router.asPath)}`}>
            {t('Sign in')}
          </Button>
        </div>
        <p className="mt-4 text-xs text-[#6B7280]">
          {t('Only want to browse?')}{' '}
          <Link href="/datasets" className="font-medium text-[#008C85] hover:underline">
            {t('See the public datasets')}
          </Link>
          .
        </p>
      </div>
    );
  } else if (!can(STUDIO_PERMS.explore)) {
    body = (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#EAEAEA] bg-white p-8 text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#52525B]">
          <Lock className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <h4 className="text-lg font-semibold text-[#18181B]">{t('No access to the Dataset Studio yet')}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
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
    <section className={`min-h-[calc(100vh-220px)] bg-[#F9FAFB] ${isPublic ? 'pb-20 pt-28 sm:pt-32' : 'py-8 sm:py-10'}`}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        {isPublic && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge tone="mint">{t('Dataset Studio')}</Badge>
            <h1 className="text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">{t(title || 'Dataset Studio')}</h1>
          </div>
        )}
        {title && !isPublic && (
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#18181B]">{t(title)}</h1>
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
