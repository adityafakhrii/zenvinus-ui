import React from 'react';
import { mediaUrl } from '@/services/api';
import { useT } from '@/i18n';

const IMAGE_URL = /^(https?:\/\/\S+|\/api\/media\/\S+)\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?\S*)?$/i;

/** Column name -> feature type, e.g. { photo: 'image' } */
export type ColumnFeatures = Readonly<Record<string, string>>;

/** A viewer cell is an image when the column is typed as one, or when its value is an image URL or media path. */
export function isImageCell(column: string | undefined, value: unknown, features?: ColumnFeatures): value is string {
  if (typeof value !== 'string') return false;
  if (column !== undefined && features?.[column] === 'image') return /^(https?:\/\/|\/api\/media\/)/i.test(value);
  return IMAGE_URL.test(value);
}

export interface ViewerCellProps {
  column?: string;
  value: unknown;
  features?: ColumnFeatures;
}

export function ViewerCell({ column, value, features }: ViewerCellProps) {
  const { t } = useT();
  if (isImageCell(column, value, features)) {
    const src = mediaUrl(value) ?? undefined;
    return (
      <td className="hf-viewer-image-cell">
        <a href={src} target="_blank" rel="noopener noreferrer" title={t('Open full size')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={column} loading="lazy" className="hf-viewer-image" />
        </a>
      </td>
    );
  }
  if (value === null || value === undefined) return <td className="hf-mono hf-null">null</td>;
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return <td className="hf-mono">{text}</td>;
}

export default ViewerCell;
