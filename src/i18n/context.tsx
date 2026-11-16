/**
 * Site languages: Indonesian (id) and English (en).
 *
 * Text in the code is written in English and is also the key: t('Save details') shows "Save details" in English and
 * the Indonesian from the dictionaries in src/i18n/id/*.ts. A missing translation falls back to the English text, so
 * nothing ever shows a raw key. Placeholders use {name}: t('Rows {from}–{to} of {total}', { from, to, total }).
 * A placeholder value may be a React element, then t() returns React nodes for JSX.
 *
 * The choice is a dropdown in the headers (LanguageSwitch, no /en URLs). The language is Redux state
 * (language-slice.ts): restored from localStorage, or the browser language when nothing was chosen.
 */
import React, { createContext, isValidElement, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import type { Dictionary } from './types';
import { DEFAULT_LANG, isLangCode, localeOf, type LangCode } from './languages';
import { languageChanged, selectLanguage, type LanguageRootState } from './language-slice';
import about from './id/about';
import catalog from './id/catalog';
import contact from './id/contact';
import core from './id/core';
import dashboard from './id/dashboard';
import home from './id/home';
import projects from './id/projects';
import site from './id/site';
import studio from './id/studio';
import support from './id/support';
import tasks from './id/tasks';

// WHY: Each area of the site keeps its own dictionary file; they are merged in alphabetical order with core last,
// because core holds the shared words and the same English word must read the same everywhere.
// A new file in src/i18n/id must be added here.
const ID: Dictionary = { ...about, ...catalog, ...contact, ...dashboard, ...home, ...projects, ...site, ...studio, ...support, ...tasks, ...core };
const DICTS: Record<LangCode, Dictionary> = { id: ID, en: {} };

// Module-level copy of the current language, for code outside React (formatters in src/utils)
let current: LangCode = DEFAULT_LANG;
export const currentLang = (): LangCode => current;
export const currentLocale = (): string => localeOf(current);

/** Placeholder values that are plain text: t() returns a string */
export type TextVars = Readonly<Record<string, string | number | null | undefined>>;
/** Placeholder values that may include React elements: t() returns React nodes */
export type NodeVars = Readonly<Record<string, ReactNode>>;

function fill(template: string, vars?: NodeVars): ReactNode {
  if (!vars) return template;
  const hasElements = Object.values(vars).some((v) => isValidElement(v));
  if (!hasElements) {
    return template.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
  }
  return template.split(/(\{\w+\})/g).filter(Boolean).map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    if (!m || !(m[1] in vars)) return part;
    const v = vars[m[1]];
    return isValidElement(v) ? React.cloneElement(v, { key: `${m[1]}-${i}` }) : v;
  });
}

function translateNode(text: string, vars: NodeVars | undefined, lang: LangCode): ReactNode {
  if (typeof text !== 'string' || !text) return text;
  return fill(DICTS[lang][text] ?? text, vars);
}

/** Translate outside React (utility code). Inside components use useT(), so the text updates when the language changes */
export function translate(text: string, vars?: TextVars, lang?: LangCode): string;
export function translate(text: string, vars: NodeVars, lang?: LangCode): ReactNode;
export function translate(text: string, vars?: NodeVars, lang: LangCode = current): ReactNode {
  return translateNode(text, vars, lang);
}

/** t() bound to the current language; text placeholders give a string, element placeholders give React nodes */
export interface TranslateFn {
  (text: string, vars?: TextVars): string;
  (text: string, vars: NodeVars): ReactNode;
}

export interface LanguageContextValue {
  lang: LangCode;
  locale: string;
  setLang: (next: LangCode) => void;
  t: TranslateFn;
}

const bindT = (lang: LangCode): TranslateFn => {
  function t(text: string, vars?: TextVars): string;
  function t(text: string, vars: NodeVars): ReactNode;
  function t(text: string, vars?: NodeVars): ReactNode {
    return translateNode(text, vars, lang);
  }
  return t;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  locale: localeOf(DEFAULT_LANG),
  setLang: () => {},
  t: bindT(DEFAULT_LANG),
});

/**
 * Provides t() and the language. The language itself lives in the Redux store (language-slice.ts), so it is
 * restored from storage with the rest of the app state.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // WHY: Typed with the slice's own state, not the app RootState, so i18n does not import the store (the store
  // imports feature slices, which import i18n)
  const lang = useSelector((state: LanguageRootState) => selectLanguage(state));
  const dispatch = useDispatch();
  current = lang;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (next: LangCode) => {
      if (!isLangCode(next)) return;
      current = next;
      dispatch(languageChanged(next));
      // WHY: Some API data is formatted (dates, labels) when it is loaded; reload it in the new language
      queryClient.invalidateQueries();
    },
    [dispatch, queryClient],
  );

  const value = useMemo<LanguageContextValue>(() => ({ lang, locale: localeOf(lang), setLang, t: bindT(lang) }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** const { t, lang, locale, setLang } = useT(); */
export const useT = (): LanguageContextValue => useContext(LanguageContext);

