import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import HeaderOne from '@/components/layout/header/header';
import FooterThree from '@/components/layout/footer/footer';
import Breadcrumb from '@/components/common/breadcrumb';
import { useAuth } from '@/features/auth';
import { STUDIO_PERMS } from '../constants';
import { useT } from '@/i18n';

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
    body = <div className="tflow-loading"><span className="spinner-border"></span></div>;
  } else if (!user) {
    body = (
      <div className="studio-gate">
        <i className="fa-solid fa-table-cells"></i>
        <h4>{t('Sign in to use the Dataset Studio')}</h4>
        <p>{t('With the studio you can look through the rows of every dataset, and add and publish your own.')}</p>
        <Link href={`/login?next=${encodeURIComponent(router.asPath)}`} className="hf-primary studio-btn">{t('Sign in')}</Link>
        <p className="studio-hint">{t('Only want to browse?')} <Link href="/datasets">{t('See the public datasets')}</Link>.</p>
      </div>
    );
  } else if (!can(STUDIO_PERMS.explore)) {
    body = (
      <div className="studio-gate">
        <i className="fa-solid fa-lock"></i>
        <h4>{t('No access to the Dataset Studio yet')}</h4>
        <p>{t('Your account does not have a role with studio access. Ask an administrator to give you one.')}</p>
        <Link href="/datasets" className="studio-btn studio-btn-light">{t('See the public datasets')}</Link>
      </div>
    );
  }

  const content = (
    <section className={`tp-portfolio-area ${isPublic ? 'pt-120' : 'pt-60'} pb-90 studio-area`}>
      <div className="container">
        {title && !isPublic && <h3 className="studio-title">{t(title)}</h3>}
        {body}
      </div>
    </section>
  );

  if (isPublic) {
    return (
      <>
        <HeaderOne />
        <main>
          <Breadcrumb top_title="Dataset Studio" page_title="Dataset Studio" />
          {content}
        </main>
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
