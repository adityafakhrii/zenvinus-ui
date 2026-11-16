import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/components/ui';
import { useT } from '@/i18n';
import { getCompanyKpis } from '../data/company-dashboard';
import type { KpiItem } from '../types/dashboard';
import { DashboardLucideIcon, iconTileToneClass } from './dashboard-icons';

export interface DeltaChipProps {
  delta?: number | null;
  good?: boolean;
}

/**
 * Compact trend delta indicator pill using crisp semantic colors and tabular numerals.
 */
export const DeltaChip = ({ delta, good = true }: DeltaChipProps) => {
  if (delta === undefined || delta === null) return null;
  const Icon = delta >= 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums whitespace-nowrap',
        good ? 'bg-tone-mint-bg text-tone-mint-fg' : 'bg-tone-red-bg text-tone-red-fg',
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      <span>{Math.abs(delta)}%</span>
    </span>
  );
};

export interface KpiGridProps {
  /** Tiles to show; defaults to company KPIs. */
  items?: KpiItem[];
}

/**
 * Four-column Tailwind Bento KPI strip reused across dashboard subpages (Billing, Projects).
 */
const KpiGrid = ({ items = getCompanyKpis() }: KpiGridProps) => {
  const { t } = useT();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <div
          key={kpi.id}
          className="flex items-start gap-3.5 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)]"
        >
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]',
              iconTileToneClass(kpi.tone),
            )}
          >
            <DashboardLucideIcon icon={kpi.icon} className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13px] font-medium text-ink-secondary leading-snug">{t(kpi.label)}</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums leading-none">
                {typeof kpi.value === 'string' ? t(kpi.value) : kpi.value}
                {kpi.valueSuffix}
              </span>
              <DeltaChip delta={kpi.delta} good={kpi.good} />
            </div>
            <p className="mt-1.5 mb-0 text-xs text-ink-muted">{t(kpi.note || 'vs. previous 30 days')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiGrid;
