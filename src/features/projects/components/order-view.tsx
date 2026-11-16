import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Cpu,
  CreditCard,
  Download,
  FileArchive,
  Handshake,
  Lock,
  Zap,
} from 'lucide-react';
import { Badge, Button, CustomProgressBar, cn } from '@/components/ui';
import { useT } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import { ORDER_PIPELINE, getCompanyOrderDetail, getOrderStageDetail } from '../data/company-orders';
import { selectPostedProjects } from '../store/projects-slice';
import type { OrderDeliverables, OrderDetail, TimelineStep } from '../types/order';
import { ProjectIcon, badgeToneOf, iconTileClassOf } from './project-icons';

const ORDER_PIPELINE_KEYS = ORDER_PIPELINE.map((s) => s.key);
const money = (n: number, locale: string) => `$${n.toLocaleString(locale)}`;

function stepBadgeClass(state: TimelineStep['state']): string {
  if (state === 'done') return 'border-teal-ink bg-tint-mint text-teal-ink';
  if (state === 'active') return 'border-navy bg-navy text-white';
  return 'border-line bg-surface text-ink-muted';
}

const PipelineTimeline = ({ orderId, timeline }: { orderId: string; timeline: TimelineStep[] }) => {
  const { t } = useT();
  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6">
      <div className="mb-5">
        <h2 className="m-0 text-base font-semibold text-ink">{t('Pipeline')}</h2>
        <p className="mt-0.5 mb-0 text-xs text-ink-muted">
          {t('Request → Expert Review → Proposal → Delivery')}
        </p>
      </div>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {timeline.map((step, i) => (
          <li key={step.key}>
            <Link
              href={`/dashboard/projects?id=${orderId}&stage=${step.key}`}
              className="group flex items-start gap-3.5 rounded-xl border border-line-subtle bg-canvas/50 p-3.5 no-underline transition-colors hover:border-teal-ink/40 hover:bg-surface"
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  stepBadgeClass(step.state),
                )}
              >
                {step.state === 'done' ? (
                  <Check className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <ProjectIcon icon={step.icon} className="h-3.5 w-3.5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {i + 1}. {t(step.label)}
                  </span>
                  {step.date && <span className="font-mono text-xs text-ink-muted">{step.date}</span>}
                </div>
                {step.desc && (
                  <p className="mt-1 mb-0 text-xs leading-relaxed text-ink-secondary">{t(step.desc)}</p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-ink group-hover:underline">
                  <span>{t('Open stage page')}</span>
                  <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PaymentsCard = ({ payments }: { payments: OrderDetail['payments'] }) => {
  const { t, locale } = useT();
  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6">
      <div className="mb-4">
        <h2 className="m-0 text-base font-semibold text-ink">{t('Payments')}</h2>
        <p className="mt-0.5 mb-0 text-xs text-ink-muted">
          {t('50% escrow upfront · 50% on completion')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {[payments.upfront, payments.final].map((p) => (
          <div
            key={p.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-line-subtle bg-canvas p-3.5"
          >
            <div>
              <div className="text-sm font-medium text-ink">{t(p.label)}</div>
              <div className="mt-0.5 text-xs text-ink-muted">
                {p.state === 'paid' ? t('Paid {date}', { date: p.date }) : t('Releases at this stage')}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                {typeof p.amount === 'string' ? p.amount : money(p.amount, locale)}
              </span>
              <Badge tone={p.state === 'paid' ? 'mint' : 'amber'}>
                {p.state === 'paid' ? t('Paid') : t('Pending')}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-ink-muted">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-ink" strokeWidth={1.6} />
        <span>{t('Funds are held in escrow and released per approved milestone.')}</span>
      </div>
    </div>
  );
};

const DeliverablesCard = ({ deliverables }: { deliverables: OrderDeliverables | null }) => {
  const { t, locale } = useT();

  if (!deliverables) {
    return (
      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-base font-semibold text-ink">{t('Datasets, Models & Inference')}</h2>
            <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('Unlocked after final payment')}</p>
          </div>
          <Badge tone="amber" dot>
            <Lock className="h-3 w-3" strokeWidth={1.75} />
            <span>{t('Locked')}</span>
          </Badge>
        </div>
        <p className="mt-4 mb-0 rounded-xl bg-canvas p-4 text-sm leading-relaxed text-ink-secondary">
          {t(
            'Once the {payment} is verified, the final datasets, trained models and inference endpoint appear right here — ready to download and use.',
            { payment: <strong className="font-semibold text-ink">{t('Full Payment')}</strong> },
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4">
        <div>
          <h2 className="m-0 text-base font-semibold text-ink">{t('Datasets, Models & Inference')}</h2>
          <p className="mt-0.5 mb-0 text-xs text-ink-muted">
            {t('Delivered {date} — yours to keep', { date: 'Nov 04, 2026' })}
          </p>
        </div>
        <Badge tone="mint" dot>
          <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
          <span>{t('Delivered')}</span>
        </Badge>
      </div>

      <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
        {t('Datasets')}
      </h3>
      <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle rounded-xl border border-line-subtle p-0">
        {deliverables.datasets?.length === 0 && (
          <li className="px-4 py-3 text-sm text-ink-muted">{t('No dataset files.')}</li>
        )}
        {deliverables.datasets.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tone-blue-bg text-tone-blue-fg">
                <FileArchive className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{d.name}</div>
                <div className="text-xs text-ink-muted">
                  {t('{count} items', { count: d.items.toLocaleString(locale) })} · {d.size} · {d.date}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              title={t('Download {name}', { name: d.name })}
              leftIcon={<Download className="h-3.5 w-3.5" strokeWidth={1.6} />}
            >
              {t('Download')}
            </Button>
          </li>
        ))}
      </ul>

      {deliverables.models.length > 0 && (
        <div className="mt-6">
          <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
            {t('Models')}
          </h3>
          <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle rounded-xl border border-line-subtle p-0">
            {deliverables.models.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tone-purple-bg text-tone-purple-fg">
                    <Cpu className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink">{m.name}</div>
                    <div className="text-xs text-ink-muted">
                      {m.framework} · {m.metric}
                    </div>
                  </div>
                </div>
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-ink no-underline hover:underline"
                >
                  <span>{t('Open')}</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {deliverables.inference && (
        <div className="mt-6">
          <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
            {t('Inference')}
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-teal-ink/25 bg-tint-mint p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-teal-ink">
                <Zap className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">{t('Endpoint Live')}</div>
                <code className="mt-1 block rounded bg-surface px-2 py-0.5 font-mono text-xs text-ink">
                  {deliverables.inference.endpoint}
                </code>
                <div className="mt-1 text-xs text-ink-secondary">
                  {deliverables.inference.region} · {deliverables.inference.latency}
                </div>
              </div>
            </div>
            <Badge tone="mint" dot>
              {t(deliverables.inference.status)}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderStagePageProps {
  orderId: string;
  stageKey: string;
}

const OrderStagePage = ({ orderId, stageKey }: OrderStagePageProps) => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const { order, idx, meta, stage, content } = getOrderStageDetail(posted, orderId, stageKey);
  const prev = idx > 0 ? ORDER_PIPELINE_KEYS[idx - 1] : null;
  const next = idx < ORDER_PIPELINE_KEYS.length - 1 ? ORDER_PIPELINE_KEYS[idx + 1] : null;
  const stateLabel =
    stage.state === 'done' ? t('Done') : stage.state === 'active' ? t('In progress') : t('Waiting');

  return (
    <section className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link
          href={`/dashboard/projects?id=${order.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{t('Back to {id}', { id: order.id })}</span>
        </Link>

        {/* Horizontal 8-Dot Stage Stepper */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-4 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
          {order.timeline.map((s) => (
            <Link
              key={s.key}
              href={`/dashboard/projects?id=${order.id}&stage=${s.key}`}
              title={t('Stage {key} — {label}', { key: s.key, label: t(s.label) })}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                stepBadgeClass(s.state),
                s.key === stageKey && 'ring-3 ring-teal-ink/25',
              )}
            >
              {s.state === 'done' ? (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Circle className="h-2.5 w-2.5 fill-current" />
              )}
            </Link>
          ))}
        </div>

        {/* Hero Summary */}
        <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
                stepBadgeClass(stage.state),
              )}
            >
              {stage.state === 'done' ? (
                <Check className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <ProjectIcon icon={meta.icon} className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">{t(meta.label)}</h1>
                <Badge
                  tone={stage.state === 'done' ? 'mint' : stage.state === 'active' ? 'blue' : 'amber'}
                  dot
                >
                  {stateLabel}
                </Badge>
              </div>
              <p className="mt-1 mb-0 font-mono text-xs text-ink-muted">
                {order.id} · {order.title} · {t('Stage {n} of 8', { n: idx + 1 })}
              </p>
              {stage.desc && <p className="mt-2.5 mb-0 text-sm text-ink-secondary">{t(stage.desc)}</p>}
              {stage.date && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{stage.date}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-8">
            <div className="mb-4">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Stage Details')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t(content.intro || stage.desc || '')}</p>
            </div>

            {content.kind === 'info' && (
              <dl className="m-0 divide-y divide-line-subtle text-sm">
                {content.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-3 py-3">
                    <dt className="inline-flex items-center gap-2 text-ink-secondary">
                      <ProjectIcon icon={r.icon} className="h-4 w-4 text-ink-muted" />
                      <span>{t(r.label)}</span>
                    </dt>
                    <dd className="m-0 font-semibold text-ink">{t(r.value)}</dd>
                  </div>
                ))}
              </dl>
            )}

            {content.kind === 'proposal' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-line-subtle bg-canvas p-4 divide-y divide-line-subtle text-sm">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-ink-secondary">{t('Document')}</span>
                    <span className="font-mono font-semibold text-ink">{content.doc.id}</span>
                  </div>
                  {content.doc.rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-2">
                      <span className="text-ink-secondary">{t(r.label)}</span>
                      <span className="font-medium text-ink">{t(r.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={stage.state !== 'active'}
                    leftIcon={<Handshake className="h-4 w-4" strokeWidth={1.6} />}
                  >
                    {t('Accept Proposal')}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" disabled={stage.state !== 'active'}>
                    {t('Request Revision')}
                  </Button>
                </div>
              </div>
            )}

            {content.kind === 'payment' && (
              <div className="flex flex-col gap-4">
                <dl className="m-0 divide-y divide-line-subtle text-sm">
                  {content.rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-3 py-3">
                      <dt className="inline-flex items-center gap-2 text-ink-secondary">
                        <ProjectIcon icon={r.icon} className="h-4 w-4 text-ink-muted" />
                        <span>{t(r.label)}</span>
                      </dt>
                      <dd className="m-0 font-semibold text-ink">{t(r.value)}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={stage.state === 'done'}
                    leftIcon={<CreditCard className="h-4 w-4" strokeWidth={1.6} />}
                  >
                    {stage.state === 'done' ? t('Already paid') : t('Pay Now')}
                  </Button>
                </div>
              </div>
            )}

            {content.kind === 'batches' && (
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {content.batches.map((b) => (
                  <li key={b.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{b.label}</span>
                      <span className="font-mono text-xs font-semibold text-ink tabular-nums">
                        {t('{count} items', { count: b.items.toLocaleString(locale) })}
                      </span>
                    </div>
                    <CustomProgressBar
                      value={b.delivered}
                      tone="teal"
                      height="sm"
                      rightLabel={t('{pct}% delivered', { pct: b.delivered })}
                    />
                  </li>
                ))}
              </ul>
            )}

            {content.kind === 'delivery' && (
              <p className="m-0 rounded-xl bg-canvas p-4 text-sm text-ink-secondary">
                {order.deliverables
                  ? t('Full details of the datasets, models and inference endpoint are in the order summary below.')
                  : t('Deliverables stay locked until the Full Payment is verified.')}
              </p>
            )}
          </div>

          <aside className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-4">
            <div className="mb-4">
              <h2 className="m-0 text-base font-semibold text-ink">{t('Pipeline Navigation')}</h2>
              <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('Jump between stages')}</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {order.timeline.map((s, i) => (
                <li key={s.key}>
                  <Link
                    href={`/dashboard/projects?id=${order.id}&stage=${s.key}`}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium no-underline transition-colors',
                      s.key === stageKey
                        ? 'bg-tint-mint text-teal-ink font-semibold'
                        : 'text-ink-secondary hover:bg-canvas hover:text-ink',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-ink-muted">{i + 1}</span>
                      <span>{t(s.label)}</span>
                    </span>
                    {s.state === 'done' && <Check className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-4">
              {prev ? (
                <Button
                  href={`/dashboard/projects?id=${order.id}&stage=${prev}`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />}
                >
                  {t('Previous')}
                </Button>
              ) : (
                <span />
              )}
              {next && (
                <Button
                  href={`/dashboard/projects?id=${order.id}&stage=${next}`}
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />}
                >
                  {t('Next')}
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export interface OrdersViewProps {
  id: string;
  stage?: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Custom Order 8-stage pipeline overview (/dashboard/orders or /dashboard/projects?id=REQ-*).
 */
export const OrdersView = ({
  id,
  stage,
  backHref = '/dashboard',
  backLabel = 'Back to Dashboard',
}: OrdersViewProps) => {
  const { t, locale } = useT();
  const posted = useAppSelector(selectPostedProjects);
  const order = getCompanyOrderDetail(posted, id);

  if (stage) {
    return <OrderStagePage orderId={order.id} stageKey={stage} />;
  }

  const pct = Math.round((order.stage / 8) * 100);

  return (
    <section className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{t(backLabel)}</span>
        </Link>

        {/* Order Hero Summary */}
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] lg:grid-cols-12">
          <div className="flex items-start gap-4 lg:col-span-8">
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                iconTileClassOf(order.tone),
              )}
            >
              <ProjectIcon icon={order.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">{order.title}</h1>
                <Badge tone={badgeToneOf(order.statusTone)} dot>
                  {t(order.status)}
                </Badge>
              </div>
              <div className="mt-1 font-mono text-xs text-ink-muted">
                {order.id} · {t(order.type)} · {t('requested {date}', { date: order.date })}
              </div>
              <p className="mt-2.5 mb-3 text-sm leading-relaxed text-ink-secondary">
                {t(
                  'Custom order with the full pipeline: expert review, proposal, milestone payments and final delivery.',
                )}
              </p>
              <CustomProgressBar value={pct} tone="teal" height="sm" rightLabel={`${pct}%`} />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-canvas p-4 lg:col-span-4">
            <div>
              <div className="text-xs text-ink-muted">{t('total contract value')}</div>
              <div className="mt-1 font-mono text-2xl font-semibold text-ink tabular-nums">
                {typeof order.amount === 'string' ? order.amount : money(order.amount, locale)}
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-teal-ink">
              {t('Stage {n} of 8 — {label}', { n: order.stage, label: t(order.stageLabel) })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <PipelineTimeline orderId={order.id} timeline={order.timeline} />
          </div>
          <div className="xl:col-span-4">
            <PaymentsCard payments={order.payments} />
          </div>
        </div>

        <div className="mt-6">
          <DeliverablesCard deliverables={order.deliverables} />
        </div>
      </div>
    </section>
  );
};
