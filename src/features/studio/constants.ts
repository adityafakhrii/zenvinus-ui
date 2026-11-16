/**
 * Studio constants that import no components, so any code can use them without pulling in the studio screens.
 * Permission codes and the studio route helper live in src/config and are re-exported here for studio code.
 */
import type { DataType } from '@/config/data-types';

// Permission codes are app config (the dashboard menu checks them too)
export { STUDIO_PERMS } from '@/config/permissions';
export type { StudioPermission } from '@/config/permissions';

/** Rows per page in the explorer */
export const STUDIO_PAGE_SIZE = 25;

export { studioBase } from '@/config/routes';

/** Data types offered in the studio form, in display order, with their English labels (i18n keys) */
export const DATA_TYPE_OPTIONS: ReadonlyArray<readonly [DataType, string]> = [
  ['tabular', 'Tabular'], ['text', 'Text'], ['image', 'Image'], ['audio', 'Audio'], ['video', 'Video'],
  ['document', 'Document'], ['time_series', 'Time series'], ['geospatial', 'Geospatial'], ['3d', '3D'],
];
