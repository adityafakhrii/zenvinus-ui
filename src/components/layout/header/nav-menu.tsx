import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import menu_data, { isMenuItemActive, sectionOf } from './menu-data';
import { useT } from '@/i18n';

/** Desktop menu. The link for the current page gets the "active" class, styled like hover (_menu.scss). */
const NavMenu = () => {
  const { t } = useT();
  const current = sectionOf(useRouter().pathname);

  return (
    <ul>
      {menu_data.map((menu_item) => (
        <li
          key={menu_item.id}
          className={[menu_item.has_dropdown && 'has-dropdown', isMenuItemActive(menu_item, current) && 'active'].filter(Boolean).join(' ')}
        >
          <Link href={menu_item.link} aria-current={menu_item.link === current ? 'page' : undefined}>
            <span></span>
            {t(menu_item.title)}
          </Link>
          {menu_item.sub_menus && (
            <ul className="submenu">
              {menu_item.sub_menus.map((sub_menu) => (
                <li key={sub_menu.link} className={sub_menu.link === current ? 'active' : undefined}>
                  <Link href={sub_menu.link} aria-current={sub_menu.link === current ? 'page' : undefined}>
                    <span>{t(sub_menu.title)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

export default NavMenu;
