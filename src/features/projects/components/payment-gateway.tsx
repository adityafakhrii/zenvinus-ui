import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Check,
  CreditCard,
  FolderOpen,
  Landmark,
  Lock,
  QrCode,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomRadioGroup,
  EmptyState,
} from '@/components/ui';
import type { RadioOption } from '@/components/ui';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import useMounted from '@/hooks/use-mounted';
import { useT, type TranslateFn } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeRequestStatus, selectPostedProject } from '../store/projects-slice';

type PaymentMethodKey = 'bca' | 'card' | 'ewallet' | 'qris';
type CheckoutStage = 'form' | 'processing' | 'done';

const METHOD_META = [
  { key: 'bca', label: 'BCA Virtual Account', desc: 'Transfer to the VA number — verified automatically', icon: Landmark },
  { key: 'card', label: 'Credit Card', desc: 'Visa / Mastercard — instant', icon: CreditCard },
  { key: 'ewallet', label: 'E-Wallet', desc: 'GoPay · OVO · DANA', icon: Wallet },
  { key: 'qris', label: 'QRIS', desc: 'Scan from any payment app', icon: QrCode },
] as const;

const idr = (m: number | null | undefined, t: TranslateFn, locale: string): string =>
  m === null || m === undefined || Number.isNaN(Number(m))
    ? t('To be discussed')
    : t('Rp {amount} million', { amount: (Math.round(Number(m) * 10) / 10).toLocaleString(locale) });

/**
 * Payment gateway (/dashboard/pay) using CustomRadioGroup cards and custom Tailwind invoice panel.
 */
