import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { CompanyTeam } from "@/features/company/screens";

const TeamRoute = () => (
  <Wrapper>
    <SEO pageTitle={"Team & Seats"} />
    <CompanyTeam />
  </Wrapper>
);

export default TeamRoute;
