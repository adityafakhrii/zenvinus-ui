import { STUDIO_PERMS, SUPPORT_PERMS } from '@/config/permissions';
import { readJson, writeJson } from '@/lib/storage';
import type { Session } from '../types/session';

const DEV_SESSION_KEY = 'zv_dev_auth_session';

/** Local dummy auth mode for UI/UX development (no remote backend required). */
export const IS_DEV_AUTH_BYPASS = true;

const isSession = (value: unknown): value is Session => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<Session>;
  return Boolean(v.user && typeof v.user.id === 'number' && typeof v.user.email === 'string' && Array.isArray(v.permissions));
};

export function createDevSession(email?: string): Session {
  const cleanEmail = email?.trim() || 'dev@zenvinus.local';
  const namePart = cleanEmail.split('@')[0]?.trim() || 'Dev Preview';
  return {
    user: {
      id: 1,
      name: namePart,
      email: cleanEmail,
    },
    session: {
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    },
    permissions: [
      STUDIO_PERMS.explore,
      STUDIO_PERMS.manage,
      STUDIO_PERMS.contribute,
      SUPPORT_PERMS.manage,
    ],
  };
}

export function readDevSession(): Session | null {
  const raw = readJson('session', DEV_SESSION_KEY);
  return isSession(raw) ? raw : null;
}

export function saveDevSession(email?: string): Session {
  const session = createDevSession(email);
  writeJson('session', DEV_SESSION_KEY, session);
  return session;
}

export function clearDevSession(): void {
  writeJson('session', DEV_SESSION_KEY, undefined);
}
