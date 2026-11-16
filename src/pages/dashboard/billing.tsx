import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { CompanyBilling } from "@/features/company/screens";

const BillingRoute = () => (
  <Wrapper>
    <SEO pageTitle={"Billing & Invoices"} />
    <CompanyBilling />
  </Wrapper>
);

export default BillingRoute;
