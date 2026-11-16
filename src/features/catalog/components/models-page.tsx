import React from "react";
import HeaderOne from "@/components/layout/header/header";
import FooterThree from "@/components/layout/footer/footer";
import SEO from "@/components/common/seo";
import DatasetsArea from "./assets-area";

const Models = () => (
  <>
    <SEO pageTitle={"Models — Zenvinus"} />
    <HeaderOne />
    <main>
      <DatasetsArea res="Model" />
    </main>
    <FooterThree />
  </>
);

export default Models;
