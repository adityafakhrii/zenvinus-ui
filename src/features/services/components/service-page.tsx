import React from "react";
import Breadcrumb from "@/components/common/breadcrumb";
import ServiceArea from "./service-area";
import VideoArea from "./video-area";
import IndustryArea from "./industry-area";
import BrandArea from "./brand-area";
import BlogArea from "./blog-area";
import FooterThree from "@/components/layout/footer/footer";
import HeaderTwo from "@/features/services/components/layout/header-2";

const Sevice = () => {
  return (
    <>
      <HeaderTwo />
      <main>
            <Breadcrumb top_title="Our Services" page_title="Service" />
            <ServiceArea />
            <VideoArea service={true}/>
            <IndustryArea service={true} />
            <BrandArea service={true} />
            <BlogArea service={true} />
      </main>
      <FooterThree />
    </>
  );
};

export default Sevice;
