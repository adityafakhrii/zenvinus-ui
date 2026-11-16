/**
 * Client-side flow state between the studio, quality check, completion and reward (Redux, saved in sessionStorage
 * under the same keys as before). Mirrors what a production backend would persist
 * (POST /submissions → GET /reviews → GET /rewards). Progress and drafts are kept per task slug.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isRecord, keysWithPrefix, readJson, writeJson } from '@/lib/storage';
import type { PersistedSlice } from '@/store/types';
import type { WorkspaceAnswer } from '../types/workspace';
import type { LastSubmission, TaskProgress } from '../types/submission';

const KEY_LAST = 'zenvinus:submission';
const PREFIX_PROGRESS = 'zenvinus:progress:';
const PREFIX_DRAFTS = 'zenvinus:drafts:';

/** An unsubmitted answer, restored by the studio when the contributor returns to the item */
export interface StoredDraft {
  answer: WorkspaceAnswer;
  savedAt: number;
}

export interface SubmissionsState {
  last: LastSubmission | null;
  /** Accepted items per task slug */
  progress: Record<string, TaskProgress>;
  /** Drafts per task slug, then per item id */
  drafts: Record<string, Record<string, StoredDraft>>;
}

const initialState: SubmissionsState = { last: null, progress: {}, drafts: {} };

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    submissionSaved: {
      reducer(state, action: PayloadAction<LastSubmission>) {
        state.last = action.payload;
      },
      prepare: (s: { slug: string; itemId: string; answer: WorkspaceAnswer; submittedAt?: number }) => ({
        payload: { slug: s.slug, itemId: s.itemId, answer: s.answer, submittedAt: s.submittedAt || Date.now() },
      }),
    },
    submissionCleared(state) {
      state.last = null;
    },
    itemAccepted(state, action: PayloadAction<{ slug: string; itemId: string }>) {
      const { slug, itemId } = action.payload;
      const progress = (state.progress[slug] ??= { accepted: [] });
      if (!progress.accepted.includes(itemId)) progress.accepted.push(itemId);
    },
    progressReset(state, action: PayloadAction<string>) {
      delete state.progress[action.payload];
    },
    draftSaved: {
      reducer(state, action: PayloadAction<{ slug: string; itemId: string; draft: StoredDraft }>) {
        const { slug, itemId, draft } = action.payload;
        (state.drafts[slug] ??= {})[itemId] = draft;
      },
      prepare: (slug: string, itemId: string, answer: WorkspaceAnswer) => ({
        payload: { slug, itemId, draft: { answer, savedAt: Date.now() } },
      }),
    },
    draftCleared(state, action: PayloadAction<{ slug: string; itemId: string }>) {
      const drafts = state.drafts[action.payload.slug];
      if (drafts) delete drafts[action.payload.itemId];
    },
    submissionsHydrated(_state, action: PayloadAction<SubmissionsState>) {
      return action.payload;
    },
  },
});

export const { submissionSaved, submissionCleared, itemAccepted, progressReset, draftSaved, draftCleared, submissionsHydrated } =
  submissionsSlice.actions;
export const submissionsReducer = submissionsSlice.reducer;

export interface SubmissionsRootState {
  submissions: SubmissionsState;
}

const NO_PROGRESS: TaskProgress = { accepted: [] };
const NO_DRAFTS: Readonly<Record<string, StoredDraft>> = {};

/** The last submission, or null when there is none or it belongs to another task */
export const selectLastSubmission = (state: SubmissionsRootState, slug?: string): LastSubmission | null => {
  const last = state.submissions.last;
  return last && (!slug || last.slug === slug) ? last : null;
};

/** Accepted items of a task (used by the Completed and Reward pages) */
export const selectProgress = (state: SubmissionsRootState, slug: string): TaskProgress => state.submissions.progress[slug] ?? NO_PROGRESS;

export const selectTaskDrafts = (state: SubmissionsRootState, slug: string): Readonly<Record<string, StoredDraft>> =>
  state.submissions.drafts[slug] ?? NO_DRAFTS;

export const selectDraft = (state: SubmissionsRootState, slug: string, itemId: string): WorkspaceAnswer | null =>
  selectTaskDrafts(state, slug)[itemId]?.answer ?? null;

/* ------------------------------ Persistence ------------------------------ */

// Stored values are written by this slice; the guards only reject missing or corrupted entries
const isLastSubmission = (v: unknown): v is LastSubmission =>
  isRecord(v) && typeof v.slug === 'string' && typeof v.itemId === 'string' && isRecord(v.answer);
const isProgress = (v: unknown): v is TaskProgress => isRecord(v) && Array.isArray(v.accepted);
const isDraftMap = (v: unknown): v is Record<string, StoredDraft> => isRecord(v);

function loadPerSlug<T>(prefix: string, guard: (v: unknown) => v is T): Record<string, T> {
  const out: Record<string, T> = {};
  for (const key of keysWithPrefix('session', prefix)) {
    const value = readJson('session', key);
    if (guard(value)) out[key.slice(prefix.length)] = value;
  }
  return out;
}

/** Write the per-slug entries that changed; a slug that disappeared is removed from storage */
function savePerSlug<T>(prefix: string, next: Record<string, T>, prev: Record<string, T>): void {
  for (const slug of new Set([...Object.keys(next), ...Object.keys(prev)])) {
    if (next[slug] !== prev[slug]) writeJson('session', prefix + slug, next[slug]);
  }
}

export const submissionsPersistence: PersistedSlice<SubmissionsState> = {
  load: () => {
    const last = readJson('session', KEY_LAST);
    return {
      last: isLastSubmission(last) ? last : null,
      progress: loadPerSlug(PREFIX_PROGRESS, isProgress),
      drafts: loadPerSlug(PREFIX_DRAFTS, isDraftMap),
    };
  },
  save: (state, prev) => {
    if (state.last !== prev.last) writeJson('session', KEY_LAST, state.last ?? undefined);
    savePerSlug(PREFIX_PROGRESS, state.progress, prev.progress);
    savePerSlug(PREFIX_DRAFTS, state.drafts, prev.drafts);
  },
  hydrate: submissionsHydrated,
};
