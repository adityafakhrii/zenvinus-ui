import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useT } from "@/i18n";
import type { AboutLayer, AboutNumber, AboutPillar, TimelineYear } from "../types/about";

import pipeline_img from "@assets/img/about/about-1.png";
import community_img from "@assets/img/business/data-engine-community.png";
import platform_img from "@assets/img/community/01-general-ai-hero.png";

/**
 * About page. Follows the section order of mangoboost.io/company/about, with its own layout:
 * 1. intro (text left, image right) with the four layers as a numbered 01-04 flow,
 * 2. problem statement (text left, image right) with the company pillars in a 2x2 grid below,
 * 3. numbers in a dark panel next to an image, 4. timeline (horizontal, hidden while empty),
 * 5. a light call-to-action card (text left, buttons right).
 * MangoBoost's offices map and partner/investor logos are left out until there are real ones to show.
 * Copy is English (the i18n key); Indonesian lives in src/i18n/id/about.ts.
 */

// The chain from raw data to a delivered dataset; each layer is one part we run ourselves
const LAYERS: AboutLayer[] = [
  {
    tag: "Collection",
    title: "Collection and curation",
    text: "We gather text, images, audio and video, then filter, de-duplicate and balance the sources before anything is labeled.",
  },
  {
    tag: "Annotation",
    title: "Annotation",
    text: "Contributors label each item on the platform, following written guidelines for the task. They are paid for each approved task.",
  },
  {
    tag: "Quality control",
    title: "Expert review",
    text: "Experts check the results. Work that misses the bar goes back for revision, and each batch gets a quality report.",
  },
  {
    tag: "Delivery",
    title: "Delivery",
    text: "Ready-made datasets in the catalog, or a custom project delivered in batches. Data ships as versioned splits with documentation and a license.",
  },
];

// Company pillars, as on mangoboost.io (Origin, Mission, Vision, Values).
// Source: Profil_Zenvora_Inteligensia_Nusantara.docx (founded 2024, vision, mission, ethics and data security).
const PILLARS: AboutPillar[] = [
  {
    label: "Origin",
    title: "Started in 2024",
    text: "Zenvinus is built by PT Zenvora Inteligensia Nusantara, an Indonesian AI company founded in 2024 to close the gap between global AI and what Indonesia needs.",
  },
  {
    label: "Mission",
    title: "Indonesian data that is ready to use",
    text: "Collect, label and check data in Indonesian languages, then deliver it with documentation and a license so teams can train and test models on it.",
  },
  {
    label: "Vision",
    title: "AI that serves Indonesia",
    text: "To be a main partner in Indonesia's digital transformation, with AI that benefits people and industry, starting with the data it learns from.",
  },
  {
    label: "Values",
    title: "Clear about data, fair to people",
    text: "We keep data secure and follow AI ethics, show what is in a dataset before you use it, and pay contributors for every approved task.",
  },
];

// WHY: placeholder figures carried over from the old counter; replace them with current numbers before launch
const NUMBERS: AboutNumber[] = [
  { value: "19,432", label: "annotated samples" },
  { value: "4,821", label: "contributors" },
  { value: "94%", label: "of reviewed work passes quality control" },
  { value: "16", label: "Indonesian datasets in the catalog" },
];

// Company history, newest first. The section stays hidden while this is empty.
// Add real milestones only, e.g. { year: "2025", title: "Platform launch", items: ["Dataset catalog opened"] }
// (the English text is the i18n key; add the Indonesian to src/i18n/id/about.ts).
const TIMELINE: TimelineYear[] = [];

const AboutPage = () => {
  const { t, locale } = useT();
  const num = (v: string): string => (/^[\d,]+$/.test(v) ? Number(v.replace(/,/g, "")).toLocaleString(locale) : v);

  return (
    <div className="zv-about">
      {/* 1. Intro + the four layers as a flow */}
      <section className="zv-about-intro-sec">
        <div className="container">
          <div className="row align-items-center gy-5 gx-lg-5">
            <div className="col-lg-7">
              <h1>
                {t("AI training data for")} <span className="zv-about-accent">{t("Indonesia")}</span>.
                <br />
                {t("From collection to delivery.")}
              </h1>
              <p className="zv-about-lead">
                {t("Zenvinus runs every step itself: collecting and curating the data, having it labeled by a community of contributors, having experts review it, and delivering it with documentation and a license.")}
              </p>
            </div>
            <div className="col-lg-5">
              <Image src={pipeline_img} alt={t("The Zenvinus data pipeline, from raw data to production")} className="zv-about-figure" priority sizes="(max-width: 991px) 80vw, 35vw" />
            </div>
          </div>

          <ol className="zv-about-flow">
            {LAYERS.map((l, i) => (
              <li key={l.title}>
                <span className="zv-about-step">{String(i + 1).padStart(2, "0")}</span>
                <span className="zv-about-kicker">{t(l.tag)}</span>
                <h3>{t(l.title)}</h3>
                <p>{t(l.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 2. Problem statement, then the company pillars */}
      <section className="zv-about-why">
        <div className="container">
          <div className="row align-items-center gy-5 gx-lg-5">
            <div className="col-lg-6">
              <h2>{t("Most AI is not trained on Indonesian data.")}</h2>
              <p>{t("Most AI models are trained largely on data from outside Indonesia, so they often handle Indonesian languages, local terms and everyday context less well.")}</p>
              <p>{t("More data from elsewhere does not fix that. The data has to be collected, labeled and checked by people who know the language and the context. That is the work we do.")}</p>
            </div>
            <div className="col-lg-6">
              <Image src={community_img} alt={t("Data flowing from sources through the Zenvinus platform to contributors")} className="zv-about-photo" sizes="(max-width: 991px) 100vw, 45vw" />
            </div>
          </div>

          <div className="zv-about-pillars">
            {PILLARS.map((p) => (
              <div key={p.label}>
                <span className="zv-about-kicker">{t(p.label)}</span>
                <h3>{t(p.title)}</h3>
                <p>{t(p.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Numbers */}
      <section className="zv-about-numbers">
        <div className="container">
          <div className="zv-about-num-panel">
            <div className="zv-about-num-media">
              <Image src={platform_img} alt={t("The Zenvinus platform for datasets, models and contributors")} sizes="(max-width: 991px) 100vw, 40vw" />
            </div>
            <div className="zv-about-num-body">
              <h2>{t("In numbers.")}</h2>
              <dl className="zv-about-num-grid">
                {NUMBERS.map((n) => (
                  <div key={n.label}>
                    <dt>{num(n.value)}</dt>
                    <dd>{t(n.label)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Timeline */}
      {TIMELINE.length > 0 && (
        <section className="zv-about-timeline">
          <div className="container">
            <h2>{t("Our journey")}</h2>
            <ol className="zv-about-years">
              {TIMELINE.map((y) => (
                <li key={y.year}>
                  <span className="zv-about-year">{y.year}</span>
                  {y.title && <span className="zv-about-kicker">{t(y.title)}</span>}
                  <ul>{y.items.map((it) => <li key={it}>{t(it)}</li>)}</ul>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 5. Call to action */}
      <section className="zv-about-cta">
        <div className="container">
          <div className="zv-about-cta-card">
            <div>
              <h2>{t("Work with us.")}</h2>
              <p>{t("Need data for a project, want to join as a contributor, or want to use our datasets? Write to us and we will get back to you as soon as we can.")}</p>
            </div>
            <div className="zv-about-cta-actions">
              <Link href="/contact" className="zv-about-btn">{t("Contact us")}</Link>
              <Link href="/tasks" className="zv-about-btn is-outline">{t("See open tasks")}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
