import Link from 'next/link';
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/services/api';
import useMounted from '@/hooks/use-mounted';
import { useT } from '@/i18n';
import { formatDateTime } from '@/utils/format';
import { fetchTicket, replyToTicket, setTicketStatus, supportKeys } from '../services/support-api';
import { supportHref, topicLabel, workspaceOf } from '../utils/links';
import TicketStatusBadge from './ticket-status';
import type { TicketDetail } from '../types/ticket';

/** /dashboard/support/ticket?id=12 — the conversation of one ticket, a reply box, and close / reopen */
const TicketPage = () => {
  const { t } = useT();
  const router = useRouter();
  const mounted = useMounted();
  const as = workspaceOf(router.query);
  const rawId = mounted && typeof router.query.id === 'string' ? Number(router.query.id) : NaN;
  const id = Number.isInteger(rawId) && rawId > 0 ? rawId : null;
  const { user, isLoading: sessionLoading } = useAuth();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: supportKeys.ticket(id ?? 0),
    queryFn: () => fetchTicket(id ?? 0),
    enabled: Boolean(user && id),
  });

  // After a change, show the returned ticket at once and refresh the lists
  const applied = (next: TicketDetail) => {
    queryClient.setQueryData(supportKeys.ticket(next.id), next);
    queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
  };
  const send = useMutation({
    mutationFn: (body: string) => replyToTicket(id ?? 0, body),
    onSuccess: (next) => {
      applied(next);
      setReply('');
    },
  });
  const status = useMutation({ mutationFn: (to: 'open' | 'closed') => setTicketStatus(id ?? 0, to), onSuccess: applied });

  const onReply = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reply.trim()) send.mutate(reply.trim());
  };

  const notFound = (mounted && router.isReady && id === null) || (error instanceof ApiError && error.status === 404);
  const asTeam = Boolean(ticket && !ticket.isRequester);

  let body: React.ReactNode;
  if (!mounted || sessionLoading || (user && isLoading && !notFound)) {
    body = <div className="tflow-loading"><span className="spinner-border"></span></div>;
  } else if (!user) {
    body = (
      <div className="edash-card zv-tickets-empty">
        <p>{t('Sign in to read and answer this request.')}</p>
        <Link href={`/login?next=${encodeURIComponent(router.asPath)}`} className="edash-btn edash-btn-sm">{t('Sign in')}</Link>
      </div>
    );
  } else if (notFound) {
    body = (
      <div className="edash-card zv-tickets-empty">
        <p>{t('This request does not exist, or it belongs to another account.')}</p>
        <Link href={supportHref(as)} className="edash-btn edash-btn-sm">{t('Back to Support')}</Link>
      </div>
    );
  } else if (error || !ticket) {
    body = <div className="edash-card"><p className="zv-tickets-note is-error">{t(error instanceof Error ? error.message : 'Something went wrong. Please try again.')}</p></div>;
  } else {
    const closed = ticket.status === 'closed';
    body = (
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="edash-card">
            <ol className="zv-thread">
              {ticket.messages.map((m) => {
                const mine = m.fromStaff === asTeam;
                return (
                  <li key={m.id} className={`${m.fromStaff ? 'is-staff' : 'is-requester'}${mine ? ' is-mine' : ''}`}>
                    <div className="zv-thread-meta">
                      <strong>{m.fromStaff ? t('Zenvinus team') : m.author.name || t('Requester')}</strong>
                      {m.fromStaff && m.author.name && <span>{m.author.name}</span>}
                      <time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time>
                    </div>
                    <p>{m.body}</p>
                  </li>
                );
              })}
            </ol>

            <form className="zv-thread-reply" onSubmit={onReply}>
              <label htmlFor="zv-reply" className="edash-card-title">{asTeam ? t('Reply as the Zenvinus team') : t('Your reply')}</label>
              {closed && <p className="zv-support-note">{asTeam ? t('This request is closed. Replying will mark it answered.') : t('This request is closed. Replying opens it again.')}</p>}
              <textarea
                id="zv-reply"
                className="edash-input"
                rows={4}
                maxLength={5000}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t('Write a message')}
                disabled={send.isPending}
              ></textarea>
              {send.isError && <p className="zv-support-error" role="alert">{t(send.error.message)}</p>}
              <div className="zv-thread-actions">
                <button type="submit" className="edash-btn" disabled={send.isPending || !reply.trim()}>
                  <i className="fa-solid fa-paper-plane"></i> {send.isPending ? t('Sending…') : t('Send')}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="edash-card zv-ticket-info">
            <h4 className="edash-card-title">{t('Details')}</h4>
            <dl>
              <div><dt>{t('Status')}</dt><dd><TicketStatusBadge status={ticket.status} asTeam={asTeam} /></dd></div>
              <div><dt>{t('Topic')}</dt><dd>{t(topicLabel(ticket.topic))}</dd></div>
              {ticket.reference && <div><dt>{t('Reference')}</dt><dd>{ticket.reference}</dd></div>}
              <div><dt>{t('Opened')}</dt><dd>{formatDateTime(ticket.createdAt)}</dd></div>
              <div><dt>{t('Last message')}</dt><dd>{formatDateTime(ticket.lastMessageAt)}</dd></div>
              {ticket.requester && (
                <div><dt>{t('Requester')}</dt><dd>{ticket.requester.name}<br /><a href={`mailto:${ticket.requester.email}`}>{ticket.requester.email}</a></dd></div>
              )}
            </dl>
            <button
              type="button"
              className="edash-btn-ghost w-100"
              disabled={status.isPending}
              onClick={() => status.mutate(closed ? 'open' : 'closed')}
            >
              <i className={closed ? 'fa-solid fa-rotate-left' : 'fa-solid fa-circle-check'}></i> {closed ? t('Reopen request') : t('Close request')}
            </button>
            {status.isError && <p className="zv-support-error" role="alert">{t(status.error.message)}</p>}
            {!closed && !asTeam && <p className="zv-support-note">{t('Close it when your question is answered.')}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120 zv-support">
          <div className="container">
            <Link href={supportHref(as)} className="zv-ticket-back">← {t('Back to Support')}</Link>
            <div className="edash-head">
              <div>
                <h3 className="edash-title">{ticket ? ticket.subject : t('Support request')}</h3>
                {ticket && <p className="edash-sub">#{ticket.id} · {t('{count} messages', { count: ticket.messageCount })}</p>}
              </div>
            </div>
            {body}
          </div>
        </section>
      </main>
      <DashboardFooter />
    </>
  );
};

export default TicketPage;
