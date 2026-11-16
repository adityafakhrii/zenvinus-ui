import Link from "next/link";
import React from "react";
import { DashboardHeader, DashboardFooter, KpiGrid, type KpiItem } from "@/features/dashboard";
import { useRouter } from "next/router";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import useMounted from "@/hooks/use-mounted";
import { OrdersView } from "./order-view";
import { POSTED_TASK_STATUS_FLOW } from "@/features/tasks";
import { REQUEST_ACTIONS, buildProposal, budgetLabel, formatDate } from "../data/project-store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changeRequestStatus, selectPostedProjects } from "../store/projects-slice";
import { useT } from "@/i18n";
import {
  getCompanyProjects,
  getProjectById,
  getProjectStatus,
  getProjectBatches,
  getProjectWorkforce,
  getProjectDeliverables,
  getProjectQa,
  getProjectTeam,
} from "../data/company-projects";
import type { HistoryEntry, RequestActionSet } from "../types/project";

const money = (n: number, locale: string) => `$${n.toLocaleString(locale)}`;

/** A string query value (?id=PRJ-1041); repeated keys count as absent */
const queryString = (value: string | string[] | undefined): string | null => (typeof value === "string" ? value : null);

const ProjectList = () => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const projects = getCompanyProjects(posted);

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <div className="edash-head">
          <div>
            <h3 className="edash-title">{t("Projects")}</h3>
            <p className="edash-sub">
              {t("All annotation jobs posted by your team — click a project for the full drill-down.")}
            </p>
          </div>
          <div className="edash-head-actions">
            <Link href="/dashboard/new-project" className="edash-btn">
              <i className="fa-solid fa-plus"></i> {t("Post New Task")}
            </Link>
          </div>
        </div>

        <div className="row g-4">
          {projects.map((p) => (
            <div className="col-xl-6" key={p.id}>
              <Link
                href={`/dashboard/projects?id=${p.id}`}
                className="edash-card edash-project-card"
              >
                <div className="edash-project-card-top">
                  <span className={`edash-tone-${p.tone} edash-project-icon`}>
                    <i className={p.icon}></i>
                  </span>
                  <div className="edash-project-card-title">
                    <h4>
                      {t(p.name)}
                      {p.kind === "posted" && (
                        <span className="edash-new-badge">{t("NEW")}</span>
                      )}
                    </h4>
                    <span className="edash-project-id">
                      {p.id} · {t(p.typeLabel)}
                    </span>
                  </div>
                  <span className={`edash-status edash-status-${p.statusTone}`}>
                    {t(p.status)}
                  </span>
                </div>
                <p className="edash-project-card-desc">{t(p.desc)}</p>
                <div className="edash-progress-cell">
                  <div className="tflow-progress">
                    <span style={{ width: `${p.delivered}%` }}></span>
                  </div>
                  <em>{p.delivered}%</em>
                </div>
                <div className="edash-project-card-foot">
                  <span>
                    <i className="fa-solid fa-layer-group"></i>{" "}
                    {p.items ? t("{count} items", { count: p.items.toLocaleString(locale) }) : t("Size TBD")}
                  </span>
                  <span>
                    <i className="fa-solid fa-wallet"></i>{" "}
                    {budgetLabel(p.budgetRange) || money(p.spend, locale)}
                  </span>
                  <strong>
                    {t("View detail")} <i className="fa-regular fa-angle-right"></i>
                  </strong>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatusCard = ({ id }: { id: string }) => {
  const { t } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const st = getProjectStatus(posted, id);
  const idx = POSTED_TASK_STATUS_FLOW.findIndex((s) => s.key === st.key);
  return (
    <div className="edash-card h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Status")}</h4>
          <p className="edash-card-sub">
            {t("Lifecycle stage {current} of {total}", { current: idx + 1, total: POSTED_TASK_STATUS_FLOW.length })}
          </p>
        </div>
        <span
          className={`edash-status ${
            idx === POSTED_TASK_STATUS_FLOW.length - 1
              ? "edash-status-mint"
              : "edash-status-amber"
            }`}
        >
          {t(st.label)}
        </span>
      </div>
      <div className="edash-project">
        <span className="edash-tone-blue edash-project-icon">
          <i className={st.icon}></i>
        </span>
        <p className="edash-project-card-desc" style={{ margin: 0 }}>
          {t(st.desc)}
        </p>
      </div>
    </div>
  );
};

const PipelineChildCard = ({ id }: { id: string }) => {
  const { t } = useT();
  return (
  <div className="edash-card h-100">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Order Pipeline")}</h4>
        <p className="edash-card-sub">
          {t("8 stages — request, expert review, proposal, milestone payments, delivery")}
        </p>
      </div>
    </div>
    <p className="edash-project-card-desc" style={{ margin: "0 0 16px" }}>
      {t("The order pages are children of this project — each stage has its own page.")}
    </p>
    <Link href={`/dashboard/projects?id=${id}&pipeline=1`} className="edash-btn-ghost w-100">
      <i className="fa-solid fa-diagram-project"></i> {t("Open Pipeline")}
    </Link>
  </div>
  );
};

interface TeamCardProps {
  id?: string;
  /** Team not assigned yet (posted request under review) */
  pending?: boolean;
}

const TeamCard = ({ id, pending }: TeamCardProps) => {
  const { t } = useT();
  const posted = useAppSelector(selectPostedProjects);
  if (pending || !id) {
    return (
      <div className="edash-card h-100">
        <div className="edash-card-head">
          <div>
            <h4 className="edash-card-title">{t("Project Team")}</h4>
            <p className="edash-card-sub">{t("Assigned once the internal review is complete")}</p>
          </div>
        </div>
        <p className="edash-project-card-desc" style={{ margin: 0 }}>
          {t("The Zenvinus PIC, QA reviewer and annotators will appear here once the proposal is approved.")}
        </p>
      </div>
    );
  }
  const team = getProjectTeam(posted, id);
  return (
    <div className="edash-card h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Project Team")}</h4>
          <p className="edash-card-sub">{t("{count} people working on this project", { count: team.count })}</p>
        </div>
      </div>
      <div className="edash-team-grid">
        <div className="edash-team-person">
          <span className="edash-tone-purple edash-activity-icon edash-initial">{team.pic.initials}</span>
          <div className="edash-activity-body">
            <span className="edash-team-role">{t("Zenvinus PIC")}</span>
            <h5>{team.pic.name}</h5>
            <p>{t(team.pic.role)} · {team.pic.email}</p>
          </div>
        </div>
        <div className="edash-team-person">
          <span className={`edash-tone-${team.reviewer.tone} edash-activity-icon edash-initial`}>{team.reviewer.initials}</span>
          <div className="edash-activity-body">
            <span className="edash-team-role">{t("Reviewer (QA)")}</span>
            <h5>{team.reviewer.name}</h5>
            <p>{t(team.reviewer.role)} · {t("double-pass sampling")}</p>
          </div>
        </div>
        <div className="edash-team-person">
          <span className="edash-tone-orange edash-activity-icon edash-initial">
            <i className="fa-solid fa-users"></i>
          </span>
          <div className="edash-activity-body">
            <span className="edash-team-role">{t("Annotators")}</span>
            <h5>{team.annotators.map((w) => w.name.split(" ")[0]).join(", ")}</h5>
            <p>{t("{count} active annotators · accuracy details in Top Workforce", { count: team.count })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NO_ACTIONS: RequestActionSet = { company: [], zenvinus: null, sla: "" };

const PostedProjectDetail = ({ id }: { id: string }) => {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const posted = useAppSelector(selectPostedProjects);
  const found = getProjectById(posted, id);
  const st = getProjectStatus(posted, id);
  const actions = REQUEST_ACTIONS[st.key] || NO_ACTIONS;
  // Only rendered for posted requests (ProjectDetail checks kind first)
  if (!found || found.kind !== "posted") return null;
  const p = found;
  // The store update re-renders this view; no manual refresh is needed
  const act = (to: string, note: string) => {
    dispatch(changeRequestStatus(id, to, note));
  };
  const proposal = ["awaiting_dp", "in_progress", "awaiting_full", "completed"].includes(
    st.key
  )
    ? buildProposal(p)
    : null;
  const history: HistoryEntry[] = p.history || [
    { at: p.started, title: "REQUEST_SUBMITTED", detail: "Created via Create AI Project Request wizard." },
  ];

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <Link href="/dashboard/projects" className="edash-back-link">
          <i className="fa-solid fa-arrow-left"></i> {t("Back to Projects")}
        </Link>

        <div className="edash-card edash-dhero">
          <div className="edash-dhero-main">
            <span className={`edash-tone-${p.tone} edash-dhero-icon`}>
              <i className={p.icon}></i>
            </span>
            <div>
              <div className="edash-dhero-title-row">
                <h3 className="edash-dhero-title">{p.name}</h3>
                <span className={`edash-status edash-status-${p.statusTone}`}>
                  {t(p.status)}
                </span>
              </div>
              <span className="edash-project-id">
                {p.id} · {t(p.typeLabel)}
                {p.useCase ? ` · ${t(p.useCase)}` : ""}
              </span>
              <p className="edash-dhero-desc">{p.desc}</p>
              <div className="edash-meta-row">
                <span>
                  <i className="fa-regular fa-calendar"></i> {t("Posted {date}", { date: formatDate(p.started) })}
                </span>
                <span>
                  <i className="fa-regular fa-clock"></i>{" "}
                  {p.deadline ? t("Target {date}", { date: formatDate(p.deadline) }) : t("No fixed deadline")}
                </span>
                <span>
                  <i className="fa-solid fa-user-tie"></i> {t(p.owner)}
                </span>
              </div>
            </div>
          </div>
          <div className="edash-dhero-side">
            <div className="edash-dhero-price">
              <strong>{budgetLabel(p.budgetRange) || t("To be discussed")}</strong>
              <span>{t("budget range")}</span>
            </div>
            <em>{t("Urgency: {level}", { level: t(p.delivery?.urgency || "Standard") })}</em>
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Status")}</h4>
                  <p className="edash-card-sub">
                    {t("Lifecycle stage {current} of {total}", {
                      current: POSTED_TASK_STATUS_FLOW.findIndex((s) => s.key === st.key) + 1,
                      total: POSTED_TASK_STATUS_FLOW.length,
                    })}
                  </p>
                </div>
                <span
                  className={`edash-status ${
                    st.key === "completed" ? "edash-status-mint" : "edash-status-amber"
                  }`}
                >
                  {t(st.label)}
                </span>
              </div>
              <div className="edash-project">
                <span className="edash-tone-blue edash-project-icon">
                  <i className={st.icon}></i>
                </span>
                <p className="edash-project-card-desc" style={{ margin: 0 }}>
                  {t(st.desc)}
                </p>
              </div>
              <p className="edash-field-hint" style={{ marginTop: 12 }}>
                <i className="fa-solid fa-hourglass-half"></i> {t(actions.sla)}
              </p>
              {actions.zenvinus && (
                <p className="edash-field-hint">
                  <i className="fa-solid fa-flask-vial"></i>{" "}
                  {t("This step is handled by the Zenvinus team — follow its progress in {link}.", {
                    link: <Link href={`/lab?id=${id}`}>AI Research Lab</Link>,
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="col-xl-8">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Activity")}</h4>
                  <p className="edash-card-sub">{t("Audit trail of your request")}</p>
                </div>
              </div>
              <ul className="edash-activity">
                {history.slice(0, 6).map((h, i) => (
                  <li key={i}>
                    <span
                      className={`edash-activity-icon ${
                        i === 0 ? "edash-tone-blue" : "edash-tone-mint"
                      }`}
                    >
                      <i className={i === 0 ? "fa-solid fa-clock" : "fa-solid fa-check"}></i>
                    </span>
                    <div className="edash-activity-body">
                      <h5>{t(h.title)}</h5>
                      <p>{t(h.detail)}</p>
                    </div>
                    <span className="edash-activity-time">{h.at}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {proposal && (
          <div className="edash-card edash-mid">
            <div className="edash-card-head">
              <div>
                <h4 className="edash-card-title">
                  {t("Proposal {id}", { id: proposal.docId })}
                </h4>
                <p className="edash-card-sub">
                  {t("Prepared by Zenvinus expert team · valid {period}", { period: proposal.validUntil })}
                </p>
              </div>
              <span className={`edash-status edash-status-${st.key === "awaiting_dp" ? "blue" : "mint"}`}>
                {st.key === "awaiting_dp" ? t("Attached — review & pay DP") : t("Accepted")}
              </span>
            </div>
            <div className="edash-budget-box" style={{ background: "var(--tp-grey-2)" }}>
              {proposal.items.map((row) => (
                <div className="edash-budget-row" key={row.label}>
                  <span>{t(row.label)}</span>
                  <span>{row.value}</span>
                </div>
              ))}
              <div className="edash-budget-row">
                <span>{t("Deliverables")}</span>
                <span>{proposal.deliverables.join(" · ")}</span>
              </div>
            </div>
            <div className="edash-budget-box" style={{ marginTop: 14 }}>
              <div className="edash-budget-row">
                <span>{t("Total contract")}</span>
                <span>{proposal.price.total}</span>
              </div>
              <div className="edash-budget-row">
                <span>{t("Down payment (50%)")}</span>
                <span>{proposal.price.upfront}</span>
              </div>
              <div className="edash-budget-row edash-budget-total">
                <span>{t("Final payment (50%)")}</span>
                <strong>{proposal.price.final}</strong>
              </div>
              <p>{proposal.price.note}</p>
            </div>
            {st.key === "proposal_ready" && (
              <div className="edash-stage-actions">
                {actions.company.map((c) => (
                  <button
                    key={c.to}
                    type="button"
                    className={c.primary ? "edash-btn" : "edash-btn-ghost"}
                    onClick={() =>
                      act(
                        c.to,
                        c.primary
                          ? "Proposal accepted by company."
                          : "Company requested changes to the proposal."
                      )
                    }
                  >
                    <i className={`fa-solid ${c.primary ? "fa-handshake" : "fa-rotate"}`}></i>{" "}
                    {t(c.label)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {st.key === "awaiting_dp" && (
          <div className="edash-card edash-mid">
            <div className="edash-card-head">
              <div>
                <h4 className="edash-card-title">{t("Down Payment")}</h4>
                <p className="edash-card-sub">
                  {t("50% of {amount} — held in escrow, released per approved batch", {
                    amount: proposal ? proposal.price.total : budgetLabel(p.budgetRange),
                  })}
                </p>
              </div>
            </div>
            <div className="edash-stage-actions">
              <Link
                href={`/dashboard/pay?id=${id}&type=dp`}
                className="edash-btn"
              >
                <i className="fa-solid fa-credit-card"></i> {t("Pay 50% Down Payment")}
              </Link>
              <Link href={`/dashboard/projects?id=${id}`} className="edash-btn-ghost">
                {t("Cancel")}
              </Link>
            </div>
          </div>
        )}

        {(st.key === "in_progress" || st.key === "revision") && (
          <div className="edash-card edash-mid">
            <div className="edash-card-head">
              <div>
                <h4 className="edash-card-title">
                  {st.key === "revision" ? t("Revision in progress") : t("Work in progress")}
                </h4>
                <p className="edash-card-sub">
                  {st.key === "revision"
                    ? t("Flagged items are being re-worked before the QA gate.")
                    : t("Batches are being delivered progressively — track them in the pipeline.")}
                </p>
              </div>
            </div>
            <div className="edash-stage-actions">
              {actions.company.map((c) => (
                <button
                  key={c.to}
                  type="button"
                  className="edash-btn-ghost"
                  onClick={() => act(c.to, "Revision requested by company.")}
                >
                  <i className="fa-solid fa-rotate"></i> {t(c.label)}
                </button>
              ))}
            </div>
          </div>
        )}

        {st.key === "awaiting_full" && (
          <div className="edash-card edash-mid">
            <div className="edash-card-head">
              <div>
                <h4 className="edash-card-title">{t("Final Payment")}</h4>
                <p className="edash-card-sub">
                  {t("Work completed & QA-approved — pay the remaining 50% to unlock delivery")}
                </p>
              </div>
            </div>
            <div className="edash-stage-actions">
              <Link
                href={`/dashboard/pay?id=${id}&type=final`}
                className="edash-btn"
              >
                <i className="fa-solid fa-credit-card"></i> {t("Pay 50% Final & Unlock Delivery")}
              </Link>
              <Link href={`/dashboard/projects?id=${id}`} className="edash-btn-ghost">
                {t("Cancel")}
              </Link>
            </div>
          </div>
        )}

        <div className="row g-4">
          <div className="col-xl-6">
            <PipelineChildCard id={id} />
          </div>
          <div className="col-xl-6">
            <TeamCard pending />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectDetail = ({ id }: { id: string }) => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const p = getProjectById(posted, id);
  // WHY: An unknown or removed project id in the URL used to crash the page on p.kind
  if (!p) {
    return (
      <div className="pf2-empty">
        {t("Project not found.")}{" "}
        <Link href="/dashboard/projects">{t("Back to projects")}</Link>
      </div>
    );
  }
  if (p.kind === "posted") return <PostedProjectDetail id={id} />;
  const batches = getProjectBatches(posted, id);
  const workforce = getProjectWorkforce(posted, id);
  const files = getProjectDeliverables(posted, id);
  const qa = getProjectQa(posted, id);
  const budgetPct = Math.round((p.spend / p.budget) * 100);
  const kpis: KpiItem[] = [
    { id: "items", label: "Total Items", value: p.items.toLocaleString(locale), icon: "fa-solid fa-layer-group", tone: "blue", note: t("across {count} batches", { count: batches.length }) },
    { id: "delivered", label: "Delivered", value: p.delivered, valueSuffix: "%", icon: "fa-solid fa-truck-fast", tone: "mint", note: t("{count} items accepted", { count: Math.round((p.delivered / 100) * p.items).toLocaleString(locale) }) },
    { id: "qa", label: "QA Pass Rate", value: p.qaPass.toLocaleString(locale), valueSuffix: "%", icon: "fa-solid fa-clipboard-check", tone: "purple", note: t("double-pass sampling") },
    { id: "wf", label: "Active Workforce", value: p.workforce, icon: "fa-solid fa-users", tone: "orange", note: t("labelers assigned") },
  ];

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <Link href="/dashboard/projects" className="edash-back-link">
          <i className="fa-solid fa-arrow-left"></i> {t("Back to Projects")}
        </Link>

        <div className="edash-card edash-dhero">
          <div className="edash-dhero-main">
            <span className={`edash-tone-${p.tone} edash-dhero-icon`}>
              <i className={p.icon}></i>
            </span>
            <div>
              <div className="edash-dhero-title-row">
                <h3 className="edash-dhero-title">{t(p.name)}</h3>
                <span className={`edash-status edash-status-${p.statusTone}`}>{t(p.status)}</span>
              </div>
              <span className="edash-project-id">
                {p.id} · {t(p.typeLabel)}
              </span>
              <p className="edash-dhero-desc">{t(p.desc)}</p>
              <div className="edash-meta-row">
                <span>
                  <i className="fa-regular fa-calendar"></i> {t("Started {date}", { date: formatDate(p.started) })}
                </span>
                <span>
                  <i className="fa-regular fa-clock"></i> {t("Due {date}", { date: formatDate(p.deadline) })}
                </span>
                <span>
                  <i className="fa-solid fa-user-tie"></i> {t("Owner: {name}", { name: p.owner })}
                </span>
              </div>
            </div>
          </div>
          <div className="edash-dhero-side">
            <div className="edash-dhero-price">
              <strong>{money(p.spend, locale)}</strong>
              <span>{t("of {amount} budget", { amount: money(p.budget, locale) })}</span>
            </div>
            <div className="tflow-progress">
              <span style={{ width: `${budgetPct}%` }}></span>
            </div>
            <em>{t("{percent}% of budget used", { percent: budgetPct })}</em>
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-6">
            <StatusCard id={id} />
          </div>
          <div className="col-xl-6">
            <PipelineChildCard id={id} />
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-12">
            <TeamCard id={id} />
          </div>
        </div>

        <KpiGrid items={kpis} />

        <div className="row g-4 edash-mid">
          <div className="col-xl-8">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Batch Progress")}</h4>
                  <p className="edash-card-sub">{t("Delivery status per dataset batch")}</p>
                </div>
              </div>
              <div className="edash-table-wrap">
                <table className="edash-table">
                  <thead>
                    <tr>
                      <th>{t("Batch")}</th>
                      <th>{t("Items")}</th>
                      <th>{t("Progress")}</th>
                      <th>{t("Due")}</th>
                      <th>{t("Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <h5 className="edash-project-name">{b.label}</h5>
                          <span className="edash-project-id">{b.id}</span>
                        </td>
                        <td className="edash-td-num">{b.items.toLocaleString(locale)}</td>
                        <td>
                          <div className="edash-progress-cell">
                            <div className="tflow-progress">
                              <span style={{ width: `${b.delivered}%` }}></span>
                            </div>
                            <em>{b.delivered}%</em>
                          </div>
                        </td>
                        <td className="edash-td-num">{b.due}</td>
                        <td>
                          <span className={`edash-status edash-status-${b.statusTone}`}>{t(b.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("QA Summary")}</h4>
                  <p className="edash-card-sub">{t("{count} items reviewed", { count: qa.reviewed.toLocaleString(locale) })}</p>
                </div>
              </div>
              <div className="edash-quality-body">
                <div className="edash-quality-ring">
                  <CircularProgressbar value={qa.passRate} text={`${qa.passRate.toLocaleString(locale)}%`} strokeWidth={6} />
                </div>
                <ul className="edash-quality-list">
                  <li>
                    <span>{t("Re-work required")}</span>
                    <strong>{qa.rework.toLocaleString(locale)}%</strong>
                  </li>
                  <li>
                    <span>{t("Avg. review time")}</span>
                    <strong>{t(qa.avgReview)}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Deliverables")}</h4>
                  <p className="edash-card-sub">{t("Approved dataset exports")}</p>
                </div>
              </div>
              <ul className="edash-activity">
                {files.map((f) => (
                  <li key={f.name}>
                    <span className={`edash-tone-${f.tone} edash-activity-icon`}>
                      <i className="fa-solid fa-file-zipper"></i>
                    </span>
                    <div className="edash-activity-body">
                      <h5>{f.name}</h5>
                      <p>
                        {f.items ? `${t("{count} items", { count: f.items.toLocaleString(locale) })} · ` : ""}
                        {f.size} · {t(f.date)}
                      </p>
                    </div>
                    <button type="button" className="edash-icon-btn" title={t("Download {name}", { name: f.name })}>
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Top Workforce")}</h4>
                  <p className="edash-card-sub">{t("Most items delivered")}</p>
                </div>
              </div>
              <ul className="edash-activity">
                {workforce.map((w) => (
                  <li key={w.name}>
                    <span className={`edash-tone-${w.tone} edash-activity-icon edash-initial`}>{w.initials}</span>
                    <div className="edash-activity-body">
                      <h5>{w.name}</h5>
                      <p>{t("{count} items", { count: w.items.toLocaleString(locale) })}</p>
                    </div>
                    <strong className="edash-accuracy">{w.accuracy.toLocaleString(locale)}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("QA Flags")}</h4>
                  <p className="edash-card-sub">{t("Latest review events")}</p>
                </div>
              </div>
              <ul className="edash-activity">
                {qa.flags.map((flag) => (
                  <li key={flag.title}>
                    <span className={`edash-tone-${flag.tone} edash-activity-icon`}>
                      <i className={flag.icon}></i>
                    </span>
                    <div className="edash-activity-body">
                      <h5>{t(flag.title)}</h5>
                      <p>{t(flag.meta)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CompanyProjects = () => {
  const { t } = useT();
  const router = useRouter();
  const ready = useMounted();
  const id = ready ? queryString(router.query.id) : null;
  const stage = queryString(router.query.stage) ?? undefined;
  const isChild = Boolean(router.query.pipeline || router.query.stage);

  // Custom order (REQ-*): its detail is the pipeline itself — back goes to the dashboard.
  if (id && id.startsWith("REQ")) {
    return (
      <>
        <DashboardHeader />
        <main>
          {ready ? (
            <OrdersView
              id={id}
              stage={stage}
              backHref="/dashboard"
              backLabel={t("Back to Dashboard")}
            />
          ) : (
            <div className="tflow-loading"><span className="spinner-border"></span></div>
          )}
        </main>
        <DashboardFooter />
      </>
    );
  }

  // The pipeline is a child of the project (PRJ-*): ?pipeline=1 / &stage=
  if (id && isChild) {
    return (
      <>
        <DashboardHeader />
        <main>
          {ready ? (
            <OrdersView
              id={id}
              stage={stage}
              backHref={`/dashboard/projects?id=${id}`}
              backLabel={t("Back to Project")}
            />
          ) : (
            <div className="tflow-loading"><span className="spinner-border"></span></div>
          )}
        </main>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main>
        {ready ? (id ? <ProjectDetail id={id} /> : <ProjectList />) : (
          <div className="tflow-loading"><span className="spinner-border"></span></div>
        )}
      </main>
      <DashboardFooter />
    </>
  );
};

export default CompanyProjects;
