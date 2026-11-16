import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import QualityCheckArea from "./task-quality-check-area";

const TaskQualityCheck = () => (
  <>
    <DashboardHeader />
    <main>
      <QualityCheckArea />
    </main>
    <DashboardFooter />
  </>
);

export default TaskQualityCheck;
