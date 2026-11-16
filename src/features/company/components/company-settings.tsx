import React, { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import { getSettingsProfile, getIndustries, getNotificationPrefs, getSecurity } from "../data/company-settings";
import { useT } from "@/i18n";
import type { NotificationPref, SettingsProfile } from "../types/settings";

/** Editable fields of the company profile form */
type ProfileForm = Pick<SettingsProfile, "name" | "industry" | "website" | "about" | "billingEmail" | "phone" | "address" | "taxId">;
type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const CompanySettings = () => {
  const { t } = useT();
  const profile = getSettingsProfile();
  const industries = getIndustries();
  const security = getSecurity();

  const [form, setForm] = useState<ProfileForm>({
    name: profile.name,
    industry: profile.industry,
    website: profile.website,
    about: profile.about,
    billingEmail: profile.billingEmail,
    phone: profile.phone,
    address: profile.address,
    taxId: profile.taxId,
  });
  const [prefs, setPrefs] = useState<NotificationPref[]>(getNotificationPrefs());
  const [twoFactor, setTwoFactor] = useState(security.twoFactor);
  const [saved, setSaved] = useState(false);
  const [logoName, setLogoName] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);

  const setField = (key: keyof ProfileForm) => (e: ChangeEvent<FieldElement>) => setForm({ ...form, [key]: e.target.value });
  const togglePref = (id: string) =>
    setPrefs(prefs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120">
          <div className="container">
            <div className="edash-head">
              <div>
                <h3 className="edash-title">{t("Settings")}</h3>
                <p className="edash-sub">
                  {t("Company profile, notifications and security for your workspace.")}
                </p>
              </div>
              <div className="edash-head-actions">
                {saved && (
                  <span className="edash-saved-note">
                    <i className="fa-solid fa-circle-check"></i> {t("All changes saved")}
                  </span>
                )}
                <button type="button" className="edash-btn" onClick={handleSave}>
                  <i className="fa-regular fa-floppy-disk"></i> {t("Save Changes")}
                </button>
              </div>
            </div>

            <div className="row g-4 edash-mid">
              <div className="col-xl-8">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Company Profile")}</h4>
                      <p className="edash-card-sub">
                        {t("Shown on orders, invoices and your public workspace.")}
                      </p>
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Company Name")}</label>
                      <input
                        className="edash-input"
                        type="text"
                        value={form.name}
                        onChange={setField("name")}
                      />
                    </div>
                    <div className="edash-field">
                      <label>{t("Industry")}</label>
                      <select
                        className="edash-input"
                        value={form.industry}
                        onChange={setField("industry")}
                      >
                        {industries.map((i) => (
                          <option key={i} value={i}>{t(i)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Website")}</label>
                    <input
                      className="edash-input"
                      type="url"
                      value={form.website}
                      onChange={setField("website")}
                    />
                  </div>
                  <div className="edash-field">
                    <label>{t("About")}</label>
                    <textarea
                      className="edash-input edash-input-sm"
                      value={form.about}
                      onChange={setField("about")}
                    />
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Billing Email")}</label>
                      <input
                        className="edash-input"
                        type="email"
                        value={form.billingEmail}
                        onChange={setField("billingEmail")}
                      />
                    </div>
                    <div className="edash-field">
                      <label>{t("Phone")}</label>
                      <input
                        className="edash-input"
                        type="text"
                        value={form.phone}
                        onChange={setField("phone")}
                      />
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Registered Address")}</label>
                    <input
                      className="edash-input"
                      type="text"
                      value={form.address}
                      onChange={setField("address")}
                    />
                  </div>
                  <div className="edash-field">
                    <label>{t("Tax ID (NPWP)")}</label>
                    <input
                      className="edash-input"
                      type="text"
                      value={form.taxId}
                      onChange={setField("taxId")}
                    />
                  </div>
                </div>
              </div>

              <div className="col-xl-4">
                <div className="edash-card edash-brand-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Workspace")}</h4>
                      <p className="edash-card-sub">{t("Identity & account facts")}</p>
                    </div>
                  </div>
                  <div className="edash-brand-box">
                    <span className="edash-brand-avatar">{form.name.charAt(0)}</span>
                    <div className="edash-brand-meta">
                      <strong>{form.name}</strong>
                      <span>{t("Customer since {date}", { date: profile.memberSince })}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="edash-btn-ghost w-100"
                    onClick={() => logoInput.current?.click()}
                  >
                    <i className="fa-solid fa-image"></i> {t("Upload Company Logo")}
                  </button>
                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setLogoName(e.target.files?.[0]?.name || "")}
                  />
                  {logoName && (
                    <p className="edash-brand-file">
                      <i className="fa-solid fa-check"></i> {t("{name} ready to upload", { name: logoName })}
                    </p>
                  )}
                  <ul className="edash-quality-list edash-brand-facts">
                    <li>
                      <span>{t("Plan")}</span>
                      <strong>Enterprise</strong>
                    </li>
                    <li>
                      <span>{t("Customer Success")}</span>
                      <strong>{profile.manager}</strong>
                    </li>
                    <li>
                      <span>{t("Workspace ID")}</span>
                      <strong>WS-2261</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row g-4 edash-mid">
              <div className="col-xl-6">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Notifications")}</h4>
                      <p className="edash-card-sub">
                        {t("Sent to {email}", { email: form.billingEmail || t("your billing email") })}
                      </p>
                    </div>
                  </div>
                  <ul className="edash-pref-list">
                    {prefs.map((p) => (
                      <li key={p.id}>
                        <div className="edash-pref-body">
                          <h5>{t(p.label)}</h5>
                          <p>{t(p.desc)}</p>
                        </div>
                        <label className="edash-switch">
                          <input
                            type="checkbox"
                            checked={p.enabled}
                            onChange={() => togglePref(p.id)}
                          />
                          <span></span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-xl-6">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Security")}</h4>
                      <p className="edash-card-sub">
                        {t("Last login {date}", { date: security.lastLogin })}
                      </p>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Email (Owner login)")}</label>
                    <input className="edash-input" type="email" value={security.email} disabled />
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("New Password")}</label>
                      <input className="edash-input" type="password" placeholder="••••••••" />
                    </div>
                    <div className="edash-field">
                      <label>{t("Confirm Password")}</label>
                      <input className="edash-input" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="edash-pref-body edash-2fa">
                    <div className="edash-pref-body">
                      <h5>{t("Two-factor authentication")}</h5>
                      <p>{t("Require an authenticator code for every owner sign-in.")}</p>
                    </div>
                    <label className="edash-switch">
                      <input
                        type="checkbox"
                        checked={twoFactor}
                        onChange={() => setTwoFactor(!twoFactor)}
                      />
                      <span></span>
                    </label>
                  </div>
                  <p className="edash-renewal">
                    <i className="fa-solid fa-desktop"></i> {t("{count} active sessions — sign out of unused devices from your account menu", { count: security.sessions })}
                  </p>
                </div>
              </div>
            </div>

            <div className="edash-card edash-danger">
              <div className="edash-danger-main">
                <h4 className="edash-card-title">{t("Danger Zone")}</h4>
                <p className="edash-card-sub">
                  {t("Irreversible actions — escrowed funds must be fully released first.")}
                </p>
              </div>
              <div className="edash-danger-actions">
                <button type="button" className="edash-btn-danger">
                  <i className="fa-solid fa-user-lock"></i> {t("Transfer Ownership")}
                </button>
                <button type="button" className="edash-btn-danger">
                  <i className="fa-regular fa-trash-can"></i> {t("Delete Workspace")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <DashboardFooter />
    </>
  );
};

export default CompanySettings;
