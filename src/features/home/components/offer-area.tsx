import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import offering_img_1 from '@assets/img/offering/img-1.svg';
import offering_img_2 from '@assets/img/offering/img-2.svg';
import offering_img_3 from '@assets/img/offering/img-3.svg';
import offering_img_4 from '@assets/img/offering/img-4.svg';
import { Badge } from '@/components/ui';
import { useT } from '@/i18n';
import type { Offering } from '../types/home';

const OFFERING_DATA: ReadonlyArray<Offering> = [
  { id: 1, img: offering_img_1, title: 'Computer {br} Vision' },
  { id: 2, img: offering_img_2, title: 'NLP & Speech {br} Intelligence' },
  { id: 3, img: offering_img_3, title: 'LLM & {br} Generative AI' },
  { id: 4, img: offering_img_4, title: 'Predictive ML {br} & Forecasting' },
];

/**
 * AI Project Modalities showcase section on dark Zenvinus Navy without decorative shape overlays.
 */
const OfferArea = () => {
  const { t } = useT();

  return (
    <section className="bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
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
          {OFFERING_DATA.map((item) => (
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 p-2">
                  <Image src={item.img} alt="" className="h-full w-full object-contain" />
                </div>
              </div>
            </Link>
          ))}
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
