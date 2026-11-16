import React from 'react';
import Image from 'next/image';
import about_img from '@assets/img/about/about-1.png';
import {
  AnnotationIcon,
  CurationIcon,
  DatasetIcon,
  DiscoveryIcon,
  ProductionIcon,
  QualityControlIcon,
  RawDataIcon,
  TrainingIcon,
} from '@/components/icons/pipeline-icons';
import { useT } from '@/i18n';
import type { PipelineStep } from '../types/home';

const PIPELINE_STEPS: ReadonlyArray<PipelineStep> = [
  {
    icon: RawDataIcon,
    title: 'Raw Data',
    description: 'Start from any source — your own data or public datasets, structured or unstructured.',
  },
  {
    icon: DiscoveryIcon,
    title: 'Discovery',
    description: 'Find and connect the right data from your own sources and available public datasets.',
  },
  {
    icon: CurationIcon,
    title: 'Curation',
    description: 'Clean, prepare, and organize raw data until it is AI-ready.',
  },
  {
    icon: AnnotationIcon,
    title: 'Annotation',
    description: 'Label your data with precision, powered by experts and AI assistance.',
  },
  {
    icon: QualityControlIcon,
    title: 'Quality Control',
    description: 'Validate every output with multi-layer quality checks.',
  },
  {
    icon: DatasetIcon,
    title: 'Dataset',
    description: 'Build, version, and manage datasets that are ready for training.',
  },
  {
    icon: TrainingIcon,
    title: 'Training',
    description: 'Train and fine-tune models with fully tracked experiments.',
  },
  {
    icon: ProductionIcon,
    title: 'Production',
    description: 'Evaluate, register, and ship models to production with confidence.',
  },
];

/**
 * 8-Stage End-to-End AI Pipeline section showing every lifecycle step transparently in a clean Bento grid.
 */
const AboutArea = () => {
  const { t } = useT();

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas p-6 text-center">
              <Image
                src={about_img}
                alt={t('It Industries We’re Offering')}
                className="mx-auto h-auto max-w-[300px] w-full object-contain"
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-ink">
              {t('best {highlight}', { highlight: t('it service') })}
            </span>
            <h2 className="mt-2 mb-6 text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[34px]">
              {t('It Industries We’re Offering')}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PIPELINE_STEPS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas p-4 transition-colors hover:border-teal-ink/30"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink shadow-[0_1px_2px_rgba(2,6,38,0.04)]">
                        <Icon />
                      </span>
                      <span className="font-mono text-xs font-medium text-ink-muted tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="m-0 text-sm font-semibold text-ink">{t(item.title)}</h3>
                    <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
                      {t(item.description)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutArea;
