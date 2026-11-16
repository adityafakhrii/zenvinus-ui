import Link from "next/link";
import React from "react";
import { useT } from "@/i18n";

import type { DashboardRole } from "../types/dashboard";

/**
 * Workspace switcher: one Zenvinus account, several memberships (RBAC):
 * Enterprise (client), Community (contributor), Internal (operations),
 * Expert (verified reviewer). The active role travels in ?as=.
 */
interface RoleLink {
  key: DashboardRole;
  label: string;
  icon: string;
  href: string;
}

const ROLES: RoleLink[] = [
  { key: "enterprise", label: "Enterprise", icon: "fa-solid fa-building", href: "/dashboard" },
  { key: "community", label: "Community", icon: "fa-solid fa-users", href: "/dashboard?as=community" },
  { key: "internal", label: "Internal", icon: "fa-solid fa-gears", href: "/dashboard?as=internal" },
  { key: "expert", label: "Expert", icon: "fa-solid fa-user-shield", href: "/dashboard?as=expert" },
];

export interface RoleSwitchProps {
  as?: DashboardRole;
}

const RoleSwitch = ({ as = "enterprise" }: RoleSwitchProps) => {
  const { t } = useT();
  return (
  <div className="edash-role-switch" role="tablist" aria-label={t("Workspace role")}>
    {ROLES.map((r) => (
      <Link
        key={r.key}
        href={r.href}
        role="tab"
        aria-selected={as === r.key}
        className={as === r.key ? "edash-role-pill edash-role-pill-active" : "edash-role-pill"}
      >
        <i className={r.icon}></i> {t(r.label)}
      </Link>
    ))}
  </div>
  );
};

export default RoleSwitch;
