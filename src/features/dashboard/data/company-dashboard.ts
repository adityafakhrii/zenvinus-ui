/**
 * Zenvinus — Company (enterprise) dashboard data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getCompanyProfile()     -> GET /api/company/me
 *   getCompanyKpis()        -> GET /api/company/dashboard/kpis
 *   getAnnotationVolume()   -> GET /api/company/dashboard/volume
 *   getCompanyProjects()    -> GET /api/company/projects
 *   getCompanyActivity()    -> GET /api/company/dashboard/activity
 *
 * The company dashboard is the mirror of the contributor flow: where
 * contributors see tasks they can join, enterprise accounts see the projects
 * they posted, the spend they incurred, and the workforce delivering them.
 */
import type {
  ActivityItem,
  CompanyProfile,
  DeliveryQuality,
  KpiItem,
  ProjectStatusCounts,
  SpendRow,
  WeeklySeries,
} from "../types/dashboard";

/* ------------------------------------------------------------------ */
/* Company profile — plan & seats shown in the account card            */
/* ------------------------------------------------------------------ */

export const getCompanyProfile = (): CompanyProfile => ({
  name: "Zenvinus Labs",
  email: "faris@zenvinuslabs.io",
  industry: "Autonomous Driving",
  plan: "Enterprise",
  seatsUsed: 18,
  seatsTotal: 25,
  renewal: "Mar 31, 2027",
  manager: "Faris A.",
});

/* ------------------------------------------------------------------ */
/* KPI tiles — deltas are vs. the previous 30 days                     */
/* ------------------------------------------------------------------ */

export const getCompanyKpis = (): KpiItem[] => [
  {
    id: "projects",
    label: "Active Projects",
    value: 6,
    delta: 2,
    icon: "fa-solid fa-diagram-project",
    tone: "blue",
  },
  {
    id: "annotations",
    label: "Annotations Delivered",
    value: "184.2K",
    delta: 12.4,
    icon: "fa-solid fa-layer-group",
    tone: "mint",
  },
  {
    id: "qa_pass",
    label: "QA Pass Rate",
    value: 97.8,
    valueSuffix: "%",
    delta: 1.2,
    icon: "fa-solid fa-clipboard-check",
    tone: "purple",
  },
  {
    id: "spend",
    label: "Spend This Month",
    value: "$12,480",
    delta: -4.1,
    icon: "fa-solid fa-wallet",
    tone: "orange",
    // spend going DOWN is good — deltas need a direction of "good" per metric
    good: true,
  },
];

/* ------------------------------------------------------------------ */
/* Annotation volume — weekly bars for the chart (units = annotations) */
/* ------------------------------------------------------------------ */

export const getAnnotationVolume = (): WeeklySeries => ({
  total: "184,210",
  caption: "Last 12 weeks",
  weeks: [
    { label: "W28", value: 9200 },
    { label: "W29", value: 10400 },
    { label: "W30", value: 9800 },
    { label: "W31", value: 12100 },
    { label: "W32", value: 13800 },
    { label: "W33", value: 12600 },
    { label: "W34", value: 14900 },
    { label: "W35", value: 16200 },
    { label: "W36", value: 15100 },
    { label: "W37", value: 17800 },
    { label: "W38", value: 19600 },
    { label: "W39", value: 21700 },
  ],
});

/* ------------------------------------------------------------------ */
/* Spend breakdown — per task type, for the side card                  */
/* ------------------------------------------------------------------ */

export const getSpendBreakdown = (): SpendRow[] => [
  { label: "Object Annotation", amount: 5480, share: 44 },
  { label: "LLM Evaluation", amount: 3120, share: 25 },
  { label: "Audio Transcription", amount: 2260, share: 18 },
  { label: "Tabular Validation", amount: 1620, share: 13 },
];

/* ------------------------------------------------------------------ */
/* Projects — the rows in the recent projects table                     */
/* ------------------------------------------------------------------ */

export { getCompanyProjects } from "@/features/projects";

/* ------------------------------------------------------------------ */
/* Activity feed — latest workforce & delivery events                  */
/* ------------------------------------------------------------------ */

export const getCompanyActivity = (): ActivityItem[] => [
  {
    icon: "fa-solid fa-circle-check",
    tone: "mint",
    title: "Chatbot Response Ranking marked complete",
    meta: "12,500 items · QA score 98.4%",
    time: "2h ago",
  },
  {
    icon: "fa-solid fa-upload",
    tone: "blue",
    title: "Dataset batch #217 delivered",
    meta: "4,800 annotated images · download ready",
    time: "6h ago",
  },
  {
    icon: "fa-solid fa-user-plus",
    tone: "purple",
    title: "5 new labelers joined Street Scene project",
    meta: "Assigned by Faris A.",
    time: "1d ago",
  },
  {
    icon: "fa-solid fa-file-invoice-dollar",
    tone: "orange",
    title: "Invoice INV-2026-09 paid",
    meta: "$11,204 · Visa •• 4242",
    time: "2d ago",
  },
  {
    icon: "fa-solid fa-triangle-exclamation",
    tone: "amber",
    title: "QA flagged 214 items for re-review",
    meta: "Receipt OCR Field Check · ambiguous fields",
    time: "3d ago",
  },
];

/* ------------------------------------------------------------------ */
/* Aggregates used by the side column                                  */
/* ------------------------------------------------------------------ */

export const getDeliveryQuality = (): DeliveryQuality => ({ score: 97.8, reviews: 12480 });

export const getProjectStatusCounts = (): ProjectStatusCounts => ({
  inProgress: 3,
  review: 1,
  completed: 2,
});
