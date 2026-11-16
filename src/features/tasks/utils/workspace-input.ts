import type { TaskTypeId } from '../data/tasks';
import type { TaskItem, WorkspaceAnswer, WorkspaceAnswerMap, WorkspaceItemMap } from '../types/workspace';

/**
 * Narrows an item and answer to the shapes of one workspace type. This is the one place where that link is
 * asserted: a task's items are always made for its own type (the backend picks the type), demo items come
 * from WORKSPACE_EXAMPLES[type], and answers are written by the same workspace that reads them.
 */
export function workspaceInput<K extends TaskTypeId>(
  _type: K,
  item: TaskItem,
  answer: WorkspaceAnswer,
): { item: WorkspaceItemMap[K]; answer: WorkspaceAnswerMap[K] } {
  // Safe per the comment above: item and answer belong to `_type`
  return { item: item as WorkspaceItemMap[K], answer: answer as WorkspaceAnswerMap[K] };
}
