import Link from "next/link";
import React from "react";
import KpiGrid from "./kpi-grid";
import { getCompanyOrders, REQUEST_ACTIONS, selectPostedProjects } from "@/features/projects";
import { useAppSelector } from "@/store/hooks";
import { useT } from "@/i18n";
import type { KpiItem } from "../types/dashboard";

/** One row of the proposal queue: a posted request or a sample order */
interface QueueRow {
  id: string;
  name: string;
  type: string;
  company: string;
  budget: string;
  status: string;
  /** CSS suffix of the status chip (edash-status-<tone>) */
  statusTone: string;
  statusKey: string | null;
  /** Next step for the Zenvinus team, when the request waits on it */
  action: { to: string; label: string } | null | undefined;
}

/** What this view reads from a posted request (projects/data/project-store) */
interface PostedRequest {
  id: string;
  name: string;
  typeLabel: string;
  company?: { name?: string } | null;
  budgetRange?: string | null;
  status: string;
  statusTone: string;
  statusKey: string;
}

// REQUEST_ACTIONS is keyed by request status; look the key up without assuming it is one of them
const zenvinusActionFor = (statusKey: string): QueueRow["action"] =>
  Object.entries(REQUEST_ACTIONS).find(([key]) => key === statusKey)?.[1]?.zenvinus;

/** Internal Dashboard (Operations Workspace): the Zenvinus team's side. */
const InternalArea = () => {
  const { t, locale } = useT();
  const posted: PostedRequest[] = useAppSelector(selectPostedProjects);
  const orders = getCompanyOrders();
  const queue: QueueRow[] = [
    ...posted.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.typeLabel,
      company: r.company?.name || "—",
      budget: r.budgetRange || "TBD",
      status: r.status,
      statusTone: r.statusTone,
      statusKey: r.statusKey,
      action: zenvinusActionFor(r.statusKey),
    })),
    ...orders.map((o) => ({
      id: o.id,
      name: o.title,
      type: o.type,
      company: "Sample order",
      budget: `$${o.amount.toLocaleString(locale)}`,
      status: o.status,
      statusTone: o.statusTone,
      statusKey: null,
      action: null,
    })),
  ];

  const kpis: KpiItem[] = [
    { id: "queue", label: "Proposal Queue", value: queue.filter((q) => q.statusKey === "pending" || q.statusKey === "in_review").length, icon: "fa-solid fa-inbox", tone: "amber", note: "awaiting internal review" },
    { id: "active", label: "Active Projects", value: queue.filter((q) => q.statusKey === "in_progress" || q.status === "In Progress").length, icon: "fa-solid fa-diagram-project", tone: "blue", note: "being worked on" },
    { id: "wf", label: "Active Workforce", value: 52, icon: "fa-solid fa-users", tone: "mint", note: "community + expert" },
    { id: "rev", label: "Revenue MTD", value: "$18.4K", icon: "fa-solid fa-sack-dollar", tone: "purple", note: "escrow + settled" },
  ];

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <div className="edash-head">
          <div>
            <h3 className="edash-title">{t("Internal Dashboard")}</h3>
            <p className="edash-sub">
              {t("Operations workspace — proposal queue, project & task management, workforce, quality control and finance.")}
            </p>
          </div>
          <div className="edash-head-actions">
            <Link href="/lab" className="edash-btn">
              <i className="fa-solid fa-flask-vial"></i> {t("AI Research Lab")}
            </Link>
          </div>
        </div>

        <KpiGrid items={kpis} />

        <div className="edash-projects">
          <div className="edash-card">
            <div className="edash-card-head">
              <div>
                <h4 className="edash-card-title">{t("Proposal Queue & Project Management")}</h4>
                <p className="edash-card-sub">
                  {t("Review enterprise proposals, manage projects and workforce assignments")}
                </p>
              </div>
              <Link href="/lab" className="edash-link">
                {t("Manage in Lab")} <i className="fa-regular fa-angle-right"></i>
              </Link>
            </div>
            <div className="edash-table-wrap">
              <table className="edash-table">
                <thead>
                  <tr>
                    <th>{t("Request / Project")}</th>
                    <th>{t("Company")}</th>
                    <th>{t("Budget")}</th>
                    <th>{t("Status")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <h5 className="edash-project-name">{q.name}</h5>
                        <span className="edash-project-id">{q.id} · {t(q.type)}</span>
                      </td>
                      <td className="edash-td-sm">{t(q.company)}</td>
                      <td className="edash-td-num">{t(q.budget)}</td>
                      <td>
                        <span className={`edash-status edash-status-${q.statusTone}`}>{t(q.status)}</span>
                      </td>
                      <td className="edash-td-action">
                        <Link href={`/lab?id=${q.id}`} className="edash-link">
                          {q.action ? t("Review") : t("Open")} <i className="fa-regular fa-angle-right"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Workforce")}</h4>
                  <p className="edash-card-sub">{t("Community vs Expert assignment")}</p>
                </div>
              </div>
              <ul className="edash-quality-list">
                <li><span>{t("Community annotators")}</span><strong>38</strong></li>
                <li><span>{t("Verified contributors")}</span><strong>9</strong></li>
                <li><span>{t("Expert reviewers")}</span><strong>5</strong></li>
              </ul>
              <Link href="/dashboard/tasks" className="edash-btn-ghost w-100">
                <i className="fa-solid fa-list-check"></i> {t("Task Management")}
              </Link>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Quality Control")}</h4>
                  <p className="edash-card-sub">{t("Audit & dispute handling")}</p>
                </div>
              </div>
              <ul className="edash-quality-list">
                <li><span>{t("Avg. pass rate")}</span><strong>{(97.4).toLocaleString(locale)}%</strong></li>
                <li><span>{t("Open disputes")}</span><strong>2</strong></li>
                <li><span>{t("Gold-standard sets")}</span><strong>11</strong></li>
              </ul>
              <Link href="/dashboard?as=expert" className="edash-btn-ghost w-100">
                <i className="fa-solid fa-user-shield"></i> {t("Expert Review Queue")}
              </Link>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Finance")}</h4>
                  <p className="edash-card-sub">{t("Escrow & payout")}</p>
                </div>
              </div>
              <ul className="edash-quality-list">
                <li><span>{t("Active escrow")}</span><strong>${(22800).toLocaleString(locale)}</strong></li>
                <li><span>{t("Awaiting down payment")}</span><strong>{t("{count} requests", { count: 2 })}</strong></li>
                <li><span>{t("Community payouts this month")}</span><strong>${(6940).toLocaleString(locale)}</strong></li>
              </ul>
              <Link href="/dashboard/billing" className="edash-btn-ghost w-100">
                <i className="fa-solid fa-file-invoice-dollar"></i> {t("Invoices")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternalArea;
