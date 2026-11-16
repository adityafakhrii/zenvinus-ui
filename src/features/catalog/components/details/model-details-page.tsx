import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import AssetDetailsArea from "./asset-details-area";

const ModelDetails = () => (
  <>
    <DashboardHeader />
    <main>
      <AssetDetailsArea res="Model" />
    </main>
    <DashboardFooter />
  </>
);

export default ModelDetails;
