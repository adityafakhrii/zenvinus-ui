import React from "react";
import { DashboardFooter, DashboardHeader } from "@/features/dashboard";
import { getSeats, getTeamMembers, getPendingInvites, getRoleGuide } from "../data/company-team";
import { useT } from "@/i18n";

const CompanyTeam = () => {
  const { t } = useT();
  const seats = getSeats();
  const members = getTeamMembers();
  const invites = getPendingInvites();
  const roles = getRoleGuide();
  const pct = Math.round((seats.used / seats.total) * 100);

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120">
          <div className="container">
            <div className="edash-head">
              <div>
                <h3 className="edash-title">{t("Team & Seats")}</h3>
                <p className="edash-sub">
                  {t("Manage the people who post, review and oversee your projects.")}
                </p>
              </div>
              <div className="edash-head-actions">
                <button type="button" className="edash-btn">
                  <i className="fa-solid fa-user-plus"></i> {t("Invite Member")}
                </button>
              </div>
            </div>

            <div className="row g-4 edash-mid">
              <div className="col-xl-4">
                <div className="edash-card h-100">
                  <div className="edash-account-top">
                    <div>
                      <p className="edash-card-sub">{t("Plan")}</p>
                      <h4 className="edash-account-name">{seats.plan}</h4>
                    </div>
                    <span className="edash-plan-badge">
                      <i className="fa-solid fa-crown"></i> {t("Active")}
                    </span>
                  </div>
                  <div className="edash-seats">
                    <div className="edash-seats-head">
                      <span>
                        {t("Seats — {count}", { count: <strong>{seats.used}/{seats.total}</strong> })}
                      </span>
                      <em>{pct}%</em>
                    </div>
                    <div className="tflow-progress">
                      <span style={{ width: `${pct}%` }}></span>
                    </div>
                  </div>
                  <p className="edash-renewal">
                    <i className="fa-solid fa-circle-check"></i> {t("{count} seats available — add members any time before renewal", { count: seats.available })}
                  </p>
                  <p className="edash-renewal">
                    <i className="fa-regular fa-calendar"></i> {t("Renews on {date}", { date: seats.renew })}
                  </p>
                </div>
              </div>
              <div className="col-xl-8">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Members")}</h4>
                      <p className="edash-card-sub">
                        {t("{used} of {total} seats in use", { used: seats.used, total: seats.total })}
                      </p>
                    </div>
                  </div>
                  <div className="edash-table-wrap">
                    <table className="edash-table">
                      <thead>
                        <tr>
                          <th>{t("Member")}</th>
                          <th>{t("Role")}</th>
                          <th>{t("Projects")}</th>
                          <th>{t("Status")}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <tr key={m.email}>
                            <td>
                              <div className="edash-member-cell">
                                <span className={`edash-tone-${m.tone} edash-activity-icon edash-initial`}>
                                  {m.initials}
                                </span>
                                <div>
                                  <h5 className="edash-project-name">{m.name}</h5>
                                  <span className="edash-project-id">{m.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`edash-type-chip edash-tone-${m.roleTone}`}>
                                {t(m.role)}
                              </span>
                            </td>
                            <td className="edash-td-num">{m.projects}</td>
                            <td>
                              <span className={`edash-status edash-status-${m.statusTone}`}>
                                {t(m.status)}
                              </span>
                            </td>
                            <td className="edash-td-action">
                              <button type="button" className="edash-icon-btn" title={t("Manage {name}", { name: m.name })}>
                                <i className="fa-solid fa-ellipsis"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-xl-8">
                <div className="edash-card h-100">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t("Pending Invitations")}</h4>
                      <p className="edash-card-sub">{t("Waiting for your teammates to accept")}</p>
                    </div>
                  </div>
                  <ul className="edash-activity">
                    {invites.map((inv) => (
                      <li key={inv.email}>
                        <span className="edash-tone-purple edash-activity-icon">
                          <i className="fa-solid fa-paper-plane"></i>
                        </span>
                        <div className="edash-activity-body">
                          <h5>{inv.email}</h5>
                          <p>
                            {t("Role: {role} · sent {date}", { role: t(inv.role), date: inv.sent })}
                          </p>
                        </div>
                        <button type="button" className="edash-link-btn">
                          <i className="fa-solid fa-rotate"></i> {t("Resend")}
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
                      <h4 className="edash-card-title">{t("Roles at a Glance")}</h4>
                      <p className="edash-card-sub">{t("What each seat can do")}</p>
                    </div>
                  </div>
                  <ul className="edash-role-list">
                    {roles.map((r) => (
                      <li key={r.role}>
                        <span className={`edash-type-chip edash-tone-${r.roleTone}`}>{t(r.role)}</span>
                        <span className="edash-role-desc">{t(r.desc)}</span>
                      </li>
                    ))}
                  </ul>
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

export default CompanyTeam;
