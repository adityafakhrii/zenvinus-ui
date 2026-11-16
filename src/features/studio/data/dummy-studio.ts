import type {
  ImportResult,
  StatsResult,
  StudioColumn,
  StudioDatasetDetail,
  StudioLicense,
} from '../types/studio';

export interface DummyStudioRecord {
  detail: StudioDatasetDetail;
  splitRows: Record<string, unknown[][]>;
}

export const DUMMY_STUDIO_LICENSES: StudioLicense[] = [
  { slug: 'cc-by-4.0', name: 'CC BY 4.0' },
  { slug: 'apache-2.0', name: 'Apache 2.0' },
  { slug: 'mit', name: 'MIT License' },
  { slug: 'enterprise-nda', name: 'Enterprise NDA' },
];

const roadColumns: StudioColumn[] = [
  { name: 'sample_id', type: 'string' },
  { name: 'image', type: 'image' },
  { name: 'city', type: 'string' },
  { name: 'defect_type', type: 'string' },
  { name: 'confidence', type: 'float' },
  { name: 'verified', type: 'bool' },
];

const sentimentColumns: StudioColumn[] = [
  { name: 'id', type: 'string' },
  { name: 'text', type: 'string' },
  { name: 'sentiment', type: 'string' },
  { name: 'score', type: 'float' },
  { name: 'domain', type: 'string' },
];

export const DUMMY_STUDIO_DATASETS: DummyStudioRecord[] = [
  {
    detail: {
      id: 1,
      slug: 'indonesian-road-damage-v2',
      name: 'Indonesian Road Damage Segmentation v2',
      status: 'published',
      dataType: 'image',
      splits: [
        { name: 'train', rows: 6 },
        { name: 'validation', rows: 2 },
      ],
      rows: 8,
      updatedAt: '2026-10-15T12:00:00Z',
      canEdit: true,
      summary: 'Urban dashcam frames annotated for potholes and pavement cracks.',
      card: '## Dataset Studio Card\n\nIncludes verified bounding box & mask labels across Indonesian cities.',
      license: 'cc-by-4.0',
      columns: roadColumns,
    },
    splitRows: {
      train: [
        ['RD-001', '/assets/img/blog/img-1.jpg', 'Bandung', 'pothole', 0.98, true],
        ['RD-002', '/assets/img/blog/img-2.jpg', 'Surabaya', 'alligator_crack', 0.94, true],
        ['RD-003', '/assets/img/blog/img-3.jpg', 'Semarang', 'longitudinal_crack', 0.91, true],
        ['RD-004', '/assets/img/blog/img-7.jpg', 'Medan', 'pothole', 0.96, true],
        ['RD-005', '/assets/img/blog/img-8.jpg', 'Yogyakarta', 'manhole_cover', 0.89, false],
        ['RD-006', '/assets/img/blog/img-9.jpg', 'Makassar', 'pothole', 0.95, true],
      ],
      validation: [
        ['RD-101', '/assets/img/blog/details/blog-1.jpg', 'Jakarta', 'pothole', 0.97, true],
        ['RD-102', '/assets/img/blog/details/blog-2.jpg', 'Denpasar', 'alligator_crack', 0.92, true],
      ],
    },
  },
  {
    detail: {
      id: 2,
      slug: 'nusantara-bahasa-sentiment-corpus',
      name: 'Nusantara Bahasa Sentiment & Intent Corpus',
      status: 'draft',
      dataType: 'text',
      splits: [{ name: 'train', rows: 4 }],
      rows: 4,
      updatedAt: '2026-10-11T10:30:00Z',
      canEdit: true,
      summary: 'Indonesian customer feedback and support snippets labeled by sentiment and intent.',
      card: '## Corpus Notes\n\nBalanced across formal and colloquial registers.',
      license: 'apache-2.0',
      columns: sentimentColumns,
    },
    splitRows: {
      train: [
        ['TXT-01', 'Pengiriman cepat dan kurirnya ramah banget.', 'positive', 0.97, 'e-commerce'],
        ['TXT-02', 'Mohon dibantu cek kendala top-up saldo yang belum masuk.', 'neutral', 0.88, 'fintech'],
        ['TXT-03', 'Aplikasi sering force close setelah update versi terbaru.', 'negative', 0.95, 'mobile'],
        ['TXT-04', 'Kualitas produk sesuai deskripsi dan packing rapi.', 'positive', 0.93, 'e-commerce'],
      ],
    },
  },
];

export function buildDummyStats(record: DummyStudioRecord, split: string): StatsResult {
  const rows = record.splitRows[split] ?? [];
  const columns = record.detail.columns.map((col, colIndex) => {
    const values = rows.map((r) => r[colIndex]);
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');
    const distinctSet = new Set(nonNull.map((v) => String(v)));
    const counts = new Map<string, number>();
    for (const v of nonNull) {
      const s = String(v);
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));

    if (col.type === 'float' || col.type === 'int') {
      const nums = nonNull.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      const min = nums.length ? Math.min(...nums) : 0;
      const max = nums.length ? Math.max(...nums) : 0;
      const mean = nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(3)) : 0;
      return {
        name: col.name,
        type: col.type,
        count: nonNull.length,
        nulls: values.length - nonNull.length,
        distinct: distinctSet.size,
        min,
        max,
        mean,
        top,
      };
    }

    const lengths = nonNull.map((v) => String(v).length);
    return {
      name: col.name,
      type: col.type,
      count: nonNull.length,
      nulls: values.length - nonNull.length,
      distinct: distinctSet.size,
      minLength: lengths.length ? Math.min(...lengths) : 0,
      maxLength: lengths.length ? Math.max(...lengths) : 0,
      top,
    };
  });

  return {
    split,
    rows: rows.length,
    sampled: false,
    columns,
  };
}

export async function parseDummyCsvImport(record: DummyStudioRecord, split: string, file: File): Promise<ImportResult> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const headers = lines[0]?.split(',').map((h) => h.trim()).filter(Boolean) ?? ['col_1'];
  const columns: StudioColumn[] = headers.map((name) => ({ name, type: 'string' }));
  const parsedRows: unknown[][] = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim()));

  record.splitRows[split] = parsedRows;
  record.detail.columns = columns;
  const existingSplit = record.detail.splits.find((s) => s.name === split);
  if (existingSplit) existingSplit.rows = parsedRows.length;
  else record.detail.splits.push({ name: split, rows: parsedRows.length });

  record.detail.rows = Object.values(record.splitRows).reduce((sum, r) => sum + r.length, 0);
  record.detail.updatedAt = new Date().toISOString();

  return {
    split,
    rows: parsedRows.length,
    columns,
    file: file.name,
  };
}
