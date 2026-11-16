import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * The old workspace page now lives at /task-studio (the Annotation Studio).
 * This stub keeps any existing links working by forwarding the ?task=slug.
 */
const TaskWorkspacePage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.replace({ pathname: '/task-studio', query: router.query });
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="tflow-loading"><span className="spinner-border"></span></div>;
};

export default TaskWorkspacePage;
