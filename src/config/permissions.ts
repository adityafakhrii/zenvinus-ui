/**
 * Permission codes the UI checks (session.permissions from GET /api/auth/get-session). They only decide what the
 * UI shows; the API enforces the same codes on every request. Grouped by the area they unlock.
 */
export const STUDIO_PERMS = {
  explore: 'datasets.explore',
  manage: 'datasets.manage',
  contribute: 'datasets.contribute',
} as const;

export type StudioPermission = (typeof STUDIO_PERMS)[keyof typeof STUDIO_PERMS];

export const SUPPORT_PERMS = {
  /** See every ticket and reply as the Zenvinus team */
  manage: 'support.manage',
} as const;
