import Link from "next/link";
import React from "react";
import { getCompanyOrderDetail, getOrderStageDetail, ORDER_PIPELINE } from "../data/company-orders";
import { useT } from "@/i18n";
import { useAppSelector } from "@/store/hooks";
import { selectPostedProjects } from "../store/projects-slice";
import type { OrderDeliverables, OrderDetail, TimelineStep } from "../types/order";

const ORDER_PIPELINE_KEYS = ORDER_PIPELINE.map((s) => s.key);

const money = (n: number, locale: string) => `$${n.toLocaleString(locale)}`;

interface PipelineTimelineProps {
  orderId: string;
  timeline: TimelineStep[];
}

const PipelineTimeline = ({ orderId, timeline }: PipelineTimelineProps) => {
  const { t } = useT();
  return (
  <div className="edash-card h-100">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Pipeline")}</h4>
        <p className="edash-card-sub">{t("Request → Expert Review → Proposal → Delivery")}</p>
      </div>
    </div>
    <ul className="edash-pipeline">
      {timeline.map((step, i) => (
        <li key={step.key} className={`edash-pipeline-step edash-pipeline-${step.state}`}>
          <Link
            href={`/dashboard/projects?id=${orderId}&stage=${step.key}`}
            className="edash-pipeline-link"
          >
            <span className="edash-pipeline-dot">
              <i className={step.state === "done" ? "fa-solid fa-check" : step.icon}></i>
            </span>
            <div className="edash-pipeline-body">
              <h5>
                {i + 1}. {t(step.label)}
              </h5>
              <p>{t(step.desc ?? "")}</p>
              {step.date && <span className="edash-pipeline-date">{step.date}</span>}
              <span className="edash-pipeline-open">
                {t("Open stage page")} <i className="fa-regular fa-angle-right"></i>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </div>
  );
};

const PaymentsCard = ({ payments }: { payments: OrderDetail["payments"] }) => {
  const { t, locale } = useT();
  return (
  <div className="edash-card">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Payments")}</h4>
        <p className="edash-card-sub">{t("50% escrow upfront · 50% on completion")}</p>
      </div>
    </div>
    {[payments.upfront, payments.final].map((p) => (
      <div className="edash-pay-stage" key={p.label}>
        <div className="edash-pay-stage-row">
          <div>
            <h5>{t(p.label)}</h5>
            <p>{p.state === "paid" ? t("Paid {date}", { date: p.date }) : t("Releases at this stage")}</p>
          </div>
          <div className="edash-pay-stage-right">
            <strong>
              {typeof p.amount === "string" ? p.amount : money(p.amount, locale)}
            </strong>
            <span className={`edash-status ${p.state === "paid" ? "edash-status-mint" : "edash-status-amber"}`}>
              {p.state === "paid" ? t("Paid") : t("Pending")}
            </span>
          </div>
        </div>
      </div>
    ))}
    <p className="edash-renewal edash-pay-note">
      <i className="fa-solid fa-lock"></i> {t("Funds are held in escrow and released per approved milestone.")}
    </p>
  </div>
  );
};

const DeliverablesCard = ({ deliverables }: { deliverables: OrderDeliverables | null }) => {
  const { t, locale } = useT();
  if (!deliverables) {
    return (
      <div className="edash-card edash-deliverables-locked">
        <div className="edash-card-head">
          <div>
            <h4 className="edash-card-title">{t("Datasets, Models & Inference")}</h4>
            <p className="edash-card-sub">{t("Unlocked after final payment")}</p>
          </div>
          <span className="edash-status edash-status-amber">
            <i className="fa-solid fa-lock"></i> {t("Locked")}
          </span>
        </div>
        <p className="edash-deliverables-note">
          {t("Once the {payment} is verified, the final datasets, trained models and inference endpoint appear right here — ready to download and use.", { payment: <strong>{t("Full Payment")}</strong> })}
        </p>
      </div>
    );
  }

  return (
    <div className="edash-card">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Datasets, Models & Inference")}</h4>
          <p className="edash-card-sub">{t("Delivered {date} — yours to keep", { date: "Nov 04, 2026" })}</p>
        </div>
        <span className="edash-status edash-status-mint">
          <i className="fa-solid fa-circle-check"></i> {t("Delivered")}
        </span>
      </div>

      <h6 className="edash-deliv-heading">{t("Datasets")}</h6>
      <ul className="edash-activity edash-deliv-list">
      {deliverables.datasets?.length === 0 && (
        <li>
          <div className="edash-activity-body"><p>{t("No dataset files.")}</p></div>
        </li>
      )}
        {deliverables.datasets.map((d) => (
          <li key={d.name}>
            <span className="edash-tone-blue edash-activity-icon">
              <i className="fa-solid fa-file-zipper"></i>
            </span>
            <div className="edash-activity-body">
              <h5>{d.name}</h5>
              <p>{t("{count} items", { count: d.items.toLocaleString(locale) })} · {d.size} · {d.date}</p>
            </div>
            <button type="button" className="edash-icon-btn" title={t("Download {name}", { name: d.name })}>
              <i className="fa-solid fa-download"></i>
            </button>
          </li>
        ))}
      </ul>

      {deliverables.models.length > 0 && (
        <>
        <h6 className="edash-deliv-heading">{t("Models")}</h6>
        <ul className="edash-activity edash-deliv-list">
        {deliverables.models.map((m) => (
          <li key={m.name}>
            <span className="edash-tone-purple edash-activity-icon">
              <i className="fa-solid fa-cubes"></i>
            </span>
            <div className="edash-activity-body">
              <h5>{m.name}</h5>
              <p>{m.framework} · {m.metric}</p>
            </div>
            <Link href={m.href} className="edash-link">
              {t("Open")} <i className="fa-regular fa-angle-right"></i>
            </Link>
          </li>
        ))}
        </ul>
        </>
      )}

      {deliverables.inference && (
        <>
        <h6 className="edash-deliv-heading">{t("Inference")}</h6>
      <div className="edash-infer-box">
        <span className="edash-tone-mint edash-activity-icon">
          <i className="fa-solid fa-bolt"></i>
        </span>
        <div className="edash-activity-body">
          <h5>{t("Endpoint Live")}</h5>
          <p>
            <code>{deliverables.inference.endpoint}</code>
          </p>
          <p>
            {deliverables.inference.region} · {deliverables.inference.latency}
          </p>
        </div>
        <span className="edash-status edash-status-mint">
          {t(deliverables.inference.status)}
        </span>
      </div>
        </>
      )}
    </div>
  );
};


/* Page of one pipeline stage — /dashboard/projects?id=..&stage=<key> */
interface OrderStagePageProps {
  orderId: string;
  stageKey: string;
}

const OrderStagePage = ({ orderId, stageKey }: OrderStagePageProps) => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const { order, idx, meta, stage, content } = getOrderStageDetail(posted, orderId, stageKey);
  const prev = idx > 0 ? ORDER_PIPELINE_KEYS[idx - 1] : null;
  const next = idx < ORDER_PIPELINE_KEYS.length - 1 ? ORDER_PIPELINE_KEYS[idx + 1] : null;
  const stateLabel = stage.state === "done" ? t("Done") : stage.state === "active" ? t("In progress") : t("Waiting");

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <Link href={`/dashboard/projects?id=${order.id}`} className="edash-back-link">
          <i className="fa-solid fa-arrow-left"></i> {t("Back to {id}", { id: order.id })}
        </Link>

        <div className="edash-card edash-stage-tracker">
          {order.timeline.map((s) => (
            <Link
              key={s.key}
              href={`/dashboard/projects?id=${order.id}&stage=${s.key}`}
              className={`edash-stage-dot edash-pipeline-${s.state}${
                s.key === stageKey ? " edash-stage-dot-current" : ""
              }`}
              title={t("Stage {key} — {label}", { key: s.key, label: t(s.label) })}
            >
              <i className={s.state === "done" ? "fa-solid fa-check" : "fa-solid fa-circle"}></i>
            </Link>
          ))}
        </div>

        <div className="edash-card edash-dhero">
          <div className="edash-dhero-main">
            <span className={`edash-pipeline-dot edash-pipeline-${stage.state} edash-stage-hero-dot`}>
              <i className={stage.state === "done" ? "fa-solid fa-check" : meta.icon}></i>
            </span>
            <div>
              <div className="edash-dhero-title-row">
                <h3 className="edash-dhero-title">{t(meta.label)}</h3>
                <span className={`edash-status edash-status-${stage.state === "done" ? "mint" : stage.state === "active" ? "blue" : "amber"}`}>
                  {stateLabel}
                </span>
              </div>
              <span className="edash-project-id">
                {order.id} · {order.title} · {t("Stage {n} of 8", { n: idx + 1 })}
              </span>
              <p className="edash-dhero-desc">{t(stage.desc ?? "")}</p>
              {stage.date && (
                <div className="edash-meta-row">
                  <span>
                    <i className="fa-regular fa-calendar"></i> {stage.date}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-8">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Stage Details")}</h4>
                  <p className="edash-card-sub">{t(content.intro || stage.desc || "")}</p>
                </div>
              </div>

              {content.kind === "info" && (
                <ul className="edash-quality-list">
                  {content.rows.map((r) => (
                    <li key={r.label}>
                      <span>
                        <i className={`${r.icon} edash-stage-row-icon`}></i> {t(r.label)}
                      </span>
                      <strong>{t(r.value)}</strong>
                    </li>
                  ))}
                </ul>
              )}

              {content.kind === "proposal" && (
                <>
                  <div className="edash-budget-box">
                    <div className="edash-budget-row">
                      <span>{t("Document")}</span>
                      <span>{content.doc.id}</span>
                    </div>
                    {content.doc.rows.map((r) => (
                      <div className="edash-budget-row" key={r.label}>
                        <span>{t(r.label)}</span>
                        <span>{t(r.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="edash-stage-actions">
                    <button
                      type="button"
                      className="edash-btn"
                      disabled={stage.state !== "active"}
                      title={stage.state !== "active" ? t("The proposal has already been decided") : t("Accept the proposal & continue to the 50% payment")}
                    >
                      <i className="fa-solid fa-handshake"></i> {t("Accept Proposal")}
                    </button>
                    <button type="button" className="edash-btn-ghost" disabled={stage.state !== "active"}>
                      {t("Request Revision")}
                    </button>
                  </div>
                </>
              )}

              {content.kind === "payment" && (
                <>
                  <ul className="edash-quality-list">
                    {content.rows.map((r) => (
                      <li key={r.label}>
                        <span>
                          <i className={`${r.icon} edash-stage-row-icon`}></i> {t(r.label)}
                        </span>
                        <strong>{t(r.value)}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="edash-stage-actions">
                    <button
                      type="button"
                      className="edash-btn"
                      disabled={stage.state === "done"}
                    >
                      <i className="fa-solid fa-credit-card"></i>{" "}
                      {stage.state === "done" ? t("Already paid") : t("Pay Now")}
                    </button>
                  </div>
                </>
              )}

              {content.kind === "batches" && (
                <ul className="edash-spend-list">
                  {content.batches.map((b) => (
                    <li key={b.id}>
                      <div className="edash-spend-row">
                        <span>{b.label}</span>
                        <strong>{t("{count} items", { count: b.items.toLocaleString(locale) })}</strong>
                      </div>
                      <div className="edash-spend-track">
                        <span style={{ width: `${b.delivered}%` }}></span>
                      </div>
                      <em>{t("{pct}% delivered", { pct: b.delivered })}</em>
                    </li>
                  ))}
                </ul>
              )}

              {content.kind === "delivery" && (
                <p className="edash-deliverables-note">
                  {order.deliverables
                    ? t("Full details of the datasets, models and inference endpoint are in the order summary below.")
                    : t("Deliverables stay locked until the Full Payment is verified.")}
                </p>
              )}
            </div>
          </div>
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Pipeline Navigation")}</h4>
                  <p className="edash-card-sub">{t("Jump between stages")}</p>
                </div>
              </div>
              <ul className="edash-stage-nav">
                {order.timeline.map((s, i) => (
                  <li key={s.key}>
                    <Link
                      href={`/dashboard/projects?id=${order.id}&stage=${s.key}`}
                      className={`edash-stage-nav-item${s.key === stageKey ? " edash-stage-nav-current" : ""}`}
                    >
                      <span className="edash-stage-nav-num">{i + 1}</span>
                      {t(s.label)}
                      {s.state === "done" && (
                        <i className="fa-solid fa-check edash-stage-nav-done"></i>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="edash-stage-actions">
                {prev && (
                  <Link
                    href={`/dashboard/projects?id=${order.id}&stage=${prev}`}
                    className="edash-btn-ghost"
                  >
                    <i className="fa-solid fa-arrow-left"></i> {t("Previous")}
                  </Link>
                )}
                {next && (
                  <Link
                    href={`/dashboard/projects?id=${order.id}&stage=${next}`}
                    className="edash-btn"
                  >
                    {t("Next")} <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export interface OrdersViewProps {
  /** PRJ-* or REQ-* id */
  id: string;
  /** Stage key: shows that stage page instead of the summary */
  stage?: string;
  backHref?: string;
  /** English i18n key */
  backLabel?: string;
}

export const OrdersView = ({ id, stage, backHref = "/dashboard", backLabel = "Back to Dashboard" }: OrdersViewProps) => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const order = getCompanyOrderDetail(posted, id);

  if (stage) {
    return <OrderStagePage orderId={order.id} stageKey={stage} />;
  }

  const pct = Math.round((order.stage / 8) * 100);

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <Link href={backHref} className="edash-back-link">
          <i className="fa-solid fa-arrow-left"></i> {t(backLabel)}
        </Link>

        <div className="edash-card edash-dhero">
          <div className="edash-dhero-main">
            <span className={`edash-tone-${order.tone} edash-dhero-icon`}>
              <i className={order.icon}></i>
            </span>
            <div>
              <div className="edash-dhero-title-row">
                <h3 className="edash-dhero-title">{order.title}</h3>
                <span className={`edash-status edash-status-${order.statusTone}`}>
                  {t(order.status)}
                </span>
              </div>
              <span className="edash-project-id">
                {order.id} · {t(order.type)} · {t("requested {date}", { date: order.date })}
              </span>
              <p className="edash-dhero-desc">
                {t("Custom order with the full pipeline: expert review, proposal, milestone payments and final delivery.")}
              </p>
              <div className="edash-progress-cell edash-dhero-progress">
                <div className="tflow-progress">
                  <span style={{ width: `${pct}%` }}></span>
                </div>
                <em>{pct}%</em>
              </div>
            </div>
          </div>
          <div className="edash-dhero-side">
            <div className="edash-dhero-price">
              <strong>
                {typeof order.amount === "string"
                  ? order.amount
                  : money(order.amount, locale)}
              </strong>
              <span>{t("total contract value")}</span>
            </div>
            <em>{t("Stage {n} of 8 — {label}", { n: order.stage, label: t(order.stageLabel) })}</em>
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-8">
            <PipelineTimeline orderId={order.id} timeline={order.timeline} />
          </div>
          <div className="col-xl-4">
            <PaymentsCard payments={order.payments} />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-12">
            <DeliverablesCard deliverables={order.deliverables} />
          </div>
        </div>
      </div>
    </section>
  );
};


