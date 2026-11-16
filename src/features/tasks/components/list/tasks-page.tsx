import React from "react";
import SEO from "@/components/common/seo";
import SiteOrDashboardLayout from "@/components/layout/site-or-dashboard-layout";
import TasksArea from "./tasks-area";

const Tasks = () => (
  <>
    <SEO pageTitle={"Tasks — Zenvinus"} />
    <SiteOrDashboardLayout>
      <TasksArea />
    </SiteOrDashboardLayout>
  </>
);

export default Tasks;
