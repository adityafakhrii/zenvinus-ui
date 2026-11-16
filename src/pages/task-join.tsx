import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TaskJoinPage as TaskJoin } from '@/features/tasks/screens';

const TaskJoinPage = () => (
  <Wrapper>
    <SEO pageTitle={'Join Task'} />
    <TaskJoin />
  </Wrapper>
);

export default TaskJoinPage;
