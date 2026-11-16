import React from 'react';
import HeaderOne from '@/components/layout/header/header';
import FooterThree from '@/components/layout/footer/footer';
import AboutPage from './about-page';

const About = () => (
  <>
    <HeaderOne />
    <main>
      <AboutPage />
    </main>
    <FooterThree />
  </>
);

export default About;
