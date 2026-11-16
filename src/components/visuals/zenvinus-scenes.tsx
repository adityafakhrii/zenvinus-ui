import React from 'react';
import {
  CheckCircle2,
  Cpu,
  Database,
  Filter,
  Layers,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import { Badge, CustomProgressBar, cn } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Product-world scene: 4-layer data curation & quality pipeline card replacing generic 3D hologram graphics.
 */
export function PipelineScene() {
  const { t } = useT();

  const stages = [
    {
      Icon: Database,
      label: t('Raw Data'),
      meta: 'Image · Text · Audio',
      progress: 100,
    },
    {
      Icon: Filter,
      label: t('Curation'),
      meta: 'De-duplicated',
      progress: 96,
    },
    {
      Icon: Tag,
      label: t('Annotation'),
      meta: '4,821 ' + t('contributors'),
      progress: 92,
    },
    {
      Icon: ShieldCheck,
      label: t('Quality Control'),
      meta: '94% pass rate',
      progress: 94,
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.10)] bg-surface p-5 shadow-[0_8px_28px_rgba(2,6,38,0.05)]">
      <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-teal">
            <Layers className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <div>
            <span className="block text-xs font-semibold text-ink">{t('Data Engine')}</span>
            <span className="block font-mono text-[11px] text-ink-muted">pipeline-v2.4</span>
          </div>
        </div>
        <Badge tone="mint" dot>
          {t('Approved')}
        </Badge>
      </div>

      <div className="mt-4 space-y-2.5">
        {stages.map(({ Icon, label, meta, progress }, i) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-xl border border-line-subtle bg-canvas px-3.5 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-teal-ink shadow-[0_1px_2px_rgba(2,6,38,0.04)]">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-ink">
                  {String(i + 1).padStart(2, '0')} · {label}
                </span>
                <span className="block truncate text-[11px] text-ink-muted">{meta}</span>
              </div>
            </div>
            <span className="shrink-0 font-mono text-xs font-semibold text-teal-ink tabular-nums">
              {progress}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 text-xs text-ink-secondary">
        <span>train / val / test</span>
        <span className="font-mono font-semibold text-ink tabular-nums">19,432 items</span>
      </div>
    </div>
  );
}

/**
 * Product-world scene: Unified Data Engine + Community + AI Lab workflow bridge.
 */
export function LifecycleHubScene() {
  const { t } = useT();

  const engines = [
    {
      Icon: Database,
      title: t('Data Engine'),
      sub: 'Schema · Versioning',
      tone: 'bg-tint-mint text-teal-ink',
    },
    {
      Icon: Users,
      title: t('Community'),
      sub: '4,821 ' + t('contributors'),
      tone: 'bg-tone-blue-bg text-tone-blue-fg',
    },
    {
      Icon: Cpu,
      title: t('AI Lab'),
      sub: 'Eval · Fine-tuning',
      tone: 'bg-canvas text-navy',
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.10)] bg-surface p-5 shadow-[0_8px_28px_rgba(2,6,38,0.05)] sm:p-6">
      <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal" />
          <span className="text-xs font-semibold text-ink">Zenvinus AI Lifecycle</span>
        </div>
        <span className="font-mono text-[11px] text-ink-muted">ID / EN</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {engines.map(({ Icon, title, sub, tone }) => (
          <div key={title} className="rounded-xl border border-line-subtle bg-canvas p-3.5">
            <span className={cn('mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg', tone)}>
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <span className="block text-xs font-semibold text-ink">{title}</span>
            <span className="mt-0.5 block text-[11px] text-ink-muted">{sub}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line-subtle bg-canvas p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-ink-secondary">{t('QA Pass Rate')}</span>
          <span className="font-mono font-semibold text-teal-ink tabular-nums">97.8%</span>
        </div>
        <CustomProgressBar value={97.8} tone="teal" height="sm" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['train · 80%', 'validation · 10%', 'test · 10%'].map((split) => (
            <span
              key={split}
              className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-ink-secondary"
            >
              {split}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Product-world scene: Active contributor queue & quality clearance view (supports light & dark Navy sections).
 */
export function WorkforceScene({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { t } = useT();
  const isDark = variant === 'dark';

  const batches = [
    {
      title: t('Street Scene Bounding Boxes'),
      type: t('Object Annotation'),
      rate: 'Rp 1.200 / item',
      progress: 84,
      status: t('In Progress'),
    },
    {
      title: t('Chatbot Response Ranking'),
      type: t('LLM Evaluation'),
      rate: 'Rp 1.500 / pair',
      progress: 100,
      status: t('In Review'),
    },
    {
      title: t('Call Center Speech-to-Text'),
      type: t('Audio Transcription'),
      rate: 'Rp 1.400 / clip',
      progress: 68,
      status: t('In Progress'),
    },
  ] as const;

  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        isDark
          ? 'border-white/12 bg-white/[0.04] text-white'
          : 'border-[rgba(8,13,53,0.10)] bg-surface text-ink shadow-[0_8px_28px_rgba(2,6,38,0.05)]',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b pb-3.5',
          isDark ? 'border-white/10' : 'border-line-subtle',
        )}
      >
        <div className="flex items-center gap-2">
          <Users className={cn('h-4 w-4', isDark ? 'text-teal' : 'text-teal-ink')} strokeWidth={1.6} />
          <span className="text-xs font-semibold">{t('Community')} Queue</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 font-mono text-[11px] tabular-nums',
            isDark ? 'text-teal' : 'text-teal-ink',
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          94% QC
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {batches.map((b) => (
          <div
            key={b.title}
            className={cn(
              'rounded-xl border p-3',
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-line-subtle bg-canvas',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold">{b.title}</span>
                <span className={cn('mt-0.5 block text-[11px]', isDark ? 'text-white/65' : 'text-ink-muted')}>
                  {b.type} · <span className="font-mono">{b.rate}</span>
                </span>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium',
                  isDark ? 'bg-white/10 text-teal' : 'bg-tint-mint text-teal-ink',
                )}
              >
                {b.status}
              </span>
            </div>
            <div className={cn('mt-2.5 h-1.5 overflow-hidden rounded-full', isDark ? 'bg-white/10' : 'bg-surface-muted')}>
              <div className="h-full rounded-full bg-teal" style={{ width: `${b.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
