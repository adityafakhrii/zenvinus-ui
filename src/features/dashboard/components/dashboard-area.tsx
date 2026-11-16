import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Crown,
  Database,
  FolderKanban,
  LifeBuoy,
  Mail,
  Plus,
  Receipt,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  CustomBarChart,
  CustomProgressBar,
  CustomSelect,
  CustomSemiCircleGauge,
  EmptyState,
  SearchInput,
  SegmentedBreakdownBar,
  SegmentedControl,
  cn,
} from '@/components/ui';
import type { BarChartDatum, BreakdownItem, SegmentedOption, SelectOption } from '@/components/ui';
import { useT } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectPostedProjects } from '@/features/projects';
import {
  getAnnotationVolume,
  getCompanyActivity,
  getCompanyProfile,
  getCompanyProjects,
  getDeliveryQuality,
  getProjectStatusCounts,
  getSpendBreakdown,
} from '../data/company-dashboard';
import {
  BentoCard,
  DashboardCanvas,
  DashboardPageHeader,
  KeyValueList,
  QuickActionGrid,
  StackedMetric,
} from './bento-primitives';
import { DashboardLucideIcon, iconTileToneClass, toBadgeTone } from './dashboard-icons';

type VolumeRange = '6w' | '12w';

const BREAKDOWN_COLORS = ['#05DAC3', '#0D9488', '#020626', '#64748B'] as const;

const COLLABORATORS = [
  { initials: 'FA', name: 'Faris A.' },
  { initials: 'RP', name: 'Rizky P.' },
  { initials: 'AP', name: 'Adinda P.' },
  { initials: 'BW', name: 'Bagas W.' },
] as const;

function money(value: number, locale: string): string {
  return `$${value.toLocaleString(locale)}`;
}

/**
 * Enterprise Dashboard (/dashboard default) structured in the ACRU Bento layout.
 */
