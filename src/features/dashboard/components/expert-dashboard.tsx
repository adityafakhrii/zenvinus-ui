import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronDown,
  ClipboardCheck,
  History,
  Layers,
  LifeBuoy,
  Lock,
  ShieldAlert,
  UserCheck,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  Button,
  CustomBarChart,
  CustomRadioGroup,
  CustomSelect,
  CustomSemiCircleGauge,
  EmptyState,
  Modal,
  SearchInput,
  SegmentedBreakdownBar,
  Textarea,
  ToastViewport,
  cn,
} from '@/components/ui';
import type { BarChartDatum, BreakdownItem, RadioOption, SelectOption, ToastItem } from '@/components/ui';
import {
  CURRENT_REVIEWER,
  REVIEW_ACTIONS,
  reviewSubmission,
  selectExpertLedger,
  selectExpertMetrics,
  selectReviewQueue,
} from '@/features/tasks';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Tone } from '../types/dashboard';
import {
  BentoCard,
  DashboardCanvas,
  DashboardPageHeader,
  QuickActionGrid,
  StackedMetric,
} from './bento-primitives';
import { toBadgeTone } from './dashboard-icons';

interface ReviewQueueRow {
  id: string;
  slug: string;
  task: string;
  taskType: string;
  note: string;
  contributor: string;
  items: number;
  status: string;
  tone?: string;
  own?: boolean;
  reviewedAt?: string;
  ledger?: { status: string; amount: number; note: string } | null;
  decision?: { action: string; reviewerName: string; rubric: string; at: string } | null;
  history?: Array<{ action: string; at: string }>;
}

const STATUS_TONE: Readonly<Record<string, Tone>> = {
  'PENDING REVIEW': 'amber',
  'IN REVIEW': 'blue',
  'REVISION REQUIRED': 'orange',
  ESCALATED: 'purple',
  APPROVED: 'mint',
  REJECTED: 'red',
};

const ACTIVE_STATUSES: ReadonlyArray<string> = ['PENDING REVIEW', 'IN REVIEW', 'ESCALATED'];
const DONE_STATUSES: ReadonlyArray<string> = ['APPROVED', 'REJECTED'];

const DAILY_REVIEWS: ReadonlyArray<BarChartDatum> = [
  { label: 'Mon', title: 'Mon', value: 14 },
  { label: 'Tue', title: 'Tue', value: 19 },
  { label: 'Wed', title: 'Wed', value: 16 },
  { label: 'Thu', title: 'Thu', value: 23 },
  { label: 'Fri', title: 'Fri', value: 27 },
  { label: 'Sat', title: 'Sat', value: 18 },
  { label: 'Sun', title: 'Sun', value: 15 },
];

/**
 * Expert Reviewer Dashboard (/dashboard?as=expert) with calibration gauge & interactive decision modal.
 */
