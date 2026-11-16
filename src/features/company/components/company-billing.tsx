import React from "react";
import { DashboardFooter, DashboardHeader, KpiGrid, getSpendBreakdown } from "@/features/dashboard";
import { getBillingSummary, getInvoices, getPaymentMethod } from "../data/company-billing";
import { useT } from "@/i18n";

const money = (n: number, locale: string): string => `$${n.toLocaleString(locale)}`;

const CompanyBilling = () => {
  const { t, locale } = useT();
  const invoices = getInvoices();
  const pay = getPaymentMethod();

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120">
          <div className="container">
            <div className="edash-head">
              <div>
                <h3 className="edash-title">{t("Billing & Invoices")}</h3>
                <p className="edash-sub">
                  {t("Payments, invoices and spend for your organization.")}
                </p>
              </div>
              <div className="edash-head-actions">
                <button type="button" className="edash-btn-ghost">
                  <i className="fa-solid fa-credit-card"></i> {t("Update Payment Method")}
                </button>
              </div>
            </div>

            <KpiGrid items={getBillingSummary()} />

            <div className="row g-4">
              <div className="col-xl-8">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Invoices")}</h4>
                      <p className="edash-card-sub">
                        {t("Charged automatically at the start of each period")}
                      </p>
                    </div>
                  </div>
                  <div className="edash-table-wrap">
                    <table className="edash-table">
                      <thead>
                        <tr>
                          <th>{t("Invoice")}</th>
                          <th>{t("Amount")}</th>
                          <th>{t("Method")}</th>
                          <th>{t("Status")}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td>
                              <h5 className="edash-project-name">{inv.id}</h5>
                              <span className="edash-project-id">{t(inv.period)}</span>
                            </td>
                            <td className="edash-td-num">{money(inv.amount, locale)}</td>
                            <td className="edash-td-sm">{inv.method}</td>
                            <td>
                              <span className={`edash-status edash-status-${inv.statusTone}`}>
                                {t(inv.status)}
                              </span>
                            </td>
                            <td className="edash-td-action">
                              {inv.status === "Paid" ? (
                                <button
                                  type="button"
                                  className="edash-icon-btn"
                                  title={t("Download {name}", { name: inv.id })}
                                >
                                  <i className="fa-solid fa-download"></i>
                                </button>
                              ) : (
                                <span className="edash-project-id">{t("due {date}", { date: inv.date })}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-xl-4">
                <div className="d-flex flex-column gap-4 h-100">
                  <div className="edash-card">
                    <div className="edash-card-head">
                      <div>
                        <h4 className="edash-card-title">{t("Payment Method")}</h4>
                        <p className="edash-card-sub">{t("Default for auto-charge")}</p>
                      </div>
                    </div>
                    <div className="edash-pay-row">
                      <span className="edash-card-badge">{pay.brand}</span>
                      <span className="edash-pay-number">•••• {pay.last4}</span>
                    </div>
                    <div className="edash-account-meta edash-account-meta-flush">
                      <span>
                        <i className="fa-solid fa-building-columns"></i> {pay.holder}
                      </span>
                      <span>
                        <i className="fa-regular fa-credit-card"></i> {t("Expires {date}", { date: pay.expiry })}
                      </span>
                      <span>
                        <i className="fa-regular fa-envelope"></i> {pay.email}
                      </span>
                    </div>
                  </div>
                  <div className="edash-card flex-grow-1">
                    <div className="edash-card-head">
                      <div>
                        <h4 className="edash-card-title">{t("Spend by Task Type")}</h4>
                        <p className="edash-card-sub">{t("This month")}</p>
                      </div>
                    </div>
                    <ul className="edash-spend-list">
                      {getSpendBreakdown().map((row) => (
                        <li key={row.label}>
                          <div className="edash-spend-row">
                            <span>{t(row.label)}</span>
                            <strong>{money(row.amount, locale)}</strong>
                          </div>
                          <div className="edash-spend-track">
                            <span style={{ width: `${row.share}%` }}></span>
                          </div>
                          <em>{t("{share}% of total", { share: row.share })}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <DashboardFooter />
    </>
  );
};

export default CompanyBilling;
