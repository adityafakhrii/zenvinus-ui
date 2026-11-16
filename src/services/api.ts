/**
 * Local UI/UX dummy-mode API utilities.
 * Remote backend connections are intentionally disabled so all features run on local dummy data.
 */
import type { IncomingMessage } from 'http';
import type { QueryParams } from '@/types/api';

export const API_URL = '';

/** Local/passthrough media URL helper (returns null for empty paths). */
export function mediaUrl(path: string | null | undefined): string | null {
  if (typeof path !== 'string' || path === '') return null;
  return path;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly unavailable: boolean;

  constructor(status: number, message: string, body: unknown = null) {
    super(message || `API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.unavailable = status === 0 || status >= 500;
  }
}

export const isUnavailableError = (error: unknown): boolean => error instanceof ApiError && error.unavailable;

export const UNAVAILABLE_MESSAGE = 'The service is running in local dummy-data mode.';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiFetchOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: QueryParams;
  ctx?: { req?: IncomingMessage };
}

export async function apiFetch<T = unknown>(
  path: string,
  _options: ApiFetchOptions = {},
): Promise<T> {
  throw new ApiError(503, `Remote API disabled in dummy mode (${path}).`, null);
}

export async function apiUpload<T = unknown>(path: string, _formData: FormData): Promise<T> {
  throw new ApiError(503, `Remote upload disabled in dummy mode (${path}).`, null);
}
