/**
 * Saving and restoring slices across reloads.
 *
 * - Restore: `hydrateFromStorage()` runs once in the browser, before any component effect (StoreProvider), so the
 *   server render and the first browser render both use the initial state and hydrate cleanly.
 * - Save: a listener writes a slice to storage after each action that changed it, but only once the store has been
 *   restored (otherwise the initial state would overwrite what the visitor saved).
 * Each slice decides its own keys and format through its PersistedSlice (src/store/types.ts).
 */
import { createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import type { PersistedSlice } from './types';

const persistenceSlice = createSlice({
  name: 'persistence',
  initialState: { hydrated: false },
  reducers: {
    storageRestored(state) {
      state.hydrated = true;
    },
  },
});

export const persistenceReducer = persistenceSlice.reducer;
export const { storageRestored } = persistenceSlice.actions;

export interface PersistenceRootState {
  persistence: { hydrated: boolean };
}

/** True once saved state has been loaded into the store (always false on the server) */
export const selectStorageHydrated = (state: PersistenceRootState): boolean => state.persistence.hydrated;

/** Slice name -> its persistence, typed against the slice's state in the root state */
export type PersistedSlices<S> = { [K in keyof S]?: PersistedSlice<S[K]> };

/** Listener middleware that saves every persisted slice that changed */
export function createPersistenceMiddleware<S extends PersistenceRootState>(slices: PersistedSlices<S>) {
  const listener = createListenerMiddleware();
  const startListening = listener.startListening.withTypes<S>();
  const keys = Object.keys(slices) as Array<keyof S>; // Object.keys loses the key type; these are the keys of `slices`
  startListening({
    predicate: (_action, current, previous) => previous.persistence.hydrated && keys.some((k) => current[k] !== previous[k]),
    effect: (_action, api) => {
      const current = api.getState();
      const previous = api.getOriginalState();
      for (const k of keys) {
        if (current[k] !== previous[k]) slices[k]?.save(current[k], previous[k]);
      }
    },
  });
  return listener.middleware;
}

/** Load every persisted slice and mark the store as restored */
export function hydrateSlices<S>(dispatch: (action: { type: string }) => unknown, slices: PersistedSlices<S>): void {
  for (const key of Object.keys(slices) as Array<keyof S>) {
    const slice = slices[key];
    if (!slice) continue;
    const loaded = slice.load();
    if (loaded !== undefined) dispatch(slice.hydrate(loaded));
  }
  dispatch(storageRestored());
}
