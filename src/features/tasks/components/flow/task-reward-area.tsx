import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Landmark,
  Layers,
  LayoutDashboard,
  Pencil,
  Send,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomRadioGroup,
} from '@/components/ui';
import type { RadioOption } from '@/components/ui';
import { useT } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import useTaskRoute from '../../hooks/use-task-route';
import { selectProgress } from '../../store/submissions-slice';
import { resolveWorkspace } from '../workspaces/registry';
import FlowStepper from './flow-stepper';

const PAYOUTS = [
  { id: 'bank', icon: Landmark, label: 'Bank Transfer', desc: 'BCA · BNI · Mandiri — 1–2 business days' },
  { id: 'ewallet', icon: Wallet, label: 'E-Wallet', desc: 'GoPay · OVO · DANA — instant' },
  { id: 'crypto', icon: Coins, label: 'Crypto (USDT)', desc: 'TRC-20 — after confirmation' },
] as const;

/**
 * Contributor reward calculation & custom payout method withdrawal screen (/task-reward).
 */
const TaskRewardArea = () => {
  const { ready, task } = useTaskRoute();
  const { t, locale } = useT();
  const [payout, setPayout] = useState('bank');
  const [claimed, setClaimed] = useState(false);
  const stored = useAppSelector((state) => (task ? selectProgress(state, task.slug) : null));
  const progress = ready && task ? stored : null;

  const payoutOptions: RadioOption[] = useMemo(
    () =>
      PAYOUTS.map((p) => {
        const Icon = p.icon;
        return {
          value: p.id,
          label: (
            <span className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
              <span>{t(p.label)}</span>
            </span>
          ),
          description: t(p.desc),
        };
      }),
    [t],
  );

  if (!ready || !task) {
    return (
      <section className="min-h-screen bg-canvas py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BentoSkeleton />
        </div>
      </section>
    );
  }

  if (!progress || progress.accepted.length === 0) {
    return (
      <section className="min-h-screen bg-canvas py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <FlowStepper current="reward" />
          <div className="mx-auto max-w-xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-8 text-center shadow-[0_1px_2px_rgba(2,6,38,0.04)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-muted">
              <Coins className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h1 className="mt-4 mb-2 text-xl font-semibold text-ink">{t('No rewards to withdraw yet')}</h1>
            <p className="m-0 text-sm leading-relaxed text-ink-secondary">
              {t(
                'Rewards appear once your submissions pass the quality check. Finish the items in {title}, then come back to this page.',
                { title: <strong className="font-semibold text-ink">{task.title}</strong> },
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                href={`/task-studio?task=${task.slug}`}
                variant="primary"
                size="md"
                leftIcon={<Pencil className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Continue Working')}
              </Button>
              <Button
                href="/dashboard?as=community"
                variant="secondary"
                size="md"
                leftIcon={<LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />}
              >
                {t('Community Dashboard')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const accepted = progress.accepted.length;
  const base = accepted * task.rewardPerItem;
  const bonus = Math.round((base * task.bonusPct) / 100);
  const total = base + bonus;
  const workspace = resolveWorkspace(task);
  const meta = workspace?.meta;

  return (
    <section className="min-h-screen bg-canvas py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <FlowStepper current="reward" />

        <div className="mx-auto max-w-2xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line-subtle pb-4">
            <div>
              <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">
                {t('Reward')} — {task.title}
              </h1>
              <p className="mt-1 mb-0 text-xs text-ink-secondary">
                {t('Workspace {name} · {count} items approved', {
                  name: meta?.label ? t(meta.label) : '',
                  count: accepted,
                })}
              </p>
            </div>
            <Badge tone="mint" dot mono>
              <Coins className="h-3 w-3" strokeWidth={1.75} />
              <span>Rp {total.toLocaleString(locale)}</span>
            </Badge>
          </div>

          <dl className="m-0 mb-6 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-canvas p-4 text-sm">
            <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
              <dt className="inline-flex items-center gap-2 text-ink-secondary">
                <Layers className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
                <span>
                  {t('Base ({count} × Rp {amount})', {
                    count: accepted,
                    amount: task.rewardPerItem.toLocaleString(locale),
                  })}
                </span>
              </dt>
              <dd className="m-0 font-mono font-semibold text-ink tabular-nums">
                Rp {base.toLocaleString(locale)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="inline-flex items-center gap-2 text-ink-secondary">
                <TrendingUp className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <span>{t('Accuracy bonus ({pct}%)', { pct: task.bonusPct })}</span>
              </dt>
              <dd className="m-0 font-mono font-semibold text-teal-ink tabular-nums">
                Rp {bonus.toLocaleString(locale)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3">
              <dt className="font-semibold text-ink">{t('Total reward')}</dt>
              <dd className="m-0 font-mono text-lg font-semibold text-ink tabular-nums">
                Rp {total.toLocaleString(locale)}
              </dd>
            </div>
          </dl>

          {!claimed ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <h2 className="m-0 text-base font-semibold text-ink">{t('Payout method')}</h2>
              </div>

              <CustomRadioGroup
                name="task-reward-payout"
                value={payout}
                onChange={setPayout}
                variant="card"
                columnsClassName="grid grid-cols-1 gap-3 sm:grid-cols-3"
                options={payoutOptions}
              />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5">
                <Button
                  href={`/task-completed?task=${task.slug}`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.6} />}
                >
                  {t('Back')}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setClaimed(true)}
                  rightIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
                >
                  {t('Claim Reward')}
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-teal-ink/25 bg-tint-mint p-6 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-teal-ink">
                <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 className="mt-3 mb-1.5 text-lg font-semibold text-ink">{t('Reward claimed')}</h2>
              <p className="m-0 text-sm text-ink-secondary">
                {t('Rp {amount} is on its way to {method}. You will be notified when the funds arrive.', {
                  amount: total.toLocaleString(locale),
                  method: t(PAYOUTS.find((p) => p.id === payout)?.label ?? ''),
                })}
              </p>
              <div className="mt-5">
                <Button
                  href="/dashboard/tasks"
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
                >
                  {t('Find Next Task')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TaskRewardArea;
