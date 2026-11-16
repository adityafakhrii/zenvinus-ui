import React from 'react';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useT } from '@/i18n';
import ContactForm from './contact-form';

const CONTACT_EMAIL = 'info@zenvinus.co.id';
const CONTACT_PHONE = { label: '+62 21 5000 8888', href: 'tel:+622150008888' };

/**
 * Contact page asymmetric split: Jakarta contact SLA cards left + custom Tailwind form right.
 */
const ContactArea = () => {
  const { t } = useT();

  const details = [
    {
      label: 'Email',
      value: (
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink no-underline hover:text-teal-ink">
          {CONTACT_EMAIL}
        </a>
      ),
      icon: Mail,
    },
    {
      label: 'Phone',
      value: (
        <a href={CONTACT_PHONE.href} className="font-mono text-ink no-underline hover:text-teal-ink">
          {CONTACT_PHONE.label}
        </a>
      ),
      icon: Phone,
    },
    {
      label: 'Office',
      value: 'Jakarta, Indonesia',
      icon: MapPin,
    },
    {
      label: 'Website',
      value: (
        <a
          href="https://zenvinus.co.id"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink no-underline hover:text-teal-ink"
        >
          zenvinus.co.id
        </a>
      ),
      icon: Globe,
    },
  ] as const;

  return (
    <section className="min-h-[calc(100vh-16rem)] bg-canvas py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Details Column */}
          <div className="lg:col-span-5">
            <Badge tone="mint" dot>
              {t('Contact Us')}
            </Badge>
            <h1 className="mt-4 mb-0 text-[30px] font-semibold tracking-[-0.025em] text-ink sm:text-[36px]">
              {t('Talk to the Zenvinus team')}
            </h1>
            <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary sm:text-base">
              {t(
                'Tell us about the data you need, ask about a dataset or model, or ask how to join as a contributor. We reply by email.',
              )}
            </p>

            <dl className="mt-8 mb-0 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {details.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3.5 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-canvas text-teal-ink">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-ink-muted">{t(item.label)}</dt>
                      <dd className="m-0 mt-0.5 text-sm font-semibold text-ink">{item.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8">
              <h2 className="m-0 text-xl font-semibold text-ink">{t('Send us a message')}</h2>
              <p className="mt-1 mb-6 text-xs text-ink-muted">{t('Fields marked * are required.')}</p>
              <ContactForm email={CONTACT_EMAIL} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactArea;
