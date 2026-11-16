/** Content blocks of the home page. Text fields are English i18n keys (Indonesian in src/i18n/id/home.ts). */
import type { ComponentType } from 'react';
import type { StaticImageData } from 'next/image';

/** One stage of the data pipeline slider (Raw Data, Discovery, ...) */
export interface PipelineStep {
  icon: ComponentType;
  title: string;
  description: string;
}

/** Data Engine, Community or AI Lab */
export interface Engine {
  num: string;
  /** Path under /public */
  img: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
}

/** An AI field we work in; the title may contain {br} */
export interface Offering {
  id: number;
  img: StaticImageData;
  title: string;
}

/** A card of the community section; `icon` is a key of the section's icon map */
export interface CommunityFeature<IconKey extends string = string> {
  tone: 'blue' | 'mint' | 'purple' | 'orange';
  icon: IconKey;
  img: StaticImageData;
  title: string;
  text: string;
}
