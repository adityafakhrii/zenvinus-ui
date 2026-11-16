import React from 'react'
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react'
 

import LineArrowFour from '@/components/icons/line-arrow-4';
import { useT } from '@/i18n';
import Button from "@/components/ui/button";

const setting = {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    // Navigation arrows
    navigation: {
        nextEl: ".hero-button-next-1",
        prevEl: ".hero-button-prev-1",
    },
    breakpoints: {
        '1200': {
            
        },
        '992': {
            
        },
        '768': {
            
        },
        '576': {
            
        },
        '0': {
            
        },
    },
    }
const slider_data = [
    "Data Engine",
    "Community",
    "AI Lab",
]
const HeroArea = () => {
  const { t } = useT();
  return (
    <>
         <section className="tp-hero-2-area p-relative">
            <div className="tp-hero-2-wrapper p-relative">
               <div className="container">
                  <div className="row align-items-center justify-content-center">
                     <div className="col-xl-12">
                        <div className="tp-hero-2-content text-center pt-200">
                           <div className="tp-hero-2-title-wrapper fadeUp">
                              <h3 className="tp-hero-2-title">{t('Build Better AI {arrow}{br} With {highlight}', { arrow: <LineArrowFour />, br: <br />, highlight: <span>{t('Better Data')}</span> })}</h3>
                        </div>
                           
                           <div className="tp-hero-2-btns fadeUp">
                              <Button href="/contact">{t('Start Your AI Project')}</Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="tp-hero-2-bottom p-relative d-none d-md-block">
               <Swiper {...setting} modules={[Navigation]} className="hero-active-2">
                {slider_data.map((item, i)  => 
                    <SwiperSlide key={i}>
                        <h3 className="tp-hero-2-bottom-title">{t(item)}</h3>
                    </SwiperSlide>
                )} 
               </Swiper>
               <div className="tp-hero-2-nav d-none d-xl-block">
                  <button type="button" className="hero-button-prev-1">{t('prev')}</button>
                  <button type="button" className="hero-button-next-1">{t('Next')}</button>
               </div>
            </div>
         </section>
    </>
  )
}

export default HeroArea