import Head from 'next/head';
import { useT } from '@/i18n';

export interface SEOProps {
  /** Page title in English; shown in the chosen language */
  pageTitle?: string;
}

const SEO = ({ pageTitle }: SEOProps) => {
  const { t } = useT();
  return (
    <Head>
      <title>{pageTitle ? t(pageTitle) : ''}</title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="description" content={t('Zenvinus — AI data, research and intelligence platform for Indonesia. zenvinus.co.id')} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="canonical" href="https://zenvinus.co.id" />
      <link rel="icon" href="/favicon.png" />
    </Head>
  );
};

export default SEO;
