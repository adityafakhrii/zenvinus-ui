/**
 * Zenvinus — Company profile settings data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getSettingsProfile() -> GET /api/company/settings/profile
 *   getNotificationPrefs() -> GET /api/company/settings/notifications
 *   getSecurity() -> GET /api/company/settings/security
 */
import type { NotificationPref, SecuritySettings, SettingsProfile } from "../types/settings";


export const getSettingsProfile = (): SettingsProfile => ({
  name: "Zenvinus Labs",
  industry: "Autonomous Driving",
  website: "https://zenvinuslabs.io",
  about:
    "Perception teams building HD-map and sensor datasets for autonomous driving programs across Southeast Asia.",
  billingEmail: "billing@zenvinuslabs.io",
  phone: "+62 21 5551 8820",
  address: "Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190",
  taxId: "01.884.521.9-092.000",
  manager: "Faris A.",
  memberSince: "Jan 2026",
});

export const getIndustries = (): string[] => [
  "Autonomous Driving",
  "E-commerce & Retail",
  "Healthcare & Medical",
  "Finance & Insurance",
  "Generative AI & LLM",
  "Agriculture",
  "Other",
];

export const getNotificationPrefs = (): NotificationPref[] => [
  {
    id: "delivery",
    label: "Batch delivery updates",
    desc: "Email when a dataset batch is delivered or approved.",
    enabled: true,
  },
  {
    id: "qa",
    label: "QA flags & re-work",
    desc: "Immediate alert when items are flagged for re-review.",
    enabled: true,
  },
  {
    id: "invoice",
    label: "Invoices & payments",
    desc: "Receipts, failed charges and monthly summaries.",
    enabled: true,
  },
  {
    id: "digest",
    label: "Weekly digest",
    desc: "Monday recap of project progress and spend.",
    enabled: false,
  },
  {
    id: "workforce",
    label: "Workforce applications",
    desc: "When new labelers apply to your private batches.",
    enabled: false,
  },
];

export const getSecurity = (): SecuritySettings => ({
  email: "faris@zenvinuslabs.io",
  twoFactor: true,
  lastLogin: "Oct 05, 2026 · 21:14 WIB · Jakarta, ID",
  sessions: 3,
});
