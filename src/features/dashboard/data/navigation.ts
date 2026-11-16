import type { DashboardRole } from '../types/dashboard';

export type NavIconKey =
  | 'dashboard'
  | 'projects'
  | 'team'
  | 'billing'
  | 'datasets'
  | 'studio'
  | 'support'
  | 'tasks'
  | 'rewards'
  | 'quality'
  | 'lab'
  | 'settings';

export interface NavSubItem {
  label: string;
  href: string;
  count?: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconKey;
  /** Pathname prefixes that mark this item active; longest match wins. */
  matches: string[];
  badgeCount?: number;
  children?: ReadonlyArray<NavSubItem>;
}

export interface PersonaCta {
  href: string;
  label: string;
  icon: 'plus' | 'search';
}

export interface QuickSearchTarget {
  id: string;
  label: string;
  category: string;
  href: string;
  icon: NavIconKey;
}

type ContributorRole = Extract<DashboardRole, 'community' | 'expert'>;

export const ENTERPRISE_NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    matches: ['/dashboard'],
  },
  {
    label: 'Projects',
    href: '/dashboard/projects',
    icon: 'projects',
    matches: ['/dashboard/projects', '/dashboard/new-project', '/dashboard/pay'],
    badgeCount: 4,
    children: [
      { label: 'All Projects', href: '/dashboard/projects', count: 4 },
      { label: 'New Request', href: '/dashboard/new-project' },
    ],
  },
  {
    label: 'Team',
    href: '/dashboard/team',
    icon: 'team',
    matches: ['/dashboard/team'],
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: 'billing',
    matches: ['/dashboard/billing'],
  },
  {
    label: 'Datasets',
    href: '/dashboard/datasets',
    icon: 'datasets',
    matches: ['/dashboard/dataset', '/dashboard/model-details'],
    children: [
      { label: 'Datasets', href: '/dashboard/datasets' },
      { label: 'Models', href: '/models' },
    ],
  },
  {
    label: 'Support',
    href: '/dashboard/support',
    icon: 'support',
    matches: ['/dashboard/support'],
  },
];

export const contributorNavItems = (as: ContributorRole): ReadonlyArray<NavItem> => [
  {
    label: 'Dashboard',
    href: `/dashboard?as=${as}`,
    icon: 'dashboard',
    matches: ['/dashboard'],
  },
  {
    label: 'Find Tasks',
    href: '/dashboard/tasks',
    icon: 'tasks',
    matches: ['/dashboard/tasks', '/task'],
    badgeCount: 6,
    children: [
      { label: 'Task Marketplace', href: '/dashboard/tasks', count: 6 },
      { label: 'Annotation Studio', href: '/task-studio?task=road-damage-annotation' },
      { label: 'Quality Check', href: '/task-quality-check?task=road-damage-annotation' },
    ],
  },
  {
    label: 'Rewards',
    href: '/task-reward?task=road-damage-annotation',
    icon: 'rewards',
    matches: ['/task-reward'],
  },
  {
    label: 'Datasets',
    href: '/dashboard/datasets',
    icon: 'datasets',
    matches: ['/dashboard/dataset', '/dashboard/model-details'],
  },
  {
    label: 'Support',
    href: `/dashboard/support?as=${as}`,
    icon: 'support',
    matches: ['/dashboard/support'],
  },
];

export const INTERNAL_NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    label: 'Dashboard',
    href: '/dashboard?as=internal',
    icon: 'dashboard',
    matches: ['/dashboard'],
  },
  {
    label: 'AI Research Lab',
    href: '/lab',
    icon: 'lab',
    matches: ['/lab'],
    badgeCount: 3,
  },
  {
    label: 'Projects',
    href: '/dashboard/projects',
    icon: 'projects',
    matches: ['/dashboard/projects', '/dashboard/new-project'],
  },
  {
    label: 'Datasets',
    href: '/dashboard/datasets',
    icon: 'datasets',
    matches: ['/dashboard/dataset', '/dashboard/model-details'],
  },
  {
    label: 'Support',
    href: '/dashboard/support?as=internal',
    icon: 'support',
    matches: ['/dashboard/support'],
  },
];

