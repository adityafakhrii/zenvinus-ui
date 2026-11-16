/** Content of the template-based service pages (/service, /service-details). Text fields are English i18n keys. */
import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

/** Sections shared with other pages: `service` switches to the service page's spacing */
export interface ServiceSectionProps {
  service?: boolean;
}

/** A sample post in the service page's blog block */
export interface ServiceBlogPost {
  id: number;
  img: StaticImageData;
  /** Extra class of the author badge ("active" highlights it) */
  cls?: string;
  user?: StaticImageData;
  user_name?: string;
  category: string;
  date: string;
  comments: string;
  /** Renders and translates itself */
  title: ReactNode;
}

/** One question of the service details FAQ (Bootstrap collapse) */
export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  /** Suffix of the heading/collapse element ids */
  accordion_id: string;
  /** "collapsed" for closed items, "" for the open one */
  collapsed: '' | 'collapsed';
  aria_expanded: 'true' | 'false';
  active: string;
}

/** A service tile; the title may contain {br} */
export interface OurService {
  id: number;
  icon: StaticImageData;
  title: string;
  description: string;
}
