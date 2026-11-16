import Link from "next/link";
import React, { useState } from "react";
import menu_data from "@/components/layout/header/menu-data";
import { useT } from "@/i18n";

const MobileMenus = () => {
  const [navTitle, setNavTitle] = useState("");
  const openMobileMenu = (menu: string) => {
    if (navTitle === menu) {
      setNavTitle("");
    } else {
      setNavTitle(menu);
    }
  };
  const { t } = useT();
  return (
    <>
      <nav className="mean-nav">
        <ul>
          {menu_data.map((menu, i) => (
            <React.Fragment key={i}>
              {menu.has_dropdown && menu.sub_menus && (
                <li className="has-dropdown">
                  <Link href={menu.link}>{t(menu.title)}</Link>
                  <ul
                    className="submenu"
                    style={{
                      display: navTitle === menu.title ? "block" : "none",
                    }}
                  >
                    {menu.sub_menus.map((sub, i) => (
                      <li key={i}>
                        <Link href={sub.link}>{t(sub.title)}</Link>
                      </li>
                    ))}
                  </ul>
                  <a
                    className={`mean-expand ${
                      navTitle === menu.title ? "mean-clicked" : ""
                    }`}
                   
                    onClick={() => openMobileMenu(menu.title)}
                    style={{ fontSize: "18px", cursor: "pointer" }}
                  >
                    <i className="fa-regular fa-angle-down"></i>
                  </a>
                </li>
              )}
              {!menu.has_dropdown && (
                <li>
                  <Link href={menu.link}>{t(menu.title)}</Link>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileMenus;
