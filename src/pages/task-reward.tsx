import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import SEO from '@/components/common/seo';
import { TaskRewardPage as TaskReward } from '@/features/tasks/screens';

const TaskRewardPage = () => (
  <Wrapper>
    <SEO pageTitle={'Reward'} />
    <TaskReward />
  </Wrapper>
);

export default TaskRewardPage;
