/** Content blocks of the About page. Text fields are English i18n keys (Indonesian in src/i18n/id/about.ts). */

/** One step of the data pipeline (Collection, Annotation, ...) */
export interface AboutLayer {
  tag: string;
  title: string;
  text: string;
}

/** Origin, Mission, Vision or Values */
export interface AboutPillar {
  label: string;
  title: string;
  text: string;
}

export interface AboutNumber {
  /** Digits with thousands commas ("19,432") are reformatted for the language; anything else is shown as written */
  value: string;
  label: string;
}

/** One year of the company timeline */
export interface TimelineYear {
  year: string;
  title?: string;
  items: string[];
}
