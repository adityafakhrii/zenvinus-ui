import Link from "next/link";
import React from "react";
import { useT } from "@/i18n";

interface FooterLink {
  label: string;
  href: string;
}

const edash_footer_links: FooterLink[] = [
  { label: "AI Research Lab", href: "/lab" },
  { label: "Support", href: "/dashboard/support" },
  { label: "Company", href: "/about" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

const DashboardFooter = () => {
  const { t } = useT();
  return (
    <footer className="edash-footer">
      <div className="container">
        <div className="edash-footer-inner">
          <p>{t("© 2026 Zenvinus Labs, Inc. All rights reserved.")}</p>
          <nav className="edash-footer-links">
            {/* WHY: "#" placeholders are plain anchors: next/link resolves "#" against the URL, which differs between
                server and browser on ?as= pages and caused a hydration warning */}
            {edash_footer_links.map((item) =>
              item.href === "#" ? (
                <a key={item.label} href="#">{t(item.label)}</a>
              ) : (
                <Link key={item.label} href={item.href}>
                  {t(item.label)}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
