import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { ProjectList as CompanyProjects } from "@/features/projects/screens";

const ProjectsPage = () => (
  <Wrapper>
    <SEO pageTitle={"Project Detail"} />
    <CompanyProjects />
  </Wrapper>
);

export default ProjectsPage;
