import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Building2, Cpu, Database, ListTodo, Mail, Newspaper, Sparkles } from 'lucide-react';
import { Badge, Modal, SearchInput } from '@/components/ui';
import { useT } from '@/i18n';

export interface SearchPopupProps {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

interface PublicDestination {
  id: string;
  label: string;
  category: string;
  href: string;
  icon: typeof Database;
}

const PUBLIC_DESTINATIONS: ReadonlyArray<PublicDestination> = [
  { id: 'tasks', label: 'Tasks', category: 'Community', href: '/tasks', icon: ListTodo },
  { id: 'datasets', label: 'Datasets', category: 'Community', href: '/datasets', icon: Database },
  { id: 'models', label: 'Models', category: 'Community', href: '/models', icon: Cpu },
  { id: 'service', label: 'Our Services', category: 'Company', href: '/service', icon: Sparkles },
  { id: 'about', label: 'About Zenvinus', category: 'Company', href: '/about', icon: Building2 },
  { id: 'blog', label: 'Blog', category: 'Media', href: '/blog', icon: BookOpen },
  { id: 'news', label: 'News', category: 'Media', href: '/news', icon: Newspaper },
  { id: 'contact', label: 'Contact Us', category: 'Company', href: '/contact', icon: Mail },
];

/**
 * Public site quick search modal powered by the custom Modal & SearchInput primitives.
 */
const SearchPopup = ({ searchOpen, setSearchOpen }: SearchPopupProps) => {
  const { t } = useT();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PUBLIC_DESTINATIONS;
    return PUBLIC_DESTINATIONS.filter(
      (item) => t(item.label).toLowerCase().includes(q) || t(item.category).toLowerCase().includes(q),
    );
  }, [query, t]);

  const handleClose = () => {
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <Modal
      open={searchOpen}
      onClose={handleClose}
      title={t('Quick search')}
      description={t('Jump directly to Zenvinus tasks, datasets, models, services, and editorial resources.')}
      size="md"
    >
      <div className="flex flex-col gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('Type here to search...')}
          autoFocus
        />

        {matches.length === 0 ? (
          <p className="m-0 py-8 text-center text-sm text-ink-muted">{t('No matching destinations.')}</p>
        ) : (
          <ul className="m-0 flex max-h-[320px] list-none flex-col gap-1 overflow-y-auto p-0">
            {matches.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={handleClose}
                    className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-ink no-underline transition-colors hover:bg-canvas"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-subtle bg-canvas text-ink-secondary group-hover:border-teal-ink/30 group-hover:bg-tint-mint group-hover:text-teal-ink">
                        <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="truncate text-sm font-medium">{t(item.label)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone="neutral">{t(item.category)}</Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-subtle group-hover:text-teal-ink" strokeWidth={1.6} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default SearchPopup;
