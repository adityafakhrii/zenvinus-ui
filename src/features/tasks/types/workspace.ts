/**
 * Items and answers of the task workspaces. Each workspace type (TaskTypeId) has its own item shape and
 * answer shape; WorkspaceItemMap / WorkspaceAnswerMap tie them to the type so the registry, the studio and
 * the quality check stay in step.
 */
import type { TaskTypeId } from '../data/tasks';

interface ItemBase {
  id: string;
  /** Hint shown by the quality check when the item fails */
  goldNote?: string;
}

export interface ImageClassificationItem extends ItemBase {
  image: string;
  labels: string[];
  gold: string;
}

export interface TextClassificationItem extends ItemBase {
  text: string;
  labels: string[];
  gold: string;
}

export interface AudioTranscriptionItem extends ItemBase {
  /** "mm:ss" */
  duration: string;
  speakers: number;
  hint: string;
  gold: string;
}

export type ResponseLabel = 'A' | 'B';

export interface LlmResponse {
  label: ResponseLabel;
  text: string;
}

export interface LlmEvaluationGold {
  preference: ResponseLabel;
  helpfulnessA: number;
  helpfulnessB: number;
  accuracyA: number;
  accuracyB: number;
}

export interface LlmEvaluationItem extends ItemBase {
  prompt: string;
  responses: LlmResponse[];
  gold: LlmEvaluationGold;
}

export type Verdict = 'valid' | 'invalid';

export interface TabularField {
  key: string;
  /** English i18n key */
  label: string;
  value: string;
  /** English i18n key */
  rule: string;
}

export interface TabularValidationItem extends ItemBase {
  fields: TabularField[];
  gold: Record<string, Verdict>;
}

/** Bounding box in percent of the image */
export interface BoxRegion {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Mask that comes with the item, as a CSS clip-path */
export interface MaskSegment {
  id: string;
  clip: string;
}

export interface ObjectAnnotationItem extends ItemBase {
  image: string;
  classes?: string[];
  /** Ids start with "r" */
  regions?: BoxRegion[];
  /** Ids start with "s" */
  segments?: MaskSegment[];
  /** Expected class per region/segment id */
  gold?: Record<string, string>;
}

export interface LabelAnswer {
  label?: string;
}

export interface TranscriptAnswer {
  text?: string;
}

export type LlmScoreKey = `helpfulness${ResponseLabel}` | `accuracy${ResponseLabel}`;

export interface LlmEvaluationAnswer extends Partial<Record<LlmScoreKey, number>> {
  preference?: ResponseLabel;
}

export interface TabularRowAnswer {
  verdict?: Verdict;
  note?: string;
}

export interface TabularValidationAnswer {
  rows?: Record<string, TabularRowAnswer>;
}

/** Point in percent of the image: [x, y] */
export type Point = [number, number];

/** Polygon drawn by the contributor; ids start with "p" */
export interface DrawnPolygon {
  id: string;
  points: Point[];
}

export interface ObjectAnnotationAnswer {
  /** Box geometry (falls back to item.regions) */
  shapes?: BoxRegion[];
  /** Class per box id */
  boxes?: Record<string, string>;
  /** Class per mask or drawn polygon id */
  segments?: Record<string, string>;
  polygons?: DrawnPolygon[];
}

export interface WorkspaceItemMap {
  image_classification: ImageClassificationItem;
  text_classification: TextClassificationItem;
  audio_transcription: AudioTranscriptionItem;
  llm_evaluation: LlmEvaluationItem;
  tabular_validation: TabularValidationItem;
  object_annotation: ObjectAnnotationItem;
}

export interface WorkspaceAnswerMap {
  image_classification: LabelAnswer;
  text_classification: LabelAnswer;
  audio_transcription: TranscriptAnswer;
  llm_evaluation: LlmEvaluationAnswer;
  tabular_validation: TabularValidationAnswer;
  object_annotation: ObjectAnnotationAnswer;
}

/** Any workspace item */
export type TaskItem = WorkspaceItemMap[TaskTypeId];

/** Any workspace answer; a fresh answer is `{}` */
export type WorkspaceAnswer = WorkspaceAnswerMap[TaskTypeId];

/** Contract of every workspace component: { item, answer, onChange } */
export interface WorkspaceProps<K extends TaskTypeId> {
  item: WorkspaceItemMap[K];
  answer: WorkspaceAnswerMap[K];
  onChange: (next: WorkspaceAnswerMap[K]) => void;
}

/** Guidelines and items of one workspace (task content or a dev-only example) */
export interface WorkspaceContent<K extends TaskTypeId> {
  guidelines: string[];
  items: WorkspaceItemMap[K][];
}
