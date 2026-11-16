import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TaskQualityCheckPage as TaskQualityCheck } from '@/features/tasks/screens';

const TaskQualityCheckPage = () => (
  <Wrapper>
    <SEO pageTitle={'Quality Check'} />
    <TaskQualityCheck />
  </Wrapper>
);

export default TaskQualityCheckPage;
