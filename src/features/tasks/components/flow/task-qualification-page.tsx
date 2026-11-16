import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import TaskQualificationArea from "./task-qualification-area";

const TaskQualification = () => (
  <>
    <DashboardHeader />
    <main>
      <TaskQualificationArea />
    </main>
    <DashboardFooter />
  </>
);

export default TaskQualification;
