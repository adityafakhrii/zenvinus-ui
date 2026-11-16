import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { DashboardPage as Dashboard } from "@/features/dashboard/screens";

const DashboardRoute = () => (
  <Wrapper>
    <SEO pageTitle={"Company Dashboard"} />
    <Dashboard />
  </Wrapper>
);

export default DashboardRoute;
