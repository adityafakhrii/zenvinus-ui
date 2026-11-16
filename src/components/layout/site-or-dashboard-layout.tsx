import React from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";
import HeaderOne from "@/components/layout/header/header";
import FooterThree from "@/components/layout/footer/footer";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";

/**
 * Wraps a page that exists both on the public site and inside the dashboard (for example /datasets and
 * /dashboard/datasets). Under /dashboard it keeps the dashboard header, menu and footer, so following a dashboard
 * link never drops the user into the marketing layout; elsewhere it shows the site header and footer (no breadcrumb banner).
 */
const SiteOrDashboardLayout = ({ children }: { children: ReactNode }) => {
  const inDashboard = useRouter().pathname.startsWith("/dashboard");
  if (inDashboard) {
    return (
      <>
        <DashboardHeader />
        <main>{children}</main>
        <DashboardFooter />
      </>
    );
  }
  return (
    <>
      <HeaderOne />
      <main>
        {children}
      </main>
      <FooterThree />
    </>
  );
};

export default SiteOrDashboardLayout;
