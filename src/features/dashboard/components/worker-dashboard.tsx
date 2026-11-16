import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  Clock,
  GraduationCap,
  Landmark,
  Layers,
  LifeBuoy,
  Search,
  Star,
  Wallet,
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
  SegmentedControl,
  cn,
} from '@/components/ui';
import type { BarChartDatum, SegmentedOption, SelectOption } from '@/components/ui';
import { useT } from '@/i18n';
import {
  getNextPayout,
  getWorkerEarnings,
  getWorkerPayouts,
  getWorkerProfile,
  getWorkerQualifications,
  getWorkerStats,
  getWorkerTasks,
} from '../data/worker-dashboard';
import {
  BentoCard,
  DashboardCanvas,
  DashboardPageHeader,
  KeyValueList,
  QuickActionGrid,
  StackedMetric,
} from './bento-primitives';
import { DashboardLucideIcon, iconTileToneClass, toBadgeTone } from './dashboard-icons';

type EarningsRange = '4w' | '8w';

const MONTHLY_GOAL_USD = 2500;

function money(value: number, locale: string): string {
  return `$${value.toLocaleString(locale)}`;
}

/**
 * Community / Contributor Dashboard (/dashboard?as=community) in the ACRU Bento structure.
 */
const ContributorArea = () => {
  const { t, locale } = useT();
  const [range, setRange] = useState<EarningsRange>('8w');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const profile = useMemo(() => getWorkerProfile(), []);
  const stats = useMemo(() => getWorkerStats(), []);
  const earnings = useMemo(() => getWorkerEarnings(), []);
  const nextPayout = useMemo(() => getNextPayout(), []);
  const tasks = useMemo(() => getWorkerTasks(), []);
  const payouts = useMemo(() => getWorkerPayouts(), []);
  const qualifications = useMemo(() => getWorkerQualifications(), []);

  const visibleWeeks = useMemo(
    () => (range === '4w' ? earnings.weeks.slice(-4) : earnings.weeks),
    [range, earnings.weeks],
  );

  const visibleTotal = useMemo(() => {
    if (range === '8w') return earnings.total;
    const sum = visibleWeeks.reduce((acc, w) => acc + w.value, 0);
    return money(sum, locale);
  }, [earnings.total, locale, range, visibleWeeks]);

  const chartData: BarChartDatum[] = useMemo(
    () =>
      visibleWeeks.map((w) => ({
        label: w.label,
        title: w.label,
        value: w.value,
      })),
    [visibleWeeks],
  );

  const rangeOptions: SegmentedOption<EarningsRange>[] = useMemo(
    () => [
      { value: '4w', label: t('4w') },
      { value: '8w', label: t('8w') },
    ],
    [t],
  );

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: t('All statuses') },
      { value: 'In Progress', label: t('In Progress') },
      { value: 'In Review', label: t('In Review') },
      { value: 'Approved', label: t('Approved') },
    ],
    [t],
  );

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesQuery =
        !q || task.name.toLowerCase().includes(q) || task.typeLabel.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [tasks, search, statusFilter]);

  const goalPct = Math.min(100, Math.round((nextPayout.amount / MONTHLY_GOAL_USD) * 100));
  const accuracyPct = Number(stats.find((s) => s.id === 'accuracy')?.value ?? 98.4);

  return (
    <DashboardCanvas>
      <DashboardPageHeader
        title={t('Community Dashboard')}
        subtitle={t('Your earnings, active tasks and qualifications in one place.')}
        actions={
          <>
            <Button
              href="/task-reward?task=road-damage-annotation"
              variant="secondary"
              size="sm"
              leftIcon={<Wallet className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Rewards & Payouts')}
            </Button>
            <Button
              href="/dashboard/tasks"
              variant="primary"
              size="sm"
              leftIcon={<Search className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('Find Tasks')}
            </Button>
          </>
        }
      />

      {/* Row 1: Earnings Chart + Next Payout Object Card */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard
          className="xl:col-span-8"
          title={t('Earnings')}
          subtitle={range === '4w' ? t('Last 4 weeks') : t(earnings.caption)}
          action={
            <SegmentedControl<EarningsRange>
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
                  <span className="text-xs font-medium text-ink-muted">{t('paid to date')}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                  <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                  <span>{t('Weekly payouts')}</span>
                </span>
              </div>

              <CustomBarChart
                data={chartData}
                series={[{ key: 'earnings', label: t('Earnings'), color: '#05DAC3' }]}
                height={230}
                formatValue={(v) => money(v, locale)}
              />
            </div>

            <div className="flex flex-col justify-between gap-5 border-t border-line-subtle pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <StackedMetric
                label={t('Earnings This Month')}
                value={money(nextPayout.amount, locale)}
                delta={8.2}
                good
                helper={t('vs. last month')}
              />
              <StackedMetric
                label={t('Tasks Completed')}
                value={132}
                delta={6}
                good
                helper={t('this month')}
              />
              <StackedMetric
                label={t('Active Streak')}
                value={t('18 days')}
                delta={2}
                good
                helper={t('personal best: 24 days')}
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="xl:col-span-4 justify-between"
          title={t('Next payout')}
          subtitle={nextPayout.method}
          action={
            <Badge tone="mint" dot>
              {t(profile.qualification)}
            </Badge>
          }
        >
          {/* Styled Navy Payout Object Card */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-navy p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[11px] font-medium text-white/60">{t('Pending payout')}</p>
                <p className="mt-1 mb-0 text-[26px] font-semibold tracking-tight tabular-nums leading-none">
                  {money(nextPayout.amount, locale)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-teal">
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                {nextPayout.date}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 text-xs text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-teal" strokeWidth={1.6} />
                {nextPayout.method}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star className="h-3.5 w-3.5 text-teal" strokeWidth={1.75} />
                {profile.rating} ({profile.reviews})
              </span>
            </div>

            <p className="mt-4 mb-0 border-t border-white/10 pt-3 text-[11px] text-white/70">
              {t(nextPayout.note)}
            </p>
          </div>

          <div className="mt-4">
            <QuickActionGrid
              items={[
                {
                  label: t('Find Tasks'),
                  href: '/dashboard/tasks',
                  icon: <Search className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Studio'),
                  href: '/task-studio?task=road-damage-annotation',
                  icon: <Layers className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Rewards'),
                  href: '/task-reward?task=road-damage-annotation',
                  icon: <Wallet className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Qualify'),
                  href: '/task-qualification?task=conversation-transcription',
                  icon: <GraduationCap className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Support'),
                  href: '/dashboard/support',
                  icon: <LifeBuoy className="h-4 w-4" strokeWidth={1.6} />,
                },
              ]}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-subtle pt-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {profile.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-ink">{profile.name}</div>
                <div className="truncate text-[11px] text-ink-muted">{t(profile.level)}</div>
              </div>
            </div>
            <Link
              href="/task-reward?task=road-damage-annotation"
              className="shrink-0 text-xs font-medium text-teal-ink no-underline hover:underline"
            >
              {t('All Payouts')}
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Row 2: Monthly Target + Qualification Guidance */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-6 justify-center"
          title={t('Monthly earning target')}
          subtitle={t('Scheduled auto-withdraw every end of month')}
          action={<Badge tone="neutral">{goalPct}%</Badge>}
        >
          <CustomProgressBar
            value={goalPct}
            tone="teal"
            leftLabel={money(nextPayout.amount, locale)}
            rightLabel={money(MONTHLY_GOAL_USD, locale)}
          />
        </BentoCard>

        <div className="lg:col-span-6 flex flex-col justify-between gap-4 rounded-2xl border border-teal-ink/15 bg-tint-mint p-5 sm:p-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-teal-ink border border-teal-ink/20">
              <Award className="h-3 w-3" strokeWidth={1.75} />
              {t('Higher-tier batches')}
            </span>
            <h3 className="mt-2 mb-0 text-[15px] font-semibold text-ink leading-snug">
              {t('Unlock speech & LLM evaluation task queues')}
            </h3>
            <p className="mt-1 mb-0 text-xs text-ink-secondary leading-relaxed">
              {t('Complete Audio Transcription qualification to unlock higher item rates.')}
            </p>
          </div>
          <Button
            href="/task-qualification?task=conversation-transcription"
            variant="primary"
            size="sm"
            className="shrink-0"
            rightIcon={<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />}
          >
            {t('Take a Qualification Test')}
          </Button>
        </div>
      </div>

      {/* Row 3: Qualifications | Accuracy Score Gauge | Payout History */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Qualifications')}
          subtitle={t('Task types you are cleared to work on')}
        >
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {qualifications.map((qual) => (
              <li key={qual.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-2 font-medium text-ink">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md',
                        iconTileToneClass(qual.tone),
                      )}
                    >
                      <DashboardLucideIcon icon={qual.icon} className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </span>
                    {t(qual.label)}
                  </span>
                  <Badge tone={toBadgeTone(qual.statusTone)}>{t(qual.status)}</Badge>
                </div>
                <CustomProgressBar
                  value={qual.score}
                  tone={qual.score >= 85 ? 'teal' : 'amber'}
                  height="sm"
                  rightLabel={t('qualification score {score}%', { score: qual.score })}
                />
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-line-subtle">
            <Button
              href="/task-qualification?task=conversation-transcription"
              variant="secondary"
              size="sm"
              block
              leftIcon={<GraduationCap className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Take a Qualification Test')}
            </Button>
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Contributor Profile')}
          subtitle={t('Visible to companies you work with')}
        >
          <div className="my-2">
            <CustomSemiCircleGauge value={accuracyPct} label={t('Accuracy Score')} />
          </div>
          <KeyValueList
            rows={[
              { label: t('Rating'), value: `${profile.rating} / 5.0 (${profile.reviews})` },
              { label: t('Level'), value: t(profile.level) },
              { label: t('Member since'), value: profile.joined },
              { label: t('Status'), value: <Badge tone="mint">{t(profile.qualification)}</Badge> },
            ]}
          />
        </BentoCard>

        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Payout History')}
          subtitle={t('Monthly auto-withdrawals')}
        >
          <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
            {payouts.map((payout) => (
              <li key={payout.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                    <span className="font-mono text-xs">{payout.id}</span>
                    <span className="text-ink-muted">· {payout.date}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-muted">{payout.method}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {money(payout.amount, locale)}
                  </span>
                  <Badge tone={toBadgeTone(payout.statusTone)}>{t(payout.status)}</Badge>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-line-subtle">
            <Button
              href="/task-reward?task=road-damage-annotation"
              variant="secondary"
              size="sm"
              block
              leftIcon={<Landmark className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('All Payouts')}
            </Button>
          </div>
        </BentoCard>
      </div>

      {/* Row 4: Full-width My Active Tasks Table */}
      <BentoCard
        className="mt-5"
        title={t('My Active Tasks')}
        subtitle={t('Jobs assigned to you from the marketplace')}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t('Search tasks')}
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
        {filteredTasks.length === 0 ? (
          <EmptyState
            title={t('No matching tasks.')}
            description={t('Try clearing your filters or browse open tasks in the marketplace.')}
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
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                  <th className="px-4 py-3 font-medium">{t('Task')}</th>
                  <th className="px-4 py-3 font-medium">{t('Progress')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Reward')}</th>
                  <th className="px-4 py-3 font-medium">{t('Status')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle bg-surface">
                {filteredTasks.map((task) => (
                  <tr key={task.name} className="transition-colors hover:bg-canvas/60">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            iconTileToneClass(task.tone),
                          )}
                        >
                          <DashboardLucideIcon icon={task.icon} className="h-4 w-4" strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">{task.name}</div>
                          <div className="text-xs text-ink-muted">{t(task.typeLabel)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="w-48 px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <CustomProgressBar value={task.progress} height="sm" className="flex-1" />
                        <span className="w-9 text-right font-mono text-xs text-ink-secondary tabular-nums">
                          {task.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                      {money(task.reward, locale)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={toBadgeTone(task.statusTone)} dot>
                        {t(task.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        href={`/task-studio?task=${task.slug}`}
                        variant="secondary"
                        size="sm"
                        rightIcon={<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />}
                      >
                        {t('Open Studio')}
                      </Button>
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

export default ContributorArea;
