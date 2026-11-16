import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { Lab } from "@/features/lab/screens";

const LabPage = () => (
  <Wrapper>
    <SEO pageTitle={"AI Research Lab"} />
    <Lab />
  </Wrapper>
);

export default LabPage;
