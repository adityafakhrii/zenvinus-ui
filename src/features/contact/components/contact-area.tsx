import React from 'react';
import ContactForm from './contact-form';
import { useT } from '@/i18n';

// Shown in the details list and used by the form (mailto). Keep in sync with the footer.
const CONTACT_EMAIL = 'info@zenvinus.co.id';
const CONTACT_PHONE = { label: '+62 21 5000 8888', href: 'tel:+622150008888' };

/** Contact page: details on the left, the message form on the right. */
const ContactArea = () => {
  const { t } = useT();
  const details = [
    { label: 'Email', value: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> },
    { label: 'Phone', value: <a href={CONTACT_PHONE.href}>{CONTACT_PHONE.label}</a> },
    { label: 'Office', value: 'Jakarta, Indonesia' },
    { label: 'Website', value: <a href="https://zenvinus.co.id" target="_blank" rel="noopener noreferrer">zenvinus.co.id</a> },
  ];

  return (
    <section className="zv-contact">
      <div className="container">
        <div className="row gy-5 gx-lg-5">
          <div className="col-lg-5">
            <h1>{t('Talk to the Zenvinus team')}</h1>
            <p className="zv-contact-lead">
              {t('Tell us about the data you need, ask about a dataset or model, or ask how to join as a contributor. We reply by email.')}
            </p>
            <dl className="zv-contact-details">
              {details.map((d) => (
                <div key={d.label}>
                  <dt>{t(d.label)}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="col-lg-7">
            <div className="zv-contact-card">
              <h2>{t('Send us a message')}</h2>
              <p>{t('Fields marked * are required.')}</p>
              <ContactForm email={CONTACT_EMAIL} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactArea;
