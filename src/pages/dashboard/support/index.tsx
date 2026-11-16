import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { SupportPage } from '@/features/support/screens';

const SupportRoute = () => (
  <Wrapper>
    <SEO pageTitle={'Support'} />
    <SupportPage />
  </Wrapper>
);

export default SupportRoute;
