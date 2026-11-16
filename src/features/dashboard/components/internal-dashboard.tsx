import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Database,
  FileText,
  FlaskConical,
  FolderKanban,
  ListChecks,
  Receipt,
  ShieldCheck,
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
  SegmentedBreakdownBar,
  SegmentedControl,
} from '@/components/ui';
import type { BarChartDatum, BreakdownItem, SegmentedOption, SelectOption } from '@/components/ui';
import { REQUEST_ACTIONS, getCompanyOrders, selectPostedProjects } from '@/features/projects';
import { useT } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import {
  BentoCard,
  DashboardCanvas,
  DashboardPageHeader,
  KeyValueList,
  QuickActionGrid,
  StackedMetric,
} from './bento-primitives';
import { toBadgeTone } from './dashboard-icons';

type OpsRange = '4w' | '6w';

interface QueueRow {
  id: string;
  name: string;
  type: string;
  company: string;
  budget: string;
  status: string;
  statusTone: string;
  statusKey: string | null;
  action: { to: string; label: string } | null | undefined;
}

interface PostedRequest {
  id: string;
  name: string;
  typeLabel: string;
  company?: { name?: string } | null;
  budgetRange?: string | null;
  status: string;
  statusTone: string;
  statusKey: string;
}

const WEEKLY_OPS_DATA: ReadonlyArray<BarChartDatum> = [
  { label: 'W34', title: 'W34', segments: { settled: 2100, escrow: 1600 } },
  { label: 'W35', title: 'W35', segments: { settled: 2450, escrow: 1950 } },
  { label: 'W36', title: 'W36', segments: { settled: 2300, escrow: 2200 } },
  { label: 'W37', title: 'W37', segments: { settled: 2800, escrow: 2450 } },
  { label: 'W38', title: 'W38', segments: { settled: 3150, escrow: 2700 } },
  { label: 'W39', title: 'W39', segments: { settled: 3420, escrow: 3100 } },
];

const zenvinusActionFor = (statusKey: string): QueueRow['action'] =>
  Object.entries(REQUEST_ACTIONS).find(([key]) => key === statusKey)?.[1]?.zenvinus;

/**
 * Internal Operations Dashboard (/dashboard?as=internal) structured in the ACRU Bento layout.
 */
