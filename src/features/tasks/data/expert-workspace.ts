/**
 * Zenvinus — Expert Reviewer workspace: seed data and pure helpers (mock backend). The review queue itself is
 * Redux state (../store/reviews-slice.ts, saved in localStorage).
 *
 * In production this maps 1:1 to a backend endpoint:
 *   getReviewQueue()      -> GET /api/expert/reviews?status=assigned
 *   getSubmissionHistory()-> GET /api/expert/reviews/history
 *   reviewSubmission()    -> POST /api/expert/reviews/:id  (approve | revise | reject | escalate)
 *   getExpertLedger()     -> GET /api/expert/earnings
 *
 * Status taxonomy (separate lifecycles, see the RBAC spec):
 *   Submission: IN PROGRESS → SUBMITTED → PENDING REVIEW → IN REVIEW →
 *               APPROVED | REVISION REQUIRED | REJECTED | ESCALATED
 *   Reward ledger: APPROVED → PENDING → AVAILABLE (payout policy)
 */

import { currentLocale } from '@/i18n';
import type { Tone } from './tasks';
import type { ExpertLedger, ExpertMetrics, ReviewDecision, ReviewSubmission, SubmissionStatus } from '../types/review';

/** Demo queue shown until the first review is saved */
export const SEED_REVIEWS: ReviewSubmission[] = [
  { id: "SUB-2201", slug: "road-damage-annotation", task: "Street Scene Bounding Boxes", taskType: "Object Annotation", contributor: "Adinda P.", submitted: "Oct 07, 08:12", status: "IN REVIEW", items: 40, note: "Batch 09 — night scenes", tone: "blue" },
  { id: "SUB-2199", slug: "llm-response-evaluation", task: "Chatbot Response Ranking", taskType: "LLM Evaluation", contributor: "Bagas W.", submitted: "Oct 07, 07:40", status: "PENDING REVIEW", items: 24, note: "Pairwise ranking", tone: "amber" },
  { id: "SUB-2196", slug: "conversation-transcription", task: "Call Center Speech-to-Text", taskType: "Audio Transcription", contributor: "Citra H.", submitted: "Oct 06, 19:05", status: "IN REVIEW", items: 12, note: "Billing disputes clips", tone: "blue" },
  { id: "SUB-2190", slug: "customer-records-validation", task: "Customer Records Cleanup", taskType: "Tabular Validation", contributor: "Dimas R.", submitted: "Oct 05, 14:22", status: "REVISION REQUIRED", items: 60, note: "Phone format inconsistencies", tone: "orange" },
  { id: "SUB-2188", slug: "road-damage-annotation", task: "Street Scene Bounding Boxes", taskType: "Object Annotation", contributor: "Eka S.", submitted: "Oct 05, 10:02", status: "ESCALATED", items: 30, note: "Annotator disagreement — needs senior decision", tone: "purple" },
  { id: "SUB-2185", slug: "customer-records-validation", task: "Customer Records Cleanup", taskType: "Tabular Validation", contributor: "Expert 001", own: true, submitted: "Oct 04, 16:40", status: "PENDING REVIEW", items: 18, note: "Own submission — locked from self-review", tone: "amber" },
];

export interface ReviewAction {
  key: string;
  /** English i18n key */
  label: string;
  to: SubmissionStatus;
  tone: Tone;
  icon: string;
}

export const REVIEW_ACTIONS = [
  { key: "approved", label: "Approve", to: "APPROVED", tone: "mint", icon: "fa-solid fa-check" },
  { key: "revision", label: "Request Revision", to: "REVISION REQUIRED", tone: "orange", icon: "fa-solid fa-rotate" },
  { key: "rejected", label: "Reject", to: "REJECTED", tone: "red", icon: "fa-solid fa-xmark" },
  { key: "escalate", label: "Escalate", to: "ESCALATED", tone: "purple", icon: "fa-solid fa-level-up" },
] as const satisfies readonly ReviewAction[];

export type ReviewActionKey = (typeof REVIEW_ACTIONS)[number]['key'];

/** The signed-in reviewer (mock; in production this comes from the auth session). */
export const CURRENT_REVIEWER = { id: "EXP-001", name: "Expert 001" };
const RUBRIC_VERSION = "rubric-v1.2";

/** Review action: changes the submission status, records the decision (reviewer, feedback, rubric, time) in the
 * history, and writes to the ledger on approval. Returns the new list and the updated row (null when nothing
 * changed). Pure: the time label is passed in. */
export const applyReview = (
  rows: readonly ReviewSubmission[],
  id: string,
  actionKey: string,
  feedback: string,
  at: string,
): { rows: ReviewSubmission[]; updated: ReviewSubmission | null } => {
  const action = REVIEW_ACTIONS.find((a) => a.key === actionKey);
  if (!action) return { rows: [...rows], updated: null };
  let updated: ReviewSubmission | null = null;
  const next = rows.map((r) => {
    if (r.id !== id) return r;
    // Acceptance criterion §8: a reviewer cannot review their own submission.
    if (r.own) return r;
    const decision: ReviewDecision = {
      reviewerId: CURRENT_REVIEWER.id,
      reviewerName: CURRENT_REVIEWER.name,
      action: action.label,
      from: r.status,
      to: action.to,
      feedback: feedback.trim() || action.label,
      rubric: RUBRIC_VERSION,
      at,
    };
    const reviewed: ReviewSubmission = {
      ...r,
      status: action.to,
      tone: action.tone,
      reviewedAt: at,
      decision,
      // §5.2: decision history is kept — a revision or escalation does not erase earlier decisions.
      history: [...(r.history || []), decision],
    };
    if (action.to === "APPROVED") {
      reviewed.ledger = { status: "PENDING", amount: r.items * 150, note: "Enters the next payout cycle" };
    }
    updated = reviewed;
    return reviewed;
  });
  return { rows: next, updated };
};

/** Time label of a review decision, in the current language */
export const reviewTimeLabel = (): string =>
  new Date().toLocaleString(currentLocale(), { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Expert reward ledger, kept apart from the submission quality status. */
export const ledgerOf = (rows: readonly ReviewSubmission[]): ExpertLedger => {
  const approved = rows.filter((r) => r.status === "APPROVED");
  const pending = approved.reduce((s, r) => s + (r.ledger?.amount || 0), 0);
  return {
    thisMonth: 1240,
    pending,
    pendingCount: approved.filter((r) => r.ledger?.status === "PENDING").length,
    available: 620,
    perItem: 150,
    note: "APPROVED → ledger PENDING → AVAILABLE per payout cycle (1st of the month).",
  };
};

/** Expert quality metrics. */
export const metricsOf = (rows: readonly ReviewSubmission[]): ExpertMetrics => {
  const done = rows.filter((r) => r.status === "APPROVED" || r.status === "REJECTED").length;
  return {
    assigned: rows.length,
    reviewed: done,
    agreement: 97.2,
    goldStandards: 3,
    avgTime: "4m 30s / item",
  };
};
