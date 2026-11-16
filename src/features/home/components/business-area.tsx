import React from 'react';
import { Code2, Cpu } from 'lucide-react';
import { LifecycleHubScene } from '@/components/visuals/zenvinus-scenes';
import { useT } from '@/i18n';

/**
 * Dual-value split highlighting Zenvinus Data Engine paired with Community & AI Lab.
 */
const BusinessArea = () => {
  const { t } = useT();

  return (
    <section className="border-y border-[rgba(8,13,53,0.06)] bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <LifecycleHubScene />
          </div>

          <div className="lg:col-span-6">
            <span className="text-xs font-medium text-teal-ink">
              {t('Why Zenvinus')}
            </span>
            <h2 className="mt-2 mb-0 text-[28px] font-medium leading-tight tracking-[-0.025em] text-ink sm:text-[34px]">
              {t('One Platform For Your Entire AI Lifecycle')}
            </h2>
            <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
              {t(
                'Stop juggling separate vendors for datasets, labeling, and model {br} development. Zenvinus unifies the whole AI workflow in one platform.',
                { br: ' ' },
              )}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-hairline pt-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tint-mint text-teal-ink">
                    <Code2 className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <h3 className="m-0 text-base font-medium text-ink">{t('Data Engine')}</h3>
                </div>
                <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                  {t('From discovery, curation, {br} to AI-ready annotation', { br: ' ' })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tone-blue-bg text-tone-blue-fg">
                    <Cpu className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <h3 className="m-0 text-base font-medium text-ink">{t('Community & AI Lab')}</h3>
                </div>
                <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                  {t('Distributed human workforce {br} plus research and training', { br: ' ' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessArea;
