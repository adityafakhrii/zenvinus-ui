/**
 * Zenvinus — Contributor (worker) dashboard data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getWorkerProfile()       -> GET /api/me
 *   getWorkerStats()         -> GET /api/me/stats
 *   getWorkerTasks()         -> GET /api/me/active-tasks
 *   getWorkerEarnings()      -> GET /api/me/earnings
 *   getWorkerPayouts()       -> GET /api/me/payouts
 *   getWorkerQualifications()-> GET /api/me/qualifications
 *
 * The contributor dashboard mirrors the company dashboard: where companies
 * see projects and spend, contributors see earnings, accuracy and the tasks
 * they are qualified to work on.
 */
import type { KpiItem, NextPayout, WeeklySeries, WorkerPayout, WorkerProfile, WorkerQualification, WorkerTask } from "../types/dashboard";

export const getWorkerProfile = (): WorkerProfile => ({
  name: "Rizky Pratama",
  initials: "RP",
  level: "Expert Annotator",
  joined: "Feb 2025",
  rating: 4.9,
  reviews: 312,
  qualification: "Verified",
});

export const getWorkerStats = (): KpiItem[] => [
  {
    id: "earnings",
    label: "Earnings This Month",
    value: "$1,860",
    delta: 8.2,
    icon: "fa-solid fa-wallet",
    tone: "mint",
    note: "vs. last month",
  },
  {
    id: "tasks",
    label: "Tasks Completed",
    value: 132,
    delta: 6,
    icon: "fa-solid fa-circle-check",
    tone: "blue",
    note: "this month",
  },
  {
    id: "accuracy",
    label: "Accuracy Score",
    value: 98.4,
    valueSuffix: "%",
    delta: 0.6,
    icon: "fa-solid fa-bullseye",
    tone: "purple",
    note: "trailing 30 days",
  },
  {
    id: "streak",
    label: "Active Streak",
    value: "18 days",
    delta: 2,
    icon: "fa-solid fa-fire",
    tone: "orange",
    note: "personal best: 24 days",
  },
];

export const getWorkerTasks = (): WorkerTask[] => [
  { name: "Street Scene Bounding Boxes", slug: "road-damage-annotation", typeLabel: "Object Annotation", icon: "fa-solid fa-object-group", tone: "blue", progress: 64, reward: 420, status: "In Progress", statusTone: "blue" },
  { name: "Chatbot Response Ranking", slug: "llm-response-evaluation", typeLabel: "LLM Evaluation", icon: "fa-solid fa-robot", tone: "orange", progress: 100, reward: 310, status: "In Review", statusTone: "amber" },
  { name: "Call Center Speech-to-Text", slug: "conversation-transcription", typeLabel: "Audio Transcription", icon: "fa-solid fa-headphones", tone: "purple", progress: 38, reward: 265, status: "In Progress", statusTone: "blue" },
  { name: "Customer Records Cleanup", slug: "customer-records-validation", typeLabel: "Tabular Validation", icon: "fa-solid fa-table", tone: "mint", progress: 100, reward: 190, status: "Approved", statusTone: "mint" },
];

export const getWorkerEarnings = (): WeeklySeries => ({
  total: "$6,940",
  caption: "Last 8 weeks",
  weeks: [
    { label: "W32", value: 640 },
    { label: "W33", value: 780 },
    { label: "W34", value: 710 },
    { label: "W35", value: 860 },
    { label: "W36", value: 920 },
    { label: "W37", value: 880 },
    { label: "W38", value: 1040 },
    { label: "W39", value: 1110 },
  ],
});

export const getWorkerPayouts = (): WorkerPayout[] => [
  { id: "PO-1042", date: "Sep 30, 2026", method: "Bank •• 8871", amount: 930, status: "Paid", statusTone: "mint" },
  { id: "PO-1038", date: "Aug 31, 2026", method: "Bank •• 8871", amount: 875, status: "Paid", statusTone: "mint" },
  { id: "PO-1031", date: "Jul 31, 2026", method: "Bank •• 8871", amount: 810, status: "Paid", statusTone: "mint" },
];

export const getWorkerQualifications = (): WorkerQualification[] => [
  { label: "Object Annotation", score: 96, status: "Passed", statusTone: "mint", tone: "blue", icon: "fa-solid fa-object-group" },
  { label: "LLM Evaluation", score: 92, status: "Passed", statusTone: "mint", tone: "orange", icon: "fa-solid fa-robot" },
  { label: "Audio Transcription", score: 74, status: "In Progress", statusTone: "amber", tone: "purple", icon: "fa-solid fa-headphones" },
];

export const getNextPayout = (): NextPayout => ({
  amount: 1860,
  date: "Oct 31, 2026",
  method: "Bank •• 8871",
  note: "Auto-withdraw on the last day of each month.",
});
