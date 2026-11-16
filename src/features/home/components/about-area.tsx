import React from 'react';
import {
  Cpu,
  Database,
  Filter,
  Layers,
  Rocket,
  Search,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { PipelineScene } from '@/components/visuals/zenvinus-scenes';
import { useT } from '@/i18n';
import type { PipelineStep } from '../types/home';

const PIPELINE_STEPS: ReadonlyArray<PipelineStep> = [
  {
    icon: Database,
    title: 'Raw Data',
    description: 'Start from any source — your own data or public datasets, structured or unstructured.',
  },
  {
    icon: Search,
    title: 'Discovery',
    description: 'Find and connect the right data from your own sources and available public datasets.',
  },
  {
    icon: Filter,
    title: 'Curation',
    description: 'Clean, prepare, and organize raw data until it is AI-ready.',
  },
  {
    icon: Tag,
    title: 'Annotation',
    description: 'Label your data with precision, powered by experts and AI assistance.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Control',
    description: 'Validate every output with multi-layer quality checks.',
  },
  {
    icon: Layers,
    title: 'Dataset',
    description: 'Build, version, and manage datasets that are ready for training.',
  },
  {
    icon: Cpu,
    title: 'Training',
    description: 'Train and fine-tune models with fully tracked experiments.',
  },
  {
    icon: Rocket,
    title: 'Production',
    description: 'Evaluate, register, and ship models to production with confidence.',
  },
];

/**
 * 8-Stage End-to-End AI Pipeline section pairing structured visual telemetry with uniform Lucide pipeline cards.
 */
const AboutArea = () => {
  const { t } = useT();

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <PipelineScene />
          </div>

          <div className="lg:col-span-8">
            <span className="text-xs font-medium text-teal-ink">
              {t('Data-to-production workflow')}
            </span>
            <h2 className="mt-2 mb-6 text-[28px] font-medium tracking-[-0.025em] text-ink sm:text-[34px]">
              {t('Eight stages from raw data to deployed AI')}
            </h2>

            <ol className="m-0 grid list-none grid-cols-1 gap-x-8 gap-y-6 border-t border-hairline p-0 pt-6 sm:grid-cols-2">
              {PIPELINE_STEPS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-teal-ink">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs text-ink-muted tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="m-0 text-sm font-medium text-ink">{t(item.title)}</h3>
                      </div>
                      <p className="mt-1 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                        {t(item.description)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutArea;