export const STUDIO_NAV_ITEM: NavItem = {
  label: 'Studio',
  href: '/dashboard/studio',
  icon: 'studio',
  matches: ['/dashboard/studio'],
  children: [
    { label: 'All Datasets', href: '/dashboard/studio' },
    { label: 'Explore Splits', href: '/dashboard/studio/explore?slug=indonesian-road-damage-v2' },
    { label: 'New Dataset', href: '/dashboard/studio/edit' },
  ],
};

export function getNavItemsForRole(as: DashboardRole, canExploreStudio: boolean): NavItem[] {
  let base: ReadonlyArray<NavItem>;
  if (as === 'community' || as === 'expert') {
    base = contributorNavItems(as);
  } else if (as === 'internal') {
    base = INTERNAL_NAV_ITEMS;
  } else {
    base = ENTERPRISE_NAV_ITEMS;
  }

  if (!canExploreStudio) return [...base];
  const withoutSupport = base.filter((item) => item.label !== 'Support');
  const supportItem = base.filter((item) => item.label === 'Support');
  return [...withoutSupport, STUDIO_NAV_ITEM, ...supportItem];
}

export function getPersonaCta(as: DashboardRole): PersonaCta | null {
  if (as === 'community') {
    return { href: '/dashboard/tasks', label: 'Find Tasks', icon: 'search' };
  }
  if (as === 'expert' || as === 'internal') {
    return null;
  }
  return { href: '/dashboard/new-project', label: 'Post New Task', icon: 'plus' };
}

export const QUICK_SEARCH_TARGETS: ReadonlyArray<QuickSearchTarget> = [
  { id: 'ent', label: 'Enterprise Dashboard', category: 'Workspaces', href: '/dashboard', icon: 'dashboard' },
  { id: 'com', label: 'Community Dashboard', category: 'Workspaces', href: '/dashboard?as=community', icon: 'tasks' },
  { id: 'int', label: 'Internal Operations', category: 'Workspaces', href: '/dashboard?as=internal', icon: 'lab' },
  { id: 'exp', label: 'Expert Reviewer Queue', category: 'Workspaces', href: '/dashboard?as=expert', icon: 'quality' },
  { id: 'proj', label: 'Projects & Orders', category: 'Enterprise', href: '/dashboard/projects', icon: 'projects' },
  { id: 'new-proj', label: 'New Project Request', category: 'Enterprise', href: '/dashboard/new-project', icon: 'projects' },
  { id: 'billing', label: 'Billing & Invoices', category: 'Enterprise', href: '/dashboard/billing', icon: 'billing' },
  { id: 'team', label: 'Team & Seats', category: 'Enterprise', href: '/dashboard/team', icon: 'team' },
  { id: 'settings', label: 'Workspace Settings & Navigation Mode', category: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  { id: 'tasks', label: 'Find Tasks Marketplace', category: 'Community', href: '/dashboard/tasks', icon: 'tasks' },
  { id: 'task-studio', label: 'Annotation Studio (Road Damage)', category: 'Community', href: '/task-studio?task=road-damage-annotation', icon: 'studio' },
  { id: 'rewards', label: 'Rewards & Payouts', category: 'Community', href: '/task-reward?task=road-damage-annotation', icon: 'rewards' },
  { id: 'datasets', label: 'Datasets Catalog', category: 'Catalog', href: '/dashboard/datasets', icon: 'datasets' },
  { id: 'studio', label: 'Dataset Studio', category: 'Catalog', href: '/dashboard/studio', icon: 'studio' },
  { id: 'lab', label: 'AI Research Lab', category: 'Internal', href: '/lab', icon: 'lab' },
  { id: 'support', label: 'Support & Tickets', category: 'Help', href: '/dashboard/support', icon: 'support' },
];
