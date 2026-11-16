import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "@assets/img/logo/logo.png";
import { getCompanyProfile } from "../data/company-dashboard";
import useMounted from "@/hooks/use-mounted";
import RoleSwitch from "./role-switch";
import { AccountMenu, useAuth } from '@/features/auth';
import { STUDIO_PERMS } from "@/config/permissions";
import { LanguageSwitch, useT } from "@/i18n";
import { isDashboardRole, type DashboardRole } from "../types/dashboard";

interface NavItem {
  label: string;
  href: string;
  /** Pathname prefixes that mark this item active; the longest match wins, so /dashboard/projects does not
   * also mark Dashboard */
  matches: string[];
}

interface PersonaCta {
  href: string;
  icon: string;
  label: string;
}

type ContributorRole = Extract<DashboardRole, "community" | "expert">;

const enterprise_nav_items: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", matches: ["/dashboard"] },
  { label: "Projects", href: "/dashboard/projects", matches: ["/dashboard/projects"] },
  { label: "Team", href: "/dashboard/team", matches: ["/dashboard/team"] },
  { label: "Billing", href: "/dashboard/billing", matches: ["/dashboard/billing"] },
  {
    label: "Datasets",
    href: "/dashboard/datasets",
    matches: ["/dashboard/dataset", "/dashboard/model-details"],
  },
  { label: "Support", href: "/dashboard/support", matches: ["/dashboard/support"] },
];

// Community and expert share one nav: the labeling studio access is the same; decision rights only show on
// their own dashboards.
const contributor_nav_items = (as: ContributorRole): NavItem[] => [
  { label: "Dashboard", href: `/dashboard?as=${as}`, matches: ["/dashboard"] },
  { label: "Find Tasks", href: "/dashboard/tasks", matches: ["/dashboard/tasks", "/task"] },
  {
    label: "Rewards",
    href: "/task-reward?task=road-damage-annotation",
    matches: ["/task-reward"],
  },
  {
    label: "Datasets",
    href: "/dashboard/datasets",
    matches: ["/dashboard/dataset", "/dashboard/model-details"],
  },
  // ?as= keeps the contributor menu on the support page
  { label: "Support", href: `/dashboard/support?as=${as}`, matches: ["/dashboard/support"] },
];

const isNavActive = (match: string, pathname: string): boolean => pathname.startsWith(match);

// The main topbar CTA follows the persona: "Post New Task" only makes sense for enterprise; experts get no CTA
// (their page is the review queue).
const personaCta = (as: string | undefined): PersonaCta | null => {
  if (as === "community")
    return { href: "/dashboard/tasks", icon: "fa-solid fa-magnifying-glass", label: "Find Tasks" };
  if (as === "expert") return null;
  return { href: "/dashboard/new-project", icon: "fa-solid fa-plus", label: "Post New Task" };
};

const DashboardHeader = () => {
  const router = useRouter();
  const company = getCompanyProfile();
  const { can, user } = useAuth();
  // WHY: Show the signed-in account; the demo company profile is only a fallback for visitors without a session
  const profile = user ? { ...company, name: user.name || user.email, email: user.email } : company;
  const asQuery = useMounted() ? router.query.as : undefined;
  // ?as= is a single value; a repeated or missing one counts as the enterprise workspace
  const as = typeof asQuery === "string" ? asQuery : undefined;
  const { t } = useT();
  const baseNav: NavItem[] =
    as === "community" || as === "expert"
      ? contributor_nav_items(as)
      : enterprise_nav_items;
  // The studio link only shows for roles that can open it; the studio pages and API check again
  const navItems = can(STUDIO_PERMS.explore)
    ? [...baseNav.filter((i) => i.label !== "Support"), { label: "Studio", href: "/dashboard/studio", matches: ["/dashboard/studio"] }, ...baseNav.filter((i) => i.label === "Support")]
    : baseNav;
  // Only one active item: the longest prefix that matches the pathname
  const activeMatch = navItems
    .flatMap((item) => item.matches.map((m) => ({ item, m })))
    .filter(({ m }) => isNavActive(m, router.pathname))
    .sort((a, b) => b.m.length - a.m.length)[0]?.item;

  const [navOpen, setNavOpen] = useState(false);
  // Close the small-screen menu after navigating
  useEffect(() => {
    setNavOpen(false);
  }, [router.asPath]);

  const cta = personaCta(as);

  return (
    <>
      {/* WHY: Two planned rows instead of one row that wrapped on its own: the main bar stays pinned on scroll,
          the workspace role bar below it scrolls away */}
      <header className="edash-topbar">
        <div className="container">
          <div className="edash-topbar-inner zv-topbar-main">
            <div className="edash-topbar-left">
              <Link href="/" className="edash-topbar-logo">
                <Image src={Logo} alt="zenvinus" priority />
              </Link>
              <nav className="edash-topbar-nav d-none d-xl-flex" aria-label={t("Main menu")}>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={item === activeMatch ? "page" : undefined}
                    className={item === activeMatch ? "edash-nav-link edash-nav-link-active" : "edash-nav-link"}
                  >
                    {t(item.label)}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="edash-topbar-actions">
              <LanguageSwitch className="d-none d-sm-inline-flex" />
              <button type="button" className="edash-bell" title={t("{count} unread notifications", { count: 3 })} aria-label={t("{count} unread notifications", { count: 3 })}>
                <i className="fa-regular fa-bell"></i>
                <span className="edash-bell-dot"></span>
              </button>
              {cta && (
                <Link href={cta.href} className="edash-btn edash-btn-sm d-none d-lg-inline-flex">
                  <i className={cta.icon}></i> {t(cta.label)}
                </Link>
              )}
              <AccountMenu
                name={profile.name}
                email={profile.email}
                title={`${profile.name} — ${t("{plan} plan", { plan: profile.plan })}`}
                links={[{ href: "/dashboard/settings", icon: "fa-solid fa-gear", label: "Account Settings" }]}
              />
              <button
                type="button"
                className="zv-topbar-burger d-xl-none"
                aria-label={navOpen ? t("Close menu") : t("Open menu")}
                aria-expanded={navOpen}
                aria-controls="zv-topbar-mobile-nav"
                onClick={() => setNavOpen((o) => !o)}
              >
                <i className={navOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
              </button>
            </div>
          </div>
        </div>

        {navOpen && (
          <nav id="zv-topbar-mobile-nav" className="zv-topbar-mobile d-xl-none" aria-label={t("Main menu")}>
            <div className="container">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={item === activeMatch ? "page" : undefined}
                  className={item === activeMatch ? "zv-topbar-mobile-link is-active" : "zv-topbar-mobile-link"}
                >
                  {t(item.label)}
                </Link>
              ))}
              {cta && (
                <Link href={cta.href} className="edash-btn edash-btn-sm d-lg-none zv-topbar-mobile-cta">
                  <i className={cta.icon}></i> {t(cta.label)}
                </Link>
              )}
              <LanguageSwitch className="d-sm-none zv-topbar-mobile-lang" />
            </div>
          </nav>
        )}
      </header>

      <div className="zv-topbar-sub">
        <div className="container zv-topbar-sub-inner">
          <span className="zv-topbar-sub-label">{t("Workspace")}</span>
          <RoleSwitch as={isDashboardRole(as) ? as : "enterprise"} />
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
