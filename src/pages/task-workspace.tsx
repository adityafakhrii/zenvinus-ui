import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Loader2 className="h-6 w-6 animate-spin text-teal-ink" strokeWidth={1.75} aria-label="Loading" />
    </div>
  );
};

export default TaskWorkspacePage;
