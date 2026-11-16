import React, { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useT } from '@/i18n';
import { Button, CustomSelect, TextInput, Textarea } from '@/components/ui';
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

  const [pickedTopic, setPickedTopic] = useState<string>(topic ?? '');
  const [subject, setSubject] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [topicError, setTopicError] = useState('');

  useEffect(() => {
    if (topic) {
      setPickedTopic(topic);
      setTopicError('');
    }
  }, [topic]);

  const topicOptions = useMemo(
    () => [
      ...SUPPORT_TOPICS.map((tp) => ({ value: tp.key, label: t(tp.label) })),
      { value: 'other', label: t('Something else') },
    ],
    [t],
  );

  const create = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.all });
      router.push(ticketHref(ticket.id, as));
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isTopic(pickedTopic)) {
      setTopicError(t('Choose a topic'));
      return;
    }
    setTopicError('');
    create.mutate({
      topic: pickedTopic,
      subject: subject.trim(),
      reference: reference.trim(),
      message: message.trim(),
    });
  };

  const signedOut = !user && !sessionLoading;

  return (
    <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 sm:p-6" id="request">
      <div className="mb-4 border-b border-[#F0F0F2] pb-3">
        <h3 className="m-0 text-base font-semibold text-[#18181B]">{t('Send a request')}</h3>
        <p className="mt-1 mb-0 text-xs text-[#6B7280]">
          {t('Add the project, task or invoice ID so we can find it faster.')}
        </p>
      </div>

      {signedOut ? (
        <div className="space-y-3 rounded-xl border border-[#EAEAEA] bg-[#F9FAFB] p-4 text-center">
          <p className="m-0 text-xs text-[#6B7280]">{t('Sign in to send a request and follow the replies here.')}</p>
          <Button
            variant="primary"
            size="sm"
            href={`/login?next=${encodeURIComponent(router.asPath || '/dashboard/support')}`}
          >
            {t('Sign in')}
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <fieldset disabled={create.isPending || !user} className="space-y-4 border-0 p-0">
            <CustomSelect
              id="sp-topic"
              label={`${t('Topic')} *`}
              placeholder={t('Choose a topic')}
              options={topicOptions}
              value={pickedTopic}
              error={topicError || undefined}
              onChange={(val) => {
                setPickedTopic(val);
                setTopicError('');
              }}
            />

            <TextInput
              id="sp-subject"
              label={`${t('Subject')} *`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={3}
              maxLength={200}
            />

            <TextInput
              id="sp-reference"
              label={t('Project, task or invoice ID')}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="PRJ-1041"
              maxLength={60}
            />

            <Textarea
              id="sp-message"
              label={`${t('What happened?')} *`}
              rows={5}
              required
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('What you did, what you expected, and what you saw instead.')}
            />

            <Button
              type="submit"
              variant="primary"
              block
              disabled={create.isPending || !user}
              loading={create.isPending}
              leftIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
            >
              {create.isPending ? t('Sending…') : t('Send request')}
            </Button>
          </fieldset>

          {create.isError && (
            <p className="m-0 text-xs font-medium text-[#DC2626]" role="alert">
              {t(create.error.message)}
            </p>
          )}
          <p className="m-0 text-xs text-[#6B7280]">{t('Replies appear in "Your requests" above.')}</p>
        </form>
      )}
    </div>
  );
};

export default RequestForm;
