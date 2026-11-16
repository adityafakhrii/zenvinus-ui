import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { UrlObject } from 'url';
import { fetchAssetBySlug, downloadAsset } from '../../services/catalog-api';
import type { AssetKind } from '../../types/asset';
import { formatDate, formatBytes } from '@/utils/format';
import ViewerCell from './viewer-cell';
import { useAuth } from '@/features/auth';
// WHY: The studio constants module, not the studio index: the studio imports the catalog's viewer cell,
// so going through both indexes would make a cycle
import { STUDIO_PERMS } from '@/config/permissions';
import { studioBase } from '@/config/routes';
import { useT } from '@/i18n';
import CardMarkdown from '@/components/common/card-markdown';

type DetailTab = 'card' | 'viewer' | 'files';

export interface AssetDetailsAreaProps {
  res?: AssetKind;
}

const AssetDetailsArea = ({ res = 'Dataset' }: AssetDetailsAreaProps) => {
  const { t, locale } = useT();
  const router = useRouter();
  const [dlError, setDlError] = useState('');
  const { can } = useAuth();
  const slug = router.isReady && typeof router.query.slug === 'string' ? router.query.slug : null;
  const label = res === 'Model' ? 'Model' : 'Dataset';
  const isModel = label === 'Model';
  const backLabel = isModel ? t('Back to Models') : t('Back to Datasets');
  // WHY: Back links return to the catalog the visitor came from: the public lists, or the dashboard catalog
  const backLink = router.pathname.startsWith('/dashboard')
    ? '/dashboard/datasets'
    : res === 'Model' ? '/models' : '/datasets';

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['asset', res, slug],
    queryFn: () => fetchAssetBySlug(res, slug ?? ''),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const dlMutation = useMutation({
    // The download button only renders once the asset has loaded
    mutationFn: () => (asset ? downloadAsset(res, asset.id) : Promise.reject(new Error('Download failed.'))),
    onSuccess: (data) => {
      setDlError('');
      const files = data?.data?.files || [];
      if (files.length === 0) {
        setDlError('No files available for download yet.');
      }
      // Backend counts the download; file URLs (if any) are in the response.
    },
    onError: (err) => setDlError(err.message || 'Download failed.'),
  });

  if (!router.isReady || isLoading) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  // WHY: Card, viewer and files are separate tabs, like a Hugging Face repo page. The tab lives in the URL
  // (?tab=viewer, ?tab=files) so it can be shared and the browser Back button moves between tabs
  const hasViewer = res === 'Dataset' && (!!asset?.preview || (asset?.splits || []).length > 0);
  const requestedTab = router.query.tab;
  const tab: DetailTab = requestedTab === 'files' || (requestedTab === 'viewer' && hasViewer) ? requestedTab : 'card';
  const tabHref = (name: DetailTab): UrlObject => {
    const { tab: _ignored, ...rest } = router.query;
    return { pathname: router.pathname, query: name === 'card' ? rest : { ...rest, tab: name } };
  };
  const totalFileBytes = (asset?.files || []).reduce((sum, f) => sum + (f.sizeBytes || 0), 0);

  if (isError || !asset) {
    return (
      <section className="tp-portfolio-area pt-120 pb-90">
        <div className="container">
          <p className="pf2-empty">
            {isModel ? t('Model not found.') : t('Dataset not found.')} <Link href={backLink}>{backLabel}</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="tp-portfolio-area pt-120 pb-90">
      <div className="container">
        <div className="hf-hero">
          <div className="hf-hero-icon">Z</div>
          <div className="hf-hero-name">
            <span className="hf-owner">{asset.organization ? `${asset.organization} / ` : 'zenvinus / '}{res.toLowerCase()}s</span>
            <h3>{asset.title}</h3>
          </div>
          <div className="hf-hero-actions">
            {res === 'Dataset' && can(STUDIO_PERMS.explore) && (
              <Link href={`${studioBase(router.pathname)}/explore?slug=${asset.slug}`} className="studio-btn studio-btn-light">
                <i className="fa-solid fa-table-cells"></i> {t('Open in Studio')}
              </Link>
            )}
            <button type="button" className="hf-primary" onClick={() => dlMutation.mutate()} disabled={dlMutation.isPending}>
              <i className="fa-solid fa-download"></i> {dlMutation.isPending ? t('Preparing…') : t('Download')}
            </button>
          </div>
          <div className="hf-badges">
            {asset.license && <span>{asset.license}</span>}
            {asset.unit && <span>{asset.unit}</span>}
            <span>{asset.dtype}</span>
            {asset.quality > 0 && <span>{t('Quality {score}', { score: asset.quality })}</span>}
          </div>
          {dlError && <p className="pf2-empty" style={{ color: '#dc3545' }}>{t(dlError)}</p>}
        </div>

        <nav className="hf-tabs" aria-label={isModel ? t('Model sections') : t('Dataset sections')}>
          <Link href={tabHref('card')} shallow scroll={false} className={tab === 'card' ? 'hf-active' : undefined} aria-current={tab === 'card' ? 'page' : undefined}>
            <i className="fa-regular fa-file-lines"></i> {isModel ? t('Model card') : t('Dataset card')}
          </Link>
          {hasViewer && (
            <Link href={tabHref('viewer')} shallow scroll={false} className={tab === 'viewer' ? 'hf-active' : undefined} aria-current={tab === 'viewer' ? 'page' : undefined}>
              <i className="fa-solid fa-table"></i> {t('Dataset viewer')}
            </Link>
          )}
          <Link href={tabHref('files')} shallow scroll={false} className={tab === 'files' ? 'hf-active' : undefined} aria-current={tab === 'files' ? 'page' : undefined}>
            <i className="fa-regular fa-folder-open"></i> {t('Files and versions')}
          </Link>
          <Link href={backLink}><i className="fa-solid fa-arrow-left"></i> {backLabel}</Link>
        </nav>

        <div className="hf-layout">
          <div className="hf-main">
            {tab === 'card' && (
              <>
                <div className="hf-card" id="card">
                  <h4 className="hf-section-title"><i className="fa-regular fa-file-lines"></i> {isModel ? t('Model card') : t('Dataset card')}</h4>
                  <div className="hf-prose">
                    <CardMarkdown markdown={asset.card || asset.desc} />
                  </div>
                </div>
                {asset.citation && (
                  <div className="hf-card" id="citation">
                    <h4 className="hf-section-title"><i className="fa-solid fa-quote-left"></i> {t('Citation')}</h4>
                    <div className="hf-code">{asset.citation}</div>
                  </div>
                )}
              </>
            )}

            {tab === 'viewer' && asset.preview && (
              <div className="hf-card" id="viewer">
                <h4 className="hf-section-title"><i className="fa-solid fa-table"></i> {t('Dataset viewer')}</h4>
                <div className="hf-viewer">
                  <table>
                    <thead>
                      <tr>
                        {(asset.preview.columns || []).map((col) => <th key={col}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(asset.preview.rows || []).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <ViewerCell key={j} column={asset.preview?.columns?.[j]} value={cell} features={asset.preview?.features} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="hf-viewer-note">{t('Preview of split {split} — showing the first {count} rows.', { split: <strong>{asset.preview.split}</strong>, count: asset.preview.rows?.length || 0 })}</p>
              </div>
            )}

            {tab === 'viewer' && (asset.splits || []).length > 0 && (
              <div className="hf-card" id="splits">
                <h4 className="hf-section-title"><i className="fa-solid fa-layer-group"></i> {t('Data structure')}</h4>
                <div className="hf-splits">
                  {asset.splits.map((split) => (
                    <div key={split.name} className="hf-split">
                      <strong>{split.name}</strong>
                      <em>{split.rows != null ? t('{count} rows', { count: split.rows.toLocaleString(locale) }) : ''}</em>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'files' && (
            <div className="hf-card" id="files">
              <h4 className="hf-section-title"><i className="fa-regular fa-folder-open"></i> {t('Files and versions')}</h4>
              {(asset.files || []).length > 0 && (
                <p className="hf-viewer-note" style={{ marginTop: 0, marginBottom: 12 }}>
                  {t('{count} files', { count: asset.files.length })} · {formatBytes(totalFileBytes)}
                </p>
              )}
              <div className="hf-files">
                {(asset.files || []).length === 0 && <p className="hf-viewer-note">{t('No files uploaded yet.')}</p>}
                {(asset.files || []).map((file) => (
                  <div key={file.path} className="hf-file">
                    <i className="fa-regular fa-file-lines"></i>
                    <span className="hf-file-name">{file.path}</span>
                    <span className="hf-file-size">{file.sizeLabel || formatBytes(file.sizeBytes)}</span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>

          <aside className="hf-side">
            <div className="hf-card">
              <h4 className="hf-section-title"><i className="fa-solid fa-circle-info"></i> {t('Metadata')}</h4>
              <ul className="hf-meta">
                <li><i className="fa-solid fa-download"></i><span className="hf-meta-label">{t('Downloads')}</span><span className="hf-meta-value">{asset.downloads.toLocaleString(locale)}</span></li>
                <li><i className="fa-solid fa-scale-balanced"></i><span className="hf-meta-label">{t('License')}</span><span className="hf-meta-value">{asset.license || '—'}</span></li>
                {asset.unit && <li><i className="fa-solid fa-database"></i><span className="hf-meta-label">{t('Size')}</span><span className="hf-meta-value">{asset.unit}</span></li>}
                {asset.sizeLabel && <li><i className="fa-solid fa-hard-drive"></i><span className="hf-meta-label">{t('Disk')}</span><span className="hf-meta-value">{asset.sizeLabel}</span></li>}
                {asset.quality > 0 && <li><i className="fa-solid fa-certificate"></i><span className="hf-meta-label">{t('Quality')}</span><span className="hf-meta-value">{asset.quality}</span></li>}
                {asset.publishedAt && <li><i className="fa-regular fa-calendar"></i><span className="hf-meta-label">{t('Published')}</span><span className="hf-meta-value">{formatDate(asset.publishedAt)}</span></li>}
                <li><i className="fa-solid fa-users"></i><span className="hf-meta-label">{t('Source')}</span><span className="hf-meta-value">{asset.organization || t('Community')}</span></li>
              </ul>
            </div>
            {asset.tags.length > 0 && (
              <div className="hf-card">
                <h4 className="hf-section-title"><i className="fa-solid fa-tags"></i> {t('Tags')}</h4>
                <div className="hf-badges">
                  {asset.tags.map((tag) => <span key={tag}>{tag}</span>)}
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
