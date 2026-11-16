import React from 'react';
import { useT } from '@/i18n';
import { statusMeta } from '../utils/links';
import type { TicketStatus } from '../types/ticket';

export interface TicketStatusBadgeProps {
  status: TicketStatus;
  /** Label it for the support team instead of the requester */
  asTeam?: boolean;
}

const TicketStatusBadge = ({ status, asTeam = false }: TicketStatusBadgeProps) => {
  const { t } = useT();
  const meta = statusMeta(status, asTeam);
  return <span className={`edash-status edash-status-${meta.tone}`}>{t(meta.label)}</span>;
};

export default TicketStatusBadge;
