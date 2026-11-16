/**
 * Saved draft of the Create AI Project Request wizard (Redux, saved in localStorage under the same key as before).
 * The form being edited stays local state in the wizard; only "Save draft" writes here.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isRecord, readJson, writeJson } from '@/lib/storage';
import type { PersistedSlice } from '@/store/types';
import type { ProjectRequestForm } from '../types/project';

const STORAGE_KEY = 'zv-request-draft';

export interface RequestDraftState {
  draft: Partial<ProjectRequestForm> | null;
}

const initialState: RequestDraftState = { draft: null };

const requestDraftSlice = createSlice({
  name: 'requestDraft',
  initialState,
  reducers: {
    draftSaved(state, action: PayloadAction<ProjectRequestForm>) {
      state.draft = action.payload;
    },
    draftCleared(state) {
      state.draft = null;
    },
    draftHydrated(_state, action: PayloadAction<RequestDraftState>) {
      return action.payload;
    },
  },
});

export const { draftSaved, draftCleared, draftHydrated } = requestDraftSlice.actions;
export const requestDraftReducer = requestDraftSlice.reducer;

export interface RequestDraftRootState {
  requestDraft: RequestDraftState;
}

export const selectRequestDraft = (state: RequestDraftRootState): Partial<ProjectRequestForm> | null => state.requestDraft.draft;

export const requestDraftPersistence: PersistedSlice<RequestDraftState> = {
  load: () => {
    const stored = readJson('local', STORAGE_KEY);
    // Only draftSaved writes this key, always a full ProjectRequestForm
    return isRecord(stored) ? { draft: stored as Partial<ProjectRequestForm> } : undefined;
  },
  save: (state) => writeJson('local', STORAGE_KEY, state.draft ?? undefined),
  hydrate: draftHydrated,
};
