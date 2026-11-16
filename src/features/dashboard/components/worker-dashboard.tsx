import Link from "next/link";
import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KpiGrid from "./kpi-grid";
import {
  getWorkerProfile,
  getWorkerStats,
  getWorkerTasks,
  getWorkerEarnings,
  getWorkerPayouts,
  getWorkerQualifications,
  getNextPayout,
} from "../data/worker-dashboard";
import { useT } from "@/i18n";

const money = (n: number, locale: string): string => `$${n.toLocaleString(locale)}`;

const EarningsChart = () => {
  const { t, locale } = useT();
  const { total, caption, weeks } = getWorkerEarnings();
  const max = Math.max(...weeks.map((w) => w.value));

  return (
    <div className="edash-card edash-chart-card h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Earnings")}</h4>
          <p className="edash-card-sub">{t(caption)}</p>
        </div>
        <div className="edash-chart-total">
          <strong>{total}</strong>
          <span>{t("paid to date")}</span>
        </div>
      </div>
      <div className="edash-chart">
        {weeks.map((w) => (
          <div className="edash-chart-col" key={w.label}>
            <div className="edash-chart-bar-wrap">
              <div
                className="edash-chart-bar-stack"
                title={`${w.label}: ${money(w.value, locale)}`}
              >
                <span className="edash-chart-value">{money(w.value, locale)}</span>
                <span
                  className="edash-chart-bar"
                  style={{ height: `${Math.round((w.value / max) * 100)}%` }}
                ></span>
              </div>
            </div>
            <span className="edash-chart-label">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NextPayoutCard = () => {
  const { t, locale } = useT();
  const next = getNextPayout();
  const profile = getWorkerProfile();

  return (
    <div className="edash-card edash-account h-100">
      <div className="edash-account-top">
        <div>
          <p className="edash-card-sub">{t("Next payout")}</p>
          <h4 className="edash-account-name">{money(next.amount, locale)}</h4>
        </div>
        <span className="edash-plan-badge">
          <i className="fa-solid fa-clock"></i> {next.date}
        </span>
      </div>
      <div className="edash-account-meta">
        <span>
          <i className="fa-solid fa-building-columns"></i> {next.method}
        </span>
        <span>
          <i className="fa-solid fa-star"></i> {t("{rating} rating · {reviews} reviews", { rating: profile.rating, reviews: profile.reviews })}
        </span>
      </div>
      <p className="edash-renewal">
        <i className="fa-regular fa-circle-check"></i> {t(next.note)}
      </p>
      <Link href="/task-reward?task=road-damage-annotation" className="edash-btn-ghost w-100">
        <i className="fa-solid fa-hand-holding-dollar"></i> {t("Rewards & Payouts")}
      </Link>
    </div>
  );
};

const TasksTable = () => {
  const { t, locale } = useT();
  return (
  <div className="edash-card">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("My Active Tasks")}</h4>
        <p className="edash-card-sub">{t("Jobs assigned to you from the marketplace")}</p>
      </div>
      <Link href="/dashboard/tasks" className="edash-link">
        {t("Browse more tasks")} <i className="fa-regular fa-angle-right"></i>
      </Link>
    </div>
    <div className="edash-table-wrap">
      <table className="edash-table">
        <thead>
          <tr>
            <th>{t("Task")}</th>
            <th>{t("Progress")}</th>
            <th>{t("Reward")}</th>
            <th>{t("Status")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {getWorkerTasks().map((task) => (
            <tr key={task.name}>
              <td>
                <div className="edash-project">
                  <span className={`edash-tone-${task.tone} edash-project-icon`}>
                    <i className={task.icon}></i>
                  </span>
                  <div>
                    <h5 className="edash-project-name">{task.name}</h5>
                    <span className="edash-project-id">{t(task.typeLabel)}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="edash-progress-cell">
                  <div className="tflow-progress">
                    <span style={{ width: `${task.progress}%` }}></span>
                  </div>
                  <em>{task.progress}%</em>
                </div>
              </td>
              <td className="edash-td-num">{money(task.reward, locale)}</td>
              <td>
                <span className={`edash-status edash-status-${task.statusTone}`}>{t(task.status)}</span>
              </td>
              <td className="edash-td-action">
                <Link href={`/task-studio?task=${task.slug}`} className="edash-link">
                  {t("Open Studio")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const QualificationsCard = () => {
  const { t } = useT();
  return (
  <div className="edash-card h-100">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Qualifications")}</h4>
        <p className="edash-card-sub">{t("Task types you are cleared to work on")}</p>
      </div>
    </div>
    <ul className="edash-spend-list">
      {getWorkerQualifications().map((q) => (
        <li key={q.label}>
          <div className="edash-spend-row">
            <span>
              <i className={`${q.icon} edash-qual-icon edash-tone-${q.tone}`}></i> {t(q.label)}
            </span>
            <span className={`edash-status edash-status-${q.statusTone}`}>{t(q.status)}</span>
          </div>
          <div className="edash-spend-track">
            <span style={{ width: `${q.score}%` }}></span>
          </div>
          <em>{t("qualification score {score}%", { score: q.score })}</em>
        </li>
      ))}
    </ul>
    <Link href="/task-qualification?task=conversation-transcription" className="edash-btn-ghost w-100">
      <i className="fa-solid fa-graduation-cap"></i> {t("Take a Qualification Test")}
    </Link>
  </div>
  );
};

const PayoutsCard = () => {
  const { t, locale } = useT();
  return (
  <div className="edash-card h-100">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Payout History")}</h4>
        <p className="edash-card-sub">{t("Monthly auto-withdrawals")}</p>
      </div>
    </div>
    <ul className="edash-quality-list">
      {getWorkerPayouts().map((p) => (
        <li key={p.id}>
          <span>
            {p.id} · {p.date}
            <em className="edash-payout-method">{p.method}</em>
          </span>
          <strong>
            {money(p.amount, locale)}{" "}
            <span className={`edash-status edash-status-${p.statusTone}`}>{t(p.status)}</span>
          </strong>
        </li>
      ))}
    </ul>
    <Link href="/task-reward?task=road-damage-annotation" className="edash-btn-ghost w-100">
      <i className="fa-solid fa-building-columns"></i> {t("All Payouts")}
    </Link>
  </div>
  );
};

const ProfileCard = () => {
  const { t } = useT();
  const profile = getWorkerProfile();

  return (
    <div className="edash-card h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Contributor Profile")}</h4>
          <p className="edash-card-sub">{t("Visible to companies you work with")}</p>
        </div>
      </div>
      <div className="edash-quality-body">
        <div className="edash-quality-ring edash-quality-ring-sm">
          <CircularProgressbar
            value={profile.rating * 20}
            text={String(profile.rating)}
            strokeWidth={6}
          />
        </div>
        <ul className="edash-quality-list">
          <li>
            <span>{t("Level")}</span>
            <strong>{t(profile.level)}</strong>
          </li>
          <li>
            <span>{t("Member since")}</span>
            <strong>{profile.joined}</strong>
          </li>
          <li>
            <span>{t("Status")}</span>
            <strong>{t(profile.qualification)}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

const ContributorArea = () => {
  const { t } = useT();
  return (
  <section className="edash-area pt-40 pb-120">
    <div className="container">
      <div className="edash-head">
        <div>
          <h3 className="edash-title">{t("Community Dashboard")}</h3>
          <p className="edash-sub">
            {t("Your earnings, active tasks and qualifications in one place.")}
          </p>
        </div>
        <div className="edash-head-actions">
          <Link href="/dashboard/tasks" className="edash-btn">
            <i className="fa-solid fa-magnifying-glass"></i> {t("Find Tasks")}
          </Link>
        </div>
      </div>

      <KpiGrid items={getWorkerStats()} />

      <div className="row g-4 edash-mid">
        <div className="col-xl-8">
          <EarningsChart />
        </div>
        <div className="col-xl-4">
          <NextPayoutCard />
        </div>
      </div>

      <div className="edash-projects">
        <TasksTable />
      </div>

      <div className="row g-4">
        <div className="col-xl-4">
          <ProfileCard />
        </div>
        <div className="col-xl-4">
          <QualificationsCard />
        </div>
        <div className="col-xl-4">
          <PayoutsCard />
        </div>
      </div>
    </div>
  </section>
  );
};

export default ContributorArea;
