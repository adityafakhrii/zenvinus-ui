import React from "react";
import { useT } from "@/i18n";
import Button from "@/components/ui/button";

const ServiceContactForm = () => {
  const { t } = useT();
  return (
    <>
      <form id="contact-form" onClick={(e) => e.preventDefault()} method="POST">
        <div className="row tp-gx-10">
          <div className="col-md-6">
            <div className="tp-service-contact-input">
              <input name="name" type="text" placeholder={t("First Name")} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="tp-service-contact-input">
              <input name="text" type="text" placeholder={t("Last Name")} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="tp-service-contact-input">
              <input name="email" type="email" placeholder={t("Email")} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="tp-service-contact-input">
              <input name="text" type="text" placeholder={t("Phone")} />
            </div>
          </div>
          <div className="col-md-12">
            <div className="tp-service-contact-input">
              <textarea name="message" placeholder={t("Enter Message")}></textarea>
            </div>
          </div>
          <div className="tp-service-contact-btn mt-10">
            <Button type="submit">
              {t("Send Message")}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ServiceContactForm;
