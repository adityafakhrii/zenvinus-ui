import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AngleArrow from '@/components/icons/angle-arrow'; 
import LineArrowTwo from '@/components/icons/line-arrow-2';
import { useT } from '@/i18n';

import offer_shape_1 from "@assets/img/offering/shape.png";
import offer_shape_2 from "@assets/img/offering/shape-2.png";

import offering_img_1 from "@assets/img/offering/img-1.svg";
import offering_img_2 from "@assets/img/offering/img-2.svg";
import offering_img_3 from "@assets/img/offering/img-3.svg";
import offering_img_4 from "@assets/img/offering/img-4.svg";

import type { Offering } from '../types/home';

const offering_data: Offering[] = [
    {
        id: 1,
        img: offering_img_1,
        title: 'Computer {br} Vision',
    },
    {
        id: 2,
        img: offering_img_2,
        title: 'NLP & Speech {br} Intelligence',
    },
    {
        id: 3,
        img: offering_img_3,
        title: 'LLM & {br} Generative AI',
    },
    {
        id: 4,
        img: offering_img_4,
        title: 'Predictive ML {br} & Forecasting',
    },
]

const OfferArea = () => {
    const { t } = useT();
    return (
        <>
           <section className="tp-offer-area p-relative pt-120 pb-90" style={{backgroundImage: `url(/assets/img/offering/bg.png)`}}>
            <div className="tp-offer-overlay"></div>
            <div className="tp-offer-shape">
               <Image className="shape-1 d-none d-xl-block" src={offer_shape_1} alt="theme-pure" />
               <Image className="shape-2" src={offer_shape_2} alt="theme-pure" />
            </div>
            <div className="container">

               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <div className="tp-feature-title-wrapper">
                        <span className="tp-section-title__pre">
                           {t('what {highlight}', { highlight: <span className="title-pre-color">{t('we deliver')}</span> })}
                           <AngleArrow />
                        </span>
                        <h3 className="tp-section-title">{t('AI Project Types We Deliver')}
                           <span className="title-left-shape">
                              <LineArrowTwo />
                           </span>
                        </h3>
                     </div>
                  </div>
                  <div className="col-lg-6">
                     <div id='tp-feature-wrapper2' className="tp-feature-wrapper offer p-relative">
                        <p>{t('From raw data to production-ready AI — delivered by our three engines: {br} Data Engine, Community, and AI Lab.', { br: <br /> })} </p>
                     </div>
                  </div>
               </div>
               <div className="row">
                {offering_data.map((item, i) => 
                    <div key={i} className="col-lg-3 col-md-6 col-sm-6">
                        <div className="tp-offer-wrapper text-center mb-30">
                        <h3 className="offer-title">{t(item.title, { br: <br /> })}</h3>
                        <div className="tp-offer-wrapper-thumb">
                            <Image src={item.img} alt="theme-pure" />
                        </div>
                        <div className="tp-offer-wrapper-btn">
                            <Link href="/service-details">{t('Read Out More')} <i className="fa-solid fa-arrow-up-right"></i></Link>
                        </div>
                        </div>
                    </div>
                )} 

                  <div className="col-lg-12">
                     <div className="tp-offer-all-btn text-center mt-30 fadeUp">
                        <p>{t('Bring them together and you overcome the ordinary.')}
                            <Link href="/service-details">{t('View All Services')}
                            <span><i className="fa-regular fa-plus"></i></span>
                            </Link>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </section> 
        </>
    );
};

export default OfferArea;