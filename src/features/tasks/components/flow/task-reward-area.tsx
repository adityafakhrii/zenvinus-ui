import React, { useState } from 'react';
import Link from 'next/link';
import useTaskRoute from '../../hooks/use-task-route';
import FlowStepper from './flow-stepper';
import { useAppSelector } from '@/store/hooks';
import { selectProgress } from '../../store/submissions-slice';
import { resolveWorkspace } from '../workspaces/registry';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';

const PAYOUTS = [
  { id: 'bank', icon: 'fa-solid fa-building-columns', label: 'Bank Transfer', desc: 'BCA · BNI · Mandiri — 1–2 business days' },
  { id: 'ewallet', icon: 'fa-solid fa-wallet', label: 'E-Wallet', desc: 'GoPay · OVO · DANA — instant' },
  { id: 'crypto', icon: 'fa-brands fa-bitcoin', label: 'Crypto (USDT)', desc: 'TRC-20 — after confirmation' },
];

const TaskRewardArea = () => {
  const { ready, task } = useTaskRoute();
  const { t, locale } = useT();
  const [payout, setPayout] = useState('bank');
  const [claimed, setClaimed] = useState(false);
  const stored = useAppSelector((state) => (task ? selectProgress(state, task.slug) : null));
  const progress = ready && task ? stored : null;

  if (!ready || !task) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  // Belum ada item disetujui untuk task ini — jangan spinner abadi,
  // tampilkan empty state agar route tetap bermakna saat dibuka langsung.
  if (!progress || progress.accepted.length === 0) {
    return (
      <section className="tflow-area pt-40 pb-120">
        <div className="container">
          <FlowStepper current="reward" />
          <div className="tflow-narrow">
            <div className="tflow-panel tflow-result">
              <span className="tflow-result-icon tflow-result-icon-sm">
                <i className="fa-solid fa-coins"></i>
              </span>
              <h3 className="tflow-title">{t('No rewards to withdraw yet')}</h3>
              <p className="tflow-desc">
                {t('Rewards appear once your submissions pass the quality check. Finish the items in {title}, then come back to this page.', { title: <strong>{task.title}</strong> })}
              </p>
              <div className="tflow-actions tflow-actions-center">
                <Button href={`/task-studio?task=${task.slug}`} className="tflow-btn">
                  <i className="fa-solid fa-pen-to-square"></i> {t('Continue Working')}
                </Button>
                <Link href="/dashboard?as=community" className="tflow-btn-ghost">
                  <i className="fa-solid fa-gauge-high"></i> {t('Community Dashboard')}
                </Link>
              </div>
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
    <section className="tflow-area pt-40 pb-120">
      <div className="container">
        <FlowStepper current="reward" />

        <div className="tflow-narrow">
          <div className="tflow-panel">
            <div className="tflow-qual-head">
              <div>
                <h3 className="tflow-title">{t('Reward')} — {task.title}</h3>
                <p className="tflow-desc">{t('Workspace {name} · {count} items approved', { name: meta?.label ? t(meta.label) : '', count: accepted })}</p>
              </div>
              <span className="tflow-badge-soft tflow-badge-open">
                <i className="fa-solid fa-coins"></i> Rp {total.toLocaleString(locale)}
              </span>
            </div>

            <div className="tflow-reward-breakdown">
              <div className="tflow-reward-row">
                <span><i className="fa-solid fa-layer-group"></i> {t('Base ({count} × Rp {amount})', { count: accepted, amount: task.rewardPerItem.toLocaleString(locale) })}</span>
                <strong>Rp {base.toLocaleString(locale)}</strong>
              </div>
              <div className="tflow-reward-row">
                <span><i className="fa-solid fa-arrow-trend-up"></i> {t('Accuracy bonus ({pct}%)', { pct: task.bonusPct })}</span>
                <strong>Rp {bonus.toLocaleString(locale)}</strong>
              </div>
              <div className="tflow-reward-row tflow-reward-total">
                <span>{t('Total reward')}</span>
                <strong>Rp {total.toLocaleString(locale)}</strong>
              </div>
            </div>

            {!claimed ? (
              <>
                <h4 className="tflow-subtitle"><i className="fa-solid fa-wallet"></i> {t('Payout method')}</h4>
                <div className="tflow-payout-grid">
                  {PAYOUTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`tflow-payout${payout === p.id ? ' tflow-payout-active' : ''}`}
                      onClick={() => setPayout(p.id)}
                    >
                      <i className={p.icon}></i>
                      <strong>{t(p.label)}</strong>
                      <span>{t(p.desc)}</span>
                    </button>
                  ))}
                </div>

                <div className="tflow-actions">
                  <Link href={`/task-completed?task=${task.slug}`} className="tflow-btn-ghost">
                    <i className="fa-solid fa-arrow-left"></i> {t('Back')}
                  </Link>
                  <Button className="tflow-btn" onClick={() => setClaimed(true)}>
                    {t('Claim Reward')} <i className="fa-solid fa-paper-plane"></i>
                  </Button>
                </div>
              </>
            ) : (
              <div className="tflow-claim-done">
                <span className="tflow-result-icon tflow-result-pass tflow-result-icon-sm">
                  <i className="fa-solid fa-circle-check"></i>
                </span>
                <h4>{t('Reward claimed!')}</h4>
                <p>
                  {t('Rp {amount} is on its way to {method}. You will be notified when the funds arrive.', {
                    amount: total.toLocaleString(locale),
                    method: t(PAYOUTS.find((p) => p.id === payout)?.label ?? ''),
                  })}
                </p>
                <Button href="/dashboard/tasks" className="tflow-btn">
                  {t('Find Next Task')} <i className="fa-solid fa-arrow-right"></i>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskRewardArea;
