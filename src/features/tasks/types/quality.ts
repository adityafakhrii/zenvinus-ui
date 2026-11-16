/** Result of the automatic quality check of one submitted item (data/quality-check.ts). */
import type { TextVars } from '@/i18n';

export interface QualityCheck {
  /** English i18n key; may hold placeholders filled from `vars` */
  label: string;
  vars?: TextVars;
  submitted: string | number;
  expected: string | number;
  ok: boolean;
  /** 0..1 similarity, for checks scored on a scale */
  score?: number;
}

export interface QualityReview {
  checks: QualityCheck[];
  /** 0..100 */
  score: number;
  passed: boolean;
  threshold: number;
  note: string | null;
}
