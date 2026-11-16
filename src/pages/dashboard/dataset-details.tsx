import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { DatasetDetailsPage as DatasetDetails } from "@/features/catalog/screens";

const DashboardDatasetDetailsPage = () => (
  <Wrapper>
    <SEO pageTitle={ "Dataset Details" } />
    <DatasetDetails />
  </Wrapper>
);

export default DashboardDatasetDetailsPage;
