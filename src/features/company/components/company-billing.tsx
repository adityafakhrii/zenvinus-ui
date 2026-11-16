import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Building2, CreditCard, Download, Mail } from 'lucide-react';
import {
  Badge,
  Button,
  Modal,
  SegmentedBreakdownBar,
  TextInput,
  ToastViewport,
} from '@/components/ui';
import type { BadgeTone, BreakdownItem, ToastItem } from '@/components/ui';
import {
  DashboardFooter,
  DashboardHeader,
  KpiGrid,
  getSpendBreakdown,
} from '@/features/dashboard';
import { useT } from '@/i18n';
import { getBillingSummary, getInvoices, getPaymentMethod } from '../data/company-billing';

const BREAKDOWN_COLORS = ['#05DAC3', '#0D9488', '#020626', '#64748B'] as const;

const STATUS_BADGE: Readonly<Record<string, BadgeTone>> = {
  mint: 'mint',
  green: 'mint',
  amber: 'amber',
  blue: 'blue',
  red: 'red',
  orange: 'orange',
};

const money = (n: number, locale: string): string => `$${n.toLocaleString(locale)}`;

/**
 * Organization Billing & Invoices view (/dashboard/billing) styled with Tailwind Bento cards & object payment card.
 */
const CompanyBilling = () => {
  const { t, locale } = useT();
  const invoices = useMemo(() => getInvoices(), []);
  const pay = useMemo(() => getPaymentMethod(), []);
  const spendRows = useMemo(() => getSpendBreakdown(), []);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [holderInput, setHolderInput] = useState(pay.holder);
  const [emailInput, setEmailInput] = useState(pay.email);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
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
      const timer = window.setTimeout(() => dismissToast(id), 3800);
      timersRef.current.push(timer);
    },
    [dismissToast],
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

  const handleSaveCard = (e: FormEvent) => {
    e.preventDefault();
    setCardModalOpen(false);
    pushToast(t('Payment Method'), t('Changes saved locally for UI preview.'));
  };

  return (
    <>
      <DashboardHeader />

      <main className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
                {t('Billing & Invoices')}
              </h1>
              <p className="mt-1 mb-0 text-sm text-ink-secondary">
                {t('Payments, invoices and spend for your organization.')}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<CreditCard className="h-4 w-4" strokeWidth={1.5} />}
              onClick={() => setCardModalOpen(true)}
            >
              {t('Update Payment Method')}
            </Button>
          </div>

          <KpiGrid items={getBillingSummary()} />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left 8 Columns: Invoices Table */}
            <section className="xl:col-span-8 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6">
              <div className="mb-4">
                <h2 className="m-0 text-base font-semibold text-ink">{t('Invoices')}</h2>
                <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                  {t('Charged automatically at the start of each period')}
                </p>
              </div>

              {/* Mobile card list (< md) */}
              <div className="divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface md:hidden">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-ink">{inv.id}</div>
                        <div className="mt-0.5 text-xs text-ink-muted">{t(inv.period)}</div>
                      </div>
                      <Badge tone={STATUS_BADGE[inv.statusTone] ?? 'neutral'} dot className="shrink-0">
                        {t(inv.status)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-ink-secondary">{inv.method}</span>
                      <span className="font-mono font-semibold text-ink tabular-nums">
                        {money(inv.amount, locale)}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      {inv.status === 'Paid' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={t('Download {name}', { name: inv.id })}
                          onClick={() => pushToast(inv.id, t('Action previewed in local dummy mode.'))}
                          leftIcon={<Download className="h-3.5 w-3.5" strokeWidth={1.6} />}
                        >
                          {t('Download')}
                        </Button>
                      ) : (
                        <span className="font-mono text-xs text-ink-muted">
                          {t('due {date}', { date: inv.date })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table (>= md) */}
              <div className="hidden overflow-x-auto rounded-xl border border-line-subtle md:block">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                      <th className="px-4 py-3 font-medium">{t('Invoice')}</th>
                      <th className="px-4 py-3 text-right font-medium">{t('Amount')}</th>
                      <th className="px-4 py-3 font-medium">{t('Method')}</th>
                      <th className="px-4 py-3 font-medium">{t('Status')}</th>
                      <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle bg-surface">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="transition-colors hover:bg-canvas/60">
                        <td className="px-4 py-3.5">
                          <div className="font-mono text-xs font-semibold text-ink">{inv.id}</div>
                          <div className="mt-0.5 text-xs text-ink-muted">{t(inv.period)}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                          {money(inv.amount, locale)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-secondary">{inv.method}</td>
                        <td className="px-4 py-3.5">
                          <Badge tone={STATUS_BADGE[inv.statusTone] ?? 'neutral'} dot>
                            {t(inv.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {inv.status === 'Paid' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={t('Download {name}', { name: inv.id })}
                              onClick={() => pushToast(inv.id, t('Action previewed in local dummy mode.'))}
                              leftIcon={<Download className="h-3.5 w-3.5" strokeWidth={1.6} />}
                            >
                              {t('Download')}
                            </Button>
                          ) : (
                            <span className="font-mono text-xs text-ink-muted">
                              {t('due {date}', { date: inv.date })}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right 4 Columns: Payment Card Object + Spend Breakdown */}
            <aside className="flex flex-col gap-6 xl:col-span-4">
              <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="m-0 text-base font-semibold text-ink">{t('Payment Method')}</h2>
                    <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('Default for auto-charge')}</p>
                  </div>
                  <Badge tone="mint">{pay.brand}</Badge>
                </div>

                {/* Styled Physical Card Motif */}
                <div className="rounded-2xl border border-white/10 bg-navy p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/60">{pay.brand}</span>
                    <CreditCard className="h-4 w-4 text-teal" strokeWidth={1.6} />
                  </div>
                  <div className="mt-5 font-mono text-lg font-semibold tracking-wider text-white tabular-nums">
                    •••• •••• •••• {pay.last4}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/75">
                    <span className="truncate">{pay.holder}</span>
                    <span className="font-mono tabular-nums">{pay.expiry}</span>
                  </div>
                </div>

                <dl className="m-0 mt-4 flex flex-col gap-2 text-xs text-ink-secondary">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                    <span>{holderInput}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                    <span>{t('Expires {date}', { date: pay.expiry })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                    <span>{emailInput}</span>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6">
                <div className="mb-4">
                  <h2 className="m-0 text-base font-semibold text-ink">{t('Spend by Task Type')}</h2>
                  <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('This month')}</p>
                </div>
                <SegmentedBreakdownBar items={breakdownItems} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Modal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        title={t('Update Payment Method')}
        description={t('Default for auto-charge')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCardModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" form="zv-update-card-form" variant="primary" size="sm">
              {t('Save Changes')}
            </Button>
          </>
        }
      >
        <form id="zv-update-card-form" onSubmit={handleSaveCard} className="flex flex-col gap-3.5">
          <TextInput
            label={t('Company Name')}
            value={holderInput}
            onChange={(e) => setHolderInput(e.target.value)}
            required
          />
          <TextInput
            label={t('Billing Email')}
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
          />
        </form>
      </Modal>

      <ToastViewport items={toasts} onDismiss={dismissToast} />
      <DashboardFooter />
    </>
  );
};

export default CompanyBilling;
