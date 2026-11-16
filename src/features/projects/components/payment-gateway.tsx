import Link from "next/link";
import React, { useState } from "react";
import { DashboardHeader, DashboardFooter } from "@/features/dashboard";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changeRequestStatus, selectPostedProject } from "../store/projects-slice";
import useMounted from "@/hooks/use-mounted";
import { useT, type TranslateFn } from "@/i18n";

type PaymentMethodKey = "bca" | "card" | "ewallet" | "qris";

interface PaymentMethod {
  key: PaymentMethodKey;
  label: string;
  desc: string;
  icon: string;
}

/** Checkout steps: choose a method, the simulated processing delay, then the receipt */
type CheckoutStage = "form" | "processing" | "done";

const METHODS: readonly PaymentMethod[] = [
  { key: "bca", label: "BCA Virtual Account", desc: "Transfer to the VA number — verified automatically", icon: "fa-solid fa-building-columns" },
  { key: "card", label: "Credit Card", desc: "Visa / Mastercard — instant", icon: "fa-solid fa-credit-card" },
  { key: "ewallet", label: "E-Wallet", desc: "GoPay · OVO · DANA", icon: "fa-solid fa-wallet" },
  { key: "qris", label: "QRIS", desc: "Scan from any payment app", icon: "fa-solid fa-qrcode" },
];

const idr = (m: number | null | undefined, t: TranslateFn, locale: string): string =>
  m === null || m === undefined || Number.isNaN(Number(m))
    ? t("To be discussed")
    : t("Rp {amount} million", { amount: (Math.round(Number(m) * 10) / 10).toLocaleString(locale) });

