import type { IsoDateString } from '@/types/api';

/** Signed-in user, as sent by GET /api/auth/get-session (zenvinus-backend/internal/webauth). */
export interface SessionUser {
  id: number;
  name: string;
  email: string;
  image?: string;
}

/** Permission codes such as "datasets.explore"; they only decide what the UI shows, the API checks every request. */
export type Permission = string;

/** Body of GET /api/auth/get-session when signed in; the endpoint answers null when signed out. */
export interface Session {
  user: SessionUser;
  session: { expiresAt: IsoDateString };
  permissions: Permission[];
}

export type SocialProvider = 'google' | 'github';

/** POST /api/auth/sign-in/social: where to send the browser next. */
export interface SocialSignInResponse {
  url?: string;
  redirect?: boolean;
}
