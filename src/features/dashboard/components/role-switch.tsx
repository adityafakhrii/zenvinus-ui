import Link from 'next/link';
import React from 'react';
import { Building2, Settings2, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { useT } from '@/i18n';
import type { DashboardRole } from '../types/dashboard';

interface RoleLink {
  key: DashboardRole;
  label: string;
  href: string;
}

const ROLES: ReadonlyArray<RoleLink> = [
  { key: 'enterprise', label: 'Enterprise', href: '/dashboard' },
  { key: 'community', label: 'Community', href: '/dashboard?as=community' },
  { key: 'internal', label: 'Internal', href: '/dashboard?as=internal' },
  { key: 'expert', label: 'Expert', href: '/dashboard?as=expert' },
];

function RoleIcon({ role }: { role: DashboardRole }) {
  const cls = 'h-3.5 w-3.5 shrink-0';
  switch (role) {
    case 'enterprise':
      return <Building2 className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case 'community':
      return <Users className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case 'internal':
      return <Settings2 className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case 'expert':
      return <ShieldCheck className={cls} strokeWidth={1.5} aria-hidden="true" />;
  }
}

export interface RoleSwitchProps {
  as?: DashboardRole;
  variant?: 'bar' | 'compact';
  className?: string;
}

/**
 * Workspace switcher across Enterprise, Community, Internal, and Expert memberships.
 */
const RoleSwitch = ({ as = 'enterprise', variant = 'bar', className }: RoleSwitchProps) => {
  const { t } = useT();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-[10px] border border-[rgba(8,13,53,0.08)] bg-canvas p-1',
        variant === 'compact' && 'w-full grid grid-cols-2 gap-1',
        className,
      )}
      role="tablist"
      aria-label={t('Workspace role')}
    >
      {ROLES.map((r) => {
        const active = as === r.key;
        return (
          <Link
            key={r.key}
            href={r.href}
            role="tab"
            aria-selected={active}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-xs font-medium no-underline whitespace-nowrap',
              'transition-[background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
              active
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(2,6,38,0.06)]'
                : 'text-ink-secondary hover:text-ink',
            )}
          >
            <span className={active ? 'text-teal-ink' : 'text-ink-muted'}>
              <RoleIcon role={r.key} />
            </span>
            <span>{t(r.label)}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default RoleSwitch;
