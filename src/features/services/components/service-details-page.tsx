import React from 'react';
import FooterThree from '@/components/layout/footer/footer';
import HeaderOne from '@/components/layout/header/header';
import ServiceDetailsArea from './service-details-area';

/**
 * Service details page (/service-details) rendered cleanly inside HeaderOne + FooterThree (no Breadcrumb).
 */
const ServiceDetails = () => (
  <>
    <HeaderOne />
    <main className="bg-canvas">
      <ServiceDetailsArea />
    </main>
    <FooterThree />
  </>
);

export default ServiceDetails;
