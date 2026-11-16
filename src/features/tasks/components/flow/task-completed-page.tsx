import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import TaskCompletedArea from "./task-completed-area";

const TaskCompleted = () => (
  <>
    <DashboardHeader />
    <main>
      <TaskCompletedArea />
    </main>
    <DashboardFooter />
  </>
);

export default TaskCompleted;
