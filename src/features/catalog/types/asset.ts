/**
 * Datasets and models. `*Dto` types are the JSON of GET /api/{datasets|models}/ and /{slug}
 * (zenvinus-backend/internal/catalog/dto.go, repository.go, service.go); the others are what the components
 * render (catalog-mappers.ts).
 */
import type { ApiItemResponse, ApiListResponse, Facet, IsoDateString, NameRef, SlugRef, TagRef } from '@/types/api';

/** Which catalog an asset belongs to; picks the API path (/api/datasets or /api/models) and the detail route. */
export type AssetKind = 'Dataset' | 'Model';

export interface AssetCardDto {
  id: number;
  slug: string;
  name: string;
  summary: string;
  dataType: string;
  tags: TagRef[];
  itemCount: number | null;
  itemUnit?: string;
  downloadCount: number;
  qualityScore: number | null;
  license: SlugRef | null;
  price: number;
  status: string;
  organization: NameRef | null;
  publishedAt: IsoDateString | null;
}

export interface AssetFileDto {
  path: string;
  sizeBytes: number;
}

export interface AssetSplitDto {
  name: string;
  rows: number;
}

/**
 * Sample rows for the dataset viewer. The backend sends a free-form map (`map[string]any`); these are the keys
 * the viewer reads, so every one is optional. Cell values can be anything JSON holds.
 */
export interface AssetPreviewDto {
  split?: string;
  columns?: string[];
  rows?: unknown[][];
  /** Column name -> feature type, e.g. { photo: 'image' } */
  features?: Record<string, string>;
}

export interface AssetDetailDto extends AssetCardDto {
  card: string;
  files: AssetFileDto[];
  sizeBytes: number | null;
  splits: AssetSplitDto[];
  preview: AssetPreviewDto | null;
  citation?: string;
  models: unknown[];
  updatedAt: IsoDateString;
}

export interface LicenseFacet {
  slug: string;
  name: string;
  count: number;
}

export interface AssetFacets {
  dataTypes: Facet[];
  licenses: LicenseFacet[];
}

export interface AssetListResponse extends ApiListResponse<AssetCardDto> {
  facets?: AssetFacets;
}

export type AssetDetailResponse = ApiItemResponse<AssetDetailDto>;

/** POST /api/{datasets|models}/{id}/download */
export interface DownloadResult {
  downloadCount: number;
  files: AssetFileDto[];
}

export type DownloadResponse = ApiItemResponse<DownloadResult>;

/** Query params of a dataset/model list request */
export interface AssetListParams {
  q?: string;
  license?: string[];
  status?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  dataType?: string[];
}

/** Colour of the row thumbnail (pf2-tone-*) */
export type AssetTone = 'blue' | 'mint' | 'purple' | 'orange';

/** A dataset or model row in the lists */
export interface AssetCard {
  id: number;
  slug: string;
  res: AssetKind;
  title: string;
  desc: string;
  dtype: string;
  tone: AssetTone;
  icon: string;
  tags: string[];
  /** "12,000 rows", formatted in the current language */
  unit: string;
  downloads: number;
  quality: number;
  license: string | null;
  licenseSlug: string | null;
  price: number;
  status: string;
  organization: string | null;
  publishedAt: IsoDateString | null;
}

export interface AssetFile extends AssetFileDto {
  sizeLabel: string;
}

export interface AssetDetail extends AssetCard {
  card: string;
  files: AssetFile[];
  sizeLabel: string;
  splits: AssetSplitDto[];
  preview: AssetPreviewDto | null;
  citation: string | null;
  models: unknown[];
  updatedAt: IsoDateString;
}

/** One page of a dataset/model list, ready to render */
export interface AssetPage {
  cards: AssetCard[];
  total: number;
  facets: AssetFacets | null;
}
