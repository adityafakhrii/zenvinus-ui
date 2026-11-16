/**
 * Chosen site language (Redux). The stored choice wins; without one the browser language decides. The choice is
 * written to localStorage only when the visitor picks a language, never for the browser default.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { readString, writeString } from '@/lib/storage';
import type { PersistedSlice } from '@/store/types';
import { DEFAULT_LANG, isLangCode, type LangCode } from './languages';

const STORAGE_KEY = 'zenvinus_lang';

export interface LanguageState {
  lang: LangCode;
  /** True once the visitor picked a language (only then is it saved) */
  chosen: boolean;
}

const initialState: LanguageState = { lang: DEFAULT_LANG, chosen: false };

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    /** The visitor picked a language in the switch */
    languageChanged(state, action: PayloadAction<LangCode>) {
      state.lang = action.payload;
      state.chosen = true;
    },
    languageHydrated(_state, action: PayloadAction<LanguageState>) {
      return action.payload;
    },
  },
});

export const { languageChanged, languageHydrated } = languageSlice.actions;
export const languageReducer = languageSlice.reducer;

/** State shape this slice needs; the app's RootState includes it */
export interface LanguageRootState {
  language: LanguageState;
}

export const selectLanguage = (state: LanguageRootState): LangCode => state.language.lang;

export const languagePersistence: PersistedSlice<LanguageState> = {
  load: () => {
    const saved = readString('local', STORAGE_KEY);
    if (isLangCode(saved)) return { lang: saved, chosen: true };
    const browser: LangCode = (navigator.language || '').toLowerCase().startsWith('id') ? 'id' : 'en';
    return { lang: browser, chosen: false };
  },
  save: (state) => {
    if (state.chosen) writeString('local', STORAGE_KEY, state.lang);
  },
  hydrate: languageHydrated,
};
