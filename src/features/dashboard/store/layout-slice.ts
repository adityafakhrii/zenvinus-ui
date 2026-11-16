import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { readJson, writeJson } from '@/lib/storage';
import type { PersistedSlice } from '@/store/types';

export const NAV_MODES = ['topbar', 'sidebar'] as const;
export type NavMode = (typeof NAV_MODES)[number];

export const isNavMode = (value: unknown): value is NavMode =>
  typeof value === 'string' && (NAV_MODES as ReadonlyArray<string>).includes(value);

export interface LayoutState {
  navMode: NavMode;
  sidebarCollapsed: boolean;
}

const STORAGE_KEY = 'zv-layout-prefs';

const initialState: LayoutState = {
  navMode: 'topbar',
  sidebarCollapsed: false,
};

const isLayoutState = (value: unknown): value is LayoutState => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<LayoutState>;
  return isNavMode(v.navMode) && typeof v.sidebarCollapsed === 'boolean';
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    navModeChanged(state, action: PayloadAction<NavMode>) {
      state.navMode = action.payload;
    },
    sidebarCollapsedChanged(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    sidebarCollapsedToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    layoutHydrated(_state, action: PayloadAction<LayoutState>) {
      return action.payload;
    },
  },
});

export const layoutReducer = layoutSlice.reducer;
export const {
  navModeChanged,
  sidebarCollapsedChanged,
  sidebarCollapsedToggled,
  layoutHydrated,
} = layoutSlice.actions;

export interface LayoutRootState {
  layout: LayoutState;
}

export const selectNavMode = (state: LayoutRootState): NavMode => state.layout.navMode;
export const selectSidebarCollapsed = (state: LayoutRootState): boolean => state.layout.sidebarCollapsed;

export const layoutPersistence: PersistedSlice<LayoutState> = {
  load: () => {
    const raw = readJson('local', STORAGE_KEY);
    return isLayoutState(raw) ? raw : undefined;
  },
  save: (state) => writeJson('local', STORAGE_KEY, state),
  hydrate: layoutHydrated,
};
