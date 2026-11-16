import React from "react"; 
import Link from "next/link";
import Image from "next/image";
import FooterThree from "@/components/layout/footer/footer"; 
import SEO from "@/components/common/seo";
import HeaderOne from "@/components/layout/header/header";
import { useT } from "@/i18n";
import error_shape from "@assets/img/error/error-shape.png";
import error_img from "@assets/img/error/404.png";


const NotFoundPage = () => {
  const { t } = useT();
  return (
    <>
    <SEO pageTitle={"Oops.! Page Not Found!"} /> 
    <HeaderOne />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <div className="tp-error-area tp-error-ptb p-relative">
              <div className="tp-error-left-shape">
                <Image src={error_shape} alt="theme-pure" />
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-xl-12">
                    <div className="tp-error-content-box text-center">
                      <Image src={error_img} alt="theme-pure" />
                    </div>
                    <div className="tp-error-text-box text-center">
                      <h4 className="error-title-sm">{t("Oops.! Page Not Found!")}</h4>
                      <p>{t("The page you are looking for does not exist.")}</p>
                      <Link
                        className="tp-btn-inner alt-color-black"
                        href="/"
                      >
                        <span className="tp-btn"> {t("Back To Home")}</span>
                        <b></b>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <FooterThree />
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
