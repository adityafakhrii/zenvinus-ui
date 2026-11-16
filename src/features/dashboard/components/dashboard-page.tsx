import React from "react";
import { useRouter } from "next/router";
import useMounted from "@/hooks/use-mounted";
import DashboardHeader from "./dashboard-header";
import DashboardFooter from "./dashboard-footer";
import DashboardArea from "./dashboard-area";
import ContributorArea from "./worker-dashboard";
import InternalArea from "./internal-dashboard";
import ExpertArea from "./expert-dashboard";
import { isDashboardRole, type DashboardRole } from "../types/dashboard";

// One view per workspace role
const VIEWS: Record<DashboardRole, () => React.JSX.Element> = {
  enterprise: DashboardArea,
  community: ContributorArea,
  internal: InternalArea,
  expert: ExpertArea,
};

/**
 * One dashboard shell, four workspaces (RBAC multi-membership):
 * /dashboard = enterprise, ?as=community / internal / expert.
 */
const Dashboard = () => {
  const router = useRouter();
  const as = useMounted() ? router.query.as : undefined;
  const View = isDashboardRole(as) ? VIEWS[as] : DashboardArea;

  return (
    <>
      <DashboardHeader />
      <main>
        <View />
      </main>
      <DashboardFooter />
    </>
  );
};

export default Dashboard;
