import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import { useT } from '@/i18n';
import { FAQ, SUPPORT_TOPICS, type SupportTopic } from '../data/faq';
import RequestForm from './request-form';
import TicketsCard from './tickets-card';

// Same inbox as the rest of the site (footer, contact page)
const SUPPORT_EMAIL = 'info@zenvinus.co.id';

type TopicFilter = SupportTopic | 'all';

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
    return FAQ.filter((f) => (topic === 'all' || f.topic === topic) && (!q || `${t(f.question)} ${t(f.answer)}`.toLowerCase().includes(q)));
  }, [query, topic, t]);

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120 zv-support">
          <div className="container">
            <div className="edash-head">
              <div>
                <h3 className="edash-title">{t('Support')}</h3>
                <p className="edash-sub">{t('Find an answer below, or send us a request and follow the replies here.')}</p>
              </div>
            </div>

            <TicketsCard />

            <div className="edash-card zv-support-search">
              <label htmlFor="zv-support-q" className="visually-hidden">{t('Search help')}</label>
              <i className="fa-regular fa-magnifying-glass" aria-hidden="true"></i>
              <input
                id="zv-support-q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search help, for example "payment" or "invite"')}
                autoComplete="off"
              />
            </div>

            <nav className="zv-support-topics" aria-label={t('Help topics')}>
              <button type="button" className={topic === 'all' ? 'is-active' : undefined} aria-pressed={topic === 'all'} onClick={() => setTopic('all')}>
                {t('All')}
              </button>
              {SUPPORT_TOPICS.map((tp) => (
                <button key={tp.key} type="button" className={topic === tp.key ? 'is-active' : undefined} aria-pressed={topic === tp.key} onClick={() => setTopic(tp.key)}>
                  <i className={tp.icon} aria-hidden="true"></i> {t(tp.label)}
                </button>
              ))}
            </nav>

            <div className="row g-4">
              <div className="col-xl-8">
                <div className="edash-card">
                  <div className="edash-card-head">
                    <div>
                      <h4 className="edash-card-title">{t('Frequently asked questions')}</h4>
                      <p className="edash-card-sub">{t('{count} answers', { count: items.length })}</p>
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <p className="zv-support-empty">
                      {t('No answer matches your search. Send us a request and we will help.')}
                    </p>
                  ) : (
                    <ul className="zv-support-faq">
                      {items.map((f) => {
                        const isOpen = open === f.id;
                        return (
                          <li key={f.id} className={isOpen ? 'is-open' : undefined}>
                            <button type="button" aria-expanded={isOpen} aria-controls={`faq-${f.id}`} onClick={() => setOpen(isOpen ? null : f.id)}>
                              <span>{t(f.question)}</span>
                              <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
                            </button>
                            {isOpen && (
                              <div id={`faq-${f.id}`} className="zv-support-answer">
                                <p>{t(f.answer)}</p>
                                {f.link && <Link href={f.link.href}>{t(f.link.label)} →</Link>}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="col-xl-4">
                <RequestForm topic={topic === 'all' ? undefined : topic} />

                <div className="edash-card mt-4">
                  <h4 className="edash-card-title">{t('Other ways to reach us')}</h4>
                  <ul className="zv-support-channels">
                    <li>
                      <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                      <div>
                        <span>{t('Email')}</span>
                        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                      </div>
                    </li>
                    <li>
                      <i className="fa-regular fa-handshake" aria-hidden="true"></i>
                      <div>
                        <span>{t('Sales and partnerships')}</span>
                        <Link href="/contact">{t('Contact page')}</Link>
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
