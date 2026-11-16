import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  Calendar,
  Check,
  Copy,
  Database,
  Download,
  FileText,
  FolderOpen,
  HardDrive,
  Info,
  Layers,
  Quote,
  Scale,
  Table2,
  Tag,
  Users,
} from 'lucide-react';
import type { UrlObject } from 'url';
import CardMarkdown from '@/components/common/card-markdown';
import { Badge, BentoSkeleton, Button, EmptyState, cn } from '@/components/ui';
import { STUDIO_PERMS } from '@/config/permissions';
import { studioBase } from '@/config/routes';
import { useAuth } from '@/features/auth';
import { useT } from '@/i18n';
import { formatBytes, formatDate } from '@/utils/format';
import { downloadAsset, fetchAssetBySlug } from '../../services/catalog-api';
import type { AssetKind } from '../../types/asset';
import ViewerCell from './viewer-cell';

type DetailTab = 'card' | 'viewer' | 'files';

export interface AssetDetailsAreaProps {
  res?: AssetKind;
}

/**
 * Clean Hugging-Face-inspired Dataset & Model Detail screen using Zenvinus Tailwind tokens.
 */
const AssetDetailsArea = ({ res = 'Dataset' }: AssetDetailsAreaProps) => {
  const { t, locale } = useT();
  const router = useRouter();
  const { can } = useAuth();
  const [dlError, setDlError] = useState('');
  const [copiedCitation, setCopiedCitation] = useState(false);

  const slug = router.isReady && typeof router.query.slug === 'string' ? router.query.slug : null;
  const label = res === 'Model' ? 'Model' : 'Dataset';
  const isModel = label === 'Model';
  const backLabel = isModel ? t('Back to Models') : t('Back to Datasets');
  const backLink = router.pathname.startsWith('/dashboard')
    ? '/dashboard/datasets'
    : res === 'Model'
      ? '/models'
      : '/datasets';

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['asset', res, slug],
    queryFn: () => fetchAssetBySlug(res, slug ?? ''),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const dlMutation = useMutation({
    mutationFn: () =>
      asset ? downloadAsset(res, asset.id) : Promise.reject(new Error('Download failed.')),
    onSuccess: (data) => {
      setDlError('');
      const files = data?.data?.files || [];
      if (files.length === 0) {
        setDlError('No files available for download yet.');
      }
    },
    onError: (err) => setDlError(err.message || 'Download failed.'),
  });

  if (!router.isReady || isLoading) {
    return (
      <section className="min-h-screen bg-canvas py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BentoSkeleton />
        </div>
      </section>
    );
  }

  const hasViewer = res === 'Dataset' && (!!asset?.preview || (asset?.splits || []).length > 0);
  const requestedTab = router.query.tab;
  const tab: DetailTab =
    requestedTab === 'files' || (requestedTab === 'viewer' && hasViewer) ? requestedTab : 'card';

  const tabHref = (name: DetailTab): UrlObject => {
    const { tab: _ignored, ...rest } = router.query;
    return { pathname: router.pathname, query: name === 'card' ? rest : { ...rest, tab: name } };
  };

  const totalFileBytes = (asset?.files || []).reduce((sum, f) => sum + (f.sizeBytes || 0), 0);

  if (isError || !asset) {
    return (
      <section className="min-h-[70vh] bg-canvas py-16">
        <div className="mx-auto max-w-[720px] px-4">
          <EmptyState
            title={isModel ? t('Model not found.') : t('Dataset not found.')}
            action={
              <Button href={backLink} variant="primary" size="sm">
                {backLabel}
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  const copyCitation = async () => {
    if (!asset.citation) return;
    try {
      await navigator.clipboard.writeText(asset.citation);
      setCopiedCitation(true);
      window.setTimeout(() => setCopiedCitation(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <section className="min-h-screen bg-canvas py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link
          href={backLink}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{backLabel}</span>
        </Link>

        {/* Repository Header Card */}
        <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-ink/20 bg-tint-cyan font-mono text-base font-semibold text-teal-ink">
                Z
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs text-ink-muted">
                  {asset.organization ? `${asset.organization} / ` : 'zenvinus / '}
                  {res.toLowerCase()}s
                </div>
                <h1 className="mt-1 mb-0 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
                  {asset.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {asset.license && <Badge tone="neutral">{asset.license}</Badge>}
                  {asset.unit && <Badge tone="blue" mono>{asset.unit}</Badge>}
                  <Badge tone="purple">{asset.dtype}</Badge>
                  {asset.quality > 0 && (
                    <Badge tone="mint" dot mono>
                      {t('Quality {score}', { score: asset.quality })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {res === 'Dataset' && can(STUDIO_PERMS.explore) && (
                <Button
                  href={`${studioBase(router.pathname)}/explore?slug=${asset.slug}`}
                  variant="secondary"
                  size="md"
                  leftIcon={<Table2 className="h-4 w-4" strokeWidth={1.5} />}
                >
                  {t('Open in Studio')}
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={dlMutation.isPending}
                onClick={() => dlMutation.mutate()}
                leftIcon={<Download className="h-4 w-4" strokeWidth={1.6} />}
              >
                {dlMutation.isPending ? t('Preparing…') : t('Download')}
              </Button>
            </div>
          </div>

          {dlError && (
            <p
              role="alert"
              className="mt-4 mb-0 rounded-xl border border-tone-red-fg/25 bg-tone-red-bg/40 px-4 py-2.5 text-xs font-medium text-tone-red-ink"
            >
              {t(dlError)}
            </p>
          )}

          {/* Custom Pill Tabs */}
          <nav
            aria-label={isModel ? t('Model sections') : t('Dataset sections')}
            className="mt-6 flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-4"
          >
            <Link
              href={tabHref('card')}
              shallow
              scroll={false}
              aria-current={tab === 'card' ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-[10px] px-3.5 text-[13px] font-medium no-underline transition-colors',
                tab === 'card'
                  ? 'bg-navy text-white'
                  : 'text-ink-secondary hover:bg-canvas hover:text-ink',
              )}
            >
              <FileText className="h-4 w-4" strokeWidth={1.5} />
              <span>{isModel ? t('Model card') : t('Dataset card')}</span>
            </Link>

            {hasViewer && (
              <Link
                href={tabHref('viewer')}
                shallow
                scroll={false}
                aria-current={tab === 'viewer' ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-[10px] px-3.5 text-[13px] font-medium no-underline transition-colors',
                  tab === 'viewer'
                    ? 'bg-navy text-white'
                    : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                )}
              >
                <Table2 className="h-4 w-4" strokeWidth={1.5} />
                <span>{t('Dataset viewer')}</span>
              </Link>
            )}

            <Link
              href={tabHref('files')}
              shallow
              scroll={false}
              aria-current={tab === 'files' ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-[10px] px-3.5 text-[13px] font-medium no-underline transition-colors',
                tab === 'files'
                  ? 'bg-navy text-white'
                  : 'text-ink-secondary hover:bg-canvas hover:text-ink',
              )}
            >
              <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
              <span>{t('Files and versions')}</span>
            </Link>
          </nav>
        </div>

        {/* Main Detail + Metadata Rail */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-8">
            {tab === 'card' && (
              <>
                <div
                  id="card"
                  className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8"
                >
                  <div className="mb-4 flex items-center gap-2 border-b border-line-subtle pb-3">
                    <FileText className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                    <h2 className="m-0 text-base font-semibold text-ink">
                      {isModel ? t('Model card') : t('Dataset card')}
                    </h2>
                  </div>
                  <div className="text-sm leading-relaxed text-ink-prose sm:text-[15px] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-ink [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-ink [&_blockquote]:pl-4 [&_blockquote]:text-ink-secondary [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0B1220] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed [&_pre]:text-[#E6EDF3] [&_code]:font-mono [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-canvas [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:text-ink">
                    <CardMarkdown markdown={asset.card || asset.desc} />
                  </div>
                </div>

                {asset.citation && (
                  <div
                    id="citation"
                    className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Quote className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                        <h2 className="m-0 text-base font-semibold text-ink">{t('Citation')}</h2>
                      </div>
                      <button
                        type="button"
                        onClick={copyCitation}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line-subtle bg-canvas px-2.5 py-1 text-xs font-medium text-ink-secondary transition-colors hover:text-ink cursor-pointer"
                      >
                        {copiedCitation ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />
                            <span className="text-teal-ink">{t('Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
                            <span>{t('Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="m-0 overflow-x-auto rounded-xl bg-[#0B1220] p-4 font-mono text-xs leading-relaxed text-[#E6EDF3]">
                      <code>{asset.citation}</code>
                    </pre>
                  </div>
                )}
              </>
            )}

            {tab === 'viewer' && asset.preview && (
              <div
                id="viewer"
                className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Table2 className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                    <h2 className="m-0 text-base font-semibold text-ink">{t('Dataset viewer')}</h2>
                  </div>
                  <Badge tone="neutral" mono>
                    {asset.preview.split}
                  </Badge>
                </div>

                <div className="overflow-x-auto rounded-xl border border-line-subtle">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-canvas">
                      <tr className="border-b border-line-subtle text-xs font-medium text-ink-secondary">
                        {(asset.preview.columns || []).map((col) => (
                          <th key={col} className="px-3.5 py-2.5 font-mono font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-subtle bg-surface">
                      {(asset.preview.rows || []).map((row, i) => (
                        <tr key={i} className="hover:bg-canvas/60">
                          {row.map((cell, j) => (
                            <ViewerCell
                              key={j}
                              column={asset.preview?.columns?.[j]}
                              value={cell}
                              features={asset.preview?.features}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-3 mb-0 text-xs text-ink-muted">
                  {t('Preview of split {split} — showing the first {count} rows.', {
                    split: <strong className="font-semibold text-ink">{asset.preview.split}</strong>,
                    count: asset.preview.rows?.length || 0,
                  })}
                </p>
              </div>
            )}

            {tab === 'viewer' && (asset.splits || []).length > 0 && (
              <div
                id="splits"
                className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                  <h2 className="m-0 text-base font-semibold text-ink">{t('Data structure')}</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {asset.splits.map((split) => (
                    <div
                      key={split.name}
                      className="flex items-center justify-between rounded-xl border border-line-subtle bg-canvas px-4 py-3"
                    >
                      <span className="font-mono text-xs font-semibold text-ink">{split.name}</span>
                      <span className="font-mono text-xs text-ink-secondary tabular-nums">
                        {split.rows != null
                          ? t('{count} rows', { count: split.rows.toLocaleString(locale) })
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'files' && (
              <div
                id="files"
                className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]"
              >
                <div className="mb-4 flex items-center justify-between gap-2 border-b border-line-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                    <h2 className="m-0 text-base font-semibold text-ink">
                      {t('Files and versions')}
                    </h2>
                  </div>
                  {(asset.files || []).length > 0 && (
                    <span className="font-mono text-xs text-ink-muted tabular-nums">
                      {t('{count} files', { count: asset.files.length })} · {formatBytes(totalFileBytes)}
                    </span>
                  )}
                </div>

                {(asset.files || []).length === 0 ? (
                  <p className="m-0 text-sm text-ink-muted">{t('No files uploaded yet.')}</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
                    {(asset.files || []).map((file) => (
                      <li key={file.path} className="flex items-center justify-between gap-4 py-3">
                        <span className="flex min-w-0 items-center gap-2.5 text-sm text-ink">
                          <FileText className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.5} />
                          <span className="truncate font-mono text-xs">{file.path}</span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-ink-secondary tabular-nums">
                          {file.sizeLabel || formatBytes(file.sizeBytes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right Metadata Rail */}
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <h2 className="m-0 text-base font-semibold text-ink">{t('Metadata')}</h2>
              </div>

              <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0 text-[13px]">
                <li className="flex items-center justify-between gap-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-ink-secondary">
                    <Download className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                    <span>{t('Downloads')}</span>
                  </span>
                  <span className="font-mono font-semibold text-ink tabular-nums">
                    {asset.downloads.toLocaleString(locale)}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-ink-secondary">
                    <Scale className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                    <span>{t('License')}</span>
                  </span>
                  <span className="font-semibold text-ink">{asset.license || '—'}</span>
                </li>
                {asset.unit && (
                  <li className="flex items-center justify-between gap-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-ink-secondary">
                      <Database className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      <span>{t('Size')}</span>
                    </span>
                    <span className="font-mono font-semibold text-ink tabular-nums">{asset.unit}</span>
                  </li>
                )}
                {asset.sizeLabel && (
                  <li className="flex items-center justify-between gap-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-ink-secondary">
                      <HardDrive className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      <span>{t('Disk')}</span>
                    </span>
                    <span className="font-mono font-semibold text-ink tabular-nums">
                      {asset.sizeLabel}
                    </span>
                  </li>
                )}
                {asset.quality > 0 && (
                  <li className="flex items-center justify-between gap-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-ink-secondary">
                      <Award className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      <span>{t('Quality')}</span>
                    </span>
                    <span className="font-mono font-semibold text-teal-ink tabular-nums">
                      {asset.quality}
                    </span>
                  </li>
                )}
                {asset.publishedAt && (
                  <li className="flex items-center justify-between gap-3 py-2.5">
                    <span className="inline-flex items-center gap-2 text-ink-secondary">
                      <Calendar className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      <span>{t('Published')}</span>
                    </span>
                    <span className="font-semibold text-ink">{formatDate(asset.publishedAt)}</span>
                  </li>
                )}
                <li className="flex items-center justify-between gap-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-ink-secondary">
                    <Users className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                    <span>{t('Source')}</span>
                  </span>
                  <span className="font-semibold text-ink">{asset.organization || t('Community')}</span>
                </li>
              </ul>
            </div>

            {asset.tags.length > 0 && (
              <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                  <h2 className="m-0 text-base font-semibold text-ink">{t('Tags')}</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default AssetDetailsArea;
