import React from 'react';
import Image from 'next/image';

import  business_shape_1 from "@assets/img/business/shape-1.png";
import  business_shape_2 from "@assets/img/business/shape-2.png";
import  business_shape_3 from "@assets/img/business/shape-3.png";
import  business_shape_4 from "@assets/img/business/shape-4.png" ;
import  data_engine_community from "@assets/img/business/data-engine-community.png" ;

import AngleArrow from '@/components/icons/angle-arrow';
import LineArrowTwo from '@/components/icons/line-arrow-2';
import CodeIcon from '@/components/icons/code-icon';
import TechIcon from '@/components/icons/tech-icon';
import { useT } from '@/i18n';

const BusinessArea = () => {
    const { t } = useT();
    return (
        <>
            <section className="tp-business-area p-relative pt-110 pb-115">
            <div className="tp-business-shape">
               <Image className="shape-1 d-none d-lg-block" src={business_shape_1} alt="theme-pure" />
               <Image className="shape-2" src={business_shape_2} alt="theme-pure" />
               <Image className="shape-3" src={business_shape_3} alt="theme-pure" />
               <Image className="shape-4" src={business_shape_4} alt="theme-pure" />
            </div>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <div className="tp-business-thumb-wrapper p-relative">
                        <div className="tp-business-thumb-media text-center">
                           <Image src={data_engine_community} alt={t('Zenvinus — Data Engine & AI Community Hub')} />
                        </div>
                        <div className="circle-animation business-4">
                           <span className="tp-circle-1"></span>
                        </div>
                        <div className="circle-animation business-3">
                           <span className="tp-circle-2"></span>
                        </div>
                        <div className="circle-animation business-2">
                           <span className="tp-circle-3"></span>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-6">
                     <div className="tp-business-title-wrapper">
                        <span className="tp-section-title__pre">
                           {t('why {highlight}', { highlight: <span className="title-pre-color">Zenvinus</span> })}
                           <AngleArrow />
                        </span>
                        <h3 className="tp-section-title">{t('One Platform For Your Entire AI Lifecycle')}
                           <span className="title-left-shape">
                              <LineArrowTwo />
                           </span>
                        </h3>
                        <p>{t('Stop juggling separate vendors for datasets, labeling, and model {br} development. Zenvinus unifies the whole AI workflow in one platform.', { br: <br /> })}</p>
                     </div>
                     <div className="row">

                        <div className="col-lg-6 col-md-6">
                           <div className="tp-business-box mb-30">
                              <div className="tp-business-box-title d-flex align-items-center">
                                 <span>
                                    <CodeIcon />
                                 </span>
                                 <h4 className="tp-business-title">{t('Data Engine')}</h4>
                              </div>
                              <p>{t('From discovery, curation, {br} to AI-ready annotation', { br: <br /> })}</p>
                           </div>
                        </div>

                        <div className="col-lg-6 col-md-6">
                           <div className="tp-business-box mb-30">
                              <div className="tp-business-box-title d-flex align-items-center">
                                 <span>
                                    <TechIcon />
                                 </span>
                                 <h4 className="tp-business-title">{t('Community & AI Lab')}</h4>
                              </div>
                              <p>{t('Distributed human workforce {br} plus research and training', { br: <br /> })}</p>
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
            </div>
         </section>
        </>
    );
};

export default BusinessArea;