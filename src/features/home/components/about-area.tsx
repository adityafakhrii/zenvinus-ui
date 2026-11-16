import Image from 'next/image';
import { Navigation } from "swiper/modules";
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import AngleArrow from "@/components/icons/angle-arrow";
import { useT } from "@/i18n";

import shape_1 from "@assets/img/about/shape-1.png";
import about from "@assets/img/about/about-1.png";
import {
    RawDataIcon,
    DiscoveryIcon,
    CurationIcon,
    AnnotationIcon,
    QualityControlIcon,
    DatasetIcon,
    TrainingIcon,
    ProductionIcon,
} from '@/components/icons/pipeline-icons';
import type { PipelineStep } from '../types/home';

const about_data: PipelineStep[] = [
    {
        icon: RawDataIcon,
        title: "Raw Data",
        description: "Start from any source — your own data or public datasets, structured or unstructured.",
    },
    {
        icon: DiscoveryIcon,
        title: "Discovery",
        description: "Find and connect the right data from your own sources and available public datasets.",
    },
    {
        icon: CurationIcon,
        title: "Curation",
        description: "Clean, prepare, and organize raw data until it is AI-ready.",
    },
    {
        icon: AnnotationIcon,
        title: "Annotation",
        description: "Label your data with precision, powered by experts and AI assistance.",
    },
    {
        icon: QualityControlIcon,
        title: "Quality Control",
        description: "Validate every output with multi-layer quality checks.",
    },
    {
        icon: DatasetIcon,
        title: "Dataset",
        description: "Build, version, and manage datasets that are ready for training.",
    },
    {
        icon: TrainingIcon,
        title: "Training",
        description: "Train and fine-tune models with fully tracked experiments.",
    },
    {
        icon: ProductionIcon,
        title: "Production",
        description: "Evaluate, register, and ship models to production with confidence.",
    },
]

const setting = {
    slidesPerView: 3,
    spaceBetween: 82,  
    navigation: {
        nextEl: ".about-button-next-1",
        prevEl: ".about-button-prev-1",
    },
    breakpoints: {
        '1860': {
            
        },
        '1800': {
            spaceBetween: 40,
        },
        '1701': {
            
        },
        '1600': {
            
        },
        '1560': {
            
        },
        '1400': {
            spaceBetween:60,
        },
        '1200': {
            spaceBetween:30,
            slidesPerView: 2,
        },
        '992': {
            spaceBetween:60,
            slidesPerView: 2,
        },
        '767': {
            slidesPerView:2
        },
        '576': {
            slidesPerView:2
        },
        '0': {
            slidesPerView:1
        },
    },
}


const AboutArea = () => {
    const { t } = useT();
    const [isLoop, setIsLoop]  = useState(false)
    useEffect(()  => {
        setIsLoop(true)
    }, [])

    return (
        <>
            <section className="tp-about-area pb-45 p-relative">
            <div className="tp-about-shape d-none d-xl-block">
               <Image className="shape-1" src={shape_1} alt="theme-pure" />
            </div>
            <div className="container">
               <div className="row">
                  <div className="col-xl-4 col-lg-12">
                     <div className="tp-about-wrapper-thumb text-center text-xl-start fadeLeft">
                        <Image src={about} alt="theme-pure" />
                     </div>
                  </div>
                  <div className="col-xl-8 col-lg-10">
                     <div className="tp-about-wrapper pl-50">

                        <div className="row">

                           <div className="col-lg-8">
                              <div className="tp-about-title-wrapper p-relative">
                                 <span className="tp-section-title__pre">
                                    {t('best {highlight}', { highlight: <span className="title-pre-color">{t('it service')}</span> })}
                                    <AngleArrow /> 
                                 </span>
                                 <h3 className="tp-section-title">{t('It Industries We’re Offering')}
                                 </h3>
                              </div>
                           </div>

                           <div className="col-lg-4">
                              <div className="tp-about-nav d-none d-md-block p-relative">
                                 <button type="button" className="about-button-prev-1">
                                    <i className="fa-regular fa-arrow-left"></i>
                                 </button>
                                 <button type="button" className="about-button-next-1">
                                    <i className="fa-regular fa-arrow-right"></i>
                                 </button>
                              </div>
                           </div>
                        </div>

                        <div className="tp-about-item-wrapper"> 
                            <Swiper {...setting}  
                                    modules={[Navigation]} 
                                    loop={isLoop} 
                                    className="about-active swiper-container"
                                    >
                                {about_data.map((item, i)  =>  
                                    <SwiperSlide key={i} className="tp-about-item mb-30">
                                        <div className="tp-about-item-thumb">
                                            <item.icon />
                                        </div>
                                        <div className="tp-about-item-content">
                                            <h4 className="about-title">{t(item.title)}</h4>
                                            <p>{t(item.description)}</p>
                                        </div>
                                    </SwiperSlide>  
                                )} 
                                </Swiper>

                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>
        </> 
    );
};

export default AboutArea;