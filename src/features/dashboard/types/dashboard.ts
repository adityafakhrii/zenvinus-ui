/**
 * Dashboard view models (mock backend in ../data). Every dashboard (enterprise, community, internal,
 * expert) reuses these shapes, and other features pass KpiItem[] to KpiGrid.
 */

/** Colour family of a card, chip or icon; becomes a CSS class suffix (edash-tone-blue, edash-status-mint, …). */
export type Tone = 'blue' | 'mint' | 'purple' | 'orange' | 'amber' | 'red' | 'green';

/** Workspace roles of one account (RBAC memberships), selected with ?as= on /dashboard. */
export const DASHBOARD_ROLES = ['enterprise', 'community', 'internal', 'expert'] as const;
export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export const isDashboardRole = (value: unknown): value is DashboardRole =>
  typeof value === 'string' && (DASHBOARD_ROLES as ReadonlyArray<string>).includes(value);

/** One KPI tile. Labels and notes are English i18n keys; string values are translated too. */
export interface KpiItem {
  id: string;
  label: string;
  value: string | number;
  valueSuffix?: string;
  /** Change in percent vs. the previous period */
  delta?: number;
  icon: string;
  tone: Tone;
  /** Whether the change is good news (spend going down is); defaults to true */
  good?: boolean;
  /** Small text under the value; defaults to "vs. previous 30 days" */
  note?: string;
}

export interface WeeklyPoint {
  label: string;
  value: number;
}

/** Weekly bars for the volume and earnings charts */
export interface WeeklySeries {
  total: string;
  caption: string;
  weeks: WeeklyPoint[];
}

export interface CompanyProfile {
  name: string;
  email: string;
  industry: string;
  plan: string;
  seatsUsed: number;
  seatsTotal: number;
  renewal: string;
  manager: string;
}

export interface SpendRow {
  label: string;
  amount: number;
  /** Percent of the total */
  share: number;
}

export interface ActivityItem {
  icon: string;
  tone: Tone;
  title: string;
  meta: string;
  time: string;
}

export interface DeliveryQuality {
  score: number;
  reviews: number;
}

export interface ProjectStatusCounts {
  inProgress: number;
  review: number;
  completed: number;
}

/* ----------------------------- Contributor ----------------------------- */

export interface WorkerProfile {
  name: string;
  initials: string;
  level: string;
  joined: string;
  rating: number;
  reviews: number;
  qualification: string;
}

export interface WorkerTask {
  name: string;
  slug: string;
  typeLabel: string;
  icon: string;
  tone: Tone;
  progress: number;
  reward: number;
  status: string;
  statusTone: Tone;
}

export interface WorkerPayout {
  id: string;
  date: string;
  method: string;
  amount: number;
  status: string;
  statusTone: Tone;
}

export interface WorkerQualification {
  label: string;
  score: number;
  status: string;
  statusTone: Tone;
  tone: Tone;
  icon: string;
}

export interface NextPayout {
  amount: number;
  date: string;
  method: string;
  note: string;
}
