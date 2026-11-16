import Link from "next/link";
import React, { useState } from "react";
import { DashboardFooter } from "@/features/dashboard";
import { useRouter } from "next/router";
import useMounted from "@/hooks/use-mounted";
import { POSTED_TASK_STATUS_FLOW } from "@/features/tasks";
import {
  REQUEST_ACTIONS,
  attachRequestProposal,
  changeRequestStatus,
  getCompanyOrders,
  getCompanyOrderDetail,
  selectPostedProject,
  selectPostedProjects,
  type PostedProject,
  type StatusStep,
  type Tone,
} from "@/features/projects";
import { useT } from "@/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const money = (n: number | string, locale = "en-US") => (typeof n === "string" ? n : `$${n.toLocaleString(locale)}`);

const findStatus = (key: string): StatusStep | undefined => POSTED_TASK_STATUS_FLOW.find((s) => s.key === key);

const LabTopbar = () => {
  const { t } = useT();
  return (
  <header className="edash-topbar">
    <div className="container">
      <div className="edash-topbar-inner">
        <div className="edash-topbar-left">
          <Link href="/" className="edash-topbar-logo">
            <i className="fa-solid fa-flask-vial" style={{ fontSize: 18, color: "var(--tp-theme-secondary)" }} />
          </Link>
          <span className="edash-account-name" style={{ fontSize: 16 }}>
            {t("AI Research Lab")}
          </span>
          <span className="edash-status edash-status-purple" style={{ background: "#e9e5fe", color: "#5337ef" }}>
            {t("internal · Zenvinus")}
          </span>
        </div>
        <div className="edash-topbar-actions">
          <Link href="/dashboard" className="edash-link">
            <i className="fa-solid fa-arrow-left"></i> {t("Company view")}
          </Link>
          <div className="edash-account-chip">
            <span className="edash-avatar">RW</span>
            <span className="edash-account-name d-none d-lg-inline">Rani W. — Solutions Architect</span>
          </div>
        </div>
      </div>
    </div>
  </header>
  );
};

/* ------------------------------------------------------------------ */
/* Queue — every incoming request                                      */
/* ------------------------------------------------------------------ */

const statusChip = (label: string, tone: Tone | undefined) => (
  <span className={`edash-status edash-status-${tone || "amber"}`}>{label}</span>
);

