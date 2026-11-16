import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Globe,
  Info,
  Lock,
  Save,
  Table2,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/services/api';
import {
  createStudioDataset,
  getStudioDataset,
  getStudioLicenses,
  importStudioCsv,
  updateStudioDataset,
} from '../services/studio-api';
import { DATA_TYPE_OPTIONS, STUDIO_PERMS, studioBase } from '../constants';
import type { ImportResult, StudioDatasetDetail, StudioDatasetInput } from '../types/studio';
import { useT } from '@/i18n';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomSelect,
  EmptyState,
  ErrorState,
  FileDropzone,
  TextInput,
  Textarea,
  type BadgeTone,
} from '@/components/ui';

/** The editable fields of step 1 */
interface DetailsForm {
  name: string;
  summary: string;
  card: string;
  dataType: string;
  license: string;
}

const EMPTY: DetailsForm = { name: '', summary: '', card: '', dataType: 'tabular', license: '' };
const SPLIT_PATTERN = /^[a-z0-9][a-z0-9_-]{0,49}$/;

const STATUS_LABEL: Readonly<Record<string, string>> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_TONE: Readonly<Record<string, BadgeTone>> = {
  draft: 'amber',
  published: 'mint',
  archived: 'neutral',
};

const STATUS_HINT: Readonly<Record<string, string>> = {
  draft: 'Draft: only studio users can see this dataset.',
  published: 'Published: anyone can see this dataset on the public Datasets page.',
  archived: 'Archived: hidden from the public Datasets page.',
};

interface StepProps {
  number: number;
  title: string;
  done: boolean;
  children: ReactNode;
}

