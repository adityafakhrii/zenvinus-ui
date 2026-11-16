import React from 'react';
import Image from 'next/image';
import EmailIcon from '@/components/icons/email-icon';
import AngleArrow from '@/components/icons/angle-arrow';
import { useT } from '@/i18n';
// shape import here
import cta_shape_1 from "@assets/img/cta/img.png";
import cta_shape_2 from "@assets/img/cta/img-2.png";
import cta_shape_3 from "@assets/img/cta/bg.png";
import Button from "@/components/ui/button";

const CtaArea = () => {
    const { t } = useT();
    return (
        <>
           <section className="tp-cta-2-area p-relative pt-200 pb-90" style={{backgroundImage: `url(/assets/img/cta/bg-shape.png)`}}>
            <div className="tp-cta-2-shape">
               <Image className="shape-1" src={cta_shape_1} alt="theme-pure" />
               <Image className="shape-2" src={cta_shape_2} alt="theme-pure" />
               <Image className="shape-3" src={cta_shape_3} alt="theme-pure" />
            </div> 
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-xl-4 col-lg-6">
                     <div className="tp-cta-2-content text-center">
                        <div className="tp-cta-2-content-icon">
                           <span>
                            <EmailIcon />                             
                           </span>
                        </div>
                        <div className="tp-cta-2-content-inner">
                           <h3 className="cta-title"><a href="tel:+622150008888">+62 21 5000 8888</a></h3>
                           <a href="mailto:info@zenvinus.co.id">info@zenvinus.co.id</a>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                     <div className="tp-cta-2-title-wrapper">
                        <span className="tp-section-title__pre">
                           {t('feature {highlight}', { highlight: <span className="title-pre-color">{t('IT Solutions')}</span> })}
                           <AngleArrow /> 
                        </span>
                        <h3 className="tp-section-title">
                            {t('We’re Ready to {highlight} IT Business', { highlight: <span className="title-color">{t('Growth')}</span> })} 
                        </h3>
                        <div className="tp-cta-2-btn">
                           <Button href="/contact">{t('Get a Free Quote')}</Button>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-2 "></div>
               </div>
            </div>
         </section> 
        </>
    );
};

export default CtaArea;