/**
 * Shapes shared by every backend endpoint. Field names match the JSON the Go backend sends
 * (zenvinus-backend/internal/catalog/dto.go and friends); feature-specific payloads live in
 * src/features/<feature>/types.
 */

/** ISO 8601 timestamp as sent by the API, e.g. "2026-11-10T08:00:00Z". */
export type IsoDateString = string;

/** `{ data }` envelope of single-item endpoints such as GET /api/tasks/{slug}. */
export interface ApiItemResponse<T> {
  data: T;
}

/** `{ data, total }` envelope of list endpoints; some add facets or a sidebar (see the feature types). */
export interface ApiListResponse<T> {
  data: T[];
  total: number;
}

/** A value and how many visible items carry it (filter chips). */
export interface Facet {
  value: string;
  count: number;
}

export interface NameRef {
  name: string;
}

export interface SlugRef {
  slug: string;
  name?: string;
}

export type TagRef = NameRef;

/** Error body of the backend: `{ code, message }`, or `{ error: { message } }` from older handlers. */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  error?: string | { message?: string };
}

/** Value of one query-string parameter; arrays become repeated keys (?dataType=a&dataType=b). */
export type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>;

export type QueryParams = Record<string, QueryValue>;
