import Breadcrumb from "@/components/common/breadcrumb";
import HeaderOne from "@/components/layout/header/header";
import React from "react";
import ServiceDetailsArea from "./service-details-area";
import FooterThree from "@/components/layout/footer/footer";

const ServiceDetails = () => {
  return (
    <>
      <HeaderOne />
      <main>
        <Breadcrumb top_title="Machine Learning" page_title="Service Details" />
        <ServiceDetailsArea />
      </main>
      <FooterThree />
    </>
  );
};

export default ServiceDetails;
