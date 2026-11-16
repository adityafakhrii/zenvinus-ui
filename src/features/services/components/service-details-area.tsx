import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';
import pipeline_img from '@assets/img/engines/data-engine.png';
import { Badge, Button, cn } from '@/components/ui';
import { useT } from '@/i18n';
import SERVICE_FAQ from '../data/accordion';
import SERVICES_CATALOG from '../data/our-service-data';
import ServiceContactForm from './service-contact-form';

/**
 * Interactive Zenvinus Service Details & FAQ page (/service-details) without legacy Lorem Ipsum/Bootstrap collapse.
 */
const ServiceDetailsArea = () => {
  const { t } = useT();
  const router = useRouter();
  const topicParam = typeof router.query.topic === 'string' ? router.query.topic : undefined;
  const [selectedSlug, setSelectedSlug] = useState<string>(SERVICES_CATALOG[0].slug);
  const [openFaqId, setOpenFaqId] = useState<number>(SERVICE_FAQ[0].id);

  const activeService = useMemo(() => {
    const slug = topicParam || selectedSlug;
    return SERVICES_CATALOG.find((s) => s.slug === slug) ?? SERVICES_CATALOG[0];
  }, [selectedSlug, topicParam]);

  const handleSelect = (slug: string) => {
    setSelectedSlug(slug);
    if (router.isReady) {
      router.replace({ pathname: '/service-details', query: { topic: slug } }, undefined, {
        shallow: true,
      });
    }
  };

  return (
    <section className="min-h-screen bg-canvas py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/service"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{t('Our Services')}</span>
          </Link>
          <h1 className="mt-3 mb-0 text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[36px]">
            {t(activeService.title)}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-ink-secondary sm:text-base">
            {t(activeService.summary)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Rail: Service Switcher + Quick Inquiry Card */}
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-4 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <p className="m-0 mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {t('All capabilities')}
              </p>
              <nav aria-label={t('Service capabilities')} className="flex flex-col gap-1">
                {SERVICES_CATALOG.map((item) => {
                  const isCurrent = item.slug === activeService.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => handleSelect(item.slug)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors cursor-pointer',
                        isCurrent
                          ? 'bg-tint-mint text-teal-ink font-semibold'
                          : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                      )}
                    >
                      <span className="truncate">{t(item.title)}</span>
                      <span className="font-mono text-[11px] text-ink-muted">{t(item.sla)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Request a project quote')}</h2>
              <p className="mt-1 mb-4 text-xs text-ink-secondary">
                {t('Tell us your data modality, volume, and target timeline.')}
              </p>
              <ServiceContactForm />
            </div>
          </aside>

          {/* Right Panel: Deliverable Breakdown & Accordion FAQ */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4">
                <div className="flex items-center gap-2">
                  <Badge tone="mint" dot>
                    {t(activeService.category)}
                  </Badge>
                  <Badge tone="neutral" mono>
                    {t(activeService.sla)}
                  </Badge>
                </div>
                <Button href="/dashboard/new-project" variant="primary" size="sm">
                  {t('Start Project Request')}
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-line-subtle bg-canvas p-4">
                <Image
                  src={pipeline_img}
                  alt={t(activeService.title)}
                  className="h-auto max-h-[320px] w-full rounded-lg object-contain"
                />
              </div>

              <h2 className="mt-6 mb-0 text-lg font-semibold text-ink">
                {t('Key deliverables & quality guarantees')}
              </h2>
              <ul className="mt-4 mb-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
                {activeService.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border border-line-subtle bg-canvas p-4 text-[13px] leading-relaxed text-ink-secondary"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clean Hairline FAQ Accordion (zero Bootstrap data-bs-toggle) */}
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8">
              <h2 className="m-0 mb-4 text-lg font-semibold text-ink">
                {t('Frequently asked questions')}
              </h2>
              <div className="divide-y divide-line-subtle">
                {SERVICE_FAQ.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="py-4 first:pt-1 last:pb-1">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqId(isOpen ? 0 : faq.id)}
                        className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-ink transition-colors hover:text-teal-ink cursor-pointer"
                      >
                        <span>{t(faq.question)}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150',
                            isOpen && 'rotate-180 text-teal-ink',
                          )}
                          strokeWidth={1.6}
                        />
                      </button>
                      {isOpen && (
                        <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                          {t(faq.answer)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetailsArea;
