import Link from "next/link";
import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KpiGrid from "./kpi-grid";
import {
  getCompanyProfile,
  getAnnotationVolume,
  getSpendBreakdown,
  getCompanyProjects,
  getCompanyActivity,
  getDeliveryQuality,
  getProjectStatusCounts,
} from "../data/company-dashboard";
import { useT } from "@/i18n";
import { useAppSelector } from "@/store/hooks";
import { selectPostedProjects } from "@/features/projects";

const money = (n: number, locale: string): string => `$${n.toLocaleString(locale)}`;

const VolumeChart = () => {
  const { t, locale } = useT();
  const { total, caption, weeks } = getAnnotationVolume();
  const max = Math.max(...weeks.map((w) => w.value));

  return (
    <div className="edash-card edash-chart-card h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Annotation Volume")}</h4>
          <p className="edash-card-sub">{t(caption)}</p>
        </div>
        <div className="edash-chart-total">
          <strong>{total}</strong>
          <span>{t("items delivered")}</span>
        </div>
      </div>
      <div className="edash-chart">
        {weeks.map((w) => (
          <div className="edash-chart-col" key={w.label}>
            <div className="edash-chart-bar-wrap">
              <span
                className="edash-chart-bar"
                style={{ height: `${Math.round((w.value / max) * 100)}%` }}
                title={t("{week}: {count} annotations", { week: w.label, count: w.value.toLocaleString(locale) })}
              ></span>
            </div>
            <span className="edash-chart-label">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccountCard = () => {
  const { t } = useT();
  const profile = getCompanyProfile();
  const seatPct = Math.round((profile.seatsUsed / profile.seatsTotal) * 100);

  return (
    <div className="edash-card edash-account h-100">
      <div className="edash-account-top">
        <div>
          <p className="edash-card-sub">{t("Account")}</p>
          <h4 className="edash-account-name">{profile.name}</h4>
        </div>
        <span className="edash-plan-badge">
          <i className="fa-solid fa-crown"></i> {profile.plan}
        </span>
      </div>
      <div className="edash-account-meta">
        <span>
          <i className="fa-solid fa-industry"></i> {t(profile.industry)}
        </span>
        <span>
          <i className="fa-solid fa-user-tie"></i> CSM: {profile.manager}
        </span>
      </div>
      <div className="edash-seats">
        <div className="edash-seats-head">
          <span>
            {t("Team seats — {count}", { count: <strong>{profile.seatsUsed}/{profile.seatsTotal}</strong> })}
          </span>
          <em>{seatPct}%</em>
        </div>
        <div className="tflow-progress">
          <span style={{ width: `${seatPct}%` }}></span>
        </div>
      </div>
      <p className="edash-renewal">
        <i className="fa-regular fa-calendar"></i> {t("Plan renews on {date}", { date: profile.renewal })}
      </p>
      <Link href="/contact" className="edash-btn-ghost w-100">
        <i className="fa-regular fa-envelope"></i> {t("Talk to Customer Success")}
      </Link>
    </div>
  );
};

const QualityCard = () => {
  const { t, locale } = useT();
  const { score, reviews } = getDeliveryQuality();

  return (
    <div className="edash-card edash-quality h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Delivery Quality")}</h4>
          <p className="edash-card-sub">{t("QA-reviewed accuracy")}</p>
        </div>
      </div>
      <div className="edash-quality-body">
        <div className="edash-quality-ring">
          <CircularProgressbar value={score} text={`${score}%`} strokeWidth={6} />
        </div>
        <ul className="edash-quality-list">
          <li>
            <span>{t("Items QA-reviewed")}</span>
            <strong>{reviews.toLocaleString(locale)}</strong>
          </li>
          <li>
            <span>{t("Re-work required")}</span>
            <strong>1.9%</strong>
          </li>
          <li>
            <span>{t("Avg. review time")}</span>
            <strong>{t("6h 12m")}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

const SpendCard = () => {
  const { t, locale } = useT();
  return (
  <div className="edash-card h-100">
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
  );
};

const ProjectsTable = () => {
  const posted = useAppSelector(selectPostedProjects);
  const { t, locale } = useT();
  return (
  <div className="edash-card">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Recent Projects")}</h4>
        <p className="edash-card-sub">{t("Annotation jobs posted by your team")}</p>
      </div>
    </div>
    <div className="edash-table-wrap">
      <table className="edash-table">
        <thead>
          <tr>
            <th>{t("Project")}</th>
            <th>{t("Type")}</th>
            <th>{t("Items")}</th>
            <th>{t("Progress")}</th>
            <th>{t("Spend")}</th>
            <th>{t("Status")}</th>
          </tr>
        </thead>
        <tbody>
          {getCompanyProjects(posted).map((p) => (
            <tr key={p.id}>
              <td>
                <div className="edash-project">
                  <span className={`edash-tone-${p.tone} edash-project-icon`}>
                    <i className={p.icon}></i>
                  </span>
                  <div>
                    <h5 className="edash-project-name">
                      <Link href={`/dashboard/projects?id=${p.id}`}>{p.name}</Link>
                    </h5>
                    <span className="edash-project-id">{p.id}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`edash-tone-${p.tone} edash-type-chip`}>{t(p.typeLabel)}</span>
              </td>
              <td className="edash-td-num">{p.items.toLocaleString(locale)}</td>
              <td>
                <div className="edash-progress-cell">
                  <div className="tflow-progress">
                    <span style={{ width: `${p.delivered}%` }}></span>
                  </div>
                  <em>{p.delivered}%</em>
                </div>
              </td>
              <td className="edash-td-num">{money(p.spend, locale)}</td>
              <td>
                <span className={`edash-status edash-status-${p.statusTone}`}>
                  {t(p.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const ActivityCard = () => {
  const { t } = useT();
  return (
  <div className="edash-card h-100">
    <div className="edash-card-head">
      <div>
        <h4 className="edash-card-title">{t("Recent Activity")}</h4>
        <p className="edash-card-sub">{t("Deliveries, team and billing events")}</p>
      </div>
    </div>
    <ul className="edash-activity">
      {getCompanyActivity().map((item, i) => (
        <li key={i}>
          <span className={`edash-tone-${item.tone} edash-activity-icon`}>
            <i className={item.icon}></i>
          </span>
          <div className="edash-activity-body">
            <h5>{t(item.title)}</h5>
            <p>{t(item.meta)}</p>
          </div>
          <span className="edash-activity-time">{t(item.time)}</span>
        </li>
      ))}
    </ul>
  </div>
  );
};

const StatusCard = () => {
  const { t } = useT();
  const counts = getProjectStatusCounts();
  const rows = [
    { label: "In Progress", value: counts.inProgress, tone: "blue" },
    { label: "In Review", value: counts.review, tone: "amber" },
    { label: "Completed", value: counts.completed, tone: "mint" },
  ];

  return (
    <div className="edash-card h-100">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t("Project Status")}</h4>
          <p className="edash-card-sub">{t("All projects, by stage")}</p>
        </div>
      </div>
      <ul className="edash-status-list">
        {rows.map((row) => (
          <li key={row.label}>
            <span className={`edash-dot edash-dot-${row.tone}`}></span>
            <span className="edash-status-label">{t(row.label)}</span>
            <strong>{row.value}</strong>
          </li>
        ))}
      </ul>
      <Link href="/dashboard/projects" className="edash-btn-ghost w-100">
        <i className="fa-solid fa-arrow-up-right-from-square"></i> {t("View All Projects")}
      </Link>
    </div>
  );
};

const DashboardArea = () => {
  const { t } = useT();
  return (
    <section className="edash-area pt-40 pb-120">
      <div className="container">
        <div className="edash-head">
          <div>
            <h3 className="edash-title">{t("Company Dashboard")}</h3>
            <p className="edash-sub">
              {t("Monitor your annotation projects, workforce delivery and spend in one place.")}
            </p>
          </div>
          <div className="edash-head-actions">
            <Link href="/dashboard/datasets" className="edash-btn-ghost">
              <i className="fa-solid fa-database"></i> {t("Order Dataset")}
            </Link>
            <Link href="/dashboard/new-project" className="edash-btn">
              <i className="fa-solid fa-plus"></i> {t("New Request")}
            </Link>
          </div>
        </div>

        <KpiGrid />

        <div className="row g-4 edash-mid">
          <div className="col-xl-8">
            <VolumeChart />
          </div>
          <div className="col-xl-4">
            <AccountCard />
          </div>
        </div>

        <div className="row g-4 edash-mid">
          <div className="col-xl-5">
            <QualityCard />
          </div>
          <div className="col-xl-7">
            <SpendCard />
          </div>
        </div>

        <div className="edash-projects" id="projects">
          <ProjectsTable />
        </div>

        <div className="edash-projects">
          
        </div>

        <div className="row g-4">
          <div className="col-xl-8">
            <ActivityCard />
          </div>
          <div className="col-xl-4">
            <StatusCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardArea;
