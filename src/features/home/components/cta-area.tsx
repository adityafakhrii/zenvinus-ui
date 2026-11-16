import React from 'react';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Clean enterprise contact CTA block (replaces decorative CTA shapes with sharp surface layout).
 */
const CtaArea = () => {
  const { t } = useT();

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-navy p-8 text-white lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              {t('feature {highlight}', { highlight: t('IT Solutions') })}
            </span>
            <h2 className="mt-2 mb-0 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('We’re Ready to {highlight} IT Business', {
                highlight: <span className="text-teal">{t('Growth')}</span>,
              })}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-white/75">
              <a
                href="tel:+622150008888"
                className="inline-flex items-center gap-2 text-white/80 no-underline hover:text-teal"
              >
                <Phone className="h-4 w-4 text-teal" strokeWidth={1.6} />
                <span className="font-mono">+62 21 5000 8888</span>
              </a>
              <a
                href="mailto:info@zenvinus.co.id"
                className="inline-flex items-center gap-2 text-white/80 no-underline hover:text-teal"
              >
                <Mail className="h-4 w-4 text-teal" strokeWidth={1.6} />
                <span>info@zenvinus.co.id</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <Button
              href="/contact"
              variant="teal"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
            >
              {t('Get a Free Quote')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaArea;
