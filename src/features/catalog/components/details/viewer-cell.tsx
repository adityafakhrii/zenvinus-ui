import React from 'react';
import { useT } from '@/i18n';
import { mediaUrl } from '@/services/api';

const IMAGE_URL = /^(https?:\/\/\S+|\/api\/media\/\S+)\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?\S*)?$/i;

export type ColumnFeatures = Readonly<Record<string, string>>;

export function isImageCell(
  column: string | undefined,
  value: unknown,
  features?: ColumnFeatures,
): value is string {
  if (typeof value !== 'string') return false;
  if (column !== undefined && features?.[column] === 'image') return /^(https?:\/\/|\/api\/media\/)/i.test(value);
  return IMAGE_URL.test(value);
}

export interface ViewerCellProps {
  column?: string;
  value: unknown;
  features?: ColumnFeatures;
}

/**
 * Clean tabular preview cell shared by the Catalog Viewer tab and Dataset Studio Explorer.
 */
export function ViewerCell({ column, value, features }: ViewerCellProps) {
  const { t } = useT();

  if (isImageCell(column, value, features)) {
    const src = mediaUrl(value) ?? undefined;
    return (
      <td className="px-3.5 py-2.5 align-middle">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          title={t('Open full size')}
          className="inline-block overflow-hidden rounded-lg border border-line-subtle bg-canvas"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={column || 'sample'} loading="lazy" className="h-12 w-16 object-cover" />
        </a>
      </td>
    );
  }

  if (value === null || value === undefined) {
    return (
      <td className="px-3.5 py-2.5 font-mono text-xs text-ink-subtle">null</td>
    );
  }

  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return (
    <td className="max-w-[320px] truncate px-3.5 py-2.5 font-mono text-xs text-ink">
      {text}
    </td>
  );
}

export default ViewerCell;
