import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectStorageHydrated, type PersistenceRootState } from '@/store/persistence';
import { fetchTaskBySlug } from '../services/tasks-api';
import type { TaskDetail } from '../types/task';

export interface UseTaskRouteOptions {
  /** Redirect when there is no task (default true) */
  require?: boolean;
  redirectTo?: string;
}

export interface TaskRoute {
  router: NextRouter;
  /** Router initialised and task loaded */
  ready: boolean;
  task: TaskDetail | null;
  slug: string | null;
  isLoading: boolean;
}

/** `?task=<slug>` as a single string (the first value when repeated) */
export const taskSlugOf = (value: string | string[] | undefined): string | null =>
  (Array.isArray(value) ? value[0] : value) || null;

/**
 * Resolves `?task=<slug>` on flow pages against the backend
 * (GET /api/tasks/{slug}). Returns `ready` once the router is initialised,
 * the saved flow state (submissions, drafts) is restored and the task is
 * loaded; `task` is null while loading or when the slug is
 * unknown. Redirects to the Task List when the slug is missing or the API
 * reports 404 — flow pages are never reachable without a task context.
 */
const useTaskRoute = ({ require = true, redirectTo = '/tasks' }: UseTaskRouteOptions = {}): TaskRoute => {
  const router = useRouter();
  const ready = router.isReady;
  const slug = ready ? taskSlugOf(router.query.task) : null;

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', slug],
    queryFn: () => fetchTaskBySlug(slug ?? ''),
    enabled: !!slug,
    retry: false,
  });

  useEffect(() => {
    if (ready && require && (!slug || (!isLoading && (isError || !task)))) {
      router.replace(redirectTo);
    }
  }, [ready, require, slug, isLoading, isError, task, redirectTo, router]);

  // WHY: Flow pages read stored submissions and progress in effects; with React 19 an effect of the first render
  // still sees the store from before it was restored. Typed with the persistence slice only, so this hook (exported
  // from the tasks index, which the store imports) does not import the store.
  const storageHydrated = useSelector((state: PersistenceRootState) => selectStorageHydrated(state));
  return { router, ready: ready && storageHydrated && !!task, task: task || null, slug, isLoading };
};

export default useTaskRoute;
