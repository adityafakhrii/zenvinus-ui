import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import TaskRewardArea from "./task-reward-area";

const TaskReward = () => (
  <>
    <DashboardHeader />
    <main>
      <TaskRewardArea />
    </main>
    <DashboardFooter />
  </>
);

export default TaskReward;
