import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, AudioLines, Bot, Plus, ScanLine, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useT } from '@/i18n';
import type { Offering, OfferingIconKey } from '../types/home';

const OFFERING_DATA: ReadonlyArray<Offering> = [
  { id: 1, iconKey: 'vision', title: 'Computer {br} Vision' },
  { id: 2, iconKey: 'nlp', title: 'NLP & Speech {br} Intelligence' },
  { id: 3, iconKey: 'llm', title: 'LLM & {br} Generative AI' },
  { id: 4, iconKey: 'predictive', title: 'Predictive ML {br} & Forecasting' },
];

const OFFERING_ICONS: Readonly<
  Record<OfferingIconKey, React.ComponentType<{ className?: string; strokeWidth?: number }>>
> = {
  vision: ScanLine,
  nlp: AudioLines,
  llm: Bot,
  predictive: TrendingUp,
};

/**
 * AI Project Modalities showcase section on dark Zenvinus Navy with unified crisp Lucide icon tiles.
 */
const OfferArea = () => {
  const { t } = useT();

  return (
    <section className="bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <span className="text-xs font-semibold text-teal">
              {t('what {highlight}', { highlight: t('we deliver') })}
            </span>
            <h2 className="mt-2 mb-0 text-[28px] font-semibold tracking-[-0.025em] text-white sm:text-[34px]">
              {t('AI Project Types We Deliver')}
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="m-0 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              {t(
                'From raw data to production-ready AI — delivered by our three engines: {br} Data Engine, Community, and AI Lab.',
                { br: ' ' },
              )}
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERING_DATA.map((item) => {
            const Icon = OFFERING_ICONS[item.iconKey];
            return (
              <Link
                key={item.id}
                href="/service-details"
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white no-underline transition-[background-color,border-color] duration-150 hover:border-teal/40 hover:bg-white/[0.08]"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <Badge tone="neutral" mono>
                      0{item.id}
                    </Badge>
                    <ArrowUpRight
                      className="h-4 w-4 text-white/50 transition-colors group-hover:text-teal"
                      strokeWidth={1.6}
                    />
                  </div>
                  <h3 className="m-0 text-lg font-semibold leading-snug text-white">
                    {t(item.title, { br: <br /> })}
                  </h3>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <span className="text-xs font-medium text-teal">{t('Read Out More')}</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal/25 bg-teal/10 text-teal transition-colors group-hover:border-teal/50 group-hover:bg-teal/15">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-center text-sm text-white/75">
          <span>{t('Bring them together and you overcome the ordinary.')}</span>
          <Link
            href="/service"
            className="inline-flex items-center gap-1.5 font-semibold text-teal no-underline hover:underline"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            <span>{t('View All Services')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OfferArea;
