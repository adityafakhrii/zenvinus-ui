import Link from 'next/link';
import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileSignature,
  FlaskConical,
  FolderKanban,
  Info,
  Microchip,
  Save,
  Send,
  Tag,
  Wallet,
  Zap,
} from 'lucide-react';
import { DashboardFooter } from '@/features/dashboard';
import { useRouter } from 'next/router';
import useMounted from '@/hooks/use-mounted';
import { POSTED_TASK_STATUS_FLOW } from '@/features/tasks';
import {
  REQUEST_ACTIONS,
  attachRequestProposal,
  changeRequestStatus,
  getCompanyOrders,
  getCompanyOrderDetail,
  selectPostedProject,
  selectPostedProjects,
  type PostedProject,
  type StatusStep,
  type Tone,
} from '@/features/projects';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomDatePicker,
  EmptyState,
  TextInput,
  Textarea,
  type BadgeTone,
} from '@/components/ui';

const money = (n: number | string, locale = 'en-US') =>
  typeof n === 'string' ? n : `$${n.toLocaleString(locale)}`;

const findStatus = (key: string): StatusStep | undefined =>
  POSTED_TASK_STATUS_FLOW.find((s) => s.key === key);

type Glyph = typeof FolderKanban;

const ICON_MAP: Readonly<Record<string, Glyph>> = {
  'fa-database': Database,
  'fa-microchip': Microchip,
  'fa-tags': Tag,
  'fa-tag': Tag,
  'fa-clipboard-check': ClipboardCheck,
  'fa-flask': FlaskConical,
  'fa-diagram-project': FolderKanban,
};

function LabGlyph({ icon, className = 'h-4 w-4' }: { icon?: string; className?: string }) {
  const token = icon?.match(/fa-[a-z0-9-]+/g)?.find((t) => t !== 'fa-solid' && t !== 'fa-regular') ?? '';
  const Icon = ICON_MAP[token] || FolderKanban;
  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />;
}

const TONE_MAP: Readonly<Partial<Record<Tone, BadgeTone>>> = {
  blue: 'blue',
  mint: 'mint',
  purple: 'blue',
  orange: 'orange',
  amber: 'amber',
};

const ICON_BG_MAP: Readonly<Partial<Record<Tone, string>>> = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-blue-bg text-tone-blue-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
};

const LabTopbar = () => {
  const { t } = useT();
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(8,13,53,0.08)] bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-teal-ink"
            aria-label={t('AI Research Lab')}
          >
            <FlaskConical className="h-4.5 w-4.5" strokeWidth={1.75} />
          </Link>
          <span className="truncate text-base font-semibold tracking-tight text-ink">
            {t('AI Research Lab')}
          </span>
          <Badge tone="blue" className="hidden sm:inline-flex">
            {t('internal · Zenvinus')}
          </Badge>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            href="/dashboard"
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />}
          >
            {t('Company view')}
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(8,13,53,0.08)] bg-canvas py-1 pl-1 pr-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
              RW
            </span>
            <span className="hidden text-xs font-medium text-ink lg:inline">
              Rani W. — Solutions Architect
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ------------------------------------------------------------------ */
/* Queue — every incoming request                                      */
/* ------------------------------------------------------------------ */

const statusChip = (label: string, tone: Tone | undefined) => (
  <Badge tone={tone ? TONE_MAP[tone] : 'amber'} dot>
    {label}
  </Badge>
);

