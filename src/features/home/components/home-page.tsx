import React from 'react';
import FooterThree from '@/components/layout/footer/footer';
import HeaderOne from '@/components/layout/header/header';
import AboutArea from './about-area';
import BusinessArea from './business-area';
import CommunityArea from './community-area';
import CtaArea from './cta-area';
import EnginesArea from './engines-area';
import HeroArea from './hero-area';
import OfferArea from './offer-area';

/**
 * Landing page (/) assembled purely from revamped Zenvinus Tailwind sections.
 */
const HomeMain = () => (
  <>
    <HeaderOne />
    <main className="bg-surface">
      <HeroArea />
      <OfferArea />
      <AboutArea />
      <BusinessArea />
      <EnginesArea />
      <CommunityArea />
      <CtaArea />
    </main>
    <FooterThree />
  </>
);

export default HomeMain;
