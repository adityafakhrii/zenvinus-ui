import React from "react";
import Link from "next/link";
import Image from "next/image";
import breadcrumb_img from "@assets/img/breadcrumb/titile.svg";
import { useT } from "@/i18n";

// The banner image follows the page title; pages without their own image (Service) use the about one
const HERO_KEYS = ['about', 'blog', 'news', 'dataset', 'model', 'task'] as const;
const HERO_FILES: Partial<Record<(typeof HERO_KEYS)[number], string>> = { dataset: 'datasets', model: 'models', task: 'tasks' };

const heroBg = (title = ''): string => {
  const t = title.toLowerCase();
  const key = t.includes('contact') ? undefined : HERO_KEYS.find((k) => t.includes(k));
  const file = t.includes('contact') ? 'contact-us' : (key && (HERO_FILES[key] ?? key)) || 'about';
  return `/assets/img/breadcrumb/zenvinus-hero-${file}.png`;
};

export interface BreadcrumbProps {
  /** Big title (English i18n key) */
  top_title?: string;
  /** Last crumb (English i18n key); also picks the banner image */
  page_title?: string;
  bg_img?: string;
}

const Breadcrumb = ({ top_title = "Our Company", page_title = "Our Company", bg_img = heroBg(page_title) }: BreadcrumbProps) => {
  const { t } = useT();
  return (
    <>
      <section
        className="breadcrumb__area breadcrumb-style pt-190 pb-210 p-relative z-index-1"
        style={{backgroundImage: `url(${bg_img})`}}>
        <div className="breadcrumb__bg-overlay m-img"></div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="breadcrumb__content text-center">
                <h3 className="breadcrumb__title">
                  {t(top_title)}
                  <Image src={breadcrumb_img} alt="theme-pure" />
                </h3>
                <div className="breadcrumb__list breadcrumb__list-translate">
                  <span> <Link href="/">{t("Home")}</Link> </span>
                  <span className="dvdr"><i className="fa-regular fa-angle-right"></i></span>
                  <span>{t("pages")}</span>
                  <span className="dvdr"> <i className="fa-regular fa-angle-right"></i> </span>
                  <span>{t(page_title)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Breadcrumb;
