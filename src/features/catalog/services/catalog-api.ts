/**
 * Dummy Datasets/Models catalog service (local UI/UX mode).
 */
import { ApiError } from '@/services/api';
import { buildAssetFacets, getDummyAssets } from '../data/dummy-catalog';
import { mapAssetCard, mapAssetDetail } from './catalog-mappers';
import type { AssetDetail, AssetKind, AssetListParams, AssetPage, DownloadResponse } from '../types/asset';

/** One page of datasets or models with their filter facets. */
export async function fetchAssets(res: AssetKind, params: AssetListParams = {}): Promise<AssetPage> {
  const all = getDummyAssets(res);
  const q = params.q?.trim().toLowerCase();
  const dtypes = Array.isArray(params.dataType) ? params.dataType.map((d) => d.toLowerCase()) : [];
  const licenses = Array.isArray(params.license) ? params.license.map((l) => l.toLowerCase()) : [];
  const status = params.status?.trim().toLowerCase();

  let filtered = all.filter((item) => {
    if (q) {
      const hay = `${item.name} ${item.summary} ${item.tags.map((t) => t.name).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dtypes.length && !dtypes.includes(item.dataType.toLowerCase())) return false;
    if (licenses.length && (!item.license || !licenses.includes(item.license.slug.toLowerCase()))) return false;
    if (status && item.status.toLowerCase() !== status) return false;
    return true;
  });

  if (params.sort === 'downloads') {
    filtered = [...filtered].sort((a, b) => b.downloadCount - a.downloadCount);
  } else if (params.sort === 'quality') {
    filtered = [...filtered].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));
  }

  const offset = params.offset ?? 0;
  const limit = params.limit ?? 12;
  const pageItems = filtered.slice(offset, offset + limit);

  return {
    cards: pageItems.map((a) => mapAssetCard(a, res)),
    total: filtered.length,
    facets: buildAssetFacets(all),
  };
}

export async function fetchAssetBySlug(res: AssetKind, slug: string): Promise<AssetDetail> {
  const found = getDummyAssets(res).find((a) => a.slug === slug);
  if (!found) {
    throw new ApiError(404, `${res} not found.`, null);
  }
  return mapAssetDetail(found, res);
}

/** Increments dummy download counter and returns the asset files. */
export async function downloadAsset(res: AssetKind, id: number): Promise<DownloadResponse> {
  const found = getDummyAssets(res).find((a) => a.id === id);
  if (!found) {
    throw new ApiError(404, `${res} not found.`, null);
  }
  found.downloadCount += 1;
  return {
    data: {
      downloadCount: found.downloadCount,
      files: found.files,
    },
  };
}
