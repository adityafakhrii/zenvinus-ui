import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import DatasetDetailsArea from "./asset-details-area";

const DatasetDetails = () => (
  <>
    <DashboardHeader />
    <main>
      <DatasetDetailsArea res="Dataset" />
    </main>
    <DashboardFooter />
  </>
);

export default DatasetDetails;
