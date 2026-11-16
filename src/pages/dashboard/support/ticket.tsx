import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TicketPage } from '@/features/support/screens';

const TicketRoute = () => (
  <Wrapper>
    <SEO pageTitle={'Support request'} />
    <TicketPage />
  </Wrapper>
);

export default TicketRoute;
