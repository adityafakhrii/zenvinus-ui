import React from 'react';
import FooterThree from '@/components/layout/footer/footer';
import HeaderOne from '@/components/layout/header/header';
import ServiceArea from './service-area';

/**
 * Services overview page (/service) without legacy Breadcrumb or template HeaderTwo.
 */
const ServicePage = () => (
  <>
    <HeaderOne />
    <main className="bg-surface">
      <ServiceArea />
    </main>
    <FooterThree />
  </>
);

export default ServicePage;
