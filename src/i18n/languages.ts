/** Site languages. No imports, so the context, the Redux slice and formatters can all use it. */
export const LANGUAGES = [
  { code: 'id', label: 'ID', name: 'Indonesia', locale: 'id-ID' },
  { code: 'en', label: 'EN', name: 'English', locale: 'en-US' },
] as const;

export type Language = (typeof LANGUAGES)[number];
export type LangCode = Language['code'];

export const DEFAULT_LANG: LangCode = 'id';

export const isLangCode = (value: unknown): value is LangCode => value === 'id' || value === 'en';

export const localeOf = (code: LangCode): string => (LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]).locale;
