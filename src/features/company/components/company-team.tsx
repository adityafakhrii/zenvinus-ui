import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Calendar, CheckCircle2, Crown, RotateCw, Send, UserPlus } from 'lucide-react';
import {
  Badge,
  Button,
  CustomProgressBar,
  CustomSelect,
  Modal,
  TextInput,
  ToastViewport,
  cn,
} from '@/components/ui';
import type { BadgeTone, SelectOption, ToastItem } from '@/components/ui';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import { useT } from '@/i18n';
import { getPendingInvites, getRoleGuide, getSeats, getTeamMembers } from '../data/company-team';

const TONE_BADGE: Readonly<Record<string, BadgeTone>> = {
  blue: 'blue',
  mint: 'mint',
  green: 'mint',
  purple: 'purple',
  orange: 'orange',
  amber: 'amber',
  red: 'red',
};

const AVATAR_TONE: Readonly<Record<string, string>> = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-purple-bg text-tone-purple-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
};

/**
 * Team & Seat Management view (/dashboard/team) with interactive Invite Modal and inline custom Role selector.
 */
const CompanyTeam = () => {
  const { t } = useT();
  const seats = useMemo(() => getSeats(), []);
  const initialMembers = useMemo(() => getTeamMembers(), []);
  const invites = useMemo(() => getPendingInvites(), []);
  const roles = useMemo(() => getRoleGuide(), []);

  const [memberRoles, setMemberRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialMembers.map((m) => [m.email, m.role])),
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>(roles[1]?.role ?? 'Admin');
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

  const roleOptions: SelectOption[] = useMemo(
    () => roles.map((r) => ({ value: r.role, label: t(r.role) })),
    [roles, t],
  );

  const pct = Math.round((seats.used / seats.total) * 100);

  const submitInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    pushToast(t('Invite Member'), `${inviteEmail} (${t(inviteRole)})`);
    setInviteEmail('');
    setInviteOpen(false);
  };

  return (
    <>
      <DashboardHeader />

      <main className="min-h-screen bg-canvas pb-16 pt-6 sm:pt-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
                {t('Team & Seats')}
              </h1>
              <p className="mt-1 mb-0 text-sm text-ink-secondary">
                {t('Manage the people who post, review and oversee your projects.')}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" strokeWidth={1.6} />}
              onClick={() => setInviteOpen(true)}
            >
              {t('Invite Member')}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left 4 cols: Plan & Seat Usage */}
            <section className="flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] xl:col-span-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-xs text-ink-muted">{t('Plan')}</p>
                    <h2 className="mt-1 mb-0 text-xl font-semibold text-ink">{seats.plan}</h2>
                  </div>
                  <Badge tone="mint" dot>
                    <Crown className="h-3 w-3" strokeWidth={1.75} />
                    <span>{t('Active')}</span>
                  </Badge>
                </div>

                <div className="mt-6">
                  <CustomProgressBar
                    value={pct}
                    tone="teal"
                    leftLabel={`${seats.used}/${seats.total}`}
                    rightLabel={`${pct}%`}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 border-t border-line-subtle pt-4 text-xs text-ink-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.6} />
                  <span>
                    {t('{count} seats available — add members any time before renewal', {
                      count: seats.available,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted">
                  <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>{t('Renews on {date}', { date: seats.renew })}</span>
                </div>
              </div>
            </section>

            {/* Right 8 cols: Members Table */}
            <section className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6 xl:col-span-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-semibold text-ink">{t('Members')}</h2>
                  <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                    {t('{used} of {total} seats in use', { used: seats.used, total: seats.total })}
                  </p>
                </div>
                <Badge tone="neutral" mono>
                  {initialMembers.length}
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-xl border border-line-subtle">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line-subtle bg-canvas text-xs font-medium text-ink-secondary">
                      <th className="px-4 py-3 font-medium">{t('Member')}</th>
                      <th className="px-4 py-3 font-medium">{t('Role')}</th>
                      <th className="px-4 py-3 text-right font-medium">{t('Projects')}</th>
                      <th className="px-4 py-3 font-medium">{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-subtle bg-surface">
                    {initialMembers.map((member) => {
                      const currentRole = memberRoles[member.email] ?? member.role;
                      return (
                        <tr key={member.email} className="transition-colors hover:bg-canvas/60">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                  AVATAR_TONE[member.tone] ?? 'bg-canvas text-ink',
                                )}
                              >
                                {member.initials}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate font-medium text-ink">{member.name}</div>
                                <div className="truncate text-xs text-ink-muted">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="w-44 px-4 py-3.5">
                            <CustomSelect
                              value={currentRole}
                              onChange={(next) => {
                                setMemberRoles((prev) => ({ ...prev, [member.email]: next }));
                                pushToast(member.name, t(next));
                              }}
                              options={roleOptions}
                              size="sm"
                              ariaLabel={t('Manage {name}', { name: member.name })}
                            />
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                            {member.projects}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge tone={TONE_BADGE[member.statusTone] ?? 'neutral'} dot>
                              {t(member.status)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Pending Invitations */}
            <section className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6 xl:col-span-8">
              <div className="mb-4">
                <h2 className="m-0 text-base font-semibold text-ink">{t('Pending Invitations')}</h2>
                <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                  {t('Waiting for your teammates to accept')}
                </p>
              </div>
              <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
                {invites.map((inv) => (
                  <li key={inv.email} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tone-purple-bg text-tone-purple-fg">
                        <Send className="h-4 w-4" strokeWidth={1.6} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink">{inv.email}</div>
                        <div className="text-xs text-ink-muted">
                          {t('Role: {role} · sent {date}', { role: t(inv.role), date: inv.sent })}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<RotateCw className="h-3.5 w-3.5" strokeWidth={1.6} />}
                      onClick={() => pushToast(t('Resend'), inv.email)}
                    >
                      {t('Resend')}
                    </Button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Roles at a Glance */}
            <section className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-6 xl:col-span-4">
              <div className="mb-4">
                <h2 className="m-0 text-base font-semibold text-ink">{t('Roles at a Glance')}</h2>
                <p className="mt-0.5 mb-0 text-xs text-ink-muted">{t('What each seat can do')}</p>
              </div>
              <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0">
                {roles.map((r) => (
                  <li key={r.role} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div>
                      <Badge tone={TONE_BADGE[r.roleTone] ?? 'neutral'}>{t(r.role)}</Badge>
                    </div>
                    <span className="text-xs leading-relaxed text-ink-secondary">{t(r.desc)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t('Invite Member')}
        description={t('Manage the people who post, review and oversee your projects.')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setInviteOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" form="zv-invite-member-form" variant="primary" size="sm">
              {t('Invite Member')}
            </Button>
          </>
        }
      >
        <form id="zv-invite-member-form" onSubmit={submitInvite} className="flex flex-col gap-4">
          <TextInput
            label={t('Work Email *')}
            type="email"
            placeholder="teammate@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <CustomSelect
            label={t('Role')}
            value={inviteRole}
            onChange={setInviteRole}
            options={roleOptions}
          />
        </form>
      </Modal>

      <ToastViewport items={toasts} onDismiss={dismissToast} />
      <DashboardFooter />
    </>
  );
};

export default CompanyTeam;
