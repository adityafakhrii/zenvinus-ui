import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TaskCompletedPage as TaskCompleted } from '@/features/tasks/screens';

const TaskCompletedPage = () => (
  <Wrapper>
    <SEO pageTitle={'Task Completed'} />
    <TaskCompleted />
  </Wrapper>
);

export default TaskCompletedPage;
