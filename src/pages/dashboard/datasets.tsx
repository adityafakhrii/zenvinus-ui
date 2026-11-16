import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { DatasetsPage as Datasets } from "@/features/catalog/screens";

const DashboardDatasetsPage = () => (
  <Wrapper>
    <SEO pageTitle={ "Datasets & Models" } />
    <Datasets />
  </Wrapper>
);

export default DashboardDatasetsPage;
