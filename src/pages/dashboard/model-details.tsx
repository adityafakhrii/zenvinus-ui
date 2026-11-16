import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { ModelDetailsPage as ModelDetails } from "@/features/catalog/screens";

const DashboardModelDetailsPage = () => (
  <Wrapper>
    <SEO pageTitle={ "Model Details" } />
    <ModelDetails />
  </Wrapper>
);

export default DashboardModelDetailsPage;
