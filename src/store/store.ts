/**
 * The Redux store: app state shared across pages (language, project requests, task submissions, expert reviews).
 * Data from the API is not kept here; it stays in TanStack Query (see docs/frontend.md, "State management").
 *
 * Slices live in their feature (features/<feature>/store/*-slice.ts) and are combined here; this file is app
 * composition, like src/providers, so it is allowed to import features.
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { languagePersistence, languageReducer } from '@/i18n/language-slice';
import { layoutPersistence, layoutReducer } from '@/features/dashboard';
import {
  projectsPersistence,
  projectsReducer,
  requestDraftPersistence,
  requestDraftReducer,
} from '@/features/projects';
import { reviewsPersistence, reviewsReducer, submissionsPersistence, submissionsReducer } from '@/features/tasks';
import { createPersistenceMiddleware, hydrateSlices, persistenceReducer, type PersistedSlices } from './persistence';

const rootReducer = combineReducers({
  persistence: persistenceReducer,
  language: languageReducer,
  layout: layoutReducer,
  projects: projectsReducer,
  requestDraft: requestDraftReducer,
  submissions: submissionsReducer,
  reviews: reviewsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Slices saved across reloads, with their storage format */
const persisted: PersistedSlices<RootState> = {
  language: languagePersistence,
  layout: layoutPersistence,
  projects: projectsPersistence,
  requestDraft: requestDraftPersistence,
  submissions: submissionsPersistence,
  reviews: reviewsPersistence,
};

/** A new store. Called once per request on the server and once in the browser (StoreProvider). */
export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().prepend(createPersistenceMiddleware<RootState>(persisted)),
  });
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

/** Restore saved slices; browser only */
export const hydrateFromStorage = (store: AppStore): void => hydrateSlices(store.dispatch, persisted);
