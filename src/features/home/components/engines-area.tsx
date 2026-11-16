import React from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Badge, cn } from '@/components/ui';
import { useT } from '@/i18n';
import type { Engine } from '../types/home';

const ENGINES_DATA: ReadonlyArray<Engine> = [
  {
    num: '01',
    img: '/assets/img/engines/data-engine.png',
    title: 'Data Engine',
    tagline: 'Turn raw data into AI-ready data.',
    description:
      'Discover, collect, clean, curate, annotate, and validate data from your own sources and available public datasets.',
    features: [
      'Data Discovery',
      'Data Collection',
      'Data Curation',
      'Data Annotation',
      'Quality Control',
      'Dataset Versioning',
    ],
  },
  {
    num: '02',
    img: '/assets/img/engines/community.png',
    title: 'Community',
    tagline: 'Scale human intelligence when AI needs people.',
    description:
      'Connect your AI projects with a community of contributors, specialists, and evaluators to handle data and AI tasks at scale.',
    features: [
      'Data Contributors',
      'AI Evaluators',
      'Specialists',
      'Quality Reviewers',
      'Distributed Workforce',
      'Reputation System',
    ],
  },
  {
    num: '03',
    img: '/assets/img/engines/ai-lab.png',
    title: 'AI Lab',
    tagline: 'Research, experiment, evaluate, and improve AI.',
    description:
      'Build and evaluate AI models with experiment tracking, training workflows, benchmarks, and expert-driven research.',
    features: [
      'AI Research',
      'Model Training',
      'Fine-tuning',
      'Model Evaluation',
      'Experiment Tracking',
      'Model Registry',
    ],
  },
];

/**
 * Clean 3-Engine showcase cards pairing technical capabilities with framed product artwork.
 */
const EnginesArea = () => {
  const { t } = useT();

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="m-0 text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[34px]">
            {t('One Platform.')} <span className="text-teal-ink">{t('Three Engines.')}</span>
          </h2>
          <p className="mt-2.5 mb-0 text-sm text-ink-secondary sm:text-base">
            {t('Everything you need to build, improve, and scale AI in one platform.')}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          {ENGINES_DATA.map((item, idx) => (
            <article
              key={item.num}
              className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas p-6 lg:grid-cols-12 lg:p-8"
            >
              <div className={cn('lg:col-span-6', idx % 2 === 1 && 'lg:order-2')}>
                <Badge tone="neutral" mono>
                  {item.num}
                </Badge>
                <h3 className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-ink">
                  {t(item.title)}
                </h3>
                <p className="mt-1.5 mb-0 text-sm font-medium text-teal-ink">{t(item.tagline)}</p>
                <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {t(item.description)}
                </p>

                <ul className="mt-6 grid grid-cols-1 gap-2.5 p-0 list-none sm:grid-cols-2">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />
                      <span>{t(feature)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cn('lg:col-span-6', idx % 2 === 1 && 'lg:order-1')}>
                <div className="overflow-hidden rounded-xl border border-[rgba(8,13,53,0.08)] bg-surface p-4">
                  <Image
                    src={item.img}
                    alt={t(item.title)}
                    width={675}
                    height={590}
                    className="h-auto w-full rounded-lg object-contain"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnginesArea;
