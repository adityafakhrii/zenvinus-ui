/**
 * Order pipeline (8 stages) shown as the child view of a project or a custom order (REQ-*),
 * built by data/company-orders.ts.
 */
import type { Tone } from './project';

export type PipelineStageKey = 'request' | 'review' | 'proposal' | 'acceptance' | 'work' | 'completed' | 'final' | 'delivery';

export interface PipelineStage {
  key: PipelineStageKey;
  label: string;
  icon: string;
}

export type StageState = 'done' | 'active' | 'pending';

export interface TimelineStep extends PipelineStage {
  state: StageState;
  date: string | null;
  desc?: string;
}

export interface OrderPayment {
  label: string;
  /** USD for seeded orders; an IDR label for posted requests */
  amount: number | string;
  state: 'paid' | 'pending';
  date: string | null;
}

export interface OrderDeliverables {
  datasets: Array<{ name: string; items: number; size: string; date: string }>;
  models: Array<{ name: string; framework: string; metric: string; href: string }>;
  inference: { endpoint: string; region: string; latency: string; status: string };
}

/** A row of the custom-order list */
export interface CompanyOrder {
  id: string;
  items: number;
  workforce: number;
  qaPass: number | null;
  title: string;
  type: string;
  icon: string;
  tone: Tone;
  date: string;
  /** USD for seeded orders; an IDR label for posted requests */
  amount: number | string;
  /** 1–8 */
  stage: number;
  stageLabel: string;
  status: string;
  statusTone: Tone;
  progress: number;
}

export interface OrderDetail extends CompanyOrder {
  timeline: TimelineStep[];
  payments: { upfront: OrderPayment; final: OrderPayment };
  /** Only after full payment and delivery */
  deliverables: OrderDeliverables | null;
}

export interface StageRow {
  icon: string;
  label: string;
  value: string;
}

/** Body of a stage page, by kind of stage */
export type StageContent =
  | { kind: 'info'; intro?: string; rows: StageRow[] }
  | { kind: 'proposal'; intro: string; doc: { id: string; rows: Array<{ label: string; value: string }> } }
  | { kind: 'payment'; intro: string; rows: StageRow[] }
  | { kind: 'batches'; intro: string; batches: Array<{ id: string; label: string; items: number; delivered: number }> }
  | { kind: 'delivery'; intro: string };

export interface OrderStageDetail {
  order: OrderDetail;
  idx: number;
  meta: PipelineStage;
  stage: TimelineStep;
  content: StageContent;
}
