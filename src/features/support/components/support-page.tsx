import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Database,
  Flag,
  FolderKanban,
  Handshake,
  HelpCircle,
  ListChecks,
  Mail,
  UserCog,
} from 'lucide-react';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import { useT } from '@/i18n';
import { SearchInput } from '@/components/ui';
import { FAQ, SUPPORT_TOPICS, type SupportTopic } from '../data/faq';
import RequestForm from './request-form';
import TicketsCard from './tickets-card';

// Same inbox as the rest of the site (footer, contact page)
const SUPPORT_EMAIL = 'info@zenvinus.co.id';

type TopicFilter = SupportTopic | 'all';

const TOPIC_ICON: Readonly<Record<SupportTopic, React.ComponentType<{ className?: string; strokeWidth?: number }>>> = {
  start: Flag,
  projects: FolderKanban,
  tasks: ListChecks,
  datasets: Database,
  account: UserCog,
};

/**
 * Dashboard help: the user's support requests (tickets), then search and topic filter over the FAQ, and a request
 * form for anything the answers do not cover. Tickets live in the backend (/api/support).
 */
const SupportPage = () => {
  const { t } = useT();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<TopicFilter>('all');
  const [open, setOpen] = useState<string | null>(null);

  // Search matches the question and answer in the language on screen
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter(
      (f) => (topic === 'all' || f.topic === topic) && (!q || `${t(f.question)} ${t(f.answer)}`.toLowerCase().includes(q)),
    );
  }, [query, topic, t]);

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="min-h-[calc(100vh-140px)] bg-canvas py-8 sm:py-10">
          <div className="mx-auto max-w-[1280px] space-y-6 px-4 sm:px-6">
            <div>
              <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">{t('Support')}</h1>
              <p className="mt-1 mb-0 text-sm text-ink-muted">
                {t('Find an answer below, or send us a request and follow the replies here.')}
              </p>
            </div>

            <TicketsCard />

            <div className="space-y-3 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-4 sm:p-5">
              <SearchInput
                id="zv-support-q"
                value={query}
                onChange={setQuery}
                placeholder={t('Search help, for example "payment" or "invite"')}
                aria-label={t('Search help')}
                clearLabel={t('Clear search')}
                autoComplete="off"
              />

              <nav className="flex flex-wrap gap-2" aria-label={t('Help topics')}>
                <button
                  type="button"
                  aria-pressed={topic === 'all'}
                  onClick={() => setTopic('all')}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    topic === 'all'
                      ? 'border-navy bg-navy text-white'
                      : 'border-line bg-canvas text-ink-secondary hover:border-line-input hover:bg-white hover:text-ink'
                  }`}
                >
                  {t('All')}
                </button>
                {SUPPORT_TOPICS.map((tp) => {
                  const Icon = TOPIC_ICON[tp.key] || HelpCircle;
                  const active = topic === tp.key;
                  return (
                    <button
                      key={tp.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTopic(tp.key)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-navy bg-navy text-white'
                          : 'border-line bg-canvas text-ink-secondary hover:border-line-input hover:bg-white hover:text-ink'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {t(tp.label)}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-line-subtle pb-3">
                    <div>
                      <h2 className="m-0 text-base font-semibold text-ink">
                        {t('Frequently asked questions')}
                      </h2>
                      <p className="mt-0.5 mb-0 text-xs text-ink-muted">
                        {t('{count} answers', { count: items.length })}
                      </p>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <p className="m-0 py-6 text-center text-sm text-ink-muted">
                      {t('No answer matches your search. Send us a request and we will help.')}
                    </p>
                  ) : (
                    <ul className="m-0 list-none divide-y divide-line-subtle p-0">
                      {items.map((f) => {
                        const isOpen = open === f.id;
                        return (
                          <li key={f.id}>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`faq-${f.id}`}
                              onClick={() => setOpen(isOpen ? null : f.id)}
                              className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm font-semibold text-ink transition-colors hover:text-teal-ink"
                            >
                              <span>{t(f.question)}</span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                                  isOpen ? 'rotate-180 text-teal-ink' : ''
                                }`}
                                strokeWidth={1.75}
                                aria-hidden="true"
                              />
                            </button>
                            {isOpen && (
                              <div id={`faq-${f.id}`} className="pb-4 pr-6 text-sm leading-relaxed text-ink-secondary">
                                <p className="m-0">{t(f.answer)}</p>
                                {f.link && (
                                  <Link
                                    href={f.link.href}
                                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-ink hover:underline"
                                  >
                                    {t(f.link.label)}
                                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                                  </Link>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-5 lg:col-span-4">
                <RequestForm topic={topic === 'all' ? undefined : topic} />

                <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-5 sm:p-6">
                  <h3 className="mb-3 text-base font-semibold text-ink">{t('Other ways to reach us')}</h3>
                  <ul className="m-0 list-none space-y-3 p-0 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-navy">
                        <Mail className="h-4 w-4" strokeWidth={1.6} />
                      </span>
                      <div>
                        <span className="block text-xs text-ink-muted">{t('Email')}</span>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-ink hover:text-teal-ink">
                          {SUPPORT_EMAIL}
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-navy">
                        <Handshake className="h-4 w-4" strokeWidth={1.6} />
                      </span>
                      <div>
                        <span className="block text-xs text-ink-muted">{t('Sales and partnerships')}</span>
                        <Link href="/contact" className="font-medium text-ink hover:text-teal-ink">
                          {t('Contact page')}
                        </Link>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <DashboardFooter />
    </>
  );
};

export default SupportPage;
