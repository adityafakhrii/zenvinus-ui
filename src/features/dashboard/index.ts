/**
 * Public API of the dashboard feature. Other features and pages import from '@/features/dashboard'.
 * The header and footer are the shell of every signed-in page; KpiGrid renders KpiItem[] tiles.
 * The /dashboard view itself (components/dashboard-page) is left out so importing this file stays light.
 */
export { default as DashboardHeader } from './components/dashboard-header';
export { default as DashboardFooter } from './components/dashboard-footer';
export { default as KpiGrid, DeltaChip } from './components/kpi-grid';
export type { KpiGridProps, DeltaChipProps } from './components/kpi-grid';
export { getCompanyProfile, getSpendBreakdown } from './data/company-dashboard';
export { DASHBOARD_ROLES, isDashboardRole } from './types/dashboard';
export type { CompanyProfile, DashboardRole, KpiItem, SpendRow, Tone } from './types/dashboard';
export {
  NAV_MODES,
  isNavMode,
  layoutPersistence,
  layoutReducer,
  navModeChanged,
  selectNavMode,
  selectSidebarCollapsed,
  sidebarCollapsedChanged,
  sidebarCollapsedToggled,
} from './store/layout-slice';
export type { LayoutRootState, LayoutState, NavMode } from './store/layout-slice';
