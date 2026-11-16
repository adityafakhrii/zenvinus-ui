import React from 'react';
import SEO from '@/components/common/seo';
import { TaskStudio } from '@/features/tasks/screens';

const TaskStudioPage = () => (
  <>
    <SEO pageTitle={'Annotation Studio'} />
    <TaskStudio />
  </>
);

export default TaskStudioPage;
