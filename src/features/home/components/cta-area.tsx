import React from 'react';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Button, Reveal } from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Clean enterprise contact CTA block (replaces decorative CTA shapes with sharp surface layout).
 */
const CtaArea = () => {
  const { t } = useT();

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-hairline bg-navy p-8 text-white lg:grid-cols-12 lg:p-10">
            <div className="lg:col-span-8">
              <span className="text-xs font-medium text-teal">
                {t('Enterprise solutions')}
              </span>
              <h2 className="mt-2 mb-0 text-2xl font-medium tracking-tight text-white sm:text-3xl">
                {t('Build your next Indonesian AI dataset or model')}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-white/75">
                <a
                  href="tel:+622150008888"
                  className="inline-flex items-center gap-2 text-white/80 no-underline transition-colors hover:text-teal"
                >
                  <Phone className="h-4 w-4 text-teal" strokeWidth={1.5} />
                  <span className="font-mono">+62 21 5000 8888</span>
                </a>
                <a
                  href="mailto:info@zenvinus.co.id"
                  className="inline-flex items-center gap-2 text-white/80 no-underline transition-colors hover:text-teal"
                >
                  <Mail className="h-4 w-4 text-teal" strokeWidth={1.5} />
                  <span>info@zenvinus.co.id</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <Button
                href="/contact"
                variant="teal"
                size="lg"
                className="group"
                rightIcon={
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                }
              >
                {t('Request Proposal')}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CtaArea;
