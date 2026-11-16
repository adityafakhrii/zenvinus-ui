/**
 * Project requests posted through the wizard (Redux, saved in localStorage under the same key as before).
 * Reducers stay pure: the thunks compute the new id and the timestamp, then dispatch the finished project.
 */
import { createSelector, createSlice, type Dispatch, type PayloadAction } from '@reduxjs/toolkit';
import { readJson, writeJson } from '@/lib/storage';
import type { PersistedSlice } from '@/store/types';
import {
  buildPostedProject,
  normalizePosted,
  nowLabel,
  withProposal,
  withStatus,
  type PostedProjectInput,
  type ProposalInput,
} from '../data/project-store';
import type { PostedProject } from '../types/project';

const STORAGE_KEY = 'zv-posted-projects';

export interface ProjectsState {
  /** Newest first, as stored */
  posted: PostedProject[];
}

const initialState: ProjectsState = { posted: [] };

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    projectAdded(state, action: PayloadAction<PostedProject>) {
      state.posted.unshift(action.payload);
    },
    projectUpdated(state, action: PayloadAction<PostedProject>) {
      const i = state.posted.findIndex((p) => p.id === action.payload.id);
      if (i >= 0) state.posted[i] = action.payload;
    },
    projectsHydrated(_state, action: PayloadAction<ProjectsState>) {
      return action.payload;
    },
  },
});

export const { projectAdded, projectUpdated, projectsHydrated } = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;

/** State shape this slice needs; the app's RootState includes it */
export interface ProjectsRootState {
  projects: ProjectsState;
}

type ProjectsThunk<R> = (dispatch: Dispatch, getState: () => ProjectsRootState) => R;

/* ------------------------------- Selectors ------------------------------- */

/** Posted requests, normalized for display (memoized: same array until the requests change) */
export const selectPostedProjects = createSelector(
  [(state: ProjectsRootState) => state.projects.posted],
  (posted): PostedProject[] => posted.map(normalizePosted),
);

export const selectPostedProject = (state: ProjectsRootState, id: string | null | undefined): PostedProject | null =>
  (id && selectPostedProjects(state).find((p) => p.id === id)) || null;

/* -------------------------------- Thunks --------------------------------- */

/** Submit the wizard form as a new request; returns the created project */
export const postProjectRequest =
  (form: PostedProjectInput): ProjectsThunk<PostedProject> =>
  (dispatch, getState) => {
    const project = buildPostedProject(form, getState().projects.posted);
    dispatch(projectAdded(project));
    return project;
  };

const updateProject =
  (id: string, change: (p: PostedProject) => PostedProject): ProjectsThunk<PostedProject | undefined> =>
  (dispatch, getState) => {
    const current = getState().projects.posted.find((p) => p.id === id);
    if (!current) return undefined;
    const updated = change(current);
    dispatch(projectUpdated(updated));
    return updated;
  };

/** Move a request to another status and record it in the history; returns the updated request */
export const changeRequestStatus = (id: string, toKey: string, note?: string) =>
  updateProject(id, (p) => withStatus(p, toKey, note, nowLabel()));

/** The expert attaches the final proposal; returns the updated request */
export const attachRequestProposal = (id: string, proposal: ProposalInput) =>
  updateProject(id, (p) => withProposal(p, proposal, nowLabel()));

/* ------------------------------ Persistence ------------------------------ */

export const projectsPersistence: PersistedSlice<ProjectsState> = {
  load: () => {
    const stored = readJson('local', STORAGE_KEY);
    // Only this slice writes the key, always as a list of PostedProject
    return Array.isArray(stored) ? { posted: stored as PostedProject[] } : undefined;
  },
  save: (state) => writeJson('local', STORAGE_KEY, state.posted),
  hydrate: projectsHydrated,
};
