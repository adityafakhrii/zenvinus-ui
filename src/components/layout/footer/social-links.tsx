import React from 'react';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';
import { useT } from '@/i18n';

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

/**
 * Clean outlined social icon buttons matching the Zenvinus Navy footer palette.
 */
const SocialLinks = () => (
  <div className="flex items-center gap-2">
    <Link
      href="https://linkedin.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/75 transition-colors hover:border-teal/50 hover:bg-teal/10 hover:text-teal"
    >
      <LinkedInIcon />
    </Link>
    <Link
      href="https://zenvinus.co.id"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Website"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/75 transition-colors hover:border-teal/50 hover:bg-teal/10 hover:text-teal"
    >
      <Globe className="h-4 w-4" strokeWidth={1.6} />
    </Link>
    <Link
      href="mailto:info@zenvinus.co.id"
      aria-label="Email"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/75 transition-colors hover:border-teal/50 hover:bg-teal/10 hover:text-teal"
    >
      <Mail className="h-4 w-4" strokeWidth={1.6} />
    </Link>
  </div>
);

export default SocialLinks;

export const CopyRight = () => {
  const { t } = useT();
  return (
    <>{t('© Copyright {year} Zenvinus. All Rights Reserved', { year: <span>{new Date().getFullYear()}</span> })}</>
  );
};
