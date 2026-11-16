import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { FilePenLine, FileSpreadsheet, Globe, Pencil, Plus, Table2 } from 'lucide-react';
import { listStudioDatasets } from '../services/studio-api';
import { DATA_TYPE_OPTIONS, studioBase } from '../constants';
import { formatDate } from '@/utils/format';
import { useT } from '@/i18n';
import { Badge, Button, EmptyState, ErrorState, TableSkeleton, type BadgeTone } from '@/components/ui';

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
  draft: 'Only studio users can see it',
  published: 'Visible on the public Datasets page',
  archived: 'Hidden from the public Datasets page',
};

const TYPE_LABEL: Readonly<Record<string, string>> = Object.fromEntries(DATA_TYPE_OPTIONS);

const STEPS = [
  { Icon: FilePenLine, title: 'Create a dataset', text: 'Give it a name, a short summary and a license.' },
  { Icon: FileSpreadsheet, title: 'Upload the data', text: 'Upload a CSV file. Each file becomes a split, such as train or test.' },
  { Icon: Globe, title: 'Publish', text: 'The dataset then appears on the public Datasets page.' },
] as const;

const StudioList = () => {
  const base = studioBase(useRouter().pathname);
  const { t, locale } = useT();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['studio', 'datasets'],
    queryFn: listStudioDatasets,
  });
  const datasets = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 text-sm text-ink-muted">
          {t('Add your own datasets to the catalog and look through the data in each one.')}
        </p>
        {data?.canCreate && (
          <Button variant="primary" href={`${base}/edit`} leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}>
            {t('New dataset')}
          </Button>
        )}
      </div>

      {data?.canCreate && (
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3" aria-label={t('How to add a dataset')}>
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-4">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy font-mono text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <strong className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Icon className="h-4 w-4 text-teal-ink" strokeWidth={1.75} />
                  {t(title)}
                </strong>
                <p className="mt-1 mb-0 text-xs leading-relaxed text-ink-muted">{t(text)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {isLoading && <TableSkeleton />}

      {isError && (
        <ErrorState
          title={t('Failed to load datasets: {error}', { error: t(error?.message ?? '') })}
          message={t(error?.message ?? '')}
        />
      )}

      {!isLoading && !isError && datasets.length === 0 && (
        <EmptyState
          title={t('No datasets yet.')}
          description={
            data?.canCreate
              ? `${t('New dataset')}`
              : undefined
          }
          action={
            data?.canCreate ? (
              <Button variant="primary" href={`${base}/edit`} leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}>
                {t('New dataset')}
              </Button>
            ) : undefined
          }
        />
      )}

      {datasets.length > 0 && (
        <>
          {/* Mobile card list (< md) */}
          <div className="divide-y divide-line-subtle overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white md:hidden">
            {datasets.map((d) => (
              <div key={d.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`${base}/explore?slug=${d.slug}`}
                      className="block truncate text-sm font-semibold text-ink hover:text-teal-ink"
                    >
                      {d.name}
                    </Link>
                    <span className="text-xs text-ink-muted">{t(TYPE_LABEL[d.dataType] || d.dataType)}</span>
                  </div>
                  <span title={t(STATUS_HINT[d.status] || '')} className="shrink-0">
                    <Badge tone={STATUS_TONE[d.status] || 'neutral'} dot>
                      {t(STATUS_LABEL[d.status] || d.status)}
                    </Badge>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary">
                  <span className="truncate">
                    {d.splits.length ? (
                      <span className="font-mono">{d.splits.map((s) => s.name).join(', ')}</span>
                    ) : (
                      <span className="text-ink-subtle">{t('No data yet')}</span>
                    )}
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-ink">
                    {d.rows.toLocaleString(locale)} {t('Rows')}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-ink-muted">{formatDate(d.updatedAt)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      href={`${base}/explore?slug=${d.slug}`}
                      leftIcon={<Table2 className="h-3.5 w-3.5" strokeWidth={1.6} />}
                    >
                      {t('View data')}
                    </Button>
                    {d.canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        href={`${base}/edit?slug=${d.slug}`}
                        leftIcon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.6} />}
                      >
                        {t('Edit')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table (>= md) */}
          <div className="hidden overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgba(8,13,53,0.08)] bg-canvas text-xs font-semibold text-ink-muted">
                    <th className="px-5 py-3.5">{t('Dataset')}</th>
                    <th className="px-4 py-3.5">{t('Status')}</th>
                    <th className="px-4 py-3.5">{t('Type')}</th>
                    <th className="px-4 py-3.5" title={t('Parts of the dataset, such as train and test')}>
                      {t('Splits')}
                    </th>
                    <th className="px-4 py-3.5">{t('Rows')}</th>
                    <th className="px-4 py-3.5">{t('Updated')}</th>
                    <th className="px-5 py-3.5 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle">
                  {datasets.map((d) => (
                    <tr key={d.id} className="transition-colors hover:bg-surface-soft">
                      <td className="px-5 py-3.5 font-semibold text-ink">
                        <Link href={`${base}/explore?slug=${d.slug}`} className="hover:text-teal-ink">
                          {d.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span title={t(STATUS_HINT[d.status] || '')}>
                          <Badge tone={STATUS_TONE[d.status] || 'neutral'} dot>
                            {t(STATUS_LABEL[d.status] || d.status)}
                          </Badge>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-secondary">{t(TYPE_LABEL[d.dataType] || d.dataType)}</td>
                      <td className="px-4 py-3.5 text-xs text-ink-secondary">
                        {d.splits.length ? (
                          <span className="font-mono">{d.splits.map((s) => s.name).join(', ')}</span>
                        ) : (
                          <span className="text-ink-subtle">{t('No data yet')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold tabular-nums text-ink">
                        {d.rows.toLocaleString(locale)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted">{formatDate(d.updatedAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            href={`${base}/explore?slug=${d.slug}`}
                            leftIcon={<Table2 className="h-3.5 w-3.5" strokeWidth={1.6} />}
                          >
                            {t('View data')}
                          </Button>
                          {d.canEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              href={`${base}/edit?slug=${d.slug}`}
                              leftIcon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.6} />}
                            >
                              {t('Edit')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudioList;
