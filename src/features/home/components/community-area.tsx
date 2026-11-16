import React from 'react';
import { ArrowRight, CircleDollarSign, Eye, Lock, Share2, Tag } from 'lucide-react';
import { Badge, Button, cn } from '@/components/ui';
import { WorkforceScene } from '@/components/visuals/zenvinus-scenes';
import { useT } from '@/i18n';
import type { CommunityFeature } from '../types/home';

const ICONS = {
  share: Share2,
  tag: Tag,
  eye: Eye,
  lock: Lock,
} as const;

const ICON_TONE = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  navy: 'bg-navy text-teal',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
} as const;

const FEATURES: ReadonlyArray<CommunityFeature<keyof typeof ICONS>> = [
  {
    tone: 'blue',
    icon: 'share',
    meta: 'datasets · models',
    title: 'Share Datasets & Models',
    text: 'Publish your datasets and models to the community, or build on what others have shared.',
  },
  {
    tone: 'mint',
    icon: 'tag',
    meta: 'image · text · audio',
    title: 'Annotation & Collection',
    text: 'Take on annotation and data collection tasks from real enterprise AI projects.',
  },
  {
    tone: 'navy',
    icon: 'eye',
    meta: '94% QC pass',
    title: 'Expert Monitoring',
    text: 'Every submission is monitored and reviewed by specialists and experts for quality.',
  },
  {
    tone: 'orange',
    icon: 'lock',
    meta: 'private tier',
    title: 'Enterprise-Exclusive Projects',
    text: 'Level up to unlock private, enterprise-only projects with dedicated workforces.',
  },
];

/**
 * Zenvinus Community ecosystem section with live queue preview and clean Bento feature cards.
 */
const CommunityArea = () => {
  const { t } = useT();

  return (
    <section className="border-t border-[rgba(8,13,53,0.06)] bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-ink">zenvinus</span>
          <Badge tone="mint">{t('community')}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[36px]">
              {t('Work On Real AI Projects,{br}{highlight} For Quality', {
                br: <br />,
                highlight: <span className="text-teal-ink">{t('Get Rewarded')}</span>,
              })}
            </h2>
            <p className="mt-4 mb-0 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {t(
                'Join a distributed workforce powering enterprise AI — and grow from contributor to specialist to expert.',
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                href="/tasks"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Tasks')}
              </Button>
              <Button href="/contact" variant="secondary" size="md">
                {t('Start Contributing')}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <WorkforceScene variant="light" />
          </div>
        </div>

        {/* 4 Community Pillars Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((item) => {
            const Icon = ICONS[item.icon];
            const toneKey = item.tone as keyof typeof ICON_TONE;
            return (
              <article
                key={item.title}
                className="flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 transition-colors hover:border-teal-ink/30"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                        ICON_TONE[toneKey] ?? 'bg-canvas text-ink',
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">{item.meta}</span>
                  </div>
                  <h3 className="m-0 text-base font-semibold text-ink">{t(item.title)}</h3>
                  <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                    {t(item.text)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Dual Reward Callout Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="flex flex-col justify-between gap-5 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 sm:flex-row sm:items-center sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint-mint text-teal-ink">
                <CircleDollarSign className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <span className="text-[11px] font-semibold text-teal-ink">
                  {t('Contributors')}
                </span>
                <h3 className="mt-1 mb-0 text-xl font-semibold text-ink">{t('Contributors Get Paid')}</h3>
                <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                  {t(
                    'For every approved data annotation and data collection task — the higher the quality, the higher the reward.',
                  )}
                </p>
              </div>
            </div>
            <Button href="/contact" variant="primary" size="md" className="shrink-0">
              {t('Start Contributing')}
            </Button>
          </article>

          <article className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-navy p-6 text-white sm:flex-row sm:items-center sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal">
                <Eye className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <span className="text-[11px] font-semibold text-teal">
                  {t('Experts')}
                </span>
                <h3 className="mt-1 mb-0 text-xl font-semibold text-white">{t('Experts Get Paid')}</h3>
                <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-white/75">
                  {t('For reviewing community results and handling annotation projects from enterprise.')}
                </p>
              </div>
            </div>
            <Button href="/contact" variant="teal" size="md" className="shrink-0">
              {t('Join as Expert')}
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
};

export default CommunityArea;
