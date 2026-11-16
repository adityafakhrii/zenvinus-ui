/**
 * Dummy Support Ticket service for local UI/UX mode (replaces remote /api/support/* calls).
 */
import { ApiError } from '@/services/api';
import { DUMMY_TICKETS } from '../data/dummy-tickets';
import type { NewTicket, TicketDetail, TicketListResponse, TicketScope, TicketStatus } from '../types/ticket';

export const supportKeys = {
  all: ['support'] as const,
  list: (scope: TicketScope, status: TicketStatus | '') => ['support', 'tickets', scope, status] as const,
  ticket: (id: number) => ['support', 'ticket', id] as const,
};

let nextMessageId = 100;

const findTicket = (id: number): TicketDetail => {
  const found = DUMMY_TICKETS.find((t) => t.id === id);
  if (!found) {
    throw new ApiError(404, 'Ticket not found.', null);
  }
  return found;
};

export const fetchTickets = async (scope: TicketScope, status: TicketStatus | ''): Promise<TicketListResponse> => {
  const filtered = DUMMY_TICKETS.filter((t) => {
    if (scope === 'mine' && !t.isRequester) return false;
    if (status && t.status !== status) return false;
    return true;
  });

  return {
    data: filtered.map(({ messages: _m, isRequester: _r, ...summary }) => summary),
    total: filtered.length,
    canManage: true,
  };
};

export const fetchTicket = async (id: number): Promise<TicketDetail> => {
  const t = findTicket(id);
  return { ...t, messages: [...t.messages] };
};

export const createTicket = async (input: NewTicket): Promise<TicketDetail> => {
  const now = new Date().toISOString();
  const id = Math.max(100, ...DUMMY_TICKETS.map((t) => t.id)) + 1;
  nextMessageId += 1;
  const created: TicketDetail = {
    id,
    topic: input.topic,
    subject: input.subject.trim(),
    reference: input.reference?.trim() || '',
    status: 'open',
    messageCount: 1,
    lastMessageAt: now,
    createdAt: now,
    requester: { name: 'Dev Preview', email: 'dev@zenvinus.local' },
    isRequester: true,
    messages: [
      {
        id: nextMessageId,
        body: input.message.trim(),
        fromStaff: false,
        author: { name: 'Dev Preview' },
        createdAt: now,
      },
    ],
  };
  DUMMY_TICKETS.unshift(created);
  return { ...created, messages: [...created.messages] };
};

export const replyToTicket = async (id: number, body: string): Promise<TicketDetail> => {
  const t = findTicket(id);
  const now = new Date().toISOString();
  nextMessageId += 1;
  const fromStaff = !t.isRequester;
  t.messages.push({
    id: nextMessageId,
    body: body.trim(),
    fromStaff,
    author: { name: fromStaff ? 'Zenvinus Support' : 'Dev Preview' },
    createdAt: now,
  });
  t.messageCount = t.messages.length;
  t.lastMessageAt = now;
  t.status = fromStaff ? 'answered' : 'open';
  return { ...t, messages: [...t.messages] };
};

export const setTicketStatus = async (
  id: number,
  status: Extract<TicketStatus, 'open' | 'closed'>,
): Promise<TicketDetail> => {
  const t = findTicket(id);
  t.status = status;
  return { ...t, messages: [...t.messages] };
};
