/**
 * Dataset studio payloads (zenvinus-backend/internal/studio/service.go and handler.go).
 */
import type { ApiItemResponse, IsoDateString } from '@/types/api';

/** "draft" | "published" | "archived" today; kept as a string so a new backend status still renders */
export type StudioDatasetStatus = string;

export interface SplitInfo {
  name: string;
  rows: number;
}

/** A column of a split (catalog.Column) */
export interface StudioColumn {
  name: string;
  /** string, int, float, bool, image, audio, ... */
  type: string;
}

/** GET /api/studio/datasets data[] */
export interface StudioDatasetSummary {
  id: number;
  slug: string;
  name: string;
  status: StudioDatasetStatus;
  dataType: string;
  splits: SplitInfo[];
  rows: number;
  updatedAt: IsoDateString;
  canEdit: boolean;
}

/** GET /api/studio/datasets/{slug} data, also returned by create and update */
export interface StudioDatasetDetail extends StudioDatasetSummary {
  summary: string;
  card: string;
  license: string;
  columns: StudioColumn[];
}

export interface StudioListResponse extends ApiItemResponse<StudioDatasetSummary[]> {
  canCreate: boolean;
}

/** GET /api/studio/datasets/{slug}/rows: one page of rows, each row a list of cell values in column order */
export interface StudioRowsResponse {
  data: unknown[][];
  columns: StudioColumn[];
  total: number;
  offset: number;
  limit: number;
}

export interface ValueCount {
  value: string;
  count: number;
}

export interface ColumnStats {
  name: string;
  type: string;
  count: number;
  nulls: number;
  distinct: number;
  min?: number;
  max?: number;
  mean?: number;
  minLength?: number;
  maxLength?: number;
  top?: ValueCount[];
}

/** GET /api/studio/datasets/{slug}/stats data */
export interface StatsResult {
  split: string;
  rows: number;
  /** True when the statistics come from the first rows only */
  sampled: boolean;
  columns: ColumnStats[];
}

/** POST /api/studio/datasets/{slug}/import data */
export interface ImportResult {
  split: string;
  rows: number;
  columns: StudioColumn[];
  file: string;
}

export interface StudioLicense {
  slug: string;
  name: string;
}

/** Body of POST /api/studio/datasets and PATCH /api/studio/datasets/{slug}; every field is optional */
export interface StudioDatasetInput {
  name?: string;
  summary?: string;
  card?: string;
  dataType?: string;
  license?: string;
  status?: StudioDatasetStatus;
}

export interface StudioRowsQuery {
  split: string;
  q?: string;
  page?: number;
}