const LabQueue = () => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const seeded = getCompanyOrders();

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <div className="edash-head">
          <div>
            <h3 className="edash-title">{t("Request Queue")}</h3>
            <p className="edash-sub">
              {t("AI project requests from companies — review them, prepare proposals, and move the pipeline forward.")}
            </p>
          </div>
        </div>

        <div className="edash-card">
          <div className="edash-card-head">
            <div>
              <h4 className="edash-card-title">{t("Incoming Requests")}</h4>
              <p className="edash-card-sub">
                {t("{count} submitted by companies", { count: posted.length })} · {t("{count} sample orders", { count: seeded.length })}
              </p>
            </div>
          </div>
          <div className="edash-table-wrap">
            <table className="edash-table">
              <thead>
                <tr>
                  <th>{t("Request")}</th>
                  <th>{t("Company")}</th>
                  <th>{t("Budget")}</th>
                  <th>{t("Status")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posted.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="edash-project">
                        <span className={`edash-tone-${r.tone} edash-project-icon`}>
                          <i className={r.icon}></i>
                        </span>
                        <div>
                          <h5 className="edash-project-name">
                            <Link href={`/lab?id=${r.id}`}>{r.name}</Link>
                          </h5>
                          <span className="edash-project-id">
                            {r.id} · {t(r.typeLabel)}
                            {r.useCase ? ` · ${r.useCase}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="edash-td-sm">{r.company?.name || r.owner}</td>
                    <td className="edash-td-num">{r.budgetRange || t("TBD")}</td>
                    <td>{statusChip(t(r.status), r.statusTone)}</td>
                    <td className="edash-td-action">
                      <Link href={`/lab?id=${r.id}`} className="edash-link">
                        {r.statusKey === "pending" || r.statusKey === "in_review" ? t("Review") : t("Open")}{" "}
                        <i className="fa-regular fa-angle-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
                {seeded.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="edash-project">
                        <span className={`edash-tone-${r.tone} edash-project-icon`}>
                          <i className={r.icon}></i>
                        </span>
                        <div>
                          <h5 className="edash-project-name">
                            <Link href={`/dashboard/projects?id=${r.id}`}>{r.title}</Link>
                          </h5>
                          <span className="edash-project-id">
                            {r.id} · {t(r.type)} · {t("sample")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="edash-td-sm">{t("Sample order")}</td>
                    <td className="edash-td-num">{money(r.amount, locale)}</td>
                    <td>{statusChip(t(r.status), r.statusTone)}</td>
                    <td className="edash-td-action">
                      <Link href={`/dashboard/projects?id=${r.id}`} className="edash-link">
                        {t("Pipeline")} <i className="fa-regular fa-angle-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Detail — reviewing a request from the expert side                  */
/* ------------------------------------------------------------------ */

interface RowProps {
  /** English i18n key */
  label: string;
  value: string | null | undefined;
}

const Row = ({ label, value }: RowProps) => {
  const { t } = useT();
  return (
    <li>
      <span>{t(label)}</span>
      <strong>{value || "—"}</strong>
    </li>
  );
};

interface ProposalFormProps {
  project: PostedProject;
  id: string;
}

/** Review & attach the proposal — the expert sets the final price. */
const ProposalForm = ({ project, id }: ProposalFormProps) => {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState<number | string>(
    project.proposalDoc?.priceJuta ?? project.estimate ?? ""
  );
  const [validUntil, setValidUntil] = useState(
    project.deadline || project.proposalDoc?.validUntil || ""
  );
  const [scope, setScope] = useState(
    project.proposalDoc?.scopeNote || project.desc || ""
  );
  const [saved, setSaved] = useState(Boolean(project.proposalDoc));

  return (
    <div className="edash-proposal-form">
      <p className="edash-proposal-title">
        <i className="fa-solid fa-file-signature"></i> {t("Attach Proposal")}
      </p>
      <div className="edash-field">
        <label>{t("Final Price (Rp million) *")}</label>
        <input
          className="edash-input"
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <p className="edash-field-hint">
          <i className="fa-solid fa-circle-info"></i>{" "}
          {t("Company budget range: {range} — you may set the final price above or below it.", { range: project.budgetRange || t("TBD") })}
        </p>
      </div>
      <div className="edash-field">
        <label>{t("Valid Until")}</label>
        <input
          className="edash-input"
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
        />
      </div>
      <div className="edash-field">
        <label>{t("Scope Notes")}</label>
        <textarea
          className="edash-input"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        />
      </div>
      {saved && (
        <p className="edash-field-hint">
          <i className="fa-solid fa-circle-check"></i>{" "}
          {t("Proposal {doc} saved ({price}) — still internal; the company cannot see it yet.", { doc: project.proposalDoc?.docId, price: project.proposalDoc?.priceLabel })}
        </p>
      )}
      <div className="edash-stage-actions">
        <button
          type="button"
          className="edash-btn-ghost"
          disabled={!price || Number(price) <= 0}
          onClick={() => {
            dispatch(attachRequestProposal(id, { priceJuta: Number(price), validUntil, scopeNote: scope }));
            setSaved(true);
          }}
        >
          <i className="fa-regular fa-floppy-disk"></i> {t("Save Proposal")}
        </button>
        <button
          type="button"
          className="edash-btn"
          disabled={!saved}
          title={saved ? t("Send the proposal to the company — they can then pay the down payment") : t("Save the proposal before sending it")}
          onClick={() => {
            dispatch(attachRequestProposal(id, { priceJuta: Number(price), validUntil, scopeNote: scope }));
            dispatch(changeRequestStatus(id, "awaiting_dp", `Proposal sent to company — ${idr(price)}.`));
          }}
        >
          <i className="fa-solid fa-paper-plane"></i> {t("Send Proposal to Company")}
        </button>
      </div>
    </div>
  );
};

const idr = (m: number | string | null | undefined): string =>
  m === null || m === undefined || Number.isNaN(Number(m))
    ? "To be discussed"
    : `Rp ${String(Math.round(Number(m) * 10) / 10).replace(".", ",")} juta`;

const LabDetail = ({ id }: { id: string }) => {
  const { t, locale } = useT();
  const dispatch = useAppDispatch();
  const posted = useAppSelector(selectPostedProjects);
  // A posted request (r), or else a sample custom order (seeded); store updates re-render this view
  const r = useAppSelector((state) => selectPostedProject(state, id));
  const seeded = r ? null : getCompanyOrderDetail(posted, id);
  const st = r ? findStatus(r.statusKey) : undefined;
  const actions = st ? REQUEST_ACTIONS[st?.key] : null;
  const zenvinusAction = actions?.zenvinus;
  const history = r ? r.history || [] : [];

  if (!r && !seeded) {
    return (
      <section className="edash-area pt-40 pb-120">
        <div className="container">
          <div className="edash-card">{t("Request not found.")}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <Link href="/lab" className="edash-back-link">
          <i className="fa-solid fa-arrow-left"></i> {t("Back to Queue")}
        </Link>

        <div className="edash-card edash-dhero">
          <div className="edash-dhero-main">
            <span className={`edash-tone-${(r ?? seeded)?.tone} edash-dhero-icon`}>
              <i className={(r ?? seeded)?.icon}></i>
            </span>
            <div>
              <div className="edash-dhero-title-row">
                <h3 className="edash-dhero-title">{r ? r.name : seeded?.title}</h3>
                {r
                  ? statusChip(t(r.status), r.statusTone)
                  : statusChip(t(seeded?.status ?? ""), seeded?.statusTone)}
              </div>
              <span className="edash-project-id">
                {(r ? r.id : seeded?.id) +
                  " · " +
                  (r ? t(r.typeLabel) + (r.useCase ? ` · ${r.useCase}` : "") : t(seeded?.type ?? ""))}
              </span>
              <p className="edash-dhero-desc">{r ? r.desc : t("Sample custom order.")}</p>
              <div className="edash-meta-row">
                <span>
                  <i className="fa-regular fa-calendar"></i>{" "}
                  {r ? t("Posted {date}", { date: r.started }) : t("Requested {date}", { date: seeded?.date })}
                </span>
                <span>
                  <i className="fa-solid fa-building"></i>{" "}
                  {r ? r.company?.name || "—" : t("Sample company")}
                </span>
                <span>
                  <i className="fa-solid fa-wallet"></i>{" "}
                  {r ? r.budgetRange || t("TBD") : (seeded ? money(seeded.amount, locale) : "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-8">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Request Details")}</h4>
                  <p className="edash-card-sub">
                    {r ? t("Form submitted by the company") : t("Sample order — summary")}
                  </p>
                </div>
              </div>
              {r ? (
                <ul className="edash-quality-list">
                  <Row label="Needs" value={(r.needs || []).map((n) => t(n)).join(" + ")} />
                  <Row label="Domain / Use case" value={`${t(r.typeLabel)}${r.useCase ? ` · ${r.useCase}` : ""}`} />
                  <Row label="Industry" value={r.industry} />
                  {r.data && (
                    <>
                      <Row label="Data modality" value={(r.data.modalities || []).join(", ")} />
                      <Row
                        label="Data availability"
                        value={
                          r.data.haveData === "yes"
                            ? t("Has its own data")
                            : r.data.haveData === "partial"
                            ? t("Partially available")
                            : t("Needs to be collected")
                        }
                      />
                      <Row
                        label="Target size"
                        value={
                          r.data.targetSize
                            ? `${Number(r.data.targetSize).toLocaleString(locale)} ${r.data.targetUnit}`
                            : t("TBD")
                        }
                      />
                      <Row label="Coverage / language" value={`${r.data.coverage || "—"} · ${r.data.language || "—"}`} />
                      <Row label="Data sources" value={(r.data.sources || []).join(", ")} />
                      <Row label="Diversity" value={(r.data.diversity || []).join(", ")} />
                    </>
                  )}
                  {r.annotation && r.annotation.type && (
                    <>
                      <Row label="Annotation" value={`${r.annotation.type} · ${(r.annotation.methods || []).join(", ")}`} />
                      <Row label="Classes" value={(r.annotation.classes || []).join(", ")} />
                      <Row label="Workforce" value={t(WORKFORCES.find((w) => w.key === r.annotation?.workforce)?.label ?? "")} />
                      <Row
                        label="Quality"
                        value={`${r.annotation.quality} · ${r.annotation.reviewLevel} · ${r.annotation.consensus}`}
                      />
                    </>
                  )}
                  {r.model && r.model.devType && (
                    <>
                      <Row
                        label="Model"
                        value={
                          r.model.devType === "finetune"
                            ? t("Fine-tune existing model")
                            : r.model.devType === "train"
                            ? t("Train new model")
                            : r.model.devType === "unsure"
                            ? t("Needs an approach recommendation")
                            : r.model.devType
                        }
                      />
                      <Row label="Preferred / platform" value={`${r.model.preferred || t("No preference")} · ${(r.model.platforms || []).join(", ")}`} />
                      <Row
                        label="Target metrics"
                        value={
                          [r.model.map && `mAP50 ${r.model.map}`, r.model.latency && t("latency {ms}ms", { ms: r.model.latency })]
                            .filter(Boolean)
                            .join(" · ") || "—"
                        }
                      />
                    </>
                  )}
                  <Row label="Deliverables" value={(r.delivery?.items || []).map((d) => t(d)).join(", ")} />
                  <Row label="Format" value={`${r.delivery?.datasetFormat || "—"} (dataset) · ${r.delivery?.modelFormat || "—"} (model)`} />
                  {r.company && (
                    <>
                      <Row label="Contact" value={`${r.company.contact} · ${r.company.role || "—"}`} />
                      <Row label="Email / WA" value={`${r.company.email} · ${r.company.phone || "—"}`} />
                    </>
                  )}
                </ul>
              ) : (
                <ul className="edash-quality-list">
                  <Row label="Type" value={t(seeded?.type ?? "")} />
                  <Row label="Contract value" value={(seeded ? money(seeded.amount, locale) : "")} />
                  <Row label="Stage" value={t("Stage {stage} of 8 — {label}", { stage: seeded?.stage, label: t(seeded?.stageLabel ?? "") })} />
                  <Row label="Items" value={(seeded?.items || 0).toLocaleString(locale)} />
                </ul>
              )}
            </div>
          </div>

          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Next Action")}</h4>
                  <p className="edash-card-sub">
                    {r ? t(actions?.sla ?? "") : t("Sample order — read only")}
                  </p>
                </div>
              </div>
              {r ? (
                <>
                  {st?.key === "in_review" && (
                    <ProposalForm project={r} id={id} />
                  )}
                  {st?.key !== "in_review" && zenvinusAction && (
                    <button
                      type="button"
                      className="edash-btn w-100"
                      onClick={() => {
                        dispatch(changeRequestStatus(id, zenvinusAction.to));
                      }}
                    >
                      <i className="fa-solid fa-bolt"></i> {t(zenvinusAction.label)}
                    </button>
                  )}
                  {!actions?.zenvinus && (
                    <p className="edash-field-hint">
                      <i className="fa-solid fa-circle-info"></i>{" "}
                      {st?.key === "proposal_ready"
                        ? t("Waiting for the company's decision (accept / request changes).")
                        : st?.key === "awaiting_dp" || st?.key === "awaiting_full"
                        ? t("Waiting for payment from the company.")
                        : t("No action needed — the next milestone is waiting on the company.")}
                    </p>
                  )}
                  <div className="edash-status-exceptions" style={{ marginTop: 16 }}>
                    {history.slice(0, 5).map((h, i) => (
                      <span key={i} style={{ display: "block", width: "100%", fontSize: 12, color: "var(--tp-text-body)" }}>
                        <strong style={{ color: "var(--tp-heading-primary)" }}>{t(h.title)}</strong> · {h.at}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={`/dashboard/projects?id=${id}`} className="edash-btn-ghost w-100">
                  <i className="fa-solid fa-diagram-project"></i> {t("View pipeline in company view")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WORKFORCES: ReadonlyArray<{ key: string; label: string }> = [
  { key: "community", label: "Zenvinus Community" },
  { key: "verified", label: "Verified Contributors" },
  { key: "expert", label: "Expert Workforce" },
  { key: "hybrid", label: "Hybrid Community + Expert Review" },
];

const Lab = () => {
  const router = useRouter();
  const mounted = useMounted();
  const id = mounted && typeof router.query.id === "string" ? router.query.id : null;

  return (
    <>
      <LabTopbar />
      <main>
        {mounted ? (id ? <LabDetail id={id} /> : <LabQueue />) : (
          <div className="tflow-loading"><span className="spinner-border"></span></div>
        )}
      </main>
      <DashboardFooter />
    </>
  );
};

export default Lab;
