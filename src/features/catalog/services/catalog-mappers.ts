/** Dataset/model API payloads -> the shapes the catalog components render. */
import { currentLocale, translate as tr } from '@/i18n';
import { formatBytes } from '@/utils/format';
import { isDataType, type DataType } from '@/config/data-types';
import type { AssetCard, AssetCardDto, AssetDetail, AssetDetailDto, AssetKind, AssetTone } from '../types/asset';

const DTYPE_TONE: Readonly<Record<DataType, AssetTone>> = {
  image: 'blue', text: 'mint', audio: 'purple', video: 'orange',
  '3d': 'blue', document: 'mint', tabular: 'purple', geospatial: 'blue',
  time_series: 'orange',
};

const DTYPE_ICON: Readonly<Record<DataType, string>> = {
  image: 'fa-solid fa-image', text: 'fa-solid fa-file-lines',
  audio: 'fa-solid fa-headphones', video: 'fa-solid fa-video',
  '3d': 'fa-solid fa-cube', document: 'fa-solid fa-file-lines',
  tabular: 'fa-solid fa-table', geospatial: 'fa-solid fa-map-location-dot',
  time_series: 'fa-solid fa-chart-line',
};

/** Card from GET /api/datasets/ or /api/models/ data[]. */
export function mapAssetCard(asset: AssetCardDto, res: AssetKind): AssetCard {
  const dtype = isDataType(asset.dataType) ? asset.dataType : null;
  return {
    id: asset.id,
    slug: asset.slug,
    res,
    title: asset.name,
    desc: asset.summary || '',
    dtype: asset.dataType,
    tone: dtype ? DTYPE_TONE[dtype] : 'blue',
    icon: dtype ? DTYPE_ICON[dtype] : 'fa-solid fa-database',
    tags: (asset.tags || []).map((t) => t.name),
    unit: asset.itemCount ? `${asset.itemCount.toLocaleString(currentLocale())} ${asset.itemUnit || tr('items')}` : (asset.itemUnit || ''),
    downloads: asset.downloadCount || 0,
    quality: asset.qualityScore || 0,
    license: asset.license?.name || null,
    licenseSlug: asset.license?.slug || null,
    price: asset.price || 0,
    status: asset.status,
    organization: asset.organization?.name || null,
    publishedAt: asset.publishedAt,
  };
}

/** Detail from GET /api/datasets/{slug} or /api/models/{slug}. */
export function mapAssetDetail(asset: AssetDetailDto, res: AssetKind): AssetDetail {
  return {
    ...mapAssetCard(asset, res),
    card: asset.card || asset.summary || '',
    files: (asset.files || []).map((f) => ({ ...f, sizeLabel: formatBytes(f.sizeBytes) })),
    sizeLabel: formatBytes(asset.sizeBytes),
    splits: asset.splits || [],
    preview: asset.preview || null,
    citation: asset.citation || null,
    models: asset.models || [],
    updatedAt: asset.updatedAt,
  };
}
