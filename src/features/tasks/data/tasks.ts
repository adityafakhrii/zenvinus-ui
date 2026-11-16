/**
 * Task constants shared by the task list, the contributor flow and the workspaces.
 *
 * The single most important contract is `task.type`: the value (mapped from the backend `dataType`) that
 * decides WHICH workspace the contributor gets. The frontend never asks the user to pick a workspace; see
 * resolveWorkspace() in src/features/tasks/components/workspaces/registry.tsx.
 */

/** Colour family of a badge or chip (tflow-tone-*, pf2-tone-*, edash-status-* classes). */
export type Tone = 'blue' | 'mint' | 'purple' | 'orange' | 'amber' | 'red' | 'green';

export interface TaskTypeMeta {
  id: string;
  /** English i18n key */
  label: string;
  /** Font Awesome classes */
  icon: string;
  tone: Tone;
  category: string;
  desc: string;
}

/* ------------------------------------------------------------------ */
/* Workspace types: driven by task.type                                */
/* ------------------------------------------------------------------ */

export const TASK_TYPES = {
  image_classification: {
    id: 'image_classification',
    label: 'Image Classification',
    icon: 'fa-solid fa-image',
    tone: 'blue',
    category: 'Image',
    desc: 'Assign a single label to each image from a fixed label set.',
  },
  text_classification: {
    id: 'text_classification',
    label: 'Text Classification',
    icon: 'fa-solid fa-file-lines',
    tone: 'mint',
    category: 'Text',
    desc: 'Label documents or snippets with the correct category.',
  },
  audio_transcription: {
    id: 'audio_transcription',
    label: 'Audio Transcription',
    icon: 'fa-solid fa-headphones',
    tone: 'purple',
    category: 'Audio',
    desc: 'Type out exactly what is said in each audio clip.',
  },
  llm_evaluation: {
    id: 'llm_evaluation',
    label: 'LLM Evaluation',
    icon: 'fa-solid fa-robot',
    tone: 'orange',
    category: 'Other',
    desc: 'Rate and compare model responses for helpfulness and accuracy.',
  },
  tabular_validation: {
    id: 'tabular_validation',
    label: 'Tabular Validation',
    icon: 'fa-solid fa-table',
    tone: 'mint',
    category: 'Other',
    desc: 'Check structured records field by field and flag bad data.',
  },
  object_annotation: {
    id: 'object_annotation',
    label: 'Object Annotation',
    icon: 'fa-solid fa-object-group',
    tone: 'blue',
    category: 'Image',
    desc: 'Draw boxes and trace masks around every object of interest — one canvas, one class palette.',
  },
} as const satisfies Record<string, TaskTypeMeta>;

/** Workspace kind of a task: decides the editor in the studio. */
export type TaskTypeId = keyof typeof TASK_TYPES;

export const isTaskTypeId = (value: string): value is TaskTypeId => Object.prototype.hasOwnProperty.call(TASK_TYPES, value);

/* ------------------------------------------------------------------ */
/* Flow definition                                                     */
/* ------------------------------------------------------------------ */

export const FLOW_STEPS = [
  { key: 'list', label: 'Task List', icon: 'fa-solid fa-list-check' },
  { key: 'detail', label: 'Task Detail', icon: 'fa-solid fa-circle-info' },
  { key: 'join', label: 'Join Task', icon: 'fa-solid fa-user-plus' },
  { key: 'qualification', label: 'Qualification', icon: 'fa-solid fa-graduation-cap' },
  { key: 'workspace', label: 'Workspace', icon: 'fa-solid fa-laptop-code' },
  { key: 'submit', label: 'Submit Item', icon: 'fa-solid fa-paper-plane' },
  { key: 'quality', label: 'Quality Check', icon: 'fa-solid fa-clipboard-check' },
  { key: 'completed', label: 'Completed', icon: 'fa-solid fa-circle-check' },
  { key: 'reward', label: 'Reward', icon: 'fa-solid fa-coins' },
] as const;

export type FlowStepKey = (typeof FLOW_STEPS)[number]['key'];

/** §5.1 task lifecycle statuses (spec ZENVINUS-roles-workflows §5.1). */
export const TASK_STATUS = {
  DRAFT: { label: 'Draft', tone: 'blue' },
  OPEN: { label: 'Open', tone: 'mint' },
  ACTIVE: { label: 'Active', tone: 'blue' },
  PAUSED: { label: 'Paused', tone: 'amber' },
  CLOSED: { label: 'Closed', tone: 'red' },
  COMPLETED: { label: 'Completed', tone: 'purple' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export type TaskStatusKey = keyof typeof TASK_STATUS;

/** Dot colour per difficulty label; unknown difficulties get no tone class. */
export const difficultyTone: Readonly<Record<string, Tone>> = { Beginner: 'green', Intermediate: 'amber', Expert: 'red' };

/**
 * Status lifecycle of a posted task — mirrors the enterprise order pipeline
 * (request → review → proposal → 50% → work → full payment → delivery) in
 * six contributor-facing statuses. New tasks start at `pending`.
 */
export const POSTED_TASK_STATUS_FLOW = [
  { key: "pending", label: "PENDING", desc: "Request submitted — waiting in the expert queue.", icon: "fa-solid fa-inbox" },
  { key: "in_review", label: "IN_REVIEW", desc: "Zenvinus expert team is reviewing your request and preparing the proposal.", icon: "fa-solid fa-user-graduate" },
  { key: "awaiting_dp", desc: "Review done, proposal attached — pay the 50% down payment to start work.", label: "AWAITING_DOWN_PAYMENT", icon: "fa-solid fa-money-check-dollar" },
  { key: "in_progress", label: "IN_PROGRESS", desc: "Qualified workforce is working on your batches.", icon: "fa-solid fa-diagram-project" },
  { key: "awaiting_full", label: "AWAITING_FULL_PAYMENT", desc: "Work completed — pay the remaining 50% to unlock delivery.", icon: "fa-solid fa-file-invoice-dollar" },
  { key: "completed", label: "COMPLETED", desc: "Paid & delivered — datasets, models and reports are available.", icon: "fa-solid fa-circle-check" },
] as const;

/** Terminal outcomes outside the main pipeline: not a sequence, only end results. */
export const POSTED_TASK_EXCEPTIONS = [
  { key: "cancelled", label: "CANCELLED", desc: "Task cancelled before completion — unused escrow returns to your balance.", icon: "fa-solid fa-ban" },
  { key: "rejected", label: "REJECTED", desc: "Rejected during expert review — revise the brief, then resubmit.", icon: "fa-solid fa-circle-xmark" },
] as const;
