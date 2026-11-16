import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { NewProjectWizard } from "@/features/projects/screens";

const NewProjectPage = () => (
  <Wrapper>
    <SEO pageTitle={"Create AI Project Request"} />
    <NewProjectWizard />
  </Wrapper>
);

export default NewProjectPage;
