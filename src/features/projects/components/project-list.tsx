import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Download,
  FileArchive,
  FlaskConical,
  FolderKanban,
  Handshake,
  Layers,
  Plus,
  RotateCw,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomProgressBar,
  CustomSelect,
  CustomSemiCircleGauge,
  EmptyState,
  SearchInput,
  cn,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { DashboardFooter, DashboardHeader, KpiGrid, type KpiItem } from '@/features/dashboard';
import { POSTED_TASK_STATUS_FLOW } from '@/features/tasks';
import useMounted from '@/hooks/use-mounted';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getCompanyProjects,
  getProjectBatches,
  getProjectById,
  getProjectDeliverables,
  getProjectQa,
  getProjectStatus,
  getProjectTeam,
  getProjectWorkforce,
} from '../data/company-projects';
import { REQUEST_ACTIONS, buildProposal, budgetLabel, formatDate } from '../data/project-store';
import { changeRequestStatus, selectPostedProjects } from '../store/projects-slice';
import type { HistoryEntry, RequestActionSet } from '../types/project';
import { OrdersView } from './order-view';
import { ProjectIcon, badgeToneOf, iconTileClassOf } from './project-icons';

const money = (n: number, locale: string) => `$${n.toLocaleString(locale)}`;
const queryString = (value: string | string[] | undefined): string | null =>
  typeof value === 'string' ? value : null;

const ProjectList = () => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const allProjects = getCompanyProjects(posted);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions: SelectOption[] = useMemo(() => {
    const uniq = Array.from(new Set(allProjects.map((p) => p.status)));
    return [
      { value: 'all', label: t('All statuses') },
      ...uniq.map((st) => ({ value: st, label: t(st) })),
    ];
  }, [allProjects, t]);

  const projects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProjects.filter((p) => {
      const okStatus = statusFilter === 'all' || p.status === statusFilter;
      const okQuery =
        !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [allProjects, search, statusFilter]);

  return (
    <section className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
              {t('Projects')}
            </h1>
            <p className="mt-1 mb-0 text-sm text-ink-secondary">
              {t('All annotation jobs posted by your team — click a project for the full drill-down.')}
            </p>
          </div>
          <Button
            href="/dashboard/new-project"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
          >
            {t('Post New Task')}
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('Search projects')}
            size="sm"
            containerClassName="w-full sm:w-64"
          />
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            size="sm"
            ariaLabel={t('Filter by status')}
            containerClassName="w-full sm:w-48"
          />
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title={t('No matching projects.')}
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
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects?id=${p.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 text-ink no-underline shadow-[0_1px_2px_rgba(2,6,38,0.03)] transition-[border-color,box-shadow] duration-150 hover:border-teal-ink/40 hover:shadow-[0_6px_18px_rgba(2,6,38,0.05)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          iconTileClassOf(p.tone),
                        )}
                      >
                        <ProjectIcon icon={p.icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="m-0 truncate text-base font-semibold text-ink group-hover:text-teal-ink">
                            {t(p.name)}
                          </h2>
                          {p.kind === 'posted' && <Badge tone="mint">{t('NEW')}</Badge>}
                        </div>
                        <span className="font-mono text-xs text-ink-muted">
                          {p.id} · {t(p.typeLabel)}
                        </span>
                      </div>
                    </div>
                    <Badge tone={badgeToneOf(p.statusTone)} dot>
                      {t(p.status)}
                    </Badge>
                  </div>

                  <p className="mt-3 mb-4 text-[13px] leading-relaxed text-ink-secondary">{t(p.desc)}</p>

                  <CustomProgressBar value={p.delivered} tone="teal" height="sm" rightLabel={`${p.delivered}%`} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-4 text-xs text-ink-secondary">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Layers className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      {p.items ? t('{count} items', { count: p.items.toLocaleString(locale) }) : t('Size TBD')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Wallet className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      {budgetLabel(p.budgetRange) || money(p.spend, locale)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-teal-ink">
                    <span>{t('View detail')}</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const StatusCard = ({ id }: { id: string }) => {
  const { t } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const st = getProjectStatus(posted, id);
  const idx = POSTED_TASK_STATUS_FLOW.findIndex((s) => s.key === st.key);

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="m-0 text-base font-semibold text-ink">{t('Status')}</h2>
          <p className="mt-0.5 mb-0 text-xs text-ink-muted">
            {t('Lifecycle stage {current} of {total}', {
              current: idx + 1,
              total: POSTED_TASK_STATUS_FLOW.length,
            })}
          </p>
        </div>
        <Badge tone={idx === POSTED_TASK_STATUS_FLOW.length - 1 ? 'mint' : 'amber'} dot>
          {t(st.label)}
        </Badge>
      </div>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tone-blue-bg text-tone-blue-fg">
          <ProjectIcon icon={st.icon} />
        </span>
        <p className="m-0 text-sm leading-relaxed text-ink-secondary">{t(st.desc)}</p>
      </div>
    </div>
  );
};

const PipelineChildCard = ({ id }: { id: string }) => {
  const { t } = useT();
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
      <div>
        <h2 className="m-0 text-base font-semibold text-ink">{t('Order Pipeline')}</h2>
        <p className="mt-0.5 mb-3 text-xs text-ink-muted">
          {t('8 stages — request, expert review, proposal, milestone payments, delivery')}
        </p>
        <p className="m-0 text-sm text-ink-secondary">
          {t('The order pages are children of this project — each stage has its own page.')}
        </p>
      </div>
      <div className="mt-5">
        <Button
          href={`/dashboard/projects?id=${id}&pipeline=1`}
          variant="secondary"
          size="sm"
          block
          leftIcon={<FolderKanban className="h-4 w-4" strokeWidth={1.5} />}
        >
          {t('Open Pipeline')}
        </Button>
      </div>
    </div>
  );
};

