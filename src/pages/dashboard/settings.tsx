import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { CompanySettings } from "@/features/company/screens";

const SettingsRoute = () => (
  <Wrapper>
    <SEO pageTitle={"Settings"} />
    <CompanySettings />
  </Wrapper>
);

export default SettingsRoute;
