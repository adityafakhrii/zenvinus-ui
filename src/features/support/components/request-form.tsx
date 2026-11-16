import Link from 'next/link';
import React from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { useT } from '@/i18n';
import { SUPPORT_TOPICS, type SupportTopic } from '../data/faq';
import { createTicket, supportKeys } from '../services/support-api';
import { ticketHref, workspaceOf } from '../utils/links';
import type { TicketTopic } from '../types/ticket';

export interface RequestFormProps {
  /** Topic picked in the FAQ filter, preselected in the form */
  topic?: SupportTopic;
}

const isTopic = (v: string): v is TicketTopic => v === 'other' || SUPPORT_TOPICS.some((t) => t.key === v);

/** Opens a support ticket, then shows its conversation */
const RequestForm = ({ topic }: RequestFormProps) => {
  const { t } = useT();
  const router = useRouter();
  const as = workspaceOf(router.query);
  const queryClient = useQueryClient();
  const { user, isLoading: sessionLoading } = useAuth();

  const create = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.all });
      router.push(ticketHref(ticket.id, as));
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const field = (name: string) => String(f.get(name) ?? '').trim();
    const picked = field('topic');
    if (!isTopic(picked)) return;
    create.mutate({ topic: picked, subject: field('subject'), reference: field('reference'), message: field('message') });
  };

  const signedOut = !user && !sessionLoading;

  return (
    <div className="edash-card" id="request">
      <div className="edash-card-head">
        <div>
          <h4 className="edash-card-title">{t('Send a request')}</h4>
          <p className="edash-card-sub">{t('Add the project, task or invoice ID so we can find it faster.')}</p>
        </div>
      </div>
      {signedOut ? (
        <div className="zv-tickets-empty">
          <p>{t('Sign in to send a request and follow the replies here.')}</p>
          <Link href={`/login?next=${encodeURIComponent(router.asPath || '/dashboard/support')}`} className="edash-btn edash-btn-sm">{t('Sign in')}</Link>
        </div>
      ) : (
        <form className="zv-support-form" onSubmit={onSubmit}>
          <fieldset disabled={create.isPending || !user}>
            <div className="edash-field">
              <label htmlFor="sp-topic">{t('Topic')} *</label>
              <select id="sp-topic" name="topic" className="edash-input" required defaultValue={topic ?? ''} key={topic ?? 'none'}>
                <option value="" disabled>{t('Choose a topic')}</option>
                {SUPPORT_TOPICS.map((tp) => <option key={tp.key} value={tp.key}>{t(tp.label)}</option>)}
                <option value="other">{t('Something else')}</option>
              </select>
            </div>
            <div className="edash-field">
              <label htmlFor="sp-subject">{t('Subject')} *</label>
              <input id="sp-subject" name="subject" className="edash-input" required minLength={3} maxLength={200} />
            </div>
            <div className="edash-field">
              <label htmlFor="sp-reference">{t('Project, task or invoice ID')}</label>
              <input id="sp-reference" name="reference" className="edash-input" placeholder="PRJ-1041" maxLength={60} />
            </div>
            <div className="edash-field">
              <label htmlFor="sp-message">{t('What happened?')} *</label>
              <textarea id="sp-message" name="message" className="edash-input" rows={5} required maxLength={5000} placeholder={t('What you did, what you expected, and what you saw instead.')}></textarea>
            </div>
            <button type="submit" className="edash-btn w-100">
              <i className="fa-solid fa-paper-plane"></i> {create.isPending ? t('Sending…') : t('Send request')}
            </button>
          </fieldset>
          {create.isError && <p className="zv-support-error" role="alert">{t(create.error.message)}</p>}
          <p className="zv-support-note">{t('Replies appear in "Your requests" above.')}</p>
        </form>
      )}
    </div>
  );
};

export default RequestForm;
