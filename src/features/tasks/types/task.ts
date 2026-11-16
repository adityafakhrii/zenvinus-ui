/**
 * Tasks. `*Dto` types are the JSON of GET /api/tasks/ and /api/tasks/{slug}
 * (zenvinus-backend/internal/catalog/dto.go: taskCard, taskDetail); TaskCard / TaskDetail are what the
 * components render (services/task-mappers.ts).
 */
import type { ApiItemResponse, ApiListResponse, Facet, IsoDateString, NameRef, SlugRef, TagRef } from '@/types/api';
import type { TaskStatusKey, TaskTypeId, Tone } from '../data/tasks';
import type { TaskItem } from './workspace';

export interface TaskCardDto {
  id: number;
  slug: string;
  title: string;
  description: string;
  tags: TagRef[];
  dataType: string;
  status: string;
  quantity: number | null;
  unit?: string;
  deadline: IsoDateString | null;
  difficulty: string;
  reward: number;
  bonus: number;
  participantCount: number;
  category: SlugRef | null;
}

export interface TaskDetailDto extends TaskCardDto {
  instructions: string;
  joined: boolean;
  organization: NameRef | null;
  dataset: SlugRef | null;
}

export interface TaskCategoryFacet {
  slug: string;
  name: string;
  count: number;
}

/**
 * Filter counts of the task list. The backend sends only `dataTypes` today; the UI already reads
 * categories, difficulties and total, so those are optional until the API sends them.
 */
export interface TaskFacets {
  dataTypes?: Facet[];
  categories?: TaskCategoryFacet[];
  difficulties?: Facet[];
  total?: number;
}

export interface TaskListResponse extends ApiListResponse<TaskCardDto> {
  facets?: TaskFacets;
}

export type TaskDetailResponse = ApiItemResponse<TaskDetailDto>;

/** POST/DELETE /api/tasks/{id}/join */
export interface JoinResult {
  joined: boolean;
  participantCount: number;
}

export type JoinResponse = ApiItemResponse<JoinResult>;

/** Query params of GET /api/tasks/ */
export interface TaskListParams {
  q?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  dataType?: string[];
}

/** A task in the list */
export interface TaskCard {
  id: number;
  slug: string;
  title: string;
  desc: string;
  tags: string[];
  dataType: string;
  type: TaskTypeId;
  typeLabel: string;
  typeIcon: string;
  tone: Tone;
  category: string;
  status: TaskStatusKey;
  statusLabel: string;
  quantity: number | null;
  /** "1,250 images" in the current language */
  unit: string;
  daysLeft: number | null;
  deadline: IsoDateString | null;
  /** Capitalized: Beginner, Intermediate, Expert */
  difficulty: string;
  /** Reward per task (Rp) */
  price: number;
  bonus: number;
  contributors: number;
  categorySlug: string | null;
}

export interface QualificationQuestion {
  q: string;
  options: string[];
  /** Index of the correct option */
  answer: number;
}

export interface Qualification {
  passScore: number;
  questions: QualificationQuestion[];
}

/** A task with everything the detail page and the contributor flow need */
export interface TaskDetail extends TaskCard {
  instructions: string;
  joined: boolean;
  organization: string | null;
  dataset: SlugRef | null;
  // The flow fields below are not sent by the backend yet; task-mappers fills safe defaults
  items: TaskItem[];
  guidelines: string[];
  requiresQualification: boolean;
  qualification: Qualification | null;
  language: string;
  estimatedTime: string;
  postedBy: string;
  rewardPerItem: number;
  bonusPct: number;
}

/** One page of the task list, ready to render */
export interface TaskPage {
  cards: TaskCard[];
  total: number;
  facets: TaskFacets | null;
}
