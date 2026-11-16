import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import TaskDetailArea from "./task-detail-area";

const TaskDetail = () => (
  <>
    <DashboardHeader />
    <main>
      <TaskDetailArea />
    </main>
    <DashboardFooter />
  </>
);

export default TaskDetail;
