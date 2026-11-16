/**
 * Support tickets. The JSON of /api/support (zenvinus-backend/internal/support/service.go); the API sends camelCase
 * and the UI renders these shapes directly, so there is no mapper.
 */
import type { IsoDateString } from '@/types/api';
import type { SupportTopic } from '../data/faq';

/** open: waits for the team · answered: the team replied, waits for the requester · closed */
export type TicketStatus = 'open' | 'answered' | 'closed';

/** Help topic of a ticket; "other" when none of the FAQ topics fits */
export type TicketTopic = SupportTopic | 'other';

export interface TicketPerson {
  name: string;
  /** Only sent for the requester, and only to the team */
  email?: string;
}

export interface TicketSummary {
  id: number;
  topic: TicketTopic;
  subject: string;
  reference: string;
  status: TicketStatus;
  messageCount: number;
  lastMessageAt: IsoDateString;
  createdAt: IsoDateString;
  /** Filled for the team only */
  requester?: TicketPerson;
}

export interface TicketMessage {
  id: number;
  body: string;
  /** Written by the Zenvinus team */
  fromStaff: boolean;
  author: TicketPerson;
  createdAt: IsoDateString;
}

export interface TicketDetail extends TicketSummary {
  messages: TicketMessage[];
  /** The caller opened this ticket */
  isRequester: boolean;
}

/** GET /api/support/tickets */
export interface TicketListResponse {
  data: TicketSummary[];
  total: number;
  /** The caller is on the support team (support.manage) */
  canManage: boolean;
}

export interface NewTicket {
  topic: TicketTopic;
  subject: string;
  reference?: string;
  message: string;
}

/** Whose tickets to list: the caller's, or every ticket (team only) */
export type TicketScope = 'mine' | 'all';
