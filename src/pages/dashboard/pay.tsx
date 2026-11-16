import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { PaymentGateway } from "@/features/projects/screens";

const PayPage = () => (
  <Wrapper>
    <SEO pageTitle={"Payment"} />
    <PaymentGateway />
  </Wrapper>
);

export default PayPage;
