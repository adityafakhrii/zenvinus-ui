/**
 * Public entry of the i18n module: import from '@/i18n'.
 * context.tsx holds the language state and t(); language-switch.tsx is the header dropdown.
 */
export * from './context';
export { LANGUAGES, DEFAULT_LANG, isLangCode, localeOf } from './languages';
export type { Language, LangCode } from './languages';
export { LanguageSwitch } from './language-switch';
export type { LanguageSwitchProps } from './language-switch';
export type { Dictionary } from './types';
