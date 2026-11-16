/**
 * Dummy Dataset Studio service for local UI/UX mode (replaces remote /api/studio/* calls).
 */
import { ApiError } from '@/services/api';
import { STUDIO_PAGE_SIZE } from '../constants';
import {
  buildDummyStats,
  DUMMY_STUDIO_DATASETS,
  DUMMY_STUDIO_LICENSES,
  parseDummyCsvImport,
} from '../data/dummy-studio';
import type {
  ImportResult,
  StatsResult,
  StudioDatasetDetail,
  StudioDatasetInput,
  StudioLicense,
  StudioListResponse,
  StudioRowsQuery,
  StudioRowsResponse,
} from '../types/studio';

export { DATA_TYPE_OPTIONS, STUDIO_PAGE_SIZE, STUDIO_PERMS, studioBase } from '../constants';

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `dataset-${Date.now()}`;

const findRecord = (slug: string) => {
  const found = DUMMY_STUDIO_DATASETS.find((d) => d.detail.slug === slug);
  if (!found) {
    throw new ApiError(404, 'Dataset not found.', null);
  }
  return found;
};

export const listStudioDatasets = async (): Promise<StudioListResponse> => ({
  data: DUMMY_STUDIO_DATASETS.map((d) => ({ ...d.detail })),
  canCreate: true,
});

export const getStudioDataset = async (slug: string): Promise<StudioDatasetDetail> => ({
  ...findRecord(slug).detail,
});

export const getStudioRows = async (
  slug: string,
  { split, q, page = 1 }: StudioRowsQuery,
): Promise<StudioRowsResponse> => {
  const record = findRecord(slug);
  const allRows = record.splitRows[split] ?? [];
  const query = q?.trim().toLowerCase();
  const filtered = query
    ? allRows.filter((row) => row.some((cell) => String(cell ?? '').toLowerCase().includes(query)))
    : allRows;
  const offset = (page - 1) * STUDIO_PAGE_SIZE;

  return {
    data: filtered.slice(offset, offset + STUDIO_PAGE_SIZE),
    columns: record.detail.columns,
    total: filtered.length,
    offset,
    limit: STUDIO_PAGE_SIZE,
  };
};

export const getStudioStats = async (slug: string, split: string): Promise<StatsResult> =>
  buildDummyStats(findRecord(slug), split);

export const getStudioLicenses = async (): Promise<StudioLicense[]> => [...DUMMY_STUDIO_LICENSES];

export const createStudioDataset = async (body: StudioDatasetInput): Promise<StudioDatasetDetail> => {
  const name = body.name?.trim() || 'Untitled Dataset';
  const id = DUMMY_STUDIO_DATASETS.length + 1;
  const slug = slugify(name);
  const detail: StudioDatasetDetail = {
    id,
    slug,
    name,
    status: body.status || 'draft',
    dataType: body.dataType || 'text',
    splits: [],
    rows: 0,
    updatedAt: new Date().toISOString(),
    canEdit: true,
    summary: body.summary || '',
    card: body.card || '',
    license: body.license || 'cc-by-4.0',
    columns: [],
  };
  DUMMY_STUDIO_DATASETS.unshift({ detail, splitRows: {} });
  return { ...detail };
};

export const updateStudioDataset = async (
  slug: string,
  body: StudioDatasetInput,
): Promise<StudioDatasetDetail> => {
  const record = findRecord(slug);
  Object.assign(record.detail, {
    name: body.name ?? record.detail.name,
    summary: body.summary ?? record.detail.summary,
    card: body.card ?? record.detail.card,
    dataType: body.dataType ?? record.detail.dataType,
    license: body.license ?? record.detail.license,
    status: body.status ?? record.detail.status,
    updatedAt: new Date().toISOString(),
  });
  return { ...record.detail };
};

export function importStudioCsv(slug: string, split: string, file: File): Promise<ImportResult> {
  return parseDummyCsvImport(findRecord(slug), split, file);
}
