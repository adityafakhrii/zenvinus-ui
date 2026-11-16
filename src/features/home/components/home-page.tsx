import React from "react";
import HeaderOne from "@/components/layout/header/header";
import FooterThree from "@/components/layout/footer/footer";

import HeroArea from "./hero-area";
import OfferArea from "./offer-area";
import AboutArea from "./about-area";
import BusinessArea from "./business-area";
import EnginesArea from "./engines-area";
import CommunityArea from "./community-area";
// import CtaArea from "./cta-area";

const HomeMain = () => {
  return (
    <>
      <HeaderOne />
      <main className="zc-rail-page">
        <HeroArea />
        <OfferArea />
        <AboutArea />
        <BusinessArea />
        <EnginesArea />
        <CommunityArea />
        {/* <CtaArea /> */}
      </main>
      <FooterThree />
    </>
  );
};

export default HomeMain;