const LabQueue = () => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const seeded = getCompanyOrders();

  return (
    <section className="min-h-[calc(100vh-140px)] bg-canvas py-8 sm:py-10">
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 sm:px-6">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">{t('Request Queue')}</h1>
          <p className="mt-1 mb-0 text-sm text-ink-muted">
            {t('AI project requests from companies — review them, prepare proposals, and move the pipeline forward.')}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(8,13,53,0.08)] px-5 py-4">
            <div>
              <h2 className="m-0 text-base font-semibold text-ink">{t('Incoming Requests')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                {t('{count} submitted by companies', { count: posted.length })} ·{' '}
                {t('{count} sample orders', { count: seeded.length })}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(8,13,53,0.08)] bg-canvas text-xs font-semibold text-ink-muted">
                  <th className="px-5 py-3">{t('Request')}</th>
                  <th className="px-4 py-3">{t('Company')}</th>
                  <th className="px-4 py-3">{t('Budget')}</th>
                  <th className="px-4 py-3">{t('Status')}</th>
                  <th className="px-5 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {posted.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-surface-soft">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            ICON_BG_MAP[r.tone] || 'bg-tone-blue-bg text-tone-blue-fg'
                          }`}
                        >
                          <LabGlyph icon={r.icon} />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/lab?id=${r.id}`}
                            className="block truncate font-semibold text-ink hover:text-teal-ink"
                          >
                            {r.name}
                          </Link>
                          <span className="text-xs text-ink-muted">
                            <span className="font-mono">{r.id}</span> · {t(r.typeLabel)}
                            {r.useCase ? ` · ${r.useCase}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-secondary">{r.company?.name || r.owner}</td>
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold tabular-nums text-ink">
                      {r.budgetRange || t('TBD')}
                    </td>
                    <td className="px-4 py-3.5">{statusChip(t(r.status), r.statusTone)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/lab?id=${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-teal-ink"
                      >
                        {r.statusKey === 'pending' || r.statusKey === 'in_review' ? t('Review') : t('Open')}
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>
                    </td>
                  </tr>
                ))}

                {seeded.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-surface-soft">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            ICON_BG_MAP[r.tone] || 'bg-tone-blue-bg text-tone-blue-fg'
                          }`}
                        >
                          <LabGlyph icon={r.icon} />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/projects?id=${r.id}`}
                            className="block truncate font-semibold text-ink hover:text-teal-ink"
                          >
                            {r.title}
                          </Link>
                          <span className="text-xs text-ink-muted">
                            <span className="font-mono">{r.id}</span> · {t(r.type)} · {t('sample')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-muted">{t('Sample order')}</td>
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold tabular-nums text-ink">
                      {money(r.amount, locale)}
                    </td>
                    <td className="px-4 py-3.5">{statusChip(t(r.status), r.statusTone)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/dashboard/projects?id=${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-teal-ink"
                      >
                        {t('Pipeline')}
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Detail — reviewing a request from the expert side                  */
/* ------------------------------------------------------------------ */

interface RowProps {
  /** English i18n key */
  label: string;
  value: string | null | undefined;
}

const Row = ({ label, value }: RowProps) => {
  const { t } = useT();
  return (
    <li className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <span className="text-xs font-medium text-ink-muted shrink-0">{t(label)}</span>
      <strong className="text-sm font-semibold text-ink sm:text-right">{value || '—'}</strong>
    </li>
  );
};

interface ProposalFormProps {
  project: PostedProject;
  id: string;
}

/** Review & attach the proposal — the expert sets the final price. */
const ProposalForm = ({ project, id }: ProposalFormProps) => {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState<string>(String(project.proposalDoc?.priceJuta ?? project.estimate ?? ''));
  const [validUntil, setValidUntil] = useState(project.deadline || project.proposalDoc?.validUntil || '');
  const [scope, setScope] = useState(project.proposalDoc?.scopeNote || project.desc || '');
  const [saved, setSaved] = useState(Boolean(project.proposalDoc));

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <FileSignature className="h-4 w-4 text-teal-ink" strokeWidth={1.75} />
        {t('Attach Proposal')}
      </p>

      <TextInput
        label={t('Final Price (Rp million) *')}
        type="number"
        min="1"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        hint={t('Company budget range: {range} — you may set the final price above or below it.', {
          range: project.budgetRange || t('TBD'),
        })}
      />

      <CustomDatePicker
        label={t('Valid Until')}
        value={validUntil}
        onChange={setValidUntil}
      />

      <Textarea
        label={t('Scope Notes')}
        rows={4}
        value={scope}
        onChange={(e) => setScope(e.target.value)}
      />

      {saved && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>
            {t('Proposal {doc} saved ({price}) — still internal; the company cannot see it yet.', {
              doc: project.proposalDoc?.docId,
              price: project.proposalDoc?.priceLabel,
            })}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          block
          disabled={!price || Number(price) <= 0}
          leftIcon={<Save className="h-4 w-4" strokeWidth={1.6} />}
          onClick={() => {
            dispatch(attachRequestProposal(id, { priceJuta: Number(price), validUntil, scopeNote: scope }));
            setSaved(true);
          }}
        >
          {t('Save Proposal')}
        </Button>
        <Button
          variant="primary"
          block
          disabled={!saved}
          title={
            saved
              ? t('Send the proposal to the company — they can then pay the down payment')
              : t('Save the proposal before sending it')
          }
          leftIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
          onClick={() => {
            dispatch(attachRequestProposal(id, { priceJuta: Number(price), validUntil, scopeNote: scope }));
            dispatch(changeRequestStatus(id, 'awaiting_dp', `Proposal sent to company — ${idr(price)}.`));
          }}
        >
          {t('Send Proposal to Company')}
        </Button>
      </div>
    </div>
  );
};

const idr = (m: number | string | null | undefined): string =>
  m === null || m === undefined || Number.isNaN(Number(m))
    ? 'To be discussed'
    : `Rp ${String(Math.round(Number(m) * 10) / 10).replace('.', ',')} juta`;

const LabDetail = ({ id }: { id: string }) => {
  const { t, locale } = useT();
  const dispatch = useAppDispatch();
  const posted = useAppSelector(selectPostedProjects);
  const r = useAppSelector((state) => selectPostedProject(state, id));
  const seeded = r ? null : getCompanyOrderDetail(posted, id);
  const st = r ? findStatus(r.statusKey) : undefined;
  const actions = st ? REQUEST_ACTIONS[st.key] : null;
  const zenvinusAction = actions?.zenvinus;
  const history = r ? r.history || [] : [];

  if (!r && !seeded) {
    return (
      <section className="min-h-[calc(100vh-140px)] bg-canvas py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <EmptyState
            title={t('Request not found.')}
            action={
              <Button variant="secondary" href="/lab">
                {t('Back to Queue')}
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  const summarySource = r ?? seeded;

  return (
    <section className="min-h-[calc(100vh-140px)] bg-canvas py-8 sm:py-10">
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 sm:px-6">
        <Link
          href="/lab"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t('Back to Queue')}
        </Link>

        {/* Hero summary */}
        <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                summarySource?.tone ? ICON_BG_MAP[summarySource.tone] : 'bg-tone-blue-bg text-tone-blue-fg'
              }`}
            >
              <LabGlyph icon={summarySource?.icon} className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="m-0 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {r ? r.name : seeded?.title}
                </h1>
                {r
                  ? statusChip(t(r.status), r.statusTone)
                  : statusChip(t(seeded?.status ?? ''), seeded?.statusTone)}
              </div>

              <p className="mt-1 mb-0 text-xs text-ink-muted">
                <span className="font-mono">{r ? r.id : seeded?.id}</span> ·{' '}
                {r ? t(r.typeLabel) + (r.useCase ? ` · ${r.useCase}` : '') : t(seeded?.type ?? '')}
              </p>

              <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
                {r ? r.desc : t('Sample custom order.')}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line-subtle pt-3.5 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />
                  {r ? t('Posted {date}', { date: r.started }) : t('Requested {date}', { date: seeded?.date })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />
                  {r ? r.company?.name || '—' : t('Sample company')}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-ink">
                  <Wallet className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />
                  {r ? r.budgetRange || t('TBD') : seeded ? money(seeded.amount, locale) : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Asymmetric 8/4 Bento split */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-6 lg:col-span-8">
            <div className="mb-4 border-b border-line-subtle pb-3">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Request Details')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                {r ? t('Form submitted by the company') : t('Sample order — summary')}
              </p>
            </div>

            {r ? (
              <ul className="m-0 list-none divide-y divide-line-subtle p-0">
                <Row label="Needs" value={(r.needs || []).map((n) => t(n)).join(' + ')} />
                <Row label="Domain / Use case" value={`${t(r.typeLabel)}${r.useCase ? ` · ${r.useCase}` : ''}`} />
                <Row label="Industry" value={r.industry} />
                {r.data && (
                  <>
                    <Row label="Data modality" value={(r.data.modalities || []).join(', ')} />
                    <Row
                      label="Data availability"
                      value={
                        r.data.haveData === 'yes'
                          ? t('Has its own data')
                          : r.data.haveData === 'partial'
                          ? t('Partially available')
                          : t('Needs to be collected')
                      }
                    />
                    <Row
                      label="Target size"
                      value={
                        r.data.targetSize
                          ? `${Number(r.data.targetSize).toLocaleString(locale)} ${r.data.targetUnit}`
                          : t('TBD')
                      }
                    />
                    <Row label="Coverage / language" value={`${r.data.coverage || '—'} · ${r.data.language || '—'}`} />
                    <Row label="Data sources" value={(r.data.sources || []).join(', ')} />
                    <Row label="Diversity" value={(r.data.diversity || []).join(', ')} />
                  </>
                )}
                {r.annotation && r.annotation.type && (
                  <>
                    <Row label="Annotation" value={`${r.annotation.type} · ${(r.annotation.methods || []).join(', ')}`} />
                    <Row label="Classes" value={(r.annotation.classes || []).join(', ')} />
                    <Row
                      label="Workforce"
                      value={t(WORKFORCES.find((w) => w.key === r.annotation?.workforce)?.label ?? '')}
                    />
                    <Row
                      label="Quality"
                      value={`${r.annotation.quality} · ${r.annotation.reviewLevel} · ${r.annotation.consensus}`}
                    />
                  </>
                )}
                {r.model && r.model.devType && (
                  <>
                    <Row
                      label="Model"
                      value={
                        r.model.devType === 'finetune'
                          ? t('Fine-tune existing model')
                          : r.model.devType === 'train'
                          ? t('Train new model')
                          : r.model.devType === 'unsure'
                          ? t('Needs an approach recommendation')
                          : r.model.devType
                      }
                    />
                    <Row
                      label="Preferred / platform"
                      value={`${r.model.preferred || t('No preference')} · ${(r.model.platforms || []).join(', ')}`}
                    />
                    <Row
                      label="Target metrics"
                      value={
                        [r.model.map && `mAP50 ${r.model.map}`, r.model.latency && t('latency {ms}ms', { ms: r.model.latency })]
                          .filter(Boolean)
                          .join(' · ') || '—'
                      }
                    />
                  </>
                )}
                <Row label="Deliverables" value={(r.delivery?.items || []).map((d) => t(d)).join(', ')} />
                <Row
                  label="Format"
                  value={`${r.delivery?.datasetFormat || '—'} (dataset) · ${r.delivery?.modelFormat || '—'} (model)`}
                />
                {r.company && (
                  <>
                    <Row label="Contact" value={`${r.company.contact} · ${r.company.role || '—'}`} />
                    <Row label="Email / WA" value={`${r.company.email} · ${r.company.phone || '—'}`} />
                  </>
                )}
              </ul>
            ) : (
              <ul className="m-0 list-none divide-y divide-line-subtle p-0">
                <Row label="Type" value={t(seeded?.type ?? '')} />
                <Row label="Contract value" value={seeded ? money(seeded.amount, locale) : ''} />
                <Row
                  label="Stage"
                  value={t('Stage {stage} of 8 — {label}', {
                    stage: seeded?.stage,
                    label: t(seeded?.stageLabel ?? ''),
                  })}
                />
                <Row label="Items" value={(seeded?.items || 0).toLocaleString(locale)} />
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-6 lg:col-span-4">
            <div className="mb-4 border-b border-line-subtle pb-3">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Next Action')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                {r ? t(actions?.sla ?? '') : t('Sample order — read only')}
              </p>
            </div>

            {r ? (
              <div className="space-y-4">
                {st?.key === 'in_review' && <ProposalForm project={r} id={id} />}

                {st?.key !== 'in_review' && zenvinusAction && (
                  <Button
                    variant="primary"
                    block
                    leftIcon={<Zap className="h-4 w-4" strokeWidth={1.75} />}
                    onClick={() => dispatch(changeRequestStatus(id, zenvinusAction.to))}
                  >
                    {t(zenvinusAction.label)}
                  </Button>
                )}

                {!actions?.zenvinus && (
                  <div className="flex items-start gap-2 rounded-xl border border-[rgba(8,13,53,0.08)] bg-canvas px-3 py-2.5 text-xs text-ink-secondary">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />
                    <span>
                      {st?.key === 'proposal_ready'
                        ? t("Waiting for the company's decision (accept / request changes).")
                        : st?.key === 'awaiting_dp' || st?.key === 'awaiting_full'
                        ? t('Waiting for payment from the company.')
                        : t('No action needed — the next milestone is waiting on the company.')}
                    </span>
                  </div>
                )}

                {history.length > 0 && (
                  <div className="space-y-2 border-t border-line-subtle pt-4">
                    {history.slice(0, 5).map((h, i) => (
                      <div key={i} className="text-xs text-ink-muted">
                        <strong className="font-semibold text-ink">{t(h.title)}</strong> · {h.at}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="secondary"
                block
                href={`/dashboard/projects?id=${id}`}
                leftIcon={<FolderKanban className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('View pipeline in company view')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const WORKFORCES: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'community', label: 'Zenvinus Community' },
  { key: 'verified', label: 'Verified Contributors' },
  { key: 'expert', label: 'Expert Workforce' },
  { key: 'hybrid', label: 'Hybrid Community + Expert Review' },
];

const Lab = () => {
  const router = useRouter();
  const mounted = useMounted();
  const id = mounted && typeof router.query.id === 'string' ? router.query.id : null;

  return (
    <>
      <LabTopbar />
      <main>
        {mounted ? (
          id ? (
            <LabDetail id={id} />
          ) : (
            <LabQueue />
          )
        ) : (
          <div className="mx-auto max-w-[1280px] p-6">
            <BentoSkeleton />
          </div>
        )}
      </main>
      <DashboardFooter />
    </>
  );
};

export default Lab;