const DashboardArea = () => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const [range, setRange] = useState<VolumeRange>('12w');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const profile = useMemo(() => getCompanyProfile(), []);
  const volume = useMemo(() => getAnnotationVolume(), []);
  const spendRows = useMemo(() => getSpendBreakdown(), []);
  const quality = useMemo(() => getDeliveryQuality(), []);
  const counts = useMemo(() => getProjectStatusCounts(), []);
  const activity = useMemo(() => getCompanyActivity(), []);
  const projects = useMemo(() => getCompanyProjects(posted), [posted]);

  const seatPct = Math.round((profile.seatsUsed / profile.seatsTotal) * 100);
  const totalSpend = useMemo(() => spendRows.reduce((sum, row) => sum + row.amount, 0), [spendRows]);

  const visibleWeeks = useMemo(
    () => (range === '6w' ? volume.weeks.slice(-6) : volume.weeks),
    [range, volume.weeks],
  );

  const visibleTotal = useMemo(() => {
    if (range === '12w') return volume.total;
    return visibleWeeks.reduce((sum, w) => sum + w.value, 0).toLocaleString(locale);
  }, [locale, range, visibleWeeks, volume.total]);

  const chartData: BarChartDatum[] = useMemo(
    () =>
      visibleWeeks.map((w) => ({
        label: w.label,
        title: w.label,
        value: w.value,
      })),
    [visibleWeeks],
  );

  const rangeOptions: SegmentedOption<VolumeRange>[] = useMemo(
    () => [
      { value: '6w', label: t('6w') },
      { value: '12w', label: t('12w') },
    ],
    [t],
  );

  const breakdownItems: BreakdownItem[] = useMemo(
    () =>
      spendRows.map((row, index) => ({
        id: row.label,
        label: t(row.label),
        percent: row.share,
        color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
      })),
    [spendRows, t],
  );

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: t('All statuses') },
      { value: 'In Progress', label: t('In Progress') },
      { value: 'In Review', label: t('In Review') },
      { value: 'Completed', label: t('Completed') },
    ],
    [t],
  );

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.typeLabel.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [projects, search, statusFilter]);

  return (
    <DashboardCanvas>
      <DashboardPageHeader
        title={t('Company Dashboard')}
        subtitle={t('Monitor your annotation projects, workforce delivery and spend in one place.')}
        actions={
          <>
            <Button
              href="/dashboard/datasets"
              variant="secondary"
              size="sm"
              leftIcon={<Database className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Order Dataset')}
            </Button>
            <Button
              href="/dashboard/new-project"
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
            >
              {t('New Request')}
            </Button>
          </>
        }
      />

      {/* Row 1: Hero Bento Volume Chart + Account & Quick Actions Card */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard
          className="xl:col-span-8"
          title={t('Annotation Volume')}
          subtitle={range === '6w' ? t('Last 6 weeks') : t(volume.caption)}
          action={
            <SegmentedControl<VolumeRange>
              value={range}
              onChange={setRange}
              options={rangeOptions}
              size="sm"
              ariaLabel={t('Select timeframe')}
            />
          }
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_210px]">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-[30px] font-semibold tracking-tight text-ink tabular-nums leading-none">
                    {visibleTotal}
                  </span>
                  <span className="text-xs font-medium text-ink-muted">{t('items delivered')}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                  <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                  <span>{t('Annotations Delivered')}</span>
                </span>
              </div>

              <CustomBarChart
                data={chartData}
                series={[{ key: 'items', label: t('Annotations Delivered'), color: '#05DAC3' }]}
                height={230}
                formatValue={(v) => v.toLocaleString(locale)}
              />
            </div>

            <div className="flex flex-col justify-between gap-5 border-t border-line-subtle pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <StackedMetric
                label={t('Spend This Month')}
                value={money(totalSpend, locale)}
                delta={-4.1}
                good
                helper={t('vs. previous 30 days')}
              />
              <StackedMetric
                label={t('Active Projects')}
                value={projects.length}
                delta={2}
                good
                helper={t('Across annotation & QA')}
              />
              <StackedMetric
                label={t('QA Pass Rate')}
                value={`${quality.score}%`}
                delta={1.2}
                good
                helper={t('{count} items reviewed', { count: quality.reviews.toLocaleString(locale) })}
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="xl:col-span-4 justify-between"
          title={t('Account')}
          subtitle={t(profile.industry)}
          action={
            <Badge tone="mint" dot>
              {t(profile.plan)}
            </Badge>
          }
        >
          {/* Styled Navy Enterprise Object Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-navy p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[11px] font-medium text-white/60">{t('Workspace')}</p>
                <p className="mt-1 mb-0 text-base font-semibold tracking-tight">{profile.name}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-teal">
                <Crown className="h-3 w-3" strokeWidth={1.75} />
                {t(profile.plan)}
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-3">
              <div>
                <p className="m-0 text-[11px] text-white/60">{t('Monthly budget')}</p>
                <p className="mt-0.5 mb-0 text-[22px] font-semibold tabular-nums leading-none">
                  {money(totalSpend, locale)}
                </p>
              </div>
              <div className="text-right">
                <p className="m-0 text-[11px] text-white/60">{t('Team')}</p>
                <p className="mt-0.5 mb-0 font-mono text-sm font-medium tabular-nums">
                  {profile.seatsUsed}/{profile.seatsTotal}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] text-white/70">
              <span>CSM: {profile.manager}</span>
              <span>{t('Plan renews on {date}', { date: profile.renewal })}</span>
            </div>
          </div>

          {/* 5-Button Quick Action Strip */}
          <div className="mt-4">
            <QuickActionGrid
              items={[
                {
                  label: t('New'),
                  href: '/dashboard/new-project',
                  icon: <Plus className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Projects'),
                  href: '/dashboard/projects',
                  icon: <FolderKanban className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Billing'),
                  href: '/dashboard/billing',
                  icon: <Receipt className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Team'),
                  href: '/dashboard/team',
                  icon: <Users className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Support'),
                  href: '/dashboard/support',
                  icon: <LifeBuoy className="h-4 w-4" strokeWidth={1.6} />,
                },
              ]}
            />
          </div>

          {/* Active Workspace Members & CSM Contact */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-4">
            <div className="flex items-center -space-x-2">
              {COLLABORATORS.map((person) => (
                <span
                  key={person.initials}
                  title={person.name}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-canvas text-[11px] font-semibold text-ink"
                >
                  {person.initials}
                </span>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-ink no-underline hover:underline"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.6} />
              <span>{t('Talk to Customer Success')}</span>
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Row 2: Monthly Seat Capacity + Workflow Guidance */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-6 justify-center"
          title={t('Team')}
          subtitle={t('Seat allocation across your organization')}
          action={
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-ink no-underline hover:underline"
            >
              <span>{t('Manage seats')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          }
        >
          <CustomProgressBar
            value={seatPct}
            tone="teal"
            leftLabel={t('{used} seats assigned', { used: profile.seatsUsed })}
            rightLabel={t('{total} seats total ({pct}%)', { total: profile.seatsTotal, pct: seatPct })}
          />
        </BentoCard>

        <div className="lg:col-span-6 flex flex-col justify-between gap-4 rounded-2xl border border-teal-ink/15 bg-tint-mint p-5 sm:p-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-teal-ink border border-teal-ink/20">
              {t('Milestone escrow')}
            </span>
            <h3 className="mt-2 mb-0 text-[15px] font-semibold text-ink leading-snug">
              {t('Request custom datasets with expert QA review')}
            </h3>
            <p className="mt-1 mb-0 text-xs text-ink-secondary leading-relaxed">
              {t('Scoped proposal in 1–2 business days with batch verification before final payout.')}
            </p>
          </div>
          <Button
            href="/dashboard/new-project"
            variant="primary"
            size="sm"
            className="shrink-0"
            rightIcon={<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />}
          >
            {t('New Request')}
          </Button>
        </div>
      </div>

      {/* Row 3: 3-Column Bento Analytics (Spend Breakdown | Delivery Quality Gauge | Project Status & Activity) */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Spend by Task Type')}
          subtitle={t('This month')}
          action={
            <span className="font-mono text-sm font-semibold text-ink tabular-nums">
              {money(totalSpend, locale)}
            </span>
          }
        >
          <SegmentedBreakdownBar items={breakdownItems} />
        </BentoCard>

        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Delivery Quality')}
          subtitle={t('QA-reviewed accuracy')}
        >
          <div className="my-2">
            <CustomSemiCircleGauge value={quality.score} label={t('QA Pass Rate')} />
          </div>
          <KeyValueList
            rows={[
              { label: t('Items QA-reviewed'), value: quality.reviews.toLocaleString(locale) },
              { label: t('Re-work required'), value: '1.9%' },
              { label: t('Avg. review time'), value: t('6h 12m') },
            ]}
          />
        </BentoCard>

        <BentoCard
          className="lg:col-span-4"
          title={t('Recent Activity')}
          subtitle={t('Deliveries, team and billing events')}
          action={
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-ink no-underline hover:underline"
            >
              <span>{t('View All Projects')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          }
        >
          {/* Compact Stage Pill Strip */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-canvas px-3 py-2">
              <div className="text-base font-semibold text-ink tabular-nums">{counts.inProgress}</div>
              <div className="text-[11px] text-ink-muted">{t('In Progress')}</div>
            </div>
            <div className="rounded-xl bg-canvas px-3 py-2">
              <div className="text-base font-semibold text-ink tabular-nums">{counts.review}</div>
              <div className="text-[11px] text-ink-muted">{t('In Review')}</div>
            </div>
            <div className="rounded-xl bg-canvas px-3 py-2">
              <div className="text-base font-semibold text-ink tabular-nums">{counts.completed}</div>
              <div className="text-[11px] text-ink-muted">{t('Completed')}</div>
            </div>
          </div>

          <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
            {activity.map((item) => (
              <li key={`${item.title}-${item.time}`} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    iconTileToneClass(item.tone),
                  )}
                >
                  <DashboardLucideIcon icon={item.icon} className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[13px] font-medium text-ink">{t(item.title)}</p>
                  <p className="mt-0.5 mb-0 truncate text-xs text-ink-muted">{t(item.meta)}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink-muted tabular-nums">{t(item.time)}</span>
              </li>
            ))}
          </ul>
        </BentoCard>
      </div>

      {/* Row 4: Full-width Filterable Recent Projects Table */}
      <BentoCard
        id="projects"
        className="mt-5"
        title={t('Recent Projects')}
        subtitle={t('Annotation jobs posted by your team')}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t('Search projects...')}
              size="sm"
              containerClassName="w-48 sm:w-56"
            />
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              size="sm"
              ariaLabel={t('Filter by status')}
              containerClassName="w-40"
            />
          </div>
        }
      >
        {filteredProjects.length === 0 ? (
          <EmptyState
            title={t('No matching projects.')}
            description={t('Try clearing your search or status filter to see all workspace projects.')}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
              >
                {t('Reset')}
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line-subtle">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                  <th className="px-4 py-3 font-medium">{t('Project')}</th>
                  <th className="px-4 py-3 font-medium">{t('Type')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Items')}</th>
                  <th className="px-4 py-3 font-medium">{t('Progress')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Spend')}</th>
                  <th className="px-4 py-3 font-medium">{t('Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle bg-surface">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-canvas/60">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            iconTileToneClass(project.tone),
                          )}
                        >
                          <DashboardLucideIcon icon={project.icon} className="h-4 w-4" strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/projects?id=${project.id}`}
                            className="block truncate font-medium text-ink no-underline hover:text-teal-ink"
                          >
                            {project.name}
                          </Link>
                          <span className="font-mono text-xs text-ink-muted tabular-nums">{project.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={toBadgeTone(project.tone)}>{t(project.typeLabel)}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-medium text-ink tabular-nums">
                      {project.items.toLocaleString(locale)}
                    </td>
                    <td className="w-44 px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <CustomProgressBar value={project.delivered} height="sm" className="flex-1" />
                        <span className="w-9 text-right font-mono text-xs text-ink-secondary tabular-nums">
                          {project.delivered}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                      {money(project.spend, locale)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={toBadgeTone(project.statusTone)} dot>
                        {t(project.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>
    </DashboardCanvas>
  );
};

export default DashboardArea;
