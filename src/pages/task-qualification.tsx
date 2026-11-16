import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TaskQualificationPage as TaskQualification } from '@/features/tasks/screens';

const TaskQualificationPage = () => (
  <Wrapper>
    <SEO pageTitle={'Qualification'} />
    <TaskQualification />
  </Wrapper>
);

export default TaskQualificationPage;
