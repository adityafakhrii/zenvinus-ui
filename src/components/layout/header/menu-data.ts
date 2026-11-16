/** Site menu (desktop nav, mobile panel, and the service page's template menu). Titles are English i18n keys. */
export interface MenuLink {
  title: string;
  link: string;
}

export interface MenuItem extends MenuLink {
  id: number;
  /** Has a dropdown with sub_menus */
  has_dropdown: boolean;
  sub_menus?: MenuLink[];
}

const menu_data: readonly MenuItem[] = [
  { id: 1, has_dropdown: false, title: 'Home', link: '/' },
  { id: 2, has_dropdown: false, title: 'Company', link: '/about' },
  {
    id: 3,
    has_dropdown: true,
    title: 'Community',
    link: '/tasks',
    sub_menus: [
      { link: '/tasks', title: 'Tasks' },
      { link: '/datasets', title: 'Datasets' },
      { link: '/models', title: 'Models' },
    ],
  },
  {
    id: 5,
    has_dropdown: true,
    title: 'Media',
    link: '/blog',
    sub_menus: [
      { link: '/blog', title: 'Blog' },
      { link: '/news', title: 'News' },
    ],
  },
  { id: 6, has_dropdown: false, title: 'Contact', link: '/contact' },
];

export default menu_data;

/** True when the item or one of its sub-links points at `current` (a menu link from sectionOf()). */
export const isMenuItemActive = (item: MenuItem, current: string): boolean =>
  item.link === current || (item.sub_menus ?? []).some((sub) => sub.link === current);

// Pages that are not in the menu but belong to a menu link (details and task flow pages)
const SECTION_OF: Readonly<Record<string, string>> = {
  '/dataset-details': '/datasets',
  '/model-details': '/models',
  '/blog-details': '/blog',
  '/news-details': '/news',
  '/service-details': '/service',
};

/** Menu link a page belongs to (router.pathname -> menu link); shared by the desktop and mobile menus. */
export const sectionOf = (pathname: string): string => {
  const mapped = SECTION_OF[pathname];
  if (mapped) return mapped;
  if (pathname.startsWith('/task')) return '/tasks'; // /task-details, /task-join, /task-reward, ...
  return pathname;
};
