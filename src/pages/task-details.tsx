import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TaskDetailPage as TaskDetail } from '@/features/tasks/screens';

const TaskDetailsPage = () => (
  <Wrapper>
    <SEO pageTitle={'Task Detail'} />
    <TaskDetail />
  </Wrapper>
);

export default TaskDetailsPage;
