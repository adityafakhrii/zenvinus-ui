import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { SUPPORT_PERMS } from '@/config/permissions';
import { useT } from '@/i18n';
import { formatDateTime } from '@/utils/format';
import { Button, EmptyState, ErrorState, SegmentedControl, TableSkeleton } from '@/components/ui';
import { fetchTickets, supportKeys } from '../services/support-api';
import { ticketHref, topicLabel, workspaceOf } from '../utils/links';
import TicketStatusBadge from './ticket-status';
import type { TicketScope, TicketStatus } from '../types/ticket';

const STATUS_FILTERS: ReadonlyArray<{ key: TicketStatus | ''; label: string }> = [
  { key: '', label: 'All' },
  { key: 'open', label: 'Awaiting team' },
  { key: 'answered', label: 'Replied' },
  { key: 'closed', label: 'Closed' },
];

/**
 * The signed-in user's support requests, newest activity first, each opening its conversation. The support team can
 * switch to every ticket. Signed-out visitors get a sign-in prompt.
 */
const TicketsCard = () => {
  const { t } = useT();
  const router = useRouter();
  const as = workspaceOf(router.query);
  const { user, isLoading: sessionLoading, can } = useAuth();
  const isTeam = can(SUPPORT_PERMS.manage);
  const [scope, setScope] = useState<TicketScope>('mine');
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const effectiveScope: TicketScope = isTeam ? scope : 'mine';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: supportKeys.list(effectiveScope, status),
    queryFn: () => fetchTickets(effectiveScope, status),
    enabled: Boolean(user),
  });

  const loginHref = `/login?next=${encodeURIComponent(router.asPath || '/dashboard/support')}`;

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-subtle pb-4">
        <div>
          <h2 className="m-0 text-base font-semibold text-ink">
            {effectiveScope === 'all' ? t('All support tickets') : t('Your requests')}
          </h2>
          <p className="mt-1 mb-0 text-xs text-ink-muted">
            {effectiveScope === 'all'
              ? t('Requests from every user. Open one to reply as the Zenvinus team.')
              : t('Open a request to read the replies and answer them.')}
          </p>
        </div>

        {isTeam && (
          <SegmentedControl<TicketScope>
            size="sm"
            ariaLabel={t('Whose tickets')}
            value={scope}
            onChange={setScope}
            options={[
              { value: 'mine', label: t('Mine') },
              { value: 'all', label: t('Everyone (team)') },
            ]}
          />
        )}
      </div>

      {!user && !sessionLoading && (
        <div className="mt-4">
          <EmptyState
            title={t('Sign in to send a request and follow the replies here.')}
            action={
              <Button variant="primary" size="sm" href={loginHref}>
                {t('Sign in')}
              </Button>
            }
          />
        </div>
      )}

      {user && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('Status')}>
            {STATUS_FILTERS.map((f) => {
              const active = status === f.key;
              return (
                <button
                  key={f.key || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(f.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-navy bg-navy text-white'
                      : 'border-line bg-canvas text-ink-secondary hover:border-line-input hover:bg-white hover:text-ink'
                  }`}
                >
                  {t(f.label)}
                </button>
              );
            })}
          </div>

          {isLoading && <TableSkeleton />}

          {isError && (
            <ErrorState
              message={t(error instanceof Error ? error.message : 'Something went wrong. Please try again.')}
            />
          )}

          {data && data.data.length === 0 && (
            <p className="m-0 rounded-xl border border-[rgba(8,13,53,0.08)] bg-canvas px-4 py-5 text-center text-sm text-ink-muted">
              {status
                ? t('No requests with this status.')
                : effectiveScope === 'all'
                ? t('No support tickets yet.')
                : t('You have not sent any requests yet. Use the form below.')}
            </p>
          )}

          {data && data.data.length > 0 && (
            <ul className="m-0 list-none divide-y divide-line-subtle overflow-hidden rounded-xl border border-[rgba(8,13,53,0.08)] p-0">
              {data.data.map((tk) => (
                <li key={tk.id}>
                  <Link
                    href={ticketHref(tk.id, as)}
                    className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-surface-soft sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-ink">{tk.subject}</strong>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        <span className="font-mono">#{tk.id}</span> · {t(topicLabel(tk.topic))}
                        {tk.reference && ` · ${tk.reference}`}
                        {tk.requester && ` · ${tk.requester.name || tk.requester.email}`}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <TicketStatusBadge status={tk.status} asTeam={effectiveScope === 'all'} />
                        <span className="text-[11px] text-ink-subtle">
                          {formatDateTime(tk.lastMessageAt)} · {t('{count} messages', { count: tk.messageCount })}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-ink-subtle" strokeWidth={1.75} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketsCard;