function Step({ number, title, done, children }: StepProps) {
  return (
    <section className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-5 sm:p-6">
      <h4 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-ink">
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
            done ? 'bg-teal text-white' : 'bg-navy text-white'
          }`}
        >
          {done ? <Check className="h-4 w-4" strokeWidth={2.25} /> : number}
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}

interface DataStepProps {
  dataset: StudioDatasetDetail;
  onImported: () => void;
}

function DataStep({ dataset, onImported }: DataStepProps) {
  const base = studioBase(useRouter().pathname);
  const { t, locale } = useT();
  const [split, setSplit] = useState(dataset.splits[0]?.name || 'train');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const mutation = useMutation({
    mutationFn: (selected: File) => importStudioCsv(dataset.slug, split, selected),
    onSuccess: (res) => {
      setResult(res);
      setFile(null);
      onImported();
    },
  });

  const splitValid = SPLIT_PATTERN.test(split);
  const replaces = dataset.splits.find((s) => s.name === split);
  const splitPresets = ['train', 'validation', 'test', ...dataset.splits.map((s) => s.name)].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <div className="space-y-5">
      {dataset.splits.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-[rgba(8,13,53,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(8,13,53,0.08)] bg-canvas text-xs font-semibold text-ink-muted">
                  <th className="px-4 py-2.5">{t('Split')}</th>
                  <th className="px-4 py-2.5">{t('Rows')}</th>
                  <th className="px-4 py-2.5 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {dataset.splits.map((s) => (
                  <tr key={s.name}>
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-ink">{s.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-ink-secondary">
                      {s.rows.toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`${base}/explore?slug=${dataset.slug}&split=${s.name}`}
                        className="text-xs font-medium text-teal-ink hover:underline"
                      >
                        {t('View data')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(8,13,53,0.08)] bg-canvas px-4 py-3 text-xs text-ink-secondary">
          <Info className="h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />
          <span>{t('This dataset has no data yet. Upload a CSV file below.')}</span>
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(null);
          if (file) mutation.mutate(file);
        }}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FileDropzone
            label={t('CSV file')}
            hint={t('The first line must hold the column names. Up to {size} and {rows} rows.', {
              size: '25 MB',
              rows: (50000).toLocaleString(locale),
            })}
            accept=".csv,text/csv"
            files={file ? [file] : []}
            onFilesChange={(files) => setFile(files[0] ?? null)}
          />

          <div className="space-y-2.5">
            <TextInput
              label={t('Upload as split')}
              value={split}
              onChange={(e) => setSplit(e.target.value.trim().toLowerCase())}
              maxLength={50}
              required
              error={!splitValid ? t('Use lowercase letters, digits, - and _ only.') : undefined}
            />
            <div className="flex flex-wrap gap-1.5">
              {splitPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSplit(preset)}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    split === preset
                      ? 'border-navy bg-navy text-white'
                      : 'border-line bg-canvas text-ink-secondary hover:border-line-input hover:bg-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            {splitValid && (
              <p className="m-0 text-xs text-ink-muted">
                {t('A split is one part of the dataset: {train} to learn from, {validation} and {test} to check results. With a single file, keep {train}.', {
                  train: <strong className="font-mono text-ink">train</strong>,
                  validation: <strong className="font-mono text-ink">validation</strong>,
                  test: <strong className="font-mono text-ink">test</strong>,
                })}
              </p>
            )}
          </div>
        </div>

        {file && replaces && splitValid && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} />
            <span>
              {t('The split {split} already has {rows} rows. Uploading replaces them. Type another name to add a new split instead.', {
                split: <strong className="font-mono">{split}</strong>,
                rows: replaces.rows.toLocaleString(locale),
              })}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!file || !splitValid || mutation.isPending}
            loading={mutation.isPending}
            leftIcon={<Upload className="h-4 w-4" strokeWidth={1.75} />}
          >
            {mutation.isPending ? t('Uploading…') : t('Upload CSV')}
          </Button>
          {!file && <span className="text-xs text-ink-subtle">{t('Choose a file first.')}</span>}
        </div>
      </form>

      {mutation.isError && (
        <p className="m-0 text-xs font-medium text-[#DC2626]" role="alert">
          {t(mutation.error.message)}
        </p>
      )}

      {result && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900"
          role="status"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
          <span>
            {t('Uploaded {rows} rows into {split}, with columns {columns}.', {
              rows: result.rows.toLocaleString(locale),
              split: <strong className="font-mono">{result.split}</strong>,
              columns: result.columns.map((c) => `${c.name} (${c.type})`).join(', '),
            })}{' '}
            <Link
              href={`${base}/explore?slug=${dataset.slug}&split=${result.split}`}
              className="font-semibold underline"
            >
              {t('View data')}
            </Link>
          </span>
        </div>
      )}

      <p className="m-0 text-xs text-ink-muted">
        {t('The original file is kept and listed under Files and versions on the dataset page.')}
      </p>
    </div>
  );
}

const StudioEditor = () => {
  const router = useRouter();
  const base = studioBase(router.pathname);
  const { t } = useT();
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const isNew = !slug;
  const [form, setForm] = useState<DetailsForm>(EMPTY);
  const [saved, setSaved] = useState('');

  const licenses = useQuery({ queryKey: ['studio', 'licenses'], queryFn: getStudioLicenses });
  const datasetQuery = useQuery({
    queryKey: ['studio', 'dataset', slug],
    queryFn: () => getStudioDataset(slug),
    enabled: !isNew,
  });
  const dataset = datasetQuery.data;

  const loadedSlug = useRef('');
  useEffect(() => {
    if (dataset && loadedSlug.current !== dataset.slug) {
      loadedSlug.current = dataset.slug;
      setForm({
        name: dataset.name,
        summary: dataset.summary || '',
        card: dataset.card || '',
        dataType: dataset.dataType || 'tabular',
        license: dataset.license || '',
      });
    }
  }, [dataset]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['studio'] });
  };

  const save = useMutation({
    mutationFn: (extra: StudioDatasetInput) =>
      isNew ? createStudioDataset({ ...form, ...extra }) : updateStudioDataset(slug, { ...form, ...extra }),
    onSuccess: (d, extra) => {
      refresh();
      setSaved(
        extra?.status === 'published' ? 'Published.' : extra?.status === 'draft' ? 'Moved back to draft.' : 'Saved.',
      );
      if (isNew) router.replace({ pathname: router.pathname, query: { slug: d.slug } }, undefined, { shallow: true });
    },
    onError: () => setSaved(''),
  });

  const dataTypeOptions = useMemo(
    () => DATA_TYPE_OPTIONS.map(([v, l]) => ({ value: v, label: t(l) })),
    [t],
  );

  const licenseOptions = useMemo(
    () => [
      { value: '', label: t('Choose a license…') },
      ...(licenses.data || []).map((l) => ({ value: l.slug, label: l.name })),
    ],
    [licenses.data, t],
  );

  if (isNew && !(can(STUDIO_PERMS.manage) || can(STUDIO_PERMS.contribute))) {
    return (
      <EmptyState
        title={t('Your role can look through datasets but not create them.')}
        action={
          <Button variant="secondary" href={base}>
            {t('All datasets')}
          </Button>
        }
      />
    );
  }

  if (!isNew && datasetQuery.isLoading) return <BentoSkeleton />;

  if (!isNew && datasetQuery.isError) {
    const { error } = datasetQuery;
    return (
      <ErrorState
        title={error instanceof ApiError && error.status === 404 ? t('Dataset not found.') : t(error.message)}
        message={t(error.message)}
        onRetry={() => datasetQuery.refetch()}
      />
    );
  }

  if (dataset && !dataset.canEdit) {
    return (
      <EmptyState
        title={t('You can view this dataset but not edit it.')}
        action={
          <Button variant="secondary" href={`${base}/explore?slug=${slug}`}>
            {t('View data')}
          </Button>
        }
      />
    );
  }

  const updateField = (key: keyof DetailsForm, value: string) => {
    setSaved('');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const rows = dataset ? dataset.splits.reduce((n, s) => n + s.rows, 0) : 0;
  const published = dataset?.status === 'published';
  const checklist: ReadonlyArray<readonly [boolean, string, string, boolean?]> = [
    [!!form.name.trim(), 'Name', 'Fill in the name in step 1.'],
    [!!form.license, 'License', 'Choose a license in step 1.'],
    [rows > 0, 'Data', 'Upload a CSV file in step 2. You can publish without data, but the page will be empty.', true],
  ];
  const canPublish = checklist.every(([ok, , , optional]) => ok || optional);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={base}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t('All datasets')}
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">
              {isNew ? t('New dataset') : dataset?.name}
            </h2>
            {dataset && (
              <Badge tone={STATUS_TONE[dataset.status] || 'neutral'} dot>
                {t(STATUS_LABEL[dataset.status] || dataset.status)}
              </Badge>
            )}
          </div>
          {dataset && <p className="mt-1 mb-0 text-xs text-ink-muted">{t(STATUS_HINT[dataset.status])}</p>}
        </div>

        {dataset && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              href={`${base}/explore?slug=${dataset.slug}`}
              leftIcon={<Table2 className="h-3.5 w-3.5" strokeWidth={1.6} />}
            >
              {t('View data')}
            </Button>
            {published && (
              <Button
                variant="secondary"
                size="sm"
                href={`/dataset-details?slug=${dataset.slug}`}
                rightIcon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />}
              >
                {t('Public page')}
              </Button>
            )}
          </div>
        )}
      </div>

      <Step number={1} title={t('Details')} done={!!dataset}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({});
          }}
        >
          <TextInput
            label={t('Name')}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            minLength={3}
            maxLength={300}
            placeholder={t('e.g. {example}', { example: 'Ulasan Produk Bahasa Indonesia' })}
            hint={
              isNew && form.name
                ? `${t('Page address:')} /dataset-details?slug=${form.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')}`
                : undefined
            }
          />

          <TextInput
            label={t('Summary')}
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            maxLength={1000}
            placeholder={t('e.g. 50,000 product reviews labeled with sentiment')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomSelect
              label={t('Data type')}
              options={dataTypeOptions}
              value={form.dataType}
              onChange={(val) => updateField('dataType', val)}
            />

            <CustomSelect
              label={t('License')}
              searchable
              options={licenseOptions}
              value={form.license}
              onChange={(val) => updateField('license', val)}
              hint={t('Says how others may use the data. Needed to publish.')}
            />
          </div>

          <Textarea
            label={`${t('Description')} ${t('(optional, shown on the dataset page)')}`}
            rows={10}
            maxLength={100000}
            value={form.card}
            onChange={(e) => updateField('card', e.target.value)}
            placeholder={t(
              '## Dataset summary\n\nWhat it contains, where it comes from, and what it is for.\n\n## Limitations\n\n- ...',
            )}
            hint={t('Use ## for headings, - for lists, and a blank line between paragraphs.')}
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              disabled={save.isPending}
              loading={save.isPending}
              leftIcon={<Save className="h-4 w-4" strokeWidth={1.6} />}
            >
              {save.isPending ? t('Saving…') : isNew ? t('Create dataset') : t('Save details')}
            </Button>
            {save.isError && (
              <span className="text-xs font-medium text-[#DC2626]" role="alert">
                {t(save.error.message)}
              </span>
            )}
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#059669]" role="status">
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                {t(saved)}
              </span>
            )}
          </div>
        </form>
      </Step>

      <Step number={2} title={t('Upload the data')} done={rows > 0}>
        {dataset ? (
          <DataStep dataset={dataset} onImported={refresh} />
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(8,13,53,0.08)] bg-canvas px-4 py-3 text-xs text-ink-muted">
            <Lock className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            <span>{t('Create the dataset in step 1 first. Then you can upload CSV files here.')}</span>
          </div>
        )}
      </Step>

      <Step number={3} title={t('Publish')} done={published}>
        {!dataset ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(8,13,53,0.08)] bg-canvas px-4 py-3 text-xs text-ink-muted">
            <Lock className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            <span>{t('Available after you create the dataset.')}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2.5">
              {checklist.map(([ok, label, todo, optional]) => (
                <li key={label} className="flex items-start gap-2.5 text-sm">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />
                  ) : optional ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.75} />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                  )}
                  <span className="text-ink-secondary">
                    <strong className="font-semibold text-ink">{t(label)}</strong>
                    {ok ? '' : ` — ${t(todo)}`}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              {published ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#059669]">
                    <Globe className="h-4 w-4" strokeWidth={1.75} />
                    {t('This dataset is public.')}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={save.isPending}
                    onClick={() => save.mutate({ status: 'draft' })}
                  >
                    {t('Unpublish')}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  disabled={!canPublish || save.isPending}
                  loading={save.isPending}
                  leftIcon={<Globe className="h-4 w-4" strokeWidth={1.75} />}
                  onClick={() => save.mutate({ status: 'published' })}
                >
                  {t('Publish')}
                </Button>
              )}
              {!published && !canPublish && (
                <span className="text-xs text-ink-muted">{t('Complete the items above to publish.')}</span>
              )}
            </div>
          </div>
        )}
      </Step>
    </div>
  );
};

export default StudioEditor;
