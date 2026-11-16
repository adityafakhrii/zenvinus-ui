import React from "react";
import Wrapper from "@/components/layout/wrapper";
import SEO from "@/components/common/seo";
import { TasksPage as Tasks } from "@/features/tasks/screens";

const DashboardTasksPage = () => (
  <Wrapper>
    <SEO pageTitle="Tasks" />
    <Tasks />
  </Wrapper>
);

export default DashboardTasksPage;
