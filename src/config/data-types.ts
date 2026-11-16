/**
 * Data types the backend uses for tasks, datasets and models (the `dataType` field).
 * One list for the whole app: filters, studio forms and mappers all read it from here.
 */
export const DATA_TYPES = ['3d', 'audio', 'document', 'geospatial', 'image', 'tabular', 'text', 'time_series', 'video'] as const;

export type DataType = (typeof DATA_TYPES)[number];

export const isDataType = (value: unknown): value is DataType =>
  typeof value === 'string' && (DATA_TYPES as ReadonlyArray<string>).includes(value);
