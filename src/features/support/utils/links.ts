import type { ParsedUrlQuery } from 'querystring';
import { SUPPORT_TOPICS } from '../data/faq';
import type { TicketStatus, TicketTopic } from '../types/ticket';

/** ?as= of the dashboard workspace, kept on support links so the contributor menu stays */
export const workspaceOf = (query: ParsedUrlQuery): string | undefined => (typeof query.as === 'string' ? query.as : undefined);

export const supportHref = (as?: string): string => (as ? `/dashboard/support?as=${encodeURIComponent(as)}` : '/dashboard/support');

export const ticketHref = (id: number, as?: string): string =>
  `/dashboard/support/ticket?id=${id}${as ? `&as=${encodeURIComponent(as)}` : ''}`;

/** English label (i18n key) of a topic */
export const topicLabel = (topic: TicketTopic): string => SUPPORT_TOPICS.find((t) => t.key === topic)?.label ?? 'Something else';

interface StatusMeta {
  /** English label (i18n key) */
  label: string;
  tone: 'amber' | 'blue' | 'mint';
}

/** Status as the requester reads it, or as the team reads it (open = needs a reply from them) */
export const statusMeta = (status: TicketStatus, asTeam: boolean): StatusMeta => {
  if (status === 'open') return { label: asTeam ? 'Needs reply' : 'Waiting for the team', tone: 'amber' };
  if (status === 'answered') return { label: asTeam ? 'Answered' : 'Replied by the team', tone: 'blue' };
  return { label: 'Closed', tone: 'mint' };
};
