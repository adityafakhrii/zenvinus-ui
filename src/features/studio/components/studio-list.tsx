import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { listStudioDatasets } from '../services/studio-api';
import { DATA_TYPE_OPTIONS, studioBase } from '../constants';
import { formatDate } from '@/utils/format';
import { useT } from '@/i18n';

const STATUS_LABEL: Readonly<Record<string, string>> = { draft: 'Draft', published: 'Published', archived: 'Archived' };
const STATUS_HINT: Readonly<Record<string, string>> = {
  draft: 'Only studio users can see it',
  published: 'Visible on the public Datasets page',
  archived: 'Hidden from the public Datasets page',
};
const TYPE_LABEL: Readonly<Record<string, string>> = Object.fromEntries(DATA_TYPE_OPTIONS);

/** [icon, title, text]; title and text are English i18n keys */
const STEPS: ReadonlyArray<readonly [string, string, string]> = [
  ['fa-solid fa-pen-to-square', 'Create a dataset', 'Give it a name, a short summary and a license.'],
  ['fa-solid fa-file-csv', 'Upload the data', 'Upload a CSV file. Each file becomes a split, such as train or test.'],
  ['fa-solid fa-globe', 'Publish', 'The dataset then appears on the public Datasets page.'],
];

const StudioList = () => {
  const base = studioBase(useRouter().pathname);
  const { t, locale } = useT();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['studio', 'datasets'], queryFn: listStudioDatasets });
  const datasets = data?.data || [];

  return (
    <>
      <div className="studio-toolbar">
        <p className="studio-sub">{t('Add your own datasets to the catalog and look through the data in each one.')}</p>
        {data?.canCreate && (
          <Link href={`${base}/edit`} className="hf-primary studio-btn">
            <i className="fa-solid fa-plus"></i> {t('New dataset')}
          </Link>
        )}
      </div>

      {data?.canCreate && (
        <ol className="studio-steps" aria-label={t('How to add a dataset')}>
          {STEPS.map(([icon, title, text], i) => (
            <li key={title} className="studio-step">
              <span className="studio-step-num">{i + 1}</span>
              <div>
                <strong><i className={icon}></i> {t(title)}</strong>
                <p>{t(text)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {isLoading && <div className="tflow-loading"><span className="spinner-border"></span></div>}
      {isError && <p className="pf2-empty">{t('Failed to load datasets: {error}', { error: t(error?.message ?? '') })}</p>}
      {!isLoading && !isError && datasets.length === 0 && (
        <p className="pf2-empty">{t('No datasets yet.')}{data?.canCreate && <> {t('Click {button} to add the first one.', { button: <strong>{t('New dataset')}</strong> })}</>}</p>
      )}
      {datasets.length > 0 && (
        <div className="hf-card">
          <div className="hf-viewer">
            <table>
              <thead>
                <tr><th>{t('Dataset')}</th><th>{t('Status')}</th><th>{t('Type')}</th><th title={t('Parts of the dataset, such as train and test')}>{t('Splits')}</th><th>{t('Rows')}</th><th>{t('Updated')}</th><th></th></tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.id}>
                    <td><Link href={`${base}/explore?slug=${d.slug}`}><strong>{d.name}</strong></Link></td>
                    <td>
                      <span className={`studio-status studio-status-${d.status}`} title={t(STATUS_HINT[d.status])}>{t(STATUS_LABEL[d.status] || d.status)}</span>
                    </td>
                    <td>{t(TYPE_LABEL[d.dataType] || d.dataType)}</td>
                    <td>{d.splits.length ? d.splits.map((s) => s.name).join(', ') : <span className="studio-muted">{t('No data yet')}</span>}</td>
                    <td>{d.rows.toLocaleString(locale)}</td>
                    <td>{formatDate(d.updatedAt)}</td>
                    <td>
                      <div className="studio-row-actions">
                        <Link href={`${base}/explore?slug=${d.slug}`} className="studio-btn studio-btn-light studio-btn-sm">
                          <i className="fa-solid fa-table"></i> {t('View data')}
                        </Link>
                        {d.canEdit && (
                          <Link href={`${base}/edit?slug=${d.slug}`} className="studio-btn studio-btn-light studio-btn-sm">
                            <i className="fa-solid fa-pen"></i> {t('Edit')}
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default StudioList;