const PaymentGateway = () => {
  const { t, locale } = useT();
  const router = useRouter();
  const ready = useMounted();
  const id = ready && typeof router.query.id === 'string' ? router.query.id : null;
  const type = router.query.type === 'final' ? 'final' : 'dp';
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => selectPostedProject(state, id));
  const isPosted = project?.kind === 'posted';

  const [method, setMethod] = useState<PaymentMethodKey>('bca');
  const [stage, setStage] = useState<CheckoutStage>('form');
  const [ref, setRef] = useState('');

  const vaNumber = useMemo(() => {
    if (!id) return '';
    return `8808 ${String(1046 + (Number(id.replace(/\D/g, '')) % 8999)).padStart(4, '0')} ${String(
      (Number(id.replace(/\D/g, '')) * 7919) % 10000,
    ).padStart(4, '0')}`;
  }, [id]);

  const methodOptions: RadioOption<PaymentMethodKey>[] = useMemo(
    () =>
      METHOD_META.map((m) => {
        const Icon = m.icon;
        return {
          value: m.key,
          label: (
            <span className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
              <span>{t(m.label)}</span>
            </span>
          ),
          description: (
            <span className="flex flex-col gap-1">
              <span>{t(m.desc)}</span>
              {m.key === 'bca' && method === 'bca' && vaNumber && (
                <span className="inline-block w-fit rounded bg-canvas px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                  VA: {vaNumber}
                </span>
              )}
            </span>
          ),
        };
      }),
    [method, t, vaNumber],
  );

  if (!ready) {
    return (
      <>
        <DashboardHeader />
        <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <BentoSkeleton />
          </div>
        </main>
        <DashboardFooter />
      </>
    );
  }

  if (!id || !project || !isPosted) {
    return (
      <>
        <DashboardHeader />
        <main className="min-h-[70vh] bg-canvas px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg">
            <EmptyState
              title={t('Payment Gateway')}
              description={t('The payment page is only for requests sent through the wizard.')}
              action={
                <Button href="/dashboard/projects" variant="primary" size="sm">
                  {t('Back to Projects')}
                </Button>
              }
            />
          </div>
        </main>
        <DashboardFooter />
      </>
    );
  }

  const proposal = project.proposalDoc;
  const total = proposal?.priceJuta ?? null;
  const share = total ? total / 2 : null;
  const amountLabel =
    type === 'dp'
      ? proposal?.upfrontLabel || idr(share, t, locale)
      : proposal?.finalLabel || idr(share, t, locale);
  const invoiceNo = `INV-${project.id.replace('PRJ-', '')}-${type.toUpperCase()}`;

  const payNow = () => {
    setStage('processing');
    const to = type === 'dp' ? 'in_progress' : 'completed';
    const note =
      type === 'dp'
        ? `Down payment ${amountLabel} paid via ${METHOD_META.find((m) => m.key === method)?.label}. Work started.`
        : `Final payment ${amountLabel} paid via ${METHOD_META.find((m) => m.key === method)?.label}. Delivery unlocked.`;
    window.setTimeout(() => {
      const updated = dispatch(changeRequestStatus(id, to, note));
      setRef(`PAY-${updated?.id.replace('PRJ-', '')}-${Date.now().toString().slice(-6)}`);
      setStage('done');
    }, 1600);
  };

  if (stage === 'done') {
    return (
      <>
        <DashboardHeader />
        <main className="min-h-screen bg-canvas px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-8 text-center shadow-[0_1px_2px_rgba(2,6,38,0.04)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tint-mint text-teal-ink">
              <Check className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h1 className="mt-4 mb-2 text-2xl font-semibold text-ink">{t('Payment successful')}</h1>
            <p className="m-0 text-sm text-ink-secondary">
              {type === 'dp'
                ? t('Down payment received — escrow is active and work has started.')
                : t('Final payment received — delivery is fully unlocked.')}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Badge tone="neutral" mono>{invoiceNo}</Badge>
              <Badge tone="mint" mono>{amountLabel}</Badge>
              <Badge tone="blue" mono>{t('Ref {ref}', { ref })}</Badge>
            </div>
            <div className="mt-6">
              <Button
                href={`/dashboard/projects?id=${id}`}
                variant="primary"
                size="md"
                leftIcon={<FolderOpen className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Back to Project')}
              </Button>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />

      <main className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Link
            href={`/dashboard/projects?id=${id}`}
            className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{t('Back to Project')}</span>
          </Link>

          <div className="mb-6">
            <h1 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
              {t('Payment Gateway')}
            </h1>
            <p className="mt-1 mb-0 text-sm text-ink-secondary">
              {type === 'dp'
                ? t('50% down payment — required before work starts.')
                : t('50% final payment — unlocks the full delivery.')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 7 cols: CustomRadioGroup Payment Selector */}
            <section className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6 lg:col-span-7">
              <div className="mb-4">
                <h2 className="m-0 text-base font-semibold text-ink">{t('Payment Method')}</h2>
                <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('Choose a payment method')}</p>
              </div>

              <CustomRadioGroup<PaymentMethodKey>
                name="pay-method"
                value={method}
                onChange={setMethod}
                variant="card"
                options={methodOptions}
              />

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line-subtle pt-5">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  loading={stage === 'processing'}
                  leftIcon={<Lock className="h-4 w-4" strokeWidth={1.6} />}
                  onClick={payNow}
                >
                  {stage === 'processing'
                    ? t('Processing payment via {method}…', {
                        method: t(METHOD_META.find((m) => m.key === method)?.label ?? ''),
                      })
                    : t('Pay {amount}', { amount: amountLabel })}
                </Button>
                <Button href={`/dashboard/projects?id=${id}`} variant="ghost" size="md">
                  {t('Cancel')}
                </Button>
              </div>
            </section>

            {/* Right 5 cols: Invoice Summary */}
            <aside className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="m-0 text-base font-semibold text-ink">{t('Invoice')}</h2>
                  <p className="mt-0.5 mb-0 font-mono text-xs text-ink-muted">{invoiceNo}</p>
                </div>
                <Badge tone="amber" dot>
                  {type === 'dp' ? '50% DP' : '50% Final'}
                </Badge>
              </div>

              <dl className="m-0 divide-y divide-line-subtle text-sm">
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-ink-secondary">{t('Project')}</dt>
                  <dd className="m-0 font-medium text-ink">{project.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-ink-secondary">{t('Request ID')}</dt>
                  <dd className="m-0 font-mono text-xs font-medium text-ink">{project.id}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-ink-secondary">{t('Total contract')}</dt>
                  <dd className="m-0 font-mono font-medium text-ink tabular-nums">
                    {proposal?.priceLabel || t(project.budgetRange || 'TBD')}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="font-semibold text-ink">
                    {type === 'dp' ? t('Down payment (50%)') : t('Final payment (50%)')}
                  </dt>
                  <dd className="m-0 font-mono text-base font-semibold text-teal-ink tabular-nums">
                    {amountLabel}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-tint-mint px-4 py-3 text-xs text-teal-ink">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{t('Funds are held in Zenvinus escrow and released per approved batch.')}</span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </>
  );
};

export default PaymentGateway;
