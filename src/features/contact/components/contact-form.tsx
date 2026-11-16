import React, { useState } from "react";
import type { FormEvent } from "react";
import { useT } from "@/i18n";
import Button from "@/components/ui/button";

// What the visitor wants. The English text is the i18n key and goes into the email subject as-is.
const TOPICS = [
  "Custom dataset project",
  "Data annotation",
  "A dataset or model in the catalog",
  "Joining as a contributor or expert",
  "Partnership",
  "Something else",
] as const;

/**
 * Contact form. WHY: the backend has no contact endpoint yet, so submitting opens the visitor's email app
 * with the message filled in (mailto). Replace onSubmit with an API call once an endpoint exists.
 */
export interface ContactFormProps {
  /** Address the message is written to */
  email: string;
}

const ContactForm = ({ email }: ContactFormProps) => {
  const { t } = useT();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (name: string): string => {
      const v = form.get(name);
      return typeof v === "string" ? v : "";
    };
    const f = {
      name: value("name"),
      email: value("email"),
      phone: value("phone"),
      company: value("company"),
      topic: value("topic"),
      message: value("message"),
    };
    const header = [
      `Name: ${f.name}`,
      `Email: ${f.email}`,
      f.phone && `Phone: ${f.phone}`,
      f.company && `Company: ${f.company}`,
      `Topic: ${f.topic}`,
    ].filter(Boolean);
    const subject = `[Zenvinus] ${f.topic} - ${f.name}`;
    const body = `${header.join("\n")}\n\n${f.message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form className="zv-contact-form" onSubmit={onSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="cf-name">{t("Name")} *</label>
          <input id="cf-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="col-md-6">
          <label htmlFor="cf-email">{t("Email")} *</label>
          <input id="cf-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="col-md-6">
          <label htmlFor="cf-phone">{t("Phone")}</label>
          <input id="cf-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="col-md-6">
          <label htmlFor="cf-company">{t("Company or institution")}</label>
          <input id="cf-company" name="company" type="text" autoComplete="organization" />
        </div>
        <div className="col-12">
          <label htmlFor="cf-topic">{t("What is it about?")} *</label>
          <select id="cf-topic" name="topic" required defaultValue="">
            <option value="" disabled>{t("Choose a topic")}</option>
            {TOPICS.map((topic) => <option key={topic} value={topic}>{t(topic)}</option>)}
          </select>
        </div>
        <div className="col-12">
          <label htmlFor="cf-message">{t("Message")} *</label>
          <textarea id="cf-message" name="message" rows={6} required placeholder={t("For a data project: the kind of data, the language, and roughly how much you need.")}></textarea>
        </div>
      </div>
      <div className="zv-contact-submit">
        <Button type="submit">{t("Send Message")}</Button>
        <span>{t("This opens your email app with the message filled in.")}</span>
      </div>
      {sent && (
        <p className="zv-contact-sent" role="status">
          {t("If your email app did not open, write to us directly at {email}.", { email })}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
