import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Phone,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useT } from '@/i18n';
import SERVICES_CATALOG, { type ZenvinusService } from '../data/our-service-data';

const ICON_MAP: Readonly<Record<ZenvinusService['iconKey'], typeof Database>> = {
  database: Database,
  scan: ScanLine,
  bot: Bot,
  shield: ShieldCheck,
  layers: Layers,
  cpu: Cpu,
};

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Scope & rubric design',
    text: 'Define label taxonomy, edge-case rules, and acceptance thresholds with Zenvinus engineers.',
  },
  {
    step: '02',
    title: 'Pilot calibration',
    text: 'Run a calibrated sample batch to lock agreement accuracy before full-volume annotation.',
  },
  {
    step: '03',
    title: 'Progressive batch QA',
    text: 'Track weekly progress while independent domain experts audit every batch in Review Queue.',
  },
  {
    step: '04',
    title: 'Versioned delivery',
    text: 'Receive clean splits, schema docs, and audit sign-off ready for model training.',
  },
] as const;

/**
 * Zenvinus Enterprise Services catalog (/service) refactored to Tailwind CSS + Lucide icons.
 */
const ServiceArea = () => {
  const { t } = useT();

  return (
    <div className="bg-surface">
      {/* Page Hero */}
      <section className="border-b border-[rgba(8,13,53,0.06)] bg-canvas py-14 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge tone="mint" dot>
                {t('Our Services')}
              </Badge>
              <h1 className="mt-4 mb-0 text-[32px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[42px]">
                {t('Managed AI data, annotation, and evaluation services')}
              </h1>
              <p className="mt-4 mb-0 text-base leading-relaxed text-ink-secondary">
                {t(
                  'From bespoke data collection across Indonesia to multi-stage expert quality assurance and model fine-tuning.',
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                href="/contact"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
              >
                {t('Request Proposal')}
              </Button>
              <Button href="/datasets" variant="secondary" size="md">
                {t('Datasets')}
              </Button>
            </div>
          </div>

          {/* 6-Card Services Bento Grid */}
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {SERVICES_CATALOG.map((service) => {
              const Icon = ICON_MAP[service.iconKey];
              return (
                <article
                  key={service.id}
                  className="flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] transition-[border-color,box-shadow] duration-150 hover:border-teal-ink/40 hover:shadow-[0_6px_18px_rgba(2,6,38,0.05)]"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint-mint text-teal-ink">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <Badge tone="neutral" mono>
                        {t(service.sla)}
                      </Badge>
                    </div>
                    <span className="text-xs font-medium text-teal-ink">
                      {t(service.category)}
                    </span>
                    <h2 className="mt-1 mb-0 text-lg font-semibold text-ink">{t(service.title)}</h2>
                    <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                      {t(service.summary)}
                    </p>
                    <ul className="mt-5 mb-0 flex list-none flex-col gap-2 border-t border-line-subtle pt-4 p-0">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs leading-relaxed text-ink-secondary"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-ink"
                            strokeWidth={1.75}
                          />
                          <span>{t(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3">
                    <Link
                      href={`/service-details?topic=${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-ink no-underline hover:underline"
                    >
                      <span>{t('Service Details')}</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Workflow */}
      <section className="py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink sm:text-[30px]">
              {t('How enterprise projects run')}
            </h2>
            <p className="mt-2 mb-0 text-sm text-ink-secondary">
              {t('Every engagement follows four transparent stages with milestone escrow protection.')}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-canvas p-5"
              >
                <span className="font-mono text-xs font-semibold text-teal-ink tabular-nums">
                  {item.step}
                </span>
                <h3 className="mt-2 mb-0 text-base font-semibold text-ink">{t(item.title)}</h3>
                <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                  {t(item.text)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div>
              <h3 className="m-0 text-xl font-semibold text-white">
                {t('Need a custom annotation pipeline or private dataset?')}
              </h3>
              <p className="mt-1.5 mb-0 text-sm text-white/70">
                {t('Speak directly with our solutions engineering team in Jakarta.')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="tel:+622150008888"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/20 px-4 text-sm font-medium text-white no-underline hover:border-teal hover:text-teal"
              >
                <Phone className="h-4 w-4" strokeWidth={1.6} />
                <span className="font-mono">+62 21 5000 8888</span>
              </a>
              <Button href="/contact" variant="teal" size="md">
                {t('Contact Us')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceArea;
