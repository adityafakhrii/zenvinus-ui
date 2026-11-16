/**
 * Dummy task service for local UI/UX mode (replaces remote /api/tasks/* calls).
 */
import { ApiError } from '@/services/api';
import { buildTaskFacets, DUMMY_TASKS } from '../data/dummy-tasks';
import type { JoinResponse, TaskCard, TaskDetail, TaskListParams, TaskPage } from '../types/task';

// Kept here for existing imports; the list lives in @/config/data-types
export { DATA_TYPES } from '@/config/data-types';

export const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Expert'] as const;

export type DifficultyFilter = (typeof DIFFICULTIES)[number];

/** Fetch the dummy task list page payload: {cards, total, facets}. */
export async function fetchTasks(params: TaskListParams = {}): Promise<TaskPage> {
  const q = params.q?.trim().toLowerCase();
  const category = params.category?.trim().toLowerCase();
  const difficulty = params.difficulty?.trim().toLowerCase();
  const status = params.status?.trim().toLowerCase();
  const dtypes = Array.isArray(params.dataType) ? params.dataType.map((d) => d.toLowerCase()) : [];

  let filtered = DUMMY_TASKS.filter((task) => {
    if (q) {
      const hay = `${task.title} ${task.desc} ${task.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (category && category !== 'all' && task.categorySlug?.toLowerCase() !== category && task.category.toLowerCase() !== category) {
      return false;
    }
    if (difficulty && difficulty !== 'all' && task.difficulty.toLowerCase() !== difficulty) {
      return false;
    }
    if (status && status !== 'all' && task.status.toLowerCase() !== status) {
      return false;
    }
    if (dtypes.length && !dtypes.includes(task.dataType.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (params.sort === 'reward') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (params.sort === 'contributors') {
    filtered = [...filtered].sort((a, b) => b.contributors - a.contributors);
  }

  const offset = params.offset ?? 0;
  const limit = params.limit ?? 12;
  const cards: TaskCard[] = filtered.slice(offset, offset + limit);

  return {
    cards,
    total: filtered.length,
    facets: buildTaskFacets(DUMMY_TASKS),
  };
}

export async function fetchTaskBySlug(slug: string): Promise<TaskDetail> {
  const found = DUMMY_TASKS.find((t) => t.slug === slug);
  if (!found) {
    throw new ApiError(404, 'Task not found.', null);
  }
  return { ...found };
}

export async function joinTask(id: number): Promise<JoinResponse> {
  const found = DUMMY_TASKS.find((t) => t.id === id);
  if (!found) {
    throw new ApiError(404, 'Task not found.', null);
  }
  if (!found.joined) {
    found.joined = true;
    found.contributors += 1;
  }
  return {
    data: {
      joined: found.joined,
      participantCount: found.contributors,
    },
  };
}

export async function leaveTask(id: number): Promise<JoinResponse> {
  const found = DUMMY_TASKS.find((t) => t.id === id);
  if (!found) {
    throw new ApiError(404, 'Task not found.', null);
  }
  if (found.joined) {
    found.joined = false;
    found.contributors = Math.max(0, found.contributors - 1);
  }
  return {
    data: {
      joined: found.joined,
      participantCount: found.contributors,
    },
  };
}

export function taskHref(task: Pick<TaskCard, 'slug'>): string {
  return `/task-details?task=${task.slug}`;
}
