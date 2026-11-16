/**
 * Contract between a slice and the store's persistence (src/store/persistence.ts). A slice that survives a reload
 * exports one of these next to its reducer. Kept in its own file with no imports, so slices can depend on it
 * without importing the store.
 */
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PersistedSlice<S> {
  /** Read the saved state; undefined when nothing usable is stored (the slice keeps its initial state) */
  load: () => S | undefined;
  /** Write the state after a change; `previous` lets a slice write only the keys that changed */
  save: (state: S, previous: S) => void;
  /** Action that replaces the slice state with the loaded one */
  hydrate: (state: S) => PayloadAction<S>;
}