const InternalArea = () => {
  const { t, locale } = useT();
  const posted: PostedRequest[] = useAppSelector(selectPostedProjects);
  const [range, setRange] = useState<OpsRange>('6w');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const orders = useMemo(() => getCompanyOrders(), []);

  const queue: QueueRow[] = useMemo(
    () => [
      ...posted.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.typeLabel,
        company: r.company?.name || '—',
        budget: r.budgetRange || 'TBD',
        status: r.status,
        statusTone: r.statusTone,
        statusKey: r.statusKey,
        action: zenvinusActionFor(r.statusKey),
      })),
      ...orders.map((o) => ({
        id: o.id,
        name: o.title,
        type: o.type,
        company: 'Sample order',
        budget: `$${o.amount.toLocaleString(locale)}`,
        status: o.status,
        statusTone: o.statusTone,
        statusKey: null,
        action: null,
      })),
    ],
    [locale, orders, posted],
  );

  const queueCount = useMemo(
    () => queue.filter((q) => q.statusKey === 'pending' || q.statusKey === 'in_review').length,
    [queue],
  );
  const activeCount = useMemo(
    () => queue.filter((q) => q.statusKey === 'in_progress' || q.status === 'In Progress').length,
    [queue],
  );

  const chartData = useMemo(
    () => (range === '4w' ? WEEKLY_OPS_DATA.slice(-4) : WEEKLY_OPS_DATA),
    [range],
  );

  const rangeOptions: SegmentedOption<OpsRange>[] = useMemo(
    () => [
      { value: '4w', label: t('4w') },
      { value: '6w', label: t('6w') },
    ],
    [t],
  );

  const stageOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: t('All statuses') },
      { value: 'review', label: t('Needs review') },
      { value: 'active', label: t('Active & Delivered') },
    ],
    [t],
  );

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queue.filter((item) => {
      const needsReview = Boolean(item.action) || item.statusKey === 'pending' || item.statusKey === 'in_review';
      const matchesStage =
        stageFilter === 'all' ||
        (stageFilter === 'review' && needsReview) ||
        (stageFilter === 'active' && !needsReview);
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
  }, [queue, search, stageFilter]);

  const workforceBreakdown: BreakdownItem[] = useMemo(
    () => [
      { id: 'community', label: t('Community annotators'), percent: 73, color: '#05DAC3' },
      { id: 'verified', label: t('Verified contributors'), percent: 17, color: '#0D9488' },
      { id: 'expert', label: t('Expert reviewers'), percent: 10, color: '#020626' },
    ],
    [t],
  );

  return (
    <DashboardCanvas>
      <DashboardPageHeader
        title={t('Internal Dashboard')}
        subtitle={t(
          'Operations workspace — proposal queue, project & task management, workforce, quality control and finance.',
        )}
        actions={
          <>
            <Button
              href="/dashboard/billing"
              variant="secondary"
              size="sm"
              leftIcon={<Receipt className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Invoices')}
            </Button>
            <Button
              href="/lab"
              variant="primary"
              size="sm"
              leftIcon={<FlaskConical className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('AI Research Lab')}
            </Button>
          </>
        }
      />

      {/* Row 1: Operations Revenue & Escrow Throughput + Escrow Card */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard
          className="xl:col-span-8"
          title={t('Revenue MTD')}
          subtitle={t('escrow + settled')}
          action={
            <SegmentedControl<OpsRange>
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
                    $18.4K
                  </span>
                  <span className="text-xs font-medium text-ink-muted">{t('escrow + settled')}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-ink-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                    <span>{t('Settled')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-navy" aria-hidden="true" />
                    <span>{t('Active escrow')}</span>
                  </span>
                </div>
              </div>

              <CustomBarChart
                data={chartData}
                series={[
                  { key: 'settled', label: t('Settled'), color: '#05DAC3' },
                  { key: 'escrow', label: t('Active escrow'), color: '#020626' },
                ]}
                height={230}
                formatValue={(v) => `$${v.toLocaleString(locale)}`}
              />
            </div>

            <div className="flex flex-col justify-between gap-5 border-t border-line-subtle pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <StackedMetric
                label={t('Proposal Queue')}
                value={queueCount}
                helper={t('awaiting internal review')}
              />
              <StackedMetric
                label={t('Active Projects')}
                value={activeCount}
                helper={t('being worked on')}
              />
              <StackedMetric
                label={t('Active Workforce')}
                value={52}
                delta={7.4}
                good
                helper={t('community + expert')}
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="xl:col-span-4 justify-between"
          title={t('Finance')}
          subtitle={t('Escrow & payout')}
          action={<Badge tone="mint" dot>{t('Internal')}</Badge>}
        >
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-navy p-5 text-white">
            <p className="m-0 text-[11px] font-medium text-white/60">{t('Active escrow')}</p>
            <p className="mt-1 mb-0 text-[26px] font-semibold tracking-tight tabular-nums leading-none">
              ${(22800).toLocaleString(locale)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-3.5 text-xs">
              <div>
                <p className="m-0 text-[11px] text-white/60">{t('Awaiting down payment')}</p>
                <p className="mt-0.5 mb-0 font-semibold text-white">{t('{count} requests', { count: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="m-0 text-[11px] text-white/60">{t('Community payouts this month')}</p>
                <p className="mt-0.5 mb-0 font-mono font-semibold text-teal tabular-nums">
                  ${(6940).toLocaleString(locale)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <QuickActionGrid
              items={[
                {
                  label: t('AI Lab'),
                  href: '/lab',
                  icon: <FlaskConical className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Studio'),
                  href: '/dashboard/studio',
                  icon: <Database className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Projects'),
                  href: '/dashboard/projects',
                  icon: <FolderKanban className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Tasks'),
                  href: '/dashboard/tasks',
                  icon: <ListChecks className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Invoices'),
                  href: '/dashboard/billing',
                  icon: <FileText className="h-4 w-4" strokeWidth={1.6} />,
                },
              ]}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-line-subtle pt-4 text-xs">
            <span className="text-ink-secondary">{t('Escalated disputes')}: <strong className="text-ink">2</strong></span>
            <Link
              href="/dashboard?as=expert"
              className="inline-flex items-center gap-1 font-medium text-teal-ink no-underline hover:underline"
            >
              <span>{t('Expert Review Queue')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Row 2: Workforce Breakdown | Quality Control SLA Gauge | Escrow & Payout Summary */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Workforce')}
          subtitle={t('Community vs Expert assignment')}
          action={<Badge tone="neutral" mono>52</Badge>}
        >
          <SegmentedBreakdownBar items={workforceBreakdown} />
          <div className="mt-4 pt-3 border-t border-line-subtle">
            <Button
              href="/dashboard/tasks"
              variant="secondary"
              size="sm"
              block
              leftIcon={<ListChecks className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Task Management')}
            </Button>
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Quality Control')}
          subtitle={t('Audit & dispute handling')}
        >
          <div className="my-2">
            <CustomSemiCircleGauge value={97.4} label={t('Avg. pass rate')} />
          </div>
          <KeyValueList
            rows={[
              { label: t('Open disputes'), value: 2 },
              { label: t('Gold-standard sets'), value: 11 },
            ]}
          />
          <div className="mt-4 pt-3 border-t border-line-subtle">
            <Button
              href="/dashboard?as=expert"
              variant="secondary"
              size="sm"
              block
              leftIcon={<ShieldCheck className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Expert Review Queue')}
            </Button>
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-4 justify-between"
          title={t('Settlement cadence')}
          subtitle={t('Monthly escrow clearance vs payout')}
        >
          <div className="flex flex-col gap-4">
            <CustomProgressBar
              value={76}
              tone="teal"
              leftLabel={t('Settled MTD')}
              rightLabel={`$${(18400).toLocaleString(locale)}`}
            />
            <KeyValueList
              rows={[
                { label: t('Active escrow'), value: `$${(22800).toLocaleString(locale)}` },
                { label: t('Awaiting down payment'), value: t('{count} requests', { count: 2 }) },
                { label: t('Community payouts this month'), value: `$${(6940).toLocaleString(locale)}` },
              ]}
            />
          </div>
          <div className="mt-4 pt-3 border-t border-line-subtle">
            <Button
              href="/dashboard/billing"
              variant="secondary"
              size="sm"
              block
              leftIcon={<Wallet className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Invoices')}
            </Button>
          </div>
        </BentoCard>
      </div>

      {/* Row 3: Full-width Proposal Queue & Project Management Table */}
      <BentoCard
        className="mt-5"
        title={t('Proposal Queue & Project Management')}
        subtitle={t('Review enterprise proposals, manage projects and workforce assignments')}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t('Search projects')}
              size="sm"
              containerClassName="w-48 sm:w-56"
            />
            <CustomSelect
              value={stageFilter}
              onChange={setStageFilter}
              options={stageOptions}
              size="sm"
              ariaLabel={t('Filter by stage')}
              containerClassName="w-44"
            />
          </div>
        }
      >
        {filteredQueue.length === 0 ? (
          <EmptyState
            title={t('No matching requests.')}
            description={t('Try adjusting your search query or stage filter.')}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStageFilter('all');
                }}
              >
                {t('Reset')}
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line-subtle">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                  <th className="px-4 py-3 font-medium">{t('Request / Project')}</th>
                  <th className="px-4 py-3 font-medium">{t('Company')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Budget')}</th>
                  <th className="px-4 py-3 font-medium">{t('Status')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle bg-surface">
                {filteredQueue.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-canvas/60">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-ink">{row.name}</div>
                      <div className="mt-0.5 font-mono text-xs text-ink-muted">
                        {row.id} · {t(row.type)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-ink-secondary">{t(row.company)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                      {t(row.budget)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={toBadgeTone(row.statusTone)} dot>
                        {t(row.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        href={`/lab?id=${row.id}`}
                        variant={row.action ? 'primary' : 'secondary'}
                        size="sm"
                        rightIcon={<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />}
                      >
                        {row.action ? t('Review') : t('Open')}
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

export default InternalArea;
