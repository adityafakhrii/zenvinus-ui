import React from "react";
import SEO from "@/components/common/seo";
import SiteOrDashboardLayout from "@/components/layout/site-or-dashboard-layout";
import DatasetsArea from "./assets-area";

const Datasets = () => (
  <>
    <SEO pageTitle={"Datasets — Zenvinus"} />
    <SiteOrDashboardLayout>
      <DatasetsArea res="Dataset" />
    </SiteOrDashboardLayout>
  </>
);

export default Datasets;