const TeamCard = ({ id, pending }: { id?: string; pending?: boolean }) => {
  const { t } = useT();
  const posted = useAppSelector(selectPostedProjects);

  if (pending || !id) {
    return (
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
        <h2 className="m-0 text-base font-semibold text-ink">{t('Project Team')}</h2>
        <p className="mt-0.5 mb-3 text-xs text-ink-muted">
          {t('Assigned once the internal review is complete')}
        </p>
        <p className="m-0 text-sm text-ink-secondary">
          {t('The Zenvinus PIC, QA reviewer and annotators will appear here once the proposal is approved.')}
        </p>
      </div>
    );
  }

  const team = getProjectTeam(posted, id);
  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
      <div className="mb-4">
        <h2 className="m-0 text-base font-semibold text-ink">{t('Project Team')}</h2>
        <p className="mt-0.5 mb-0 text-xs text-ink-muted">
          {t('{count} people working on this project', { count: team.count })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl bg-canvas p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tone-purple-bg text-xs font-semibold text-tone-purple-fg">
            {team.pic.initials}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-ink-muted">
              {t('Zenvinus PIC')}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-ink">{team.pic.name}</div>
            <div className="truncate text-xs text-ink-secondary">
              {t(team.pic.role)} · {team.pic.email}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-canvas p-4">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              iconTileClassOf(team.reviewer.tone),
            )}
          >
            {team.reviewer.initials}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-ink-muted">
              {t('Reviewer (QA)')}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-ink">{team.reviewer.name}</div>
            <div className="truncate text-xs text-ink-secondary">
              {t(team.reviewer.role)} · {t('double-pass sampling')}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-canvas p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tone-orange-bg text-tone-orange-fg">
            <Users className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-ink-muted">
              {t('Annotators')}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-ink">
              {team.annotators.map((w) => w.name.split(' ')[0]).join(', ')}
            </div>
            <div className="truncate text-xs text-ink-secondary">
              {t('{count} active annotators · accuracy details in Top Workforce', { count: team.count })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NO_ACTIONS: RequestActionSet = { company: [], zenvinus: null, sla: '' };

const PostedProjectDetail = ({ id }: { id: string }) => {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const posted = useAppSelector(selectPostedProjects);
  const found = getProjectById(posted, id);
  const st = getProjectStatus(posted, id);
  const actions = REQUEST_ACTIONS[st.key] || NO_ACTIONS;

  if (!found || found.kind !== 'posted') return null;
  const p = found;
  const act = (to: string, note: string) => dispatch(changeRequestStatus(id, to, note));
  const proposal = ['awaiting_dp', 'in_progress', 'awaiting_full', 'completed'].includes(st.key)
    ? buildProposal(p)
    : null;
  const history: HistoryEntry[] = p.history || [
    { at: p.started, title: 'REQUEST_SUBMITTED', detail: 'Created via Create AI Project Request wizard.' },
  ];

  return (
    <section className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/projects"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{t('Back to Projects')}</span>
        </Link>

        {/* Project Hero */}
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] lg:grid-cols-12">
          <div className="flex items-start gap-4 lg:col-span-8">
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                iconTileClassOf(p.tone),
              )}
            >
              <ProjectIcon icon={p.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">{p.name}</h1>
                <Badge tone={badgeToneOf(p.statusTone)} dot>
                  {t(p.status)}
                </Badge>
              </div>
              <div className="mt-1 font-mono text-xs text-ink-muted">
                {p.id} · {t(p.typeLabel)}
                {p.useCase ? ` · ${t(p.useCase)}` : ''}
              </div>
              <p className="mt-2.5 mb-3 text-sm leading-relaxed text-ink-secondary">{p.desc}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t('Posted {date}', { date: formatDate(p.started) })}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>
                    {p.deadline ? t('Target {date}', { date: formatDate(p.deadline) }) : t('No fixed deadline')}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t(p.owner)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-canvas p-4 lg:col-span-4">
            <div>
              <div className="text-xs text-ink-muted">{t('budget range')}</div>
              <div className="mt-1 text-xl font-semibold text-ink">
                {budgetLabel(p.budgetRange) || t('To be discussed')}
              </div>
            </div>
            <div className="mt-3 text-xs text-teal-ink font-medium">
              {t('Urgency: {level}', { level: t(p.delivery?.urgency || 'Standard') })}
            </div>
          </div>
        </div>

        {/* Status & Activity Trail */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col gap-4 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="m-0 text-base font-semibold text-ink">{t('Status')}</h2>
                <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                  {t('Lifecycle stage {current} of {total}', {
                    current: POSTED_TASK_STATUS_FLOW.findIndex((s) => s.key === st.key) + 1,
                    total: POSTED_TASK_STATUS_FLOW.length,
                  })}
                </p>
              </div>
              <Badge tone={st.key === 'completed' ? 'mint' : 'amber'} dot>
                {t(st.label)}
              </Badge>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tone-blue-bg text-tone-blue-fg">
                <ProjectIcon icon={st.icon} />
              </span>
              <p className="m-0 text-sm text-ink-secondary">{t(st.desc)}</p>
            </div>
            {actions.sla && (
              <div className="flex items-center gap-2 rounded-xl bg-canvas px-3.5 py-2.5 text-xs text-ink-secondary">
                <Clock className="h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.5} />
                <span>{t(actions.sla)}</span>
              </div>
            )}
            {actions.zenvinus && (
              <div className="flex items-start gap-2 rounded-xl bg-tint-mint px-3.5 py-2.5 text-xs text-teal-ink">
                <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                <span>
                  {t('This step is handled by the Zenvinus team — follow its progress in {link}.', {
                    link: (
                      <Link href={`/lab?id=${id}`} className="font-semibold underline text-teal-ink">
                        AI Research Lab
                      </Link>
                    ),
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-8">
            <div className="mb-4">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Activity')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('Audit trail of your request')}</p>
            </div>
            <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
              {history.slice(0, 6).map((h, i) => (
                <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      i === 0 ? 'bg-tone-blue-bg text-tone-blue-fg' : 'bg-tone-mint-bg text-tone-mint-fg',
                    )}
                  >
                    {i === 0 ? <Clock className="h-4 w-4" strokeWidth={1.6} /> : <Check className="h-4 w-4" strokeWidth={1.75} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink">{t(h.title)}</div>
                    <div className="text-xs text-ink-muted">{t(h.detail)}</div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-ink-muted">{h.at}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Proposal Document */}
        {proposal && (
          <div className="mt-6 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-base font-semibold text-ink">
                  {t('Proposal {id}', { id: proposal.docId })}
                </h2>
                <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                  {t('Prepared by Zenvinus expert team · valid {period}', { period: proposal.validUntil })}
                </p>
              </div>
              <Badge tone={st.key === 'awaiting_dp' ? 'blue' : 'mint'} dot>
                {st.key === 'awaiting_dp' ? t('Attached — review & pay DP') : t('Accepted')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <dl className="m-0 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-canvas p-4 text-sm">
                {proposal.items.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-ink-secondary">{t(row.label)}</dt>
                    <dd className="m-0 font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-ink-secondary">{t('Deliverables')}</dt>
                  <dd className="m-0 font-medium text-ink text-right">{proposal.deliverables.join(' · ')}</dd>
                </div>
              </dl>

              <dl className="m-0 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface p-4 text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-ink-secondary">{t('Total contract')}</dt>
                  <dd className="m-0 font-mono font-medium text-ink">{proposal.price.total}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-ink-secondary">{t('Down payment (50%)')}</dt>
                  <dd className="m-0 font-mono font-medium text-ink">{proposal.price.upfront}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="font-semibold text-ink">{t('Final payment (50%)')}</dt>
                  <dd className="m-0 font-mono font-semibold text-teal-ink">{proposal.price.final}</dd>
                </div>
                <p className="mt-3 mb-0 pt-2 text-xs text-ink-muted">{proposal.price.note}</p>
              </dl>
            </div>

            {st.key === 'proposal_ready' && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {actions.company.map((c) => (
                  <Button
                    key={c.to}
                    type="button"
                    variant={c.primary ? 'primary' : 'secondary'}
                    size="sm"
                    leftIcon={c.primary ? <Handshake className="h-4 w-4" strokeWidth={1.6} /> : <RotateCw className="h-4 w-4" strokeWidth={1.6} />}
                    onClick={() =>
                      act(
                        c.to,
                        c.primary ? 'Proposal accepted by company.' : 'Company requested changes to the proposal.',
                      )
                    }
                  >
                    {t(c.label)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stage Action Panels */}
        {st.key === 'awaiting_dp' && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-ink/25 bg-tint-mint p-6">
            <div>
              <h2 className="m-0 text-base font-semibold text-ink">{t('Down Payment')}</h2>
              <p className="mt-1 mb-0 text-xs text-ink-secondary">
                {t('50% of {amount} — held in escrow, released per approved batch', {
                  amount: proposal ? proposal.price.total : budgetLabel(p.budgetRange),
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                href={`/dashboard/pay?id=${id}&type=dp`}
                variant="primary"
                size="sm"
                leftIcon={<CreditCard className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Pay 50% Down Payment')}
              </Button>
              <Button href={`/dashboard/projects?id=${id}`} variant="secondary" size="sm">
                {t('Cancel')}
              </Button>
            </div>
          </div>
        )}

        {(st.key === 'in_progress' || st.key === 'revision') && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6">
            <div>
              <h2 className="m-0 text-base font-semibold text-ink">
                {st.key === 'revision' ? t('Revision in progress') : t('Work in progress')}
              </h2>
              <p className="mt-1 mb-0 text-xs text-ink-muted">
                {st.key === 'revision'
                  ? t('Flagged items are being re-worked before the QA gate.')
                  : t('Batches are being delivered progressively — track them in the pipeline.')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.company.map((c) => (
                <Button
                  key={c.to}
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCw className="h-3.5 w-3.5" strokeWidth={1.6} />}
                  onClick={() => act(c.to, 'Revision requested by company.')}
                >
                  {t(c.label)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {st.key === 'awaiting_full' && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-ink/25 bg-tint-mint p-6">
            <div>
              <h2 className="m-0 text-base font-semibold text-ink">{t('Final Payment')}</h2>
              <p className="mt-1 mb-0 text-xs text-ink-secondary">
                {t('Work completed & QA-approved — pay the remaining 50% to unlock delivery')}
              </p>
            </div>
            <Button
              href={`/dashboard/pay?id=${id}&type=final`}
              variant="primary"
              size="sm"
              leftIcon={<CreditCard className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('Pay 50% Final & Unlock Delivery')}
            </Button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PipelineChildCard id={id} />
          <TeamCard pending />
        </div>
      </div>
    </section>
  );
};

const ProjectDetail = ({ id }: { id: string }) => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const p = getProjectById(posted, id);

  if (!p) {
    return (
      <section className="min-h-[70vh] bg-canvas py-16">
        <div className="mx-auto max-w-lg px-4">
          <EmptyState
            title={t('Project not found.')}
            action={
              <Button href="/dashboard/projects" variant="primary" size="sm">
                {t('Back to projects')}
              </Button>
            }
          />
        </div>
      </section>
    );
  }
  if (p.kind === 'posted') return <PostedProjectDetail id={id} />;

  const batches = getProjectBatches(posted, id);
  const workforce = getProjectWorkforce(posted, id);
  const files = getProjectDeliverables(posted, id);
  const qa = getProjectQa(posted, id);
  const budgetPct = Math.round((p.spend / p.budget) * 100);
  const kpis: KpiItem[] = [
    { id: 'items', label: 'Total Items', value: p.items.toLocaleString(locale), icon: 'fa-solid fa-layer-group', tone: 'blue', note: t('across {count} batches', { count: batches.length }) },
    { id: 'delivered', label: 'Delivered', value: p.delivered, valueSuffix: '%', icon: 'fa-solid fa-truck-fast', tone: 'mint', note: t('{count} items accepted', { count: Math.round((p.delivered / 100) * p.items).toLocaleString(locale) }) },
    { id: 'qa', label: 'QA Pass Rate', value: p.qaPass.toLocaleString(locale), valueSuffix: '%', icon: 'fa-solid fa-clipboard-check', tone: 'purple', note: t('double-pass sampling') },
    { id: 'wf', label: 'Active Workforce', value: p.workforce, icon: 'fa-solid fa-users', tone: 'orange', note: t('labelers assigned') },
  ];

  return (
    <section className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/projects"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{t('Back to Projects')}</span>
        </Link>

        {/* Project Detail Hero */}
        <div className="mb-6 grid grid-cols-1 gap-6 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] lg:grid-cols-12">
          <div className="flex items-start gap-4 lg:col-span-8">
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                iconTileClassOf(p.tone),
              )}
            >
              <ProjectIcon icon={p.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">{t(p.name)}</h1>
                <Badge tone={badgeToneOf(p.statusTone)} dot>
                  {t(p.status)}
                </Badge>
              </div>
              <div className="mt-1 font-mono text-xs text-ink-muted">
                {p.id} · {t(p.typeLabel)}
              </div>
              <p className="mt-2.5 mb-3 text-sm leading-relaxed text-ink-secondary">{t(p.desc)}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t('Started {date}', { date: formatDate(p.started) })}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t('Due {date}', { date: formatDate(p.deadline) })}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t('Owner: {name}', { name: p.owner })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-canvas p-4 lg:col-span-4">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-semibold text-ink tabular-nums">
                  {money(p.spend, locale)}
                </span>
                <span className="text-xs text-ink-muted">
                  {t('of {amount} budget', { amount: money(p.budget, locale) })}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <CustomProgressBar
                value={budgetPct}
                tone="teal"
                height="sm"
                leftLabel={t('{percent}% of budget used', { percent: budgetPct })}
              />
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatusCard id={id} />
          <PipelineChildCard id={id} />
        </div>

        <div className="mb-6">
          <TeamCard id={id} />
        </div>

        <KpiGrid items={kpis} />

        {/* Batches + QA Semi-Circular Gauge */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-8">
            <div className="mb-4">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Batch Progress')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('Delivery status per dataset batch')}</p>
            </div>
            {/* Mobile card list (< md) */}
            <div className="divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface md:hidden">
              {batches.map((b) => (
                <div key={b.id} className="flex flex-col gap-2.5 p-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{b.label}</div>
                      <div className="font-mono text-xs text-ink-muted">{b.id}</div>
                    </div>
                    <Badge tone={badgeToneOf(b.statusTone)} dot className="shrink-0">
                      {t(b.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <CustomProgressBar value={b.delivered} height="sm" className="flex-1" />
                    <span className="w-9 text-right font-mono text-xs text-ink-secondary tabular-nums">
                      {b.delivered}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-ink-secondary tabular-nums">
                    <span>
                      {b.items.toLocaleString(locale)} {t('items')}
                    </span>
                    <span>
                      {t('Due')}: {b.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table (>= md) */}
            <div className="hidden overflow-x-auto rounded-xl border border-line-subtle md:block">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                    <th className="px-4 py-3 font-medium">{t('Batch')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('Items')}</th>
                    <th className="px-4 py-3 font-medium">{t('Progress')}</th>
                    <th className="px-4 py-3 font-medium">{t('Due')}</th>
                    <th className="px-4 py-3 font-medium">{t('Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle bg-surface">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-canvas/60">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-ink">{b.label}</div>
                        <div className="font-mono text-xs text-ink-muted">{b.id}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-ink tabular-nums">
                        {b.items.toLocaleString(locale)}
                      </td>
                      <td className="w-44 px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <CustomProgressBar value={b.delivered} height="sm" className="flex-1" />
                          <span className="w-9 text-right font-mono text-xs text-ink-secondary tabular-nums">
                            {b.delivered}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink-secondary">{b.due}</td>
                      <td className="px-4 py-3.5">
                        <Badge tone={badgeToneOf(b.statusTone)} dot>
                          {t(b.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-4">
            <div>
              <h2 className="m-0 text-base font-semibold text-ink">{t('QA Summary')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                {t('{count} items reviewed', { count: qa.reviewed.toLocaleString(locale) })}
              </p>
            </div>
            <div className="my-4">
              <CustomSemiCircleGauge value={qa.passRate} label={t('QA Pass Rate')} />
            </div>
            <dl className="m-0 divide-y divide-line-subtle text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-secondary">{t('Re-work required')}</dt>
                <dd className="m-0 font-mono font-semibold text-ink">{qa.rework.toLocaleString(locale)}%</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-secondary">{t('Avg. review time')}</dt>
                <dd className="m-0 font-semibold text-ink">{t(qa.avgReview)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bottom 3-Column Bento */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
            <h2 className="m-0 text-base font-semibold text-ink">{t('Deliverables')}</h2>
            <p className="mt-0.5 mb-4 text-xs text-ink-muted">{t('Approved dataset exports')}</p>
            <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
              {files.map((f) => (
                <li key={f.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        iconTileClassOf(f.tone),
                      )}
                    >
                      <FileArchive className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{f.name}</div>
                      <div className="text-xs text-ink-muted">
                        {f.items ? `${t('{count} items', { count: f.items.toLocaleString(locale) })} · ` : ''}
                        {f.size} · {t(f.date)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    title={t('Download {name}', { name: f.name })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-subtle bg-surface text-ink-muted hover:bg-canvas hover:text-ink cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
            <h2 className="m-0 text-base font-semibold text-ink">{t('Top Workforce')}</h2>
            <p className="mt-0.5 mb-4 text-xs text-ink-muted">{t('Most items delivered')}</p>
            <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
              {workforce.map((w) => (
                <li key={w.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        iconTileClassOf(w.tone),
                      )}
                    >
                      {w.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{w.name}</div>
                      <div className="text-xs text-ink-muted">
                        {t('{count} items', { count: w.items.toLocaleString(locale) })}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-teal-ink tabular-nums">
                    {w.accuracy.toLocaleString(locale)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
            <h2 className="m-0 text-base font-semibold text-ink">{t('QA Flags')}</h2>
            <p className="mt-0.5 mb-4 text-xs text-ink-muted">{t('Latest review events')}</p>
            <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
              {qa.flags.map((flag) => (
                <li key={flag.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      iconTileClassOf(flag.tone),
                    )}
                  >
                    <ProjectIcon icon={flag.icon} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{t(flag.title)}</div>
                    <div className="text-xs text-ink-muted">{t(flag.meta)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const CompanyProjects = () => {
  const { t } = useT();
  const router = useRouter();
  const ready = useMounted();
  const id = ready ? queryString(router.query.id) : null;
  const stage = queryString(router.query.stage) ?? undefined;
  const isChild = Boolean(router.query.pipeline || router.query.stage);

  const renderLoading = () => (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      <BentoSkeleton />
    </div>
  );

  if (id && id.startsWith('REQ')) {
    return (
      <>
        <DashboardHeader />
        <main className="min-h-screen bg-canvas">
          {ready ? (
            <OrdersView
              id={id}
              stage={stage}
              backHref="/dashboard"
              backLabel={t('Back to Dashboard')}
            />
          ) : (
            renderLoading()
          )}
        </main>
        <DashboardFooter />
      </>
    );
  }

  if (id && isChild) {
    return (
      <>
        <DashboardHeader />
        <main className="min-h-screen bg-canvas">
          {ready ? (
            <OrdersView
              id={id}
              stage={stage}
              backHref={`/dashboard/projects?id=${id}`}
              backLabel={t('Back to Project')}
            />
          ) : (
            renderLoading()
          )}
        </main>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="min-h-screen bg-canvas">
        {ready ? id ? <ProjectDetail id={id} /> : <ProjectList /> : renderLoading()}
      </main>
      <DashboardFooter />
    </>
  );
};

export default CompanyProjects;
