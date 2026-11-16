import Link from 'next/link';
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/services/api';
import useMounted from '@/hooks/use-mounted';
import { useT } from '@/i18n';
import { formatDateTime } from '@/utils/format';
import { BentoSkeleton, Button, ConfirmDialog, EmptyState, ErrorState, Textarea } from '@/components/ui';
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
  const [confirmOpen, setConfirmOpen] = useState(false);

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
  const status = useMutation({
    mutationFn: (to: 'open' | 'closed') => setTicketStatus(id ?? 0, to),
    onSuccess: (next) => {
      applied(next);
      setConfirmOpen(false);
    },
  });

  const onReply = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reply.trim()) send.mutate(reply.trim());
  };

  const notFound = (mounted && router.isReady && id === null) || (error instanceof ApiError && error.status === 404);
  const asTeam = Boolean(ticket && !ticket.isRequester);

  let body: React.ReactNode;
  if (!mounted || sessionLoading || (user && isLoading && !notFound)) {
    body = <BentoSkeleton />;
  } else if (!user) {
    body = (
      <EmptyState
        title={t('Sign in to read and answer this request.')}
        action={
          <Button variant="primary" size="sm" href={`/login?next=${encodeURIComponent(router.asPath)}`}>
            {t('Sign in')}
          </Button>
        }
      />
    );
  } else if (notFound) {
    body = (
      <EmptyState
        title={t('This request does not exist, or it belongs to another account.')}
        action={
          <Button variant="secondary" size="sm" href={supportHref(as)}>
            {t('Back to Support')}
          </Button>
        }
      />
    );
  } else if (error || !ticket) {
    body = (
      <ErrorState message={t(error instanceof Error ? error.message : 'Something went wrong. Please try again.')} />
    );
  } else {
    const closed = ticket.status === 'closed';
    body = (
      <>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 sm:p-6">
              <ol className="m-0 list-none space-y-3 p-0">
                {ticket.messages.map((m) => {
                  const mine = m.fromStaff === asTeam;
                  return (
                    <li
                      key={m.id}
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm sm:max-w-[85%] ${
                        m.fromStaff
                          ? 'border border-[#CCF2EF] bg-[#F1FBFA]'
                          : 'border border-[#E5E7EB] bg-[#F3F5F8]'
                      } ${mine ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                        <strong className="font-semibold text-[#18181B]">
                          {m.fromStaff ? t('Zenvinus team') : m.author.name || t('Requester')}
                        </strong>
                        {m.fromStaff && m.author.name && <span>{m.author.name}</span>}
                        <span className="ml-auto font-mono text-[11px] text-[#9CA3AF]">
                          <time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time>
                        </span>
                      </div>
                      <p className="m-0 whitespace-pre-wrap leading-relaxed text-[#18181B]">{m.body}</p>
                    </li>
                  );
                })}
              </ol>

              <form className="mt-6 space-y-3 border-t border-[#F0F0F2] pt-5" onSubmit={onReply}>
                <Textarea
                  id="zv-reply"
                  label={asTeam ? t('Reply as the Zenvinus team') : t('Your reply')}
                  rows={4}
                  maxLength={5000}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t('Write a message')}
                  disabled={send.isPending}
                  hint={
                    closed
                      ? asTeam
                        ? t('This request is closed. Replying will mark it answered.')
                        : t('This request is closed. Replying opens it again.')
                      : undefined
                  }
                />

                {send.isError && (
                  <p className="m-0 text-xs font-medium text-[#DC2626]" role="alert">
                    {t(send.error.message)}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={send.isPending || !reply.trim()}
                    loading={send.isPending}
                    leftIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
                  >
                    {send.isPending ? t('Sending…') : t('Send')}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 sm:p-6">
              <h2 className="mb-3 text-base font-semibold text-[#18181B]">{t('Details')}</h2>
              <dl className="m-0 divide-y divide-[#F0F0F2] text-sm">
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs font-medium text-[#6B7280]">{t('Status')}</dt>
                  <dd className="m-0">
                    <TicketStatusBadge status={ticket.status} asTeam={asTeam} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs font-medium text-[#6B7280]">{t('Topic')}</dt>
                  <dd className="m-0 font-medium text-[#18181B]">{t(topicLabel(ticket.topic))}</dd>
                </div>
                {ticket.reference && (
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-xs font-medium text-[#6B7280]">{t('Reference')}</dt>
                    <dd className="m-0 font-mono text-xs font-semibold text-[#18181B]">{ticket.reference}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs font-medium text-[#6B7280]">{t('Opened')}</dt>
                  <dd className="m-0 text-xs text-[#52525B]">{formatDateTime(ticket.createdAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs font-medium text-[#6B7280]">{t('Last message')}</dt>
                  <dd className="m-0 text-xs text-[#52525B]">{formatDateTime(ticket.lastMessageAt)}</dd>
                </div>
                {ticket.requester && (
                  <div className="flex flex-col gap-0.5 py-2.5">
                    <dt className="text-xs font-medium text-[#6B7280]">{t('Requester')}</dt>
                    <dd className="m-0 text-xs text-[#18181B]">
                      <div className="font-semibold">{ticket.requester.name}</div>
                      <a href={`mailto:${ticket.requester.email}`} className="text-[#008C85] hover:underline">
                        {ticket.requester.email}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 space-y-2">
                <Button
                  variant={closed ? 'secondary' : 'outline'}
                  block
                  disabled={status.isPending}
                  leftIcon={
                    closed ? (
                      <RotateCcw className="h-4 w-4" strokeWidth={1.6} />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.6} />
                    )
                  }
                  onClick={() => setConfirmOpen(true)}
                >
                  {closed ? t('Reopen request') : t('Close request')}
                </Button>

                {status.isError && (
                  <p className="m-0 text-xs font-medium text-[#DC2626]" role="alert">
                    {t(status.error.message)}
                  </p>
                )}

                {!closed && !asTeam && (
                  <p className="m-0 text-center text-xs text-[#6B7280]">
                    {t('Close it when your question is answered.')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          loading={status.isPending}
          tone={closed ? 'primary' : 'danger'}
          title={closed ? t('Reopen request') : t('Close request')}
          description={
            closed
              ? t('This request is closed. Replying opens it again.')
              : t('Close it when your question is answered.')
          }
          confirmLabel={closed ? t('Reopen request') : t('Close request')}
          cancelLabel={t('Cancel')}
          onConfirm={() => status.mutate(closed ? 'open' : 'closed')}
        />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="min-h-[calc(100vh-140px)] bg-[#F9FAFB] py-8 sm:py-10">
          <div className="mx-auto max-w-[1280px] space-y-5 px-4 sm:px-6">
            <Link
              href={supportHref(as)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#18181B]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              {t('Back to Support')}
            </Link>

            <div>
              <h1 className="m-0 text-2xl font-bold tracking-tight text-[#18181B]">
                {ticket ? ticket.subject : t('Support request')}
              </h1>
              {ticket && (
                <p className="mt-1 mb-0 text-xs text-[#6B7280]">
                  <span className="font-mono">#{ticket.id}</span> ·{' '}
                  {t('{count} messages', { count: ticket.messageCount })}
                </p>
              )}
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
