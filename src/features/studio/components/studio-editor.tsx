import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/services/api';
import { createStudioDataset, getStudioDataset, getStudioLicenses, importStudioCsv, updateStudioDataset } from '../services/studio-api';
import { DATA_TYPE_OPTIONS, STUDIO_PERMS, studioBase } from '../constants';
import type { ImportResult, StudioDatasetDetail, StudioDatasetInput } from '../types/studio';
import { useT } from '@/i18n';

/** The editable fields of step 1 */
interface DetailsForm {
  name: string;
  summary: string;
  card: string;
  dataType: string;
  license: string;
}

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const EMPTY: DetailsForm = { name: '', summary: '', card: '', dataType: 'tabular', license: '' };
const SPLIT_PATTERN = /^[a-z0-9][a-z0-9_-]{0,49}$/;

const STATUS_LABEL: Readonly<Record<string, string>> = { draft: 'Draft', published: 'Published', archived: 'Archived' };
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
    <section className="hf-card studio-step-card">
      <h4 className="hf-section-title">
        <span className={`studio-step-num${done ? ' is-done' : ''}`}>{done ? <i className="fa-solid fa-check"></i> : number}</span>
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
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useMutation({
    mutationFn: (selected: File) => importStudioCsv(dataset.slug, split, selected),
    onSuccess: (res) => {
      setResult(res);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onImported();
    },
  });
  const splitValid = SPLIT_PATTERN.test(split);
  const replaces = dataset.splits.find((s) => s.name === split);

  return (
    <>
      {dataset.splits.length > 0 ? (
        <div className="hf-viewer studio-splits">
          <table>
            <thead><tr><th>{t('Split')}</th><th>{t('Rows')}</th><th></th></tr></thead>
            <tbody>
              {dataset.splits.map((s) => (
                <tr key={s.name}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.rows.toLocaleString(locale)}</td>
                  <td><Link href={`${base}/explore?slug=${dataset.slug}&split=${s.name}`}>{t('View data')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="studio-callout"><i className="fa-solid fa-circle-info"></i><span>{t('This dataset has no data yet. Upload a CSV file below.')}</span></p>
      )}

      <form className="studio-form" onSubmit={(e) => { e.preventDefault(); setResult(null); if (file) mutation.mutate(file); }}>
        <div className="studio-form-row">
          <label>
            <span>{t('CSV file')}</span>
            <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            <em className="studio-hint">{t('The first line must hold the column names. Up to {size} and {rows} rows.', { size: '25 MB', rows: (50000).toLocaleString(locale) })}</em>
          </label>
          <label>
            <span>{t('Upload as split')}</span>
            <input value={split} onChange={(e) => setSplit(e.target.value.trim().toLowerCase())} list="studio-splits" maxLength={50} required />
            <datalist id="studio-splits">
              {['train', 'validation', 'test', ...dataset.splits.map((s) => s.name)].filter((v, i, a) => a.indexOf(v) === i).map((s) => <option key={s} value={s} />)}
            </datalist>
            {splitValid
              ? <em className="studio-hint">{t('A split is one part of the dataset: {train} to learn from, {validation} and {test} to check results. With a single file, keep {train}.', { train: <b>train</b>, validation: <b>validation</b>, test: <b>test</b> })}</em>
              : <em className="studio-error">{t('Use lowercase letters, digits, - and _ only.')}</em>}
          </label>
        </div>
        {file && replaces && splitValid && (
          <p className="studio-callout studio-callout-warn">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{t('The split {split} already has {rows} rows. Uploading replaces them. Type another name to add a new split instead.', { split: <b>{split}</b>, rows: replaces.rows.toLocaleString(locale) })}</span>
          </p>
        )}
        <div className="studio-form-actions">
          <button type="submit" className="hf-primary studio-btn" disabled={!file || !splitValid || mutation.isPending}>
            <i className="fa-solid fa-upload"></i> {mutation.isPending ? t('Uploading…') : t('Upload CSV')}
          </button>
          {!file && <span className="studio-hint">{t('Choose a file first.')}</span>}
        </div>
      </form>
      {mutation.isError && <p className="studio-error" role="alert">{t(mutation.error.message)}</p>}
      {result && (
        <p className="studio-success" role="status">
          <i className="fa-solid fa-check"></i>{' '}
          {t('Uploaded {rows} rows into {split}, with columns {columns}.', {
            rows: result.rows.toLocaleString(locale),
            split: <strong>{result.split}</strong>,
            columns: result.columns.map((c) => `${c.name} (${c.type})`).join(', '),
          })}{' '}
          <Link href={`${base}/explore?slug=${dataset.slug}&split=${result.split}`}>{t('View data')}</Link>
        </p>
      )}
      <p className="studio-hint">{t('The original file is kept and listed under Files and versions on the dataset page.')}</p>
    </>
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
  const datasetQuery = useQuery({ queryKey: ['studio', 'dataset', slug], queryFn: () => getStudioDataset(slug), enabled: !isNew });
  const dataset = datasetQuery.data;

  // WHY: Fill the form once per dataset. Refetches (after a CSV upload or on window focus) must not overwrite unsaved edits
  const loadedSlug = useRef('');
  useEffect(() => {
    if (dataset && loadedSlug.current !== dataset.slug) {
      loadedSlug.current = dataset.slug;
      setForm({ name: dataset.name, summary: dataset.summary || '', card: dataset.card || '', dataType: dataset.dataType || 'tabular', license: dataset.license || '' });
    }
  }, [dataset]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['studio'] });
  };

  const save = useMutation({
    mutationFn: (extra: StudioDatasetInput) => (isNew ? createStudioDataset({ ...form, ...extra }) : updateStudioDataset(slug, { ...form, ...extra })),
    onSuccess: (d, extra) => {
      refresh();
      setSaved(extra?.status === 'published' ? 'Published.' : extra?.status === 'draft' ? 'Moved back to draft.' : 'Saved.');
      if (isNew) router.replace({ pathname: router.pathname, query: { slug: d.slug } }, undefined, { shallow: true });
    },
    onError: () => setSaved(''),
  });

  if (isNew && !(can(STUDIO_PERMS.manage) || can(STUDIO_PERMS.contribute))) {
    return <p className="pf2-empty">{t('Your role can look through datasets but not create them.')}</p>;
  }
  if (!isNew && datasetQuery.isLoading) return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  if (!isNew && datasetQuery.isError) {
    const { error } = datasetQuery;
    return <p className="pf2-empty">{error instanceof ApiError && error.status === 404 ? t('Dataset not found.') : t(error.message)} <Link href={base}>{t('Back to the studio')}</Link></p>;
  }
  if (dataset && !dataset.canEdit) {
    return <p className="pf2-empty">{t('You can view this dataset but not edit it.')} <Link href={`${base}/explore?slug=${slug}`}>{t('View data')}</Link></p>;
  }

  const field = (key: keyof DetailsForm) => ({
    value: form[key],
    onChange: (e: ChangeEvent<FormElement>) => { setSaved(''); setForm({ ...form, [key]: e.target.value }); },
  });
  const rows = dataset ? dataset.splits.reduce((n, s) => n + s.rows, 0) : 0;
  const published = dataset?.status === 'published';
  /** [done, label, what to do, optional]; label and todo are English i18n keys */
  const checklist: ReadonlyArray<readonly [boolean, string, string, boolean?]> = [
    [!!form.name.trim(), 'Name', 'Fill in the name in step 1.'],
    [!!form.license, 'License', 'Choose a license in step 1.'],
    [rows > 0, 'Data', 'Upload a CSV file in step 2. You can publish without data, but the page will be empty.', true],
  ];
  const canPublish = checklist.every(([ok, , , optional]) => ok || optional);

  return (
    <>
      <div className="studio-toolbar">
        <div>
          <Link href={base} className="studio-back"><i className="fa-solid fa-arrow-left"></i> {t('All datasets')}</Link>
          <h4 className="studio-dataset-name">
            {isNew ? t('New dataset') : dataset?.name}{' '}
            {dataset && <span className={`studio-status studio-status-${dataset.status}`}>{t(STATUS_LABEL[dataset.status] || dataset.status)}</span>}
          </h4>
          {dataset && <p className="studio-hint studio-status-hint">{t(STATUS_HINT[dataset.status])}</p>}
        </div>
        {dataset && (
          <div className="studio-actions">
            <Link href={`${base}/explore?slug=${dataset.slug}`} className="studio-btn studio-btn-light"><i className="fa-solid fa-table"></i> {t('View data')}</Link>
            {published && <Link href={`/dataset-details?slug=${dataset.slug}`} className="studio-btn studio-btn-light"><i className="fa-solid fa-arrow-up-right-from-square"></i> {t('Public page')}</Link>}
          </div>
        )}
      </div>

      <Step number={1} title={t('Details')} done={!!dataset}>
        <form className="studio-form" onSubmit={(e) => { e.preventDefault(); save.mutate({}); }}>
          <label>
            <span>{t('Name')}</span>
            <input {...field('name')} required minLength={3} maxLength={300} placeholder={t('e.g. {example}', { example: 'Ulasan Produk Bahasa Indonesia' })} />
            {isNew && form.name && <em className="studio-hint">{t('Page address:')} /dataset-details?slug={form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</em>}
          </label>
          <label>
            <span>{t('Summary')}</span>
            <input {...field('summary')} maxLength={1000} placeholder={t('e.g. 50,000 product reviews labeled with sentiment')} />
          </label>
          <div className="studio-form-row">
            <label>
              <span>{t('Data type')}</span>
              <select {...field('dataType')}>
                {DATA_TYPE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}
              </select>
            </label>
            <label>
              <span>{t('License')}</span>
              <select {...field('license')}>
                <option value="">{t('Choose a license…')}</option>
                {(licenses.data || []).map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </select>
              <em className="studio-hint">{t('Says how others may use the data. Needed to publish.')}</em>
            </label>
          </div>
          <label>
            <span>{t('Description')} <small className="studio-muted">{t('(optional, shown on the dataset page)')}</small></span>
            <textarea {...field('card')} rows={12} maxLength={100000}
              placeholder={t('## Dataset summary\n\nWhat it contains, where it comes from, and what it is for.\n\n## Limitations\n\n- ...')} />
            <em className="studio-hint">{t('Use ## for headings, - for lists, and a blank line between paragraphs.')}</em>
          </label>
          <div className="studio-form-actions">
            <button type="submit" className="hf-primary studio-btn" disabled={save.isPending}>
              <i className="fa-solid fa-floppy-disk"></i> {save.isPending ? t('Saving…') : isNew ? t('Create dataset') : t('Save details')}
            </button>
            {save.isError && <span className="studio-error" role="alert">{t(save.error.message)}</span>}
            {saved && <span className="studio-success" role="status"><i className="fa-solid fa-check"></i> {t(saved)}</span>}
          </div>
        </form>
      </Step>

      <Step number={2} title={t('Upload the data')} done={rows > 0}>
        {dataset
          ? <DataStep dataset={dataset} onImported={refresh} />
          : <p className="studio-callout"><i className="fa-solid fa-lock"></i><span>{t('Create the dataset in step 1 first. Then you can upload CSV files here.')}</span></p>}
      </Step>

      <Step number={3} title={t('Publish')} done={published}>
        {!dataset ? (
          <p className="studio-callout"><i className="fa-solid fa-lock"></i><span>{t('Available after you create the dataset.')}</span></p>
        ) : (
          <>
            <ul className="studio-checklist">
              {checklist.map(([ok, label, todo, optional]) => (
                <li key={label} className={ok ? 'is-ok' : optional ? 'is-warn' : 'is-missing'}>
                  <i className={ok ? 'fa-solid fa-circle-check' : optional ? 'fa-solid fa-circle-exclamation' : 'fa-regular fa-circle'}></i>
                  <span><b>{t(label)}</b>{ok ? '' : ` — ${t(todo)}`}</span>
                </li>
              ))}
            </ul>
            <div className="studio-form-actions">
              {published ? (
                <>
                  <span className="studio-success"><i className="fa-solid fa-globe"></i> {t('This dataset is public.')}</span>
                  <button type="button" className="studio-btn studio-btn-light" disabled={save.isPending} onClick={() => save.mutate({ status: 'draft' })}>
                    {t('Unpublish')}
                  </button>
                </>
              ) : (
                <button type="button" className="hf-primary studio-btn" disabled={!canPublish || save.isPending} onClick={() => save.mutate({ status: 'published' })}>
                  <i className="fa-solid fa-globe"></i> {t('Publish')}
                </button>
              )}
              {!published && !canPublish && <span className="studio-hint">{t('Complete the items above to publish.')}</span>}
            </div>
          </>
        )}
      </Step>
    </>
  );
};

export default StudioEditor;