const ExpertArea = () => {
  const { t, locale } = useT();
  const dispatch = useAppDispatch();
  const queue: ReviewQueueRow[] = useAppSelector(selectReviewQueue);
  const metrics = useAppSelector(selectExpertMetrics);
  const ledger = useAppSelector(selectExpertLedger);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [decisionTarget, setDecisionTarget] = useState<ReviewQueueRow | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('approved');
  const [feedback, setFeedback] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toastTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, tone: 'success' }]);
      const timer = window.setTimeout(() => dismissToast(id), 4000);
      toastTimersRef.current.push(timer);
    },
    [dismissToast],
  );

  const awaitingCount = useMemo(
    () => queue.filter((r) => !r.own && ACTIVE_STATUSES.includes(r.status)).length,
    [queue],
  );

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: t('All statuses') },
      { value: 'PENDING REVIEW', label: t('PENDING REVIEW') },
      { value: 'IN REVIEW', label: t('IN REVIEW') },
      { value: 'REVISION REQUIRED', label: t('REVISION REQUIRED') },
      { value: 'ESCALATED', label: t('ESCALATED') },
      { value: 'APPROVED', label: t('APPROVED') },
      { value: 'REJECTED', label: t('REJECTED') },
    ],
    [t],
  );

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queue.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesQuery =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.task.toLowerCase().includes(q) ||
        row.contributor.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [queue, search, statusFilter]);

  const queueBreakdown: BreakdownItem[] = useMemo(() => {
    const total = Math.max(1, queue.length);
    const active = queue.filter((r) => r.status === 'PENDING REVIEW' || r.status === 'IN REVIEW').length;
    const revision = queue.filter((r) => r.status === 'REVISION REQUIRED').length;
    const escalated = queue.filter((r) => r.status === 'ESCALATED').length;
    const done = queue.filter((r) => DONE_STATUSES.includes(r.status)).length;
    return [
      { id: 'active', label: t('Awaiting Review'), percent: Math.round((active / total) * 100), color: '#05DAC3' },
      { id: 'revision', label: t('REVISION REQUIRED'), percent: Math.round((revision / total) * 100), color: '#F59E0B' },
      { id: 'escalated', label: t('ESCALATED'), percent: Math.round((escalated / total) * 100), color: '#6D28D9' },
      { id: 'done', label: t('Completed'), percent: Math.round((done / total) * 100), color: '#0D9488' },
    ];
  }, [queue, t]);

  const decisionOptions: RadioOption[] = useMemo(
    () =>
      REVIEW_ACTIONS.map((action) => ({
        value: action.key,
        label: (
          <span className="inline-flex items-center gap-2">
            <span>{t(action.label)}</span>
            <Badge tone={toBadgeTone(action.tone)}>{t(action.to)}</Badge>
          </span>
        ),
      })),
    [t],
  );

  const openDecisionModal = (row: ReviewQueueRow) => {
    setDecisionTarget(row);
    setSelectedAction('approved');
    setFeedback('');
  };

  const submitDecision = () => {
    if (!decisionTarget) return;
    const chosen = REVIEW_ACTIONS.find((a) => a.key === selectedAction);
    dispatch(reviewSubmission(decisionTarget.id, selectedAction, feedback));
    const title = decisionTarget.id;
    setDecisionTarget(null);
    pushToast(title, chosen ? t(chosen.to) : undefined);
  };

  return (
    <DashboardCanvas>
      <DashboardPageHeader
        title={t('Expert Dashboard')}
        subtitle={t('Review workspace — approve, request revision, reject, or escalate community submissions.')}
        actions={
          <>
            <Button
              href="/dashboard?as=internal"
              variant="secondary"
              size="sm"
              leftIcon={<ShieldAlert className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Escalate to Internal QA')}
            </Button>
            <Button
              href="/task-studio?task=road-damage-annotation"
              variant="primary"
              size="sm"
              leftIcon={<ClipboardCheck className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('Review in Studio')}
            </Button>
          </>
        }
      />

      {/* Row 1: Daily Reviews Completed Chart + Reviewer Calibration Card */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard
          className="xl:col-span-8"
          title={t('Daily Reviews Completed')}
          subtitle={t('Your review cadence over the past 7 days')}
          action={<Badge tone="blue" mono>{metrics.reviewed} {t('submissions')}</Badge>}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_210px]">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-[30px] font-semibold tracking-tight text-ink tabular-nums leading-none">
                    {metrics.reviewed}
                  </span>
                  <span className="text-xs font-medium text-ink-muted">{t('submissions')}</span>
                </div>
                <span className="text-xs text-ink-secondary">
                  {t('Avg. review time')}: <strong className="text-ink">{t(metrics.avgTime)}</strong>
                </span>
              </div>

              <CustomBarChart
                data={DAILY_REVIEWS}
                series={[{ key: 'reviews', label: t('Reviewed'), color: '#05DAC3' }]}
                height={230}
                formatValue={(v) => `${v} ${t('items')}`}
              />
            </div>

            <div className="flex flex-col justify-between gap-5 border-t border-line-subtle pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <StackedMetric
                label={t('Assigned Reviews')}
                value={metrics.assigned}
                helper={t('matching your expertise')}
              />
              <StackedMetric
                label={t('Awaiting Action')}
                value={awaitingCount}
                helper={t('active queue')}
              />
              <StackedMetric
                label={t('Expert Earnings')}
                value={`$${ledger.thisMonth.toLocaleString(locale)}`}
                delta={9.4}
                good
                helper={t('this month')}
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="xl:col-span-4 justify-between"
          title={t('Reviewer calibration')}
          subtitle={CURRENT_REVIEWER.name}
          action={<Badge tone="mint" dot>{t('Verified')}</Badge>}
        >
          <div className="my-1">
            <CustomSemiCircleGauge value={metrics.agreement} label={t('Agreement Score')} />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2.5 rounded-xl bg-canvas p-3 text-center">
            <div>
              <div className="text-sm font-semibold text-ink tabular-nums">{metrics.goldStandards}</div>
              <div className="text-[11px] text-ink-muted">{t('Gold standards created')}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-ink tabular-nums">{t(metrics.avgTime)}</div>
              <div className="text-[11px] text-ink-muted">{t('Avg. review time')}</div>
            </div>
          </div>

          <div className="mt-4">
            <QuickActionGrid
              items={[
                {
                  label: t('Review Queue'),
                  href: '#review-queue',
                  icon: <ClipboardCheck className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Task Studio'),
                  href: '/task-studio?task=road-damage-annotation',
                  icon: <Layers className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Rewards'),
                  href: '/task-reward?task=road-damage-annotation',
                  icon: <Wallet className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Internal QA'),
                  href: '/dashboard?as=internal',
                  icon: <ShieldAlert className="h-4 w-4" strokeWidth={1.6} />,
                },
                {
                  label: t('Support'),
                  href: '/dashboard/support',
                  icon: <LifeBuoy className="h-4 w-4" strokeWidth={1.6} />,
                },
              ]}
            />
          </div>
        </BentoCard>
      </div>

      {/* Row 2: Reward Ledger | Queue Distribution */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-6 justify-between"
          title={t('Reward Ledger')}
          subtitle={t(ledger.note)}
          action={
            <Link
              href="/task-reward?task=road-damage-annotation"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-ink no-underline hover:underline"
            >
              <span>{t('Rewards & Payouts')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-canvas p-3.5">
              <div className="text-xs text-ink-secondary">{t('Available (ready to withdraw)')}</div>
              <div className="mt-1 font-mono text-lg font-semibold text-ink tabular-nums">
                ${ledger.available.toLocaleString(locale)}
              </div>
            </div>
            <div className="rounded-xl bg-canvas p-3.5">
              <div className="text-xs text-ink-secondary">{t('Pending (awaiting payout cycle)')}</div>
              <div className="mt-1 font-mono text-lg font-semibold text-teal-ink tabular-nums">
                ${(ledger.pending / 100).toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl bg-canvas p-3.5">
              <div className="text-xs text-ink-secondary">{t('Rate per item')}</div>
              <div className="mt-1 font-mono text-lg font-semibold text-ink tabular-nums">
                ${(ledger.perItem / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-6 justify-between"
          title={t('Queue Distribution')}
          subtitle={t('Current submissions grouped by quality status')}
          action={
            <Badge tone="neutral" mono>
              {queue.length}
            </Badge>
          }
        >
          <SegmentedBreakdownBar items={queueBreakdown} />
        </BentoCard>
      </div>

      {/* Row 3: Full-width Interactive Review Queue Table */}
      <BentoCard
        id="review-queue"
        className="mt-5"
        title={t('Review Queue')}
        subtitle={t('Submission status is separate from payout status — APPROVED items enter the reward ledger as PENDING')}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t('Search submissions...')}
              size="sm"
              containerClassName="w-48 sm:w-56"
            />
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              size="sm"
              ariaLabel={t('Filter by review status')}
              containerClassName="w-44"
            />
          </div>
        }
      >
        {filteredQueue.length === 0 ? (
          <EmptyState
            title={t('No matching submissions.')}
            description={t('Try resetting the status filter or search query.')}
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
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                  <th className="px-4 py-3 font-medium">{t('Submission')}</th>
                  <th className="px-4 py-3 font-medium">{t('Contributor')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Items')}</th>
                  <th className="px-4 py-3 font-medium">{t('Review Status')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle bg-surface">
                {filteredQueue.map((row) => {
                  const actionable = !DONE_STATUSES.includes(row.status) && !row.own;
                  const statusTone = STATUS_TONE[row.status] ?? row.tone ?? 'blue';
                  const hasDetails = Boolean(row.ledger || row.decision || (row.history?.length ?? 0) > 0);
                  const isOpen = expanded === row.id;

                  return (
                    <React.Fragment key={row.id}>
                      <tr className={cn('transition-colors hover:bg-canvas/60', isOpen && 'bg-tint-mint/50')}>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-ink">{row.task}</div>
                          <div className="mt-0.5 text-xs text-ink-muted">
                            <span className="font-mono">{row.id}</span> · {t(row.taskType)} · {t(row.note)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-ink-secondary">{row.contributor}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                          {row.items}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={toBadgeTone(statusTone)} dot>
                            {t(row.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            {row.own ? (
                              <span
                                className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2.5 py-1 text-xs font-medium text-ink-muted"
                                title={t('Acceptance rule: you cannot review your own submission')}
                              >
                                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                                {t('Own submission')}
                              </span>
                            ) : actionable ? (
                              <>
                                <Button
                                  href={`/task-studio?task=${row.slug}&review=${row.id}`}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {t('Review in Studio')}
                                </Button>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openDecisionModal(row)}
                                >
                                  {t('Decide')}
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-ink-muted">
                                {t('Reviewed {date}', { date: row.reviewedAt || '' })}
                              </span>
                            )}

                            {hasDetails && (
                              <button
                                type="button"
                                onClick={() => setExpanded(isOpen ? null : row.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-line-subtle bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-canvas hover:text-ink cursor-pointer"
                              >
                                <span>{isOpen ? t('Hide details') : t('Details')}</span>
                                <ChevronDown
                                  className={cn(
                                    'h-3.5 w-3.5 transition-transform duration-150',
                                    isOpen && 'rotate-180',
                                  )}
                                  strokeWidth={1.6}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-canvas/70">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="flex flex-col gap-2 text-xs text-ink-secondary">
                              {row.ledger && (
                                <div className="flex items-start gap-2">
                                  <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-ink" strokeWidth={1.6} />
                                  <span>
                                    <strong className="text-ink">{t('Ledger:')}</strong>{' '}
                                    {t(row.ledger.status)} (${(row.ledger.amount / 100).toFixed(2)}) — {t(row.ledger.note)}
                                  </span>
                                </div>
                              )}
                              {row.decision && (
                                <div className="flex items-start gap-2">
                                  <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-ink" strokeWidth={1.6} />
                                  <span>
                                    <strong className="text-ink">{t('Last decision:')}</strong>{' '}
                                    {t('{action} by {name}', {
                                      action: t(row.decision.action),
                                      name: row.decision.reviewerName,
                                    })}{' '}
                                    · {row.decision.rubric} · {row.decision.at}
                                  </span>
                                </div>
                              )}
                              {(row.history?.length ?? 0) > 0 && (
                                <div className="flex items-start gap-2">
                                  <History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.6} />
                                  <span>
                                    <strong className="text-ink">{t('Decision history:')}</strong>{' '}
                                    {(row.history ?? []).map((h) => `${t(h.action)} (${h.at})`).join(' → ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      {/* Custom Interactive Decision Modal */}
      <Modal
        open={decisionTarget !== null}
        onClose={() => setDecisionTarget(null)}
        title={decisionTarget ? `${t('Submission decision')} · ${decisionTarget.id}` : t('Submission decision')}
        description={
          decisionTarget
            ? `${decisionTarget.task} — ${decisionTarget.contributor} (${decisionTarget.items} ${t('items')})`
            : undefined
        }
        footer={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setDecisionTarget(null)}>
              {t('Cancel')}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={submitDecision}>
              {t('Apply decision')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <CustomRadioGroup
            name="expert-decision"
            label={t('Select decision')}
            value={selectedAction}
            onChange={setSelectedAction}
            variant="card"
            options={decisionOptions}
          />
          <Textarea
            label={t('Feedback / rubric note')}
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('Optional notes on edge cases, rubric criteria, or revision hints...')}
          />
        </div>
      </Modal>

      <ToastViewport items={toasts} onDismiss={dismissToast} />
    </DashboardCanvas>
  );
};

export default ExpertArea;
