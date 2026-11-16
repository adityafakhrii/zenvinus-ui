import Link from "next/link";
import React from "react";
import KpiGrid from "./kpi-grid";
import { selectExpertLedger, selectExpertMetrics, selectReviewQueue } from "@/features/tasks";
import { useAppSelector } from "@/store/hooks";
import { useT } from "@/i18n";
import type { KpiItem, Tone } from "../types/dashboard";

// Status chips: amber/orange = needs action, purple = passed through an expert, mint = done.
// `red` only comes from the Reject action.
const CHIP_TONES: ReadonlyArray<Tone> = ["mint", "orange", "purple", "red"];
const tone = (c: string | undefined): Tone => CHIP_TONES.find((x) => x === c) ?? "blue";

const STATUS_CHIPS: Readonly<Record<string, { tone: Tone }>> = {
  "PENDING REVIEW": { tone: "amber" },
  "IN REVIEW": { tone: "blue" },
  "REVISION REQUIRED": { tone: "orange" },
  ESCALATED: { tone: "purple" },
  APPROVED: { tone: "mint" },
  REJECTED: { tone: "red" },
};

/** What this view reads from a review-queue submission (tasks/data/expert-workspace) */
interface ReviewQueueRow {
  id: string;
  slug: string;
  task: string;
  taskType: string;
  note: string;
  contributor: string;
  items: number;
  status: string;
  tone?: string;
  /** The reviewer's own submission: cannot be reviewed by them */
  own?: boolean;
  reviewedAt?: string;
  ledger?: { status: string; amount: number; note: string } | null;
  decision?: { action: string; reviewerName: string; rubric: string; at: string } | null;
  history?: Array<{ action: string; at: string }>;
}

const ACTIVE_STATUSES: ReadonlyArray<string> = ["PENDING REVIEW", "IN REVIEW", "ESCALATED"];
const DONE_STATUSES: ReadonlyArray<string> = ["APPROVED", "REJECTED"];

