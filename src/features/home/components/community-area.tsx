import React from 'react';
import Image from 'next/image';
import { AnnotationIcon, ShareIcon, EyeIcon, LockIcon } from '@/components/icons/pipeline-icons';
import { useT } from '@/i18n';

import img_hero from "@assets/img/community/01-general-ai-hero.png";
import img_share from "@assets/img/community/02-share-datasets-models.png";
import img_annotation from "@assets/img/community/03-annotation-data-collection.png";
import img_monitoring from "@assets/img/community/04-expert-monitoring.png";
import img_enterprise from "@assets/img/community/05-enterprise-projects.png";
import Button from "@/components/ui/button";
import type { CommunityFeature } from "../types/home";

const icons = { share: ShareIcon, tag: AnnotationIcon, eye: EyeIcon, lock: LockIcon } as const;

const features: CommunityFeature<keyof typeof icons>[] = [
  {
    tone: 'blue',
    icon: 'share',
    img: img_share,
    title: 'Share Datasets & Models',
    text: 'Publish your datasets and models to the community, or build on what others have shared.',
  },
  {
    tone: 'mint',
    icon: 'tag',
    img: img_annotation,
    title: 'Annotation & Collection',
    text: 'Take on annotation and data collection tasks from real enterprise AI projects.',
  },
  {
    tone: 'purple',
    icon: 'eye',
    img: img_monitoring,
    title: 'Expert Monitoring',
    text: 'Every submission is monitored and reviewed by specialists and experts for quality.',
  },
  {
    tone: 'orange',
    icon: 'lock',
    img: img_enterprise,
    title: 'Enterprise-Exclusive Projects',
    text: 'Level up to unlock private, enterprise-only projects with dedicated workforces.',
  },
];

const CommunityArea = () => {
  const { t } = useT();
  return (
    <section className="tp-community-area pt-120 pb-90">
      <div className="zc-wrap container">
        <div className="zc-brand">
          <strong>zenvinus</strong> <span>{t('community')}</span>
          <div className="zc-brand-wave">~~~~~~~</div>
        </div>

        <div className="zc-hero-grid">
          <div className="zc-hero-copy">
            <h3 className="zc-hero-title">
              {t('Work On Real AI Projects,{br}{highlight} For Quality', { br: <br />, highlight: <span>{t('Get Rewarded')}</span> })}
            </h3>
            <p>
              {t('Join a distributed workforce powering enterprise AI — and grow from contributor to specialist to expert.')}
            </p>
          </div>

          <div className="zc-hero-visual">
            <Image src={img_hero} alt={t('Zenvinus AI workforce')} />
          </div>
        </div>

        <div className="zc-feature-grid">
          {features.map((item) => {
            const Icon = icons[item.icon];
            return (
              <article key={item.title} className="zc-feature-card">
                <div className="zc-feature-copy">
                  <div className="zc-icon-bubble"><Icon /></div>
                  <h3>{t(item.title)}</h3>
                  <p>{t(item.text)}</p>
                </div>
                <div className="zc-feature-art">
                  <Image src={item.img} alt={t(item.title)} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="zc-reward-grid">
          <article className="zc-reward-card zc-contributor">
            <div className="zc-reward-icon zc-reward-text">$</div>
            <div className="zc-reward-copy">
              <span className="zc-eyebrow">{t('FOR CONTRIBUTORS')}</span>
              <h2>{t('Contributors Get Paid')}</h2>
              <p>
                {t('For every approved data annotation and data collection task — the higher the quality, the higher the reward.')}
              </p>
            </div>
            <div className="zc-reward-btn"><Button href="/contact">{t('Start Contributing')}</Button></div>
          </article>

          <article className="zc-reward-card zc-expert">
            <div className="zc-reward-icon"><EyeIcon /></div>
            <div className="zc-reward-copy">
              <span className="zc-eyebrow">{t('FOR EXPERTS')}</span>
              <h2>{t('Experts Get Paid')}</h2>
              <p>
                {t('For reviewing community results and handling annotation projects from enterprise.')}
              </p>
            </div>
            <div className="zc-reward-btn"><Button href="/contact">{t('Join as Expert')}</Button></div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default CommunityArea;
