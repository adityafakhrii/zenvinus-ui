/** Client-side flow state between studio, quality check, completion and reward (data/submission-store.ts). */
import type { WorkspaceAnswer } from './workspace';

export interface LastSubmission {
  slug: string;
  itemId: string;
  answer: WorkspaceAnswer;
  submittedAt: number;
}

/** Accepted item ids per task */
export interface TaskProgress {
  accepted: string[];
}

/** Item state in the studio navigator */
export interface StudioItemState {
  id: string;
  state: 'current' | 'draft' | 'todo';
}
