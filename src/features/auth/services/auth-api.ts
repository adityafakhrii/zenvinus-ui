/**
 * Dummy auth calls for local UI/UX development (stored in sessionStorage, no remote backend calls).
 */
import type { Session, SocialProvider, SocialSignInResponse } from '../types/session';
import { clearDevSession, readDevSession, saveDevSession } from './dev-session';

/** Current session (null when signed out). */
export async function getSession(): Promise<Session | null> {
  return readDevSession();
}

/** Simulated OTP send for dummy mode. */
export async function sendVerificationOtp(_email: string): Promise<unknown> {
  return { sent: true };
}

/** Simulated OTP sign-in for dummy mode. */
export async function signInEmailOtp(email: string, _otp: string): Promise<unknown> {
  return saveDevSession(email);
}

/** Simulated social sign-in for dummy mode. */
export async function signInSocial(
  provider: SocialProvider,
  callbackURL = `${window.location.origin}/dashboard`,
): Promise<SocialSignInResponse | null> {
  saveDevSession(`${provider}@zenvinus.local`);
  window.location.href = callbackURL;
  return { url: callbackURL, redirect: true };
}

export async function signOut(): Promise<unknown> {
  clearDevSession();
  return null;
}
