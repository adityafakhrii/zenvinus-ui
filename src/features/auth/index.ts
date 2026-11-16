/** Public API of the auth feature; other features import from '@/features/auth'. */
export { AuthProvider, useAuth, SESSION_QUERY_KEY } from './auth-provider';
export { default as AccountMenu } from './components/account-menu';
export type { AccountMenuLink, AccountMenuProps } from './components/account-menu';
export type { AuthContextValue } from './auth-provider';
export { getSession, sendVerificationOtp, signInEmailOtp, signInSocial, signOut } from './services/auth-api';
export type { Permission, Session, SessionUser, SocialProvider } from './types/session';
