import React, { useState } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Mail, MapPin, Phone, Send } from 'lucide-react';
import footer_logo from '@assets/img/logo/footer-logo.png';
import { cn } from '@/components/ui';
import { useT } from '@/i18n';
import SocialLinks, { CopyRight } from './social-links';

const SERVICE_LINKS = [
  { title: 'Data Annotation', link: '/service' },
  { title: 'Dataset Preparation', link: '/service' },
  { title: 'AI Model Training', link: '/service' },
  { title: 'Text Labeling', link: '/service' },
  { title: 'Image Annotation', link: '/service' },
  { title: 'Data Collection', link: '/service' },
] as const;

const PLATFORM_LINKS = [
  { title: 'About Zenvinus', link: '/about' },
  { title: 'Tasks', link: '/tasks' },
  { title: 'Datasets', link: '/datasets' },
  { title: 'Models', link: '/models' },
  { title: 'Blog', link: '/blog' },
  { title: 'Contact', link: '/contact' },
] as const;

/**
 * Clean Zenvinus Navy (#020626) site footer without decorative backdrop clutter or native checkboxes.
 */
const FooterThree = () => {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !agreed) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center no-underline" aria-label="Zenvinus">
              <Image src={footer_logo} alt="Zenvinus" className="h-7 w-auto object-contain" />
            </Link>
            <p className="mt-4 mb-0 max-w-sm text-sm leading-relaxed text-white/70">
              {t(
                "Indonesia's AI data & model training platform. {br}We help companies prepare high-quality data. Visit zenvinus.co.id",
                { br: ' ' },
              )}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 text-[13px] text-white/75">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=Jakarta,+Indonesia"
                className="inline-flex items-center gap-2 text-white/75 no-underline transition-colors hover:text-teal"
              >
                <MapPin className="h-4 w-4 shrink-0 text-teal" strokeWidth={1.6} />
                <span>Jakarta, Indonesia</span>
              </Link>
              <a
                href="mailto:info@zenvinus.co.id"
                className="inline-flex items-center gap-2 text-white/75 no-underline transition-colors hover:text-teal"
              >
                <Mail className="h-4 w-4 shrink-0 text-teal" strokeWidth={1.6} />
                <span>info@zenvinus.co.id</span>
              </a>
              <a
                href="tel:+622150008888"
                className="inline-flex items-center gap-2 text-white/75 no-underline transition-colors hover:text-teal"
              >
                <Phone className="h-4 w-4 shrink-0 text-teal" strokeWidth={1.6} />
                <span className="font-mono">+62 21 5000 8888</span>
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="lg:col-span-2">
            <h3 className="m-0 mb-4 text-sm font-semibold text-white">{t('Services')}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {SERVICE_LINKS.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.link}
                    className="text-[13px] text-white/70 no-underline transition-colors hover:text-teal"
                  >
                    {t(item.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="lg:col-span-2">
            <h3 className="m-0 mb-4 text-sm font-semibold text-white">{t('Platform')}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {PLATFORM_LINKS.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.link}
                    className="text-[13px] text-white/70 no-underline transition-colors hover:text-teal"
                  >
                    {t(item.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter + Social */}
          <div className="lg:col-span-4">
            <h3 className="m-0 mb-2 text-sm font-semibold text-white">{t('Newsletter')}</h3>
            <p className="m-0 mb-4 text-[13px] text-white/65">
              {t('Monthly releases on Indonesian datasets, QA benchmarks, and open tasks.')}
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribed(false);
                  }}
                  placeholder={t('Enter Email Address')}
                  className="h-10 min-w-0 flex-1 rounded-[10px] border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder:text-white/45 transition-colors focus:border-teal focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={t('Subscribe')}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-teal text-navy transition-colors hover:bg-teal-ink hover:text-white cursor-pointer"
                >
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    agreed ? 'border-teal bg-teal text-navy' : 'border-white/30 bg-transparent',
                  )}
                >
                  {agreed && <Check className="h-3 w-3" strokeWidth={1.75} />}
                </span>
                <span className="text-xs leading-snug text-white/65">
                  {t('I agree to all your terms and policies')}
                </span>
              </label>

              {subscribed && (
                <p className="m-0 text-xs font-medium text-teal">{t('Subscribed to Zenvinus updates.')}</p>
              )}
            </form>

            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">
            <CopyRight />
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#" className="text-white/65 no-underline transition-colors hover:text-white">
              {t('Terms and conditions')}
            </a>
            <a href="#" className="text-white/65 no-underline transition-colors hover:text-white">
              {t('Privacy policy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterThree;
