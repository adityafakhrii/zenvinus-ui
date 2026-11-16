import React from 'react';
import { useT } from '@/i18n';
import { Badge, type BadgeTone } from '@/components/ui';
import { statusMeta } from '../utils/links';
import type { TicketStatus } from '../types/ticket';

export interface TicketStatusBadgeProps {
  status: TicketStatus;
  /** Label it for the support team instead of the requester */
  asTeam?: boolean;
}

const TONE_MAP: Readonly<Record<string, BadgeTone>> = {
  blue: 'blue',
  mint: 'mint',
  green: 'mint',
  purple: 'blue',
  orange: 'orange',
  amber: 'amber',
  red: 'red',
};

const TicketStatusBadge = ({ status, asTeam = false }: TicketStatusBadgeProps) => {
  const { t } = useT();
  const meta = statusMeta(status, asTeam);
  return (
    <Badge tone={TONE_MAP[meta.tone] || 'neutral'} dot>
      {t(meta.label)}
    </Badge>
  );
};

export default TicketStatusBadge;
