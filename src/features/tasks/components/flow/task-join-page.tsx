import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import TaskJoinArea from "./task-join-area";

const TaskJoin = () => (
  <>
    <DashboardHeader />
    <main>
      <TaskJoinArea />
    </main>
    <DashboardFooter />
  </>
);

export default TaskJoin;
