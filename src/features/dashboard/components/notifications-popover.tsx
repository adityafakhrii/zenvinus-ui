import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Badge, Popover, cn } from '@/components/ui';
import { useT } from '@/i18n';

interface NotificationEntry {
  id: string;
  title: string;
  detail: string;
  time: string;
  href: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationEntry[] = [
  {
    id: 'n1',
    title: 'Dataset batch #217 delivered',
    detail: '4,800 annotated images passed QA review',
    time: '2h ago',
    href: '/dashboard/projects',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Support ticket REQ-2084 replied',
    detail: 'Operations confirmed your 30% DP transfer',
    time: '4h ago',
    href: '/dashboard/support',
    unread: true,
  },
  {
    id: 'n3',
    title: 'QA flagged 214 items for re-review',
    detail: 'Receipt OCR Field Check batch 04',
    time: '1d ago',
    href: '/dashboard?as=expert',
    unread: false,
  },
];

/**
 * Custom Tailwind notification bell popover for the dashboard topbar & sidebar utility header.
 */
export function NotificationsPopover() {
  const { t } = useT();
  const [items, setItems] = useState<NotificationEntry[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = items.filter((i) => i.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const markRead = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)));
  };

  return (
    <Popover
      align="end"
      className="w-[min(340px,calc(100vw-24px))] p-0 overflow-hidden"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={t('{count} unread notifications', { count: unreadCount })}
          className={cn(
            'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border transition-colors duration-150 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-ink/40',
            open
              ? 'border-teal-ink bg-canvas text-ink'
              : 'border-[rgba(8,13,53,0.10)] bg-surface text-ink-secondary hover:border-ink/25 hover:text-ink',
          )}
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-teal-ink ring-2 ring-surface"
              aria-hidden="true"
            />
          )}
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">{t('Notifications')}</span>
              {unreadCount > 0 && (
                <Badge tone="mint" mono>
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-ink hover:text-navy transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t('Mark all read')}
              </button>
            )}
          </div>
          <ul className="m-0 max-h-72 list-none divide-y divide-line-subtle overflow-y-auto p-0">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => {
                    markRead(item.id);
                    close();
                  }}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 no-underline transition-colors hover:bg-canvas',
                    item.unread && 'bg-tint-mint/45',
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      item.unread ? 'bg-teal-ink' : 'bg-line',
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[13px] font-medium text-ink leading-snug">{t(item.title)}</p>
                    <p className="mt-0.5 mb-0 text-xs text-ink-secondary">{t(item.detail)}</p>
                    <span className="mt-1 block font-mono text-[11px] text-ink-muted tabular-nums">
                      {t(item.time)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Popover>
  );
}
