/** Expert review of contributor submissions (mock backend in data/expert-workspace.ts). */
import type { Tone } from '../data/tasks';

export type SubmissionStatus = 'PENDING REVIEW' | 'IN REVIEW' | 'REVISION REQUIRED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';

export interface ReviewDecision {
  reviewerId: string;
  reviewerName: string;
  /** English label of the action taken */
  action: string;
  from: SubmissionStatus;
  to: SubmissionStatus;
  feedback: string;
  rubric: string;
  at: string;
}

/** Reward ledger entry, kept apart from the quality status */
export interface ReviewLedgerEntry {
  status: 'PENDING' | 'AVAILABLE';
  amount: number;
  note: string;
}

export interface ReviewSubmission {
  id: string;
  slug: string;
  task: string;
  taskType: string;
  contributor: string;
  /** The reviewer's own submission: locked from self-review */
  own?: boolean;
  submitted: string;
  status: SubmissionStatus;
  items: number;
  note: string;
  tone: Tone;
  reviewedAt?: string;
  decision?: ReviewDecision;
  history?: ReviewDecision[];
  ledger?: ReviewLedgerEntry;
}

export interface ExpertLedger {
  thisMonth: number;
  pending: number;
  pendingCount: number;
  available: number;
  perItem: number;
  note: string;
}

export interface ExpertMetrics {
  assigned: number;
  reviewed: number;
  agreement: number;
  goldStandards: number;
  avgTime: string;
}
