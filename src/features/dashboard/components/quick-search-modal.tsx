import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Award,
  ClipboardCheck,
  CreditCard,
  Database,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  ListChecks,
  Settings,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Badge, Modal, SearchInput, cn } from '@/components/ui';
import { useT } from '@/i18n';
import { QUICK_SEARCH_TARGETS, type NavIconKey } from '../data/navigation';

export function NavLucideIcon({ icon, className }: { icon: NavIconKey; className?: string }) {
  const props = { className: cn('h-4 w-4 shrink-0', className), strokeWidth: 1.5, 'aria-hidden': true as const };
  switch (icon) {
    case 'dashboard':
      return <LayoutDashboard {...props} />;
    case 'projects':
      return <FolderKanban {...props} />;
    case 'team':
      return <Users {...props} />;
    case 'billing':
      return <CreditCard {...props} />;
    case 'datasets':
      return <Database {...props} />;
    case 'studio':
      return <Layers {...props} />;
    case 'support':
      return <LifeBuoy {...props} />;
    case 'tasks':
      return <ListChecks {...props} />;
    case 'rewards':
      return <Award {...props} />;
    case 'quality':
      return <ClipboardCheck {...props} />;
    case 'lab':
      return <FlaskConical {...props} />;
    case 'settings':
      return <Settings {...props} />;
  }
}

export interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Global Quick Search command modal (Ctrl+K / Cmd+K) across workspaces, tasks, datasets, and settings.
 */
export function QuickSearchModal({ open, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const { t } = useT();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_SEARCH_TARGETS;
    return QUICK_SEARCH_TARGETS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={t('Quick search')}
      description={t('Jump directly to any workspace, project flow, dataset studio, or settings.')}
    >
      <div
        onKeyDown={(e) => {
          if (results.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % results.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
          } else if (e.key === 'Enter') {
            const picked = results[activeIndex];
            if (picked) {
              e.preventDefault();
              navigateTo(picked.href);
            }
          }
        }}
        className="flex flex-col gap-3"
      >
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setActiveIndex(0);
          }}
          placeholder={t('Search')}
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto rounded-xl border border-line-subtle bg-surface">
          {results.length === 0 ? (
            <p className="m-0 py-8 text-center text-sm text-ink-muted">{t('No matching destinations.')}</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-line-subtle p-1">
              {results.map((item, idx) => {
                const active = idx === activeIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigateTo(item.href)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors cursor-pointer',
                        active ? 'bg-tint-mint text-ink' : 'text-ink hover:bg-canvas',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <NavLucideIcon
                          icon={item.icon}
                          className={active ? 'text-teal-ink' : 'text-ink-muted'}
                        />
                        <span className="truncate text-sm font-medium">{t(item.label)}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge tone="neutral">{t(item.category)}</Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