/** Payment gateway page — down payment / final checkout before the status moves on. */
const PaymentGateway = () => {
  const { t, locale } = useT();
  const router = useRouter();
  const ready = useMounted();
  const id = ready && typeof router.query.id === "string" ? router.query.id : null;
  const type = router.query.type === "final" ? "final" : "dp";
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => selectPostedProject(state, id));
  const isPosted = project?.kind === "posted";

  const [method, setMethod] = useState<PaymentMethodKey>("bca");
  const [stage, setStage] = useState<CheckoutStage>("form");
  const [ref, setRef] = useState("");

  if (!ready) {
    return (
      <>
        <DashboardHeader />
        <main>
          <div className="tflow-loading"><span className="spinner-border"></span></div>
        </main>
        <DashboardFooter />
      </>
    );
  }

  if (!id || !project || !isPosted) {
    return (
      <>
        <DashboardHeader />
        <main>
          <section className="edash-area pt-40 pb-120">
            <div className="container">
              <div className="edash-card">
                <p className="edash-card-sub" style={{ margin: 0 }}>
                  {t("The payment page is only for requests sent through the wizard.")}{" "}
                  <Link href="/dashboard/projects" className="edash-link">{t("Back to Projects")}</Link>
                </p>
              </div>
            </div>
          </section>
        </main>
        <DashboardFooter />
      </>
    );
  }

  const proposal = project.proposalDoc;
  const total = proposal?.priceJuta ?? null;
  const share = total ? total / 2 : null;
  const amountLabel =
    type === "dp"
      ? proposal?.upfrontLabel || idr(share, t, locale)
      : proposal?.finalLabel || idr(share, t, locale);
  const invoiceNo = `INV-${project.id.replace("PRJ-", "")}-${type.toUpperCase()}`;
  const vaNumber = `8808 ${String(1046 + Number(id.replace(/\D/g, "")) % 8999).padStart(4, "0")} ${String(
    (Number(id.replace(/\D/g, "")) * 7919) % 10000
  ).padStart(4, "0")}`;

  const payNow = () => {
    setStage("processing");
    const to = type === "dp" ? "in_progress" : "completed";
    const note =
      type === "dp"
        ? `Down payment ${amountLabel} paid via ${METHODS.find((m) => m.key === method)?.label}. Work started.`
        : `Final payment ${amountLabel} paid via ${METHODS.find((m) => m.key === method)?.label}. Delivery unlocked.`;
    window.setTimeout(() => {
      const updated = dispatch(changeRequestStatus(id, to, note));
      setRef(`PAY-${updated?.id.replace("PRJ-", "")}-${Date.now().toString().slice(-6)}`);
      setStage("done");
    }, 1600);
  };

  if (stage === "done") {
    return (
      <>
        <DashboardHeader />
        <main>
          <section className="edash-area pt-40 pb-120">
            <div className="container">
              <div className="edash-card edash-success">
                <span className="edash-success-icon">
                  <i className="fa-solid fa-check"></i>
                </span>
                <h4>{t("Payment successful")}</h4>
                <p>
                  {type === "dp"
                    ? t("Down payment received — escrow is active and work has started.")
                    : t("Final payment received — delivery is fully unlocked.")}
                </p>
                <div className="edash-success-meta">
                  <span>{invoiceNo}</span>
                  <span>{amountLabel}</span>
                  <span>{t("Ref {ref}", { ref })}</span>
                </div>
                <div className="edash-success-actions">
                  <Link href={`/dashboard/projects?id=${id}`} className="edash-btn">
                    <i className="fa-solid fa-folder-open"></i> {t("Back to Project")}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120">
          <div className="container">
            <Link href={`/dashboard/projects?id=${id}`} className="edash-back-link">
              <i className="fa-solid fa-arrow-left"></i> {t("Back to Project")}
            </Link>

            <div className="edash-head">
              <div>
                <h3 className="edash-title">{t("Payment Gateway")}</h3>
                <p className="edash-sub">
                  {type === "dp"
                    ? t("50% down payment — required before work starts.")
                    : t("50% final payment — unlocks the full delivery.")}
                </p>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-xl-7">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Payment Method")}</h4>
                      <p className="edash-card-sub">{t("Choose a payment method")}</p>
                    </div>
                  </div>
                  <div className="edash-choices">
                    {METHODS.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        className={`edash-choice${method === m.key ? " edash-choice-active" : ""}`}
                        onClick={() => setMethod(m.key)}
                      >
                        <span className="edash-choice-dot" />
                        <span>
                          <strong>
                            <i className={`${m.icon} edash-pay-method-icon`}></i> {t(m.label)}
                          </strong>
                          <small>{t(m.desc)}</small>
                          {m.key === "bca" && method === m.key && (
                            <small className="edash-va-number">VA: {vaNumber}</small>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>

                  {stage === "form" ? (
                    <div className="edash-stage-actions">
                      <button type="button" className="edash-btn" onClick={payNow}>
                        <i className="fa-solid fa-lock"></i> {t("Pay {amount}", { amount: amountLabel })}
                      </button>
                      <Link
                        href={`/dashboard/projects?id=${id}`}
                        className="edash-btn-ghost"
                      >
                        {t("Cancel")}
                      </Link>
                    </div>
                  ) : (
                    <div className="edash-stage-actions">
                      <span className="edash-saved-note">
                        <span className="spinner-border spinner-border-sm"></span>{" "}
                        {t("Processing payment via {method}…", { method: t(METHODS.find((m) => m.key === method)?.label ?? "") })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-xl-5">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Invoice")}</h4>
                      <p className="edash-card-sub">{invoiceNo}</p>
                    </div>
                  </div>
                  <ul className="edash-quality-list">
                    <li>
                      <span>{t("Project")}</span>
                      <strong>{project.name}</strong>
                    </li>
                    <li>
                      <span>{t("Request ID")}</span>
                      <strong>{project.id}</strong>
                    </li>
                    <li>
                      <span>{t("Total contract")}</span>
                      <strong>{proposal?.priceLabel || t(project.budgetRange || "TBD")}</strong>
                    </li>
                    <li>
                      <span>{type === "dp" ? t("Down payment (50%)") : t("Final payment (50%)")}</span>
                      <strong>{amountLabel}</strong>
                    </li>
                  </ul>
                  <p className="edash-renewal" style={{ marginBottom: 0 }}>
                    <i className="fa-solid fa-lock"></i> {t("Funds are held in Zenvinus escrow and released per approved batch.")}
                  </p>
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

export default PaymentGateway;
