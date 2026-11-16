import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { LifecycleHubScene, PipelineScene, WorkforceScene } from '@/components/visuals/zenvinus-scenes';
import { useT } from '@/i18n';
import type { AboutLayer, AboutNumber, AboutPillar, TimelineYear } from '../types/about';

const LAYERS: ReadonlyArray<AboutLayer> = [
  {
    tag: 'Collection',
    title: 'Collection and curation',
    text: 'We gather text, images, audio and video, then filter, de-duplicate and balance the sources before anything is labeled.',
  },
  {
    tag: 'Annotation',
    title: 'Annotation',
    text: 'Contributors label each item on the platform, following written guidelines for the task. They are paid for each approved task.',
  },
  {
    tag: 'Quality control',
    title: 'Expert review',
    text: 'Experts check the results. Work that misses the bar goes back for revision, and each batch gets a quality report.',
  },
  {
    tag: 'Delivery',
    title: 'Delivery',
    text: 'Ready-made datasets in the catalog, or a custom project delivered in batches. Data ships as versioned splits with documentation and a license.',
  },
];

const PILLARS: ReadonlyArray<AboutPillar> = [
  {
    label: 'Origin',
    title: 'Started in 2024',
    text: 'Zenvinus is built by PT Zenvora Inteligensia Nusantara, an Indonesian AI company founded in 2024 to close the gap between global AI and what Indonesia needs.',
  },
  {
    label: 'Mission',
    title: 'Indonesian data that is ready to use',
    text: 'Collect, label and check data in Indonesian languages, then deliver it with documentation and a license so teams can train and test models on it.',
  },
  {
    label: 'Vision',
    title: 'AI that serves Indonesia',
    text: "To be a main partner in Indonesia's digital transformation, with AI that benefits people and industry, starting with the data it learns from.",
  },
  {
    label: 'Values',
    title: 'Clear about data, fair to people',
    text: 'We keep data secure and follow AI ethics, show what is in a dataset before you use it, and pay contributors for every approved task.',
  },
];

const NUMBERS: ReadonlyArray<AboutNumber> = [
  { value: '19,432', label: 'annotated samples' },
  { value: '4,821', label: 'contributors' },
  { value: '94%', label: 'of reviewed work passes quality control' },
  { value: '16', label: 'Indonesian datasets in the catalog' },
];

const TIMELINE: ReadonlyArray<TimelineYear> = [];

/**
 * About Zenvinus page refactored into Tailwind CSS with 4px vertical rhythm & crisp surface hierarchy.
 */
const AboutPage = () => {
  const { t, locale } = useT();
  const num = (v: string): string => (/^[\d,]+$/.test(v) ? Number(v.replace(/,/g, '')).toLocaleString(locale) : v);

  return (
    <div className="bg-surface">
      {/* 1. Intro + 4-Layer Flow */}
      <section className="border-b border-[rgba(8,13,53,0.06)] bg-canvas py-14 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Badge tone="mint" dot>
                {t('About Zenvinus')}
              </Badge>
              <h1 className="mt-4 mb-0 text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink sm:text-[42px]">
                {t('AI training data for')}{' '}
                <span className="text-teal-ink">{t('Indonesia')}</span>.
                <br />
                {t('From collection to delivery.')}
              </h1>
              <p className="mt-5 mb-0 max-w-2xl text-base leading-relaxed text-ink-secondary">
                {t(
                  'Zenvinus runs every step itself: collecting and curating the data, having it labeled by a community of contributors, having experts review it, and delivering it with documentation and a license.',
                )}
              </p>
            </div>

            <div className="lg:col-span-5">
              <PipelineScene />
            </div>
          </div>

          <ol className="mt-12 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
            {LAYERS.map((layer, index) => (
              <li
                key={layer.title}
                className="flex flex-col rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-teal-ink">
                    {t(layer.tag)}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink-muted tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="m-0 text-base font-semibold text-ink">{t(layer.title)}</h2>
                <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                  {t(layer.text)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 2. Problem Statement & Company Pillars */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <h2 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[32px]">
                {t('Most AI is not trained on Indonesian data.')}
              </h2>
              <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
                {t(
                  'Most AI models are trained largely on data from outside Indonesia, so they often handle Indonesian languages, local terms and everyday context less well.',
                )}
              </p>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
                {t(
                  'More data from elsewhere does not fix that. The data has to be collected, labeled and checked by people who know the language and the context. That is the work we do.',
                )}
              </p>
            </div>

            <div className="lg:col-span-6">
              <LifecycleHubScene />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.label}
                className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas p-6"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-ink">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t(pillar.label)}
                </span>
                <h3 className="mt-2 mb-0 text-lg font-semibold text-ink">{t(pillar.title)}</h3>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{t(pillar.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Numbers Dark Navy Panel */}
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 rounded-2xl bg-navy p-6 text-white lg:grid-cols-12 lg:p-10">
            <div className="lg:col-span-5">
              <WorkforceScene variant="dark" />
            </div>

            <div className="lg:col-span-7">
              <h2 className="m-0 text-[28px] font-semibold tracking-tight text-white sm:text-[32px]">
                {t('In numbers.')}
              </h2>
              <dl className="mt-6 mb-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {NUMBERS.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <dt className="font-mono text-[28px] font-semibold text-teal tabular-nums leading-none">
                      {num(item.value)}
                    </dt>
                    <dd className="m-0 mt-2 text-sm text-white/75">{t(item.label)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Optional Timeline */}
      {TIMELINE.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <h2 className="m-0 text-2xl font-semibold text-ink">{t('Our journey')}</h2>
            <ol className="mt-6 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
              {TIMELINE.map((y) => (
                <li
                  key={y.year}
                  className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas p-5"
                >
                  <span className="font-mono text-lg font-semibold text-teal-ink tabular-nums">{y.year}</span>
                  {y.title && <div className="mt-1 text-sm font-semibold text-ink">{t(y.title)}</div>}
                  <ul className="mt-3 mb-0 flex list-disc flex-col gap-1.5 pl-4 text-xs text-ink-secondary">
                    {y.items.map((it) => (
                      <li key={it}>{t(it)}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 5. CTA Banner */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-teal-ink/20 bg-tint-mint p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
                {t('Work with us.')}
              </h2>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
                {t(
                  'Need data for a project, want to join as a contributor, or want to use our datasets? Write to us and we will get back to you as soon as we can.',
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                href="/contact"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Contact us')}
              </Button>
              <Button href="/tasks" variant="secondary" size="md">
                {t('See open tasks')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
