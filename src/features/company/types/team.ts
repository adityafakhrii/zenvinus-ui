import type { Tone } from '@/features/dashboard';

export const TEAM_ROLES = ['Owner', 'Admin', 'Reviewer', 'Annotator'] as const;
/** Workspace role of a member; also the English i18n key */
export type TeamRole = (typeof TEAM_ROLES)[number];

export interface Seats {
  used: number;
  total: number;
  available: number;
  plan: string;
  renew: string;
}

export interface TeamMember {
  name: string;
  email: string;
  role: TeamRole;
  roleTone: Tone;
  projects: number;
  status: string;
  statusTone: Tone;
  joined: string;
  initials: string;
  tone: Tone;
}

export interface PendingInvite {
  email: string;
  role: TeamRole;
  sent: string;
}

export interface RoleGuideEntry {
  role: TeamRole;
  roleTone: Tone;
  desc: string;
}
