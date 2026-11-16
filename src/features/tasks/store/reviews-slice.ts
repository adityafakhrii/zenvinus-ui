/**
 * Expert review queue (Redux, saved in localStorage under the same key as before). Starts with the demo queue
 * (SEED_REVIEWS) until the first review is saved.
 */
import { createSelector, createSlice, type Dispatch, type PayloadAction } from '@reduxjs/toolkit';
import { readJson, writeJson } from '@/lib/storage';
import type { PersistedSlice } from '@/store/types';
import { SEED_REVIEWS, applyReview, ledgerOf, metricsOf, reviewTimeLabel } from '../data/expert-workspace';
import type { ExpertLedger, ExpertMetrics, ReviewSubmission } from '../types/review';

const STORAGE_KEY = 'zv-expert-reviews';

export interface ReviewsState {
  rows: ReviewSubmission[];
}

const initialState: ReviewsState = { rows: SEED_REVIEWS };

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    reviewsReplaced(state, action: PayloadAction<ReviewSubmission[]>) {
      state.rows = action.payload;
    },
    reviewsHydrated(_state, action: PayloadAction<ReviewsState>) {
      return action.payload;
    },
  },
});

export const { reviewsReplaced, reviewsHydrated } = reviewsSlice.actions;
export const reviewsReducer = reviewsSlice.reducer;

export interface ReviewsRootState {
  reviews: ReviewsState;
}

/** Apply a review decision (approve, request revision, reject, escalate); returns the updated submission */
export const reviewSubmission =
  (id: string, actionKey: string, feedback = '') =>
  (dispatch: Dispatch, getState: () => ReviewsRootState): ReviewSubmission | null => {
    const { rows, updated } = applyReview(getState().reviews.rows, id, actionKey, feedback, reviewTimeLabel());
    dispatch(reviewsReplaced(rows));
    return updated;
  };

export const selectReviewQueue = (state: ReviewsRootState): ReviewSubmission[] => state.reviews.rows;

/** One submission for the studio's review mode (task-studio?review=SUB-xxxx) */
export const selectSubmissionForReview = (state: ReviewsRootState, id: string | null | undefined): ReviewSubmission | null =>
  (id && state.reviews.rows.find((r) => r.id === id)) || null;

/** Expert reward ledger, kept apart from the submission quality status */
export const selectExpertLedger = createSelector([selectReviewQueue], (rows): ExpertLedger => ledgerOf(rows));

export const selectExpertMetrics = createSelector([selectReviewQueue], (rows): ExpertMetrics => metricsOf(rows));

// The stored list is written by this slice; the guard only rejects a missing or corrupted value
const isReviewList = (v: unknown): v is ReviewSubmission[] =>
  Array.isArray(v) && v.every((r) => typeof r === 'object' && r !== null && typeof r.id === 'string' && typeof r.status === 'string');

export const reviewsPersistence: PersistedSlice<ReviewsState> = {
  load: () => {
    const stored = readJson('local', STORAGE_KEY);
    return isReviewList(stored) ? { rows: stored } : undefined;
  },
  save: (state) => writeJson('local', STORAGE_KEY, state.rows),
  hydrate: reviewsHydrated,
};
