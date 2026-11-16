import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { SUPPORT_PERMS } from '@/config/permissions';
import { useT } from '@/i18n';
import { formatDateTime } from '@/utils/format';
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
    <div className="edash-card zv-tickets">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{effectiveScope === 'all' ? t('All support tickets') : t('Your requests')}</h4>
          <p className="edash-card-sub">
            {effectiveScope === 'all'
              ? t('Requests from every user. Open one to reply as the Zenvinus team.')
              : t('Open a request to read the replies and answer them.')}
          </p>
        </div>
        {isTeam && (
          <div className="zv-tickets-scope" role="group" aria-label={t('Whose tickets')}>
            <button type="button" className={scope === 'mine' ? 'is-active' : undefined} aria-pressed={scope === 'mine'} onClick={() => setScope('mine')}>{t('Mine')}</button>
            <button type="button" className={scope === 'all' ? 'is-active' : undefined} aria-pressed={scope === 'all'} onClick={() => setScope('all')}>{t('Everyone (team)')}</button>
          </div>
        )}
      </div>

      {!user && !sessionLoading && (
        <div className="zv-tickets-empty">
          <p>{t('Sign in to send a request and follow the replies here.')}</p>
          <Link href={loginHref} className="edash-btn edash-btn-sm">{t('Sign in')}</Link>
        </div>
      )}

      {user && (
        <>
          <div className="zv-tickets-filter" role="group" aria-label={t('Status')}>
            {STATUS_FILTERS.map((f) => (
              <button key={f.key || 'all'} type="button" className={status === f.key ? 'is-active' : undefined} aria-pressed={status === f.key} onClick={() => setStatus(f.key)}>
                {t(f.label)}
              </button>
            ))}
          </div>

          {isLoading && <p className="zv-tickets-note">{t('Loading')}…</p>}
          {isError && <p className="zv-tickets-note is-error">{t(error instanceof Error ? error.message : 'Something went wrong. Please try again.')}</p>}
          {data && data.data.length === 0 && (
            <p className="zv-tickets-note">
              {status ? t('No requests with this status.') : effectiveScope === 'all' ? t('No support tickets yet.') : t('You have not sent any requests yet. Use the form below.')}
            </p>
          )}
          {data && data.data.length > 0 && (
            <ul className="zv-tickets-list">
              {data.data.map((tk) => (
                <li key={tk.id}>
                  <Link href={ticketHref(tk.id, as)}>
                    <div className="zv-tickets-main">
                      <strong>{tk.subject}</strong>
                      <span>
                        #{tk.id} · {t(topicLabel(tk.topic))}
                        {tk.reference && ` · ${tk.reference}`}
                        {tk.requester && ` · ${tk.requester.name || tk.requester.email}`}
                      </span>
                    </div>
                    <div className="zv-tickets-side">
                      <TicketStatusBadge status={tk.status} asTeam={effectiveScope === 'all'} />
                      <span>{formatDateTime(tk.lastMessageAt)} · {t('{count} messages', { count: tk.messageCount })}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default TicketsCard;
