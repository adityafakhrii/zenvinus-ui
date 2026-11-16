import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button, CustomProgressBar, SegmentedControl, cn } from '@/components/ui';
import type { SegmentedOption } from '@/components/ui';
import { useT } from '@/i18n';

type EngineKey = 'data' | 'community' | 'lab';

interface EnginePreview {
  title: string;
  badge: string;
  headline: string;
  metricLabel: string;
  metricValue: string;
  progressLabel: string;
  progressValue: number;
  bullets: ReadonlyArray<string>;
}

const PREVIEW_DATA: Readonly<Record<EngineKey, EnginePreview>> = {
  data: {
    title: 'Data Engine',
    badge: 'Automated + QA',
    headline: 'Turn raw data into AI-ready data.',
    metricLabel: 'Items QA-reviewed',
    metricValue: '184,210',
    progressLabel: 'Batch #217 · Street Scene Bounding Boxes',
    progressValue: 86,
    bullets: ['Data Discovery', 'Data Curation', 'Dataset Versioning'],
  },
  community: {
    title: 'Community',
    badge: '4,821 Contributors',
    headline: 'Scale human intelligence when AI needs people.',
    metricLabel: 'QA Pass Rate',
    metricValue: '97.8%',
    progressLabel: 'Active Qualification · Multimodal Labeling',
    progressValue: 94,
    bullets: ['Data Contributors', 'Quality Reviewers', 'Reputation System'],
  },
  lab: {
    title: 'AI Lab',
    badge: 'Experiment & Eval',
    headline: 'Research, experiment, evaluate, and improve AI.',
    metricLabel: 'Models benchmarked',
    metricValue: '24',
    progressLabel: 'Indo-Vision v2 · Precision Evaluation',
    progressValue: 91,
    bullets: ['Fine-tuning', 'Model Evaluation', 'Experiment Tracking'],
  },
};

/**
 * Asymmetric Editorial Hero + Live Interactive 3-Engine Workspace Scene (zero decorative blobs/carousels).
 */
const HeroArea = () => {
  const { t } = useT();
  const [activeEngine, setActiveEngine] = useState<EngineKey>('data');
  const [focusedBullet, setFocusedBullet] = useState<number>(0);

  const engineOptions: SegmentedOption<EngineKey>[] = useMemo(
    () => [
      { value: 'data', label: t('Data Engine') },
      { value: 'community', label: t('Community') },
      { value: 'lab', label: t('AI Lab') },
    ],
    [t],
  );

  const preview = PREVIEW_DATA[activeEngine];

  return (
    <section className="relative border-b border-[rgba(8,13,53,0.06)] bg-canvas py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Copy Column */}
          <div className="lg:col-span-6">
            <h1 className="m-0 text-[32px] font-medium leading-[1.06] tracking-[-0.03em] text-ink sm:text-[48px] xl:text-[56px] zv-animate-enter">
              {t('Build Better AI')}
              <span className="mt-1 block text-teal-ink">{t('With Better Data')}</span>
            </h1>

            <p className="mt-5 mb-0 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-[17px] zv-animate-enter zv-delay-1">
              {t('Everything you need to build, improve, and scale AI in one platform.')}{' '}
              {t('Collect, annotate, validate with domain experts, and version training datasets with complete visibility.')}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 zv-animate-enter zv-delay-2">
              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className="group"
                rightIcon={
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                }
              >
                {t('Start Your AI Project')}
              </Button>
              <Button href="/datasets" variant="secondary" size="lg">
                {t('Datasets')}
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-2.5 sm:gap-4 border-t border-line-subtle pt-6 zv-animate-enter zv-delay-3">
              <div>
                <div className="text-xl font-semibold text-ink tabular-nums sm:text-2xl">97.8%</div>
                <div className="mt-0.5 text-xs text-ink-muted">{t('QA Pass Rate')}</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-ink tabular-nums sm:text-2xl">4,821</div>
                <div className="mt-0.5 text-xs text-ink-muted">{t('contributors')}</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-ink tabular-nums sm:text-2xl">16</div>
                <div className="mt-0.5 text-xs text-ink-muted">{t('Indonesian datasets')}</div>
              </div>
            </div>
          </div>

          {/* Right Interactive Product Scene */}
          <div className="lg:col-span-6 zv-animate-enter zv-delay-2">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.10)] bg-surface p-5 shadow-[0_12px_36px_rgba(2,6,38,0.06)] transition-shadow duration-200 hover:shadow-[0_16px_44px_rgba(2,6,38,0.08)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-teal transition-colors duration-150">
                    {activeEngine === 'data' ? (
                      <Database className="h-4 w-4" strokeWidth={1.5} />
                    ) : activeEngine === 'community' ? (
                      <Users className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Cpu className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="text-sm font-semibold text-ink">Zenvinus {t('Workspace')}</span>
                </div>

                <SegmentedControl<EngineKey>
                  value={activeEngine}
                  onChange={(next) => {
                    setActiveEngine(next);
                    setFocusedBullet(0);
                  }}
                  options={engineOptions}
                  size="sm"
                  ariaLabel={t('One Platform.')}
                />
              </div>

              <div key={activeEngine} className="mt-5 flex flex-col gap-4 zv-animate-panel">
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-navy p-5 text-white">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
                      {t(preview.badge)}
                    </span>
                    <h2 className="mt-2 mb-0 text-lg font-semibold leading-snug text-white">
                      {t(preview.headline)}
                    </h2>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <div className="text-xs text-white/60">{t(preview.metricLabel)}</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-teal tabular-nums">
                      {preview.metricValue}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-line-subtle bg-canvas p-4">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-ink">{preview.progressLabel}</span>
                    <span className="font-mono font-semibold text-teal-ink tabular-nums">
                      {preview.progressValue}%
                    </span>
                  </div>
                  <CustomProgressBar value={preview.progressValue} tone="teal" height="sm" />
                </div>

                <div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-3">
                  {preview.bullets.map((bullet, idx) => {
                    const isFocused = focusedBullet === idx;
                    return (
                      <button
                        key={bullet}
                        type="button"
                        onClick={() => setFocusedBullet(idx)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer',
                          isFocused ? 'bg-tint-mint text-teal-ink' : 'text-ink hover:bg-canvas',
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-ink" strokeWidth={1.5} />
                        <span className="truncate">{t(bullet)}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-3 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.5} />
                    <span>{t('Expert-verified quality checks per batch')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-ink-secondary">
                    <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>v2.4</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroArea;
