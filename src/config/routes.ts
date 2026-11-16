/** Route helpers used by more than one feature. */

/** The dataset studio lives at /studio in the public site layout and at /dashboard/studio in the dashboard; links stay in the one in use. */
export const studioBase = (pathname = ''): '/dashboard/studio' | '/studio' =>
  pathname.startsWith('/dashboard') ? '/dashboard/studio' : '/studio';
