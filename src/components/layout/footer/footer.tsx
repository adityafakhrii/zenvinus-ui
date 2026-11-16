import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import footer_logo from "@assets/img/logo/footer-logo.png";
import SocialLinks, { CopyRight } from './social-links';
import EmailAeroplan from '@/components/icons/email-aeroplan';
import { useT } from '@/i18n';
const footer_contact = {
    bg_img: "assets/img/footer/footer-bg.jpg",
    footer_info: "Indonesia's AI data & model training platform. {br}We help companies prepare high-quality data. Visit zenvinus.co.id",
    map_link: "https://www.google.com/maps/search/?api=1&query=Jakarta,+Indonesia",
    address: <>Jakarta, Indonesia</>,
    mail: "info@zenvinus.co.id",
    phone: "+62 21 5000 8888",
    service_links: [
        {title: "Data Annotation", link: "/service"},
        {title: "Dataset Preparation", link: "/service"},
        {title: "AI Model Training", link: "/service"},
        {title: "Text Labeling", link: "/service"},
        {title: "Image Annotation", link: "/service"},
        {title: "Data Collection", link: "/service"},
    ]
}
const {bg_img, footer_info, map_link, address, mail, phone, service_links} = footer_contact

const FooterThree = () => {
    const { t } = useT();
    return (
        <>
           <footer className="tp-footer-3-area p-relative">
                <div className="tp-footer-bg" style={{backgroundImage: `url(${bg_img})`}}></div>
                    <div className="container">
                    <div className="tp-footer-3-main-area">
                        <div className="row">
                        <div className="col-lg-4 col-md-6">
                            <div className="tp-footer-widget tp-footer-3-col-1">
                                <div className="tp-footer-logo">
                                    <Link href="/"> 
                                        <Image src={footer_logo} alt="theme-pure" />
                                    </Link>
                                </div>
                                <div className="tp-footer-widget-content">
                                    <div className="tp-footer-info">
                                    <p className="p">{t(footer_info, { br: <br /> })}</p>
                                    <div className="tp-footer-main-location">
                                        <Link target="_blank" href={map_link}>
                                            <i className="fa-sharp fa-light fa-location-dot"></i> 
                                            {address}
                                        </Link>
                                    </div>
                                    <div className="tp-footer-main-mail">
                                        <a href={`mailto:${mail}`}><i className="fa-light fa-message-dots"></i> 
                                        {mail} <br /> {phone}</a>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="tp-footer-widget tp-footer-3-col-2">
                                <h3 className="tp-footer-widget-title">{t("Services Req")}</h3>
                                <div className="tp-footer-widget-content">
                                    <ul>
                                        {service_links.map((item, i) => <li key={i}><Link href={item.link}>{t(item.title)}</Link></li>)} 
                                    </ul>
                                </div>
                            </div> 
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="tp-footer-widget tp-footer-3-col-3">
                                <h3 className="tp-footer-widget-title">{t("Newsletter")}</h3>
                                <div className="tp-footer-from">
                                    <div className="tp-footer-text-email p-relative">
                                    <input type="text" placeholder={t("Enter Email Address")} />
                                    <span> 
                                        <EmailAeroplan />
                                    </span>
                                    </div>
                                    <div className="tp-footer-form-check">
                                    <input className="form-check-input" id="flexCheckChecked" type="checkbox" />
                                    <label className="form-check-label" htmlFor="flexCheckChecked">
                                        {t("I agree to all your terms and policies")}
                                    </label>
                                </div>
                                <div className="tp-footer-widget-social">
                                    <SocialLinks /> 
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="tp-footer-copyright-area p-relative">
                        <div className="row">
                        <div className="col-md-12 col-lg-6">
                            <div className="tp-footer-copyright-inner">
                               <p> <CopyRight /></p> 
                            </div>
                        </div>
                        <div className="col-md-12 col-lg-6">
                            <div className="tp-footer-copyright-inner text-lg-end">
                                <a href="#">{t("Terms and conditions")}</a>
                                <a className="ml-50" href="#"> {t("Privacy policy")}</a>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </footer> 
        </>
    );
};

export default FooterThree;