/** Expert Dashboard (Review Workspace) — assigned reviews, queue, ledger. */
const ExpertArea = () => {
  const { t, locale } = useT();
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const queue: ReviewQueueRow[] = useAppSelector(selectReviewQueue);
  const metrics = useAppSelector(selectExpertMetrics);
  const ledger = useAppSelector(selectExpertLedger);

  const kpis: KpiItem[] = [
    { id: "assigned", label: "Assigned Reviews", value: metrics.assigned, icon: "fa-solid fa-clipboard-check", tone: "blue", note: "matching your expertise" },
    { id: "pending", label: "Awaiting Action", value: queue.filter((r) => !r.own && ACTIVE_STATUSES.includes(r.status)).length, icon: "fa-solid fa-hourglass-half", tone: "amber", note: "active queue" },
    { id: "agreement", label: "Agreement Score", value: metrics.agreement, valueSuffix: "%", icon: "fa-solid fa-handshake-angle", tone: "mint", note: "vs other reviewers" },
    { id: "earnings", label: "Expert Earnings", value: `$${ledger.thisMonth.toLocaleString(locale)}`, icon: "fa-solid fa-wallet", tone: "purple", note: "this month" },
  ];

  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <div className="edash-head">
          <div>
            <h3 className="edash-title">{t("Expert Dashboard")}</h3>
            <p className="edash-sub">
              {t("Review workspace — approve, request revision, reject, or escalate community submissions.")}
            </p>
          </div>
        </div>

        <KpiGrid items={kpis} />

        <div className="edash-projects">
          <div className="edash-card">
            <div className="edash-card-head">
              <div>
                <h4 className="edash-card-title">{t("Review Queue")}</h4>
                <p className="edash-card-sub">
                  {t("Submission status is separate from payout status — APPROVED items enter the reward ledger as PENDING")}
                </p>
              </div>
            </div>
            <div className="edash-table-wrap">
              <table className="edash-table">
                <thead>
                  <tr>
                    <th>{t("Submission")}</th>
                    <th>{t("Contributor")}</th>
                    <th>{t("Items")}</th>
                    <th>{t("Review Status")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((r) => {
                    const actionable = !DONE_STATUSES.includes(r.status) && !r.own;
                    const chip = STATUS_CHIPS[r.status];
                    return (
                      <React.Fragment key={r.id}>
                        <tr>
                          <td>
                            <h5 className="edash-project-name">{r.task}</h5>
                            <span className="edash-project-id">{r.id} · {t(r.taskType)} · {t(r.note)}</span>
                          </td>
                          <td className="edash-td-sm">{r.contributor}</td>
                          <td className="edash-td-num">{r.items}</td>
                          <td>
                            <span className={`edash-status edash-status-${chip?.tone || tone(r.tone)}`}>
                              {t(r.status)}
                            </span>
                          </td>
                          <td className="edash-td-action">
                            {r.own ? (
                              <span
                                className="edash-project-id"
                                title={t("Acceptance rule: you cannot review your own submission")}
                              >
                                <i className="fa-solid fa-lock"></i> {t("Own submission")}
                              </span>
                            ) : actionable ? (
                              <Link
                                href={`/task-studio?task=${r.slug}&review=${r.id}`}
                                className="edash-review-cta"
                                title={t("Decide in the studio — same view the contributor worked in")}
                              >
                                <i className="fa-solid fa-clipboard-check"></i> {t("Review in Studio")}
                              </Link>
                            ) : (
                              <span className="edash-project-id">
                                {t("Reviewed {date}", { date: r.reviewedAt || "" })}
                              </span>
                            )}
                            {(r.ledger || r.decision || (r.history?.length ?? 0) > 0) && (
                              <button
                                type="button"
                                className="edash-detail-toggle"
                                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                              >
                                {expanded === r.id ? t("Hide details") : t("Details")}
                                <i
                                  className={`fa-solid fa-chevron-down ${expanded === r.id ? "edash-detail-open" : ""}`}
                                ></i>
                              </button>
                            )}
                          </td>
                        </tr>
                        {expanded === r.id && (
                          <tr className="edash-detail-row">
                            <td colSpan={5}>
                              {r.ledger && (
                                <span className="edash-detail-item">
                                  <i className="fa-solid fa-hand-holding-dollar"></i> {t("Ledger:")}
                                  {" "}{t(r.ledger.status)} (${(r.ledger.amount / 100).toFixed(2)}) — {t(r.ledger.note)}
                                </span>
                              )}
                              {r.decision && (
                                <span className="edash-detail-item">
                                  <i className="fa-solid fa-user-check"></i> {t("Last decision:")}
                                  {" "}{t("{action} by {name}", { action: t(r.decision.action), name: r.decision.reviewerName })} · {r.decision.rubric} · {r.decision.at}
                                </span>
                              )}
                              {(r.history?.length ?? 0) > 0 && (
                                <span className="edash-detail-item">
                                  <i className="fa-solid fa-clock-rotate-left"></i> {t("Decision history:")}
                                  {" "}{(r.history ?? []).map((h) => `${t(h.action)} (${h.at})`).join(" → ")}
                                </span>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-6">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Reward Ledger")}</h4>
                  <p className="edash-card-sub">{t(ledger.note)}</p>
                </div>
              </div>
              <ul className="edash-quality-list">
                <li><span>{t("Available (ready to withdraw)")}</span><strong>${ledger.available.toLocaleString(locale)}</strong></li>
                <li><span>{t("Pending (awaiting payout cycle)")}</span><strong>${(ledger.pending / 100).toFixed(2)}</strong></li>
                <li><span>{t("Rate per item")}</span><strong>${(ledger.perItem / 100).toFixed(2)}</strong></li>
              </ul>
              <Link href="/task-reward?task=road-damage-annotation" className="edash-btn-ghost w-100">
                <i className="fa-solid fa-hand-holding-dollar"></i> {t("Rewards & Payouts")}
              </Link>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="edash-card h-100">
              <div className="edash-card-head">
                <div>
                  <h4 className="edash-card-title">{t("Quality Metrics")}</h4>
                  <p className="edash-card-sub">{t("Your review quality")}</p>
                </div>
              </div>
              <ul className="edash-quality-list">
                <li><span>{t("Reviewed")}</span><strong>{t("{count} submissions", { count: metrics.reviewed })}</strong></li>
                <li><span>{t("Inter-reviewer agreement")}</span><strong>{metrics.agreement}%</strong></li>
                <li><span>{t("Gold standards created")}</span><strong>{t("{count} sets", { count: metrics.goldStandards })}</strong></li>
                <li><span>{t("Avg. review time")}</span><strong>{t(metrics.avgTime)}</strong></li>
              </ul>
              <Link href="/dashboard?as=internal" className="edash-btn-ghost w-100">
                <i className="fa-solid fa-shield-halved"></i> {t("Escalate to Internal QA")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertArea;
