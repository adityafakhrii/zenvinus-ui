import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import menu_data, { isMenuItemActive, sectionOf, type MenuItem } from "./menu-data";
import { useT } from "@/i18n";
import Button from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import Logo from "@assets/img/logo/logo.png";

/**
 * Site menu below 1200px: a menu button in the header opens a panel from the right with every menu link,
 * expandable submenus, the current page marked like the desktop menu, and "Get Started Today" (or "Dashboard"
 * when signed in).
 * Closes on link click, route change, Escape, or a tap on the backdrop; the page behind does not scroll while open.
 * While closed the panel is visibility: hidden, so its links are out of the tab order.
 */
const MobileNav = () => {
  const { t } = useT();
  const { user } = useAuth();
  const router = useRouter();
  const current = sectionOf(router.pathname);
  const [open, setOpen] = useState(false);
  // The dropdown that holds the current page starts expanded
  const [expanded, setExpanded] = useState<string | null>(null);

  const isActive = (item: MenuItem) => isMenuItemActive(item, current);

  useEffect(() => {
    if (!open) return undefined;
    setExpanded(menu_data.find((m) => m.has_dropdown && isActive(m))?.title ?? null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <>
      <button type="button" className="zv-mnav-toggle d-xl-none" aria-label={t("Open menu")} aria-expanded={open} aria-controls="zv-mnav" onClick={() => setOpen(true)}>
        <span></span><span></span><span></span>
      </button>

      <div className={`zv-mnav-backdrop${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true"></div>
      <nav id="zv-mnav" className={`zv-mnav${open ? " is-open" : ""}`} aria-label={t("Menu")}>
        <div className="zv-mnav-head">
          <Link href="/" className="zv-mnav-logo" onClick={() => setOpen(false)}>
            <Image src={Logo} alt="Zenvinus" />
          </Link>
          <button type="button" className="zv-mnav-close" aria-label={t("Close menu")} onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M11 1L1 11M1 1l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="zv-mnav-list">
          {menu_data.map((item) => (
            <li key={item.title} className={isActive(item) ? "is-active" : undefined}>
              {item.sub_menus ? (
                <>
                  <button type="button" className="zv-mnav-link" aria-expanded={expanded === item.title}
                    onClick={() => setExpanded(expanded === item.title ? null : item.title)}>
                    {t(item.title)}
                    <i className="fa-regular fa-angle-down" aria-hidden="true"></i>
                  </button>
                  {expanded === item.title && (
                    <ul className="zv-mnav-sub">
                      {item.sub_menus.map((sub) => (
                        <li key={sub.link} className={sub.link === current ? "is-active" : undefined}>
                          <Link href={sub.link} aria-current={sub.link === current ? "page" : undefined} onClick={() => setOpen(false)}>{t(sub.title)}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link href={item.link} className="zv-mnav-link" aria-current={item.link === current ? "page" : undefined} onClick={() => setOpen(false)}>
                  {t(item.title)}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="zv-mnav-foot">
          {user ? (
            <>
              <p className="zv-mnav-user">{user.name || user.email}</p>
              <Button href="/dashboard" block onClick={() => setOpen(false)}>{t("Dashboard")}</Button>
            </>
          ) : (
            <Button href="/login" block onClick={() => setOpen(false)}>{t("Get Started Today")}</Button>
          )}
          <a href="mailto:info@zenvinus.co.id" className="zv-mnav-mail">info@zenvinus.co.id</a>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
