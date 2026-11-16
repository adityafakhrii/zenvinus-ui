import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, DIFFICULTIES, taskHref } from '../../services/tasks-api';
import type { DifficultyFilter } from '../../services/tasks-api';
import { difficultyTone } from '../../data/tasks';
import type { TaskListParams } from '../../types/task';
import { DATA_TYPES } from '@/config/data-types';
import type { DataType } from '@/config/data-types';
import { useT } from '@/i18n';
import { SkeletonRows } from '@/components/ui/skeleton';

const DTYPE_LABELS: Record<DataType, string> = {
  image: 'Image', text: 'Text', audio: 'Audio', video: 'Video',
  '3d': '3D', document: 'Document', tabular: 'Tabular',
  geospatial: 'Geospatial', time_series: 'Time Series',
};

const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'reward', label: 'Highest Reward' },
  { value: 'deadline', label: 'Ending Soon' },
];

const TasksArea = () => {
  const { t, locale } = useT();
  const [query, setQuery] = useState('');
  const [selDtypes, setSelDtypes] = useState<Set<string>>(new Set());
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [diff, setDiff] = useState<DifficultyFilter>('All');
  const [sort, setSort] = useState('newest');

  const toggleSet = (setter: Dispatch<SetStateAction<Set<string>>>) => (value: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  const toggleDtype = toggleSet(setSelDtypes);
  const toggleCat = toggleSet(setSelCats);
  const hasFilters = query.trim() !== '' || selDtypes.size > 0 || selCats.size > 0 || diff !== 'All';

  const params = useMemo(() => {
    const p: TaskListParams = { sort };
    if (query.trim()) p.q = query.trim();
    if (selDtypes.size) p.dataType = [...selDtypes];
    if (diff !== 'All') p.difficulty = diff.toLowerCase();
    return p;
  }, [query, selDtypes, diff, sort]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', params],
    queryFn: () => fetchTasks(params),
    placeholderData: (prev) => prev,
  });

  const tasks = useMemo(() => data?.cards || [], [data]);
  const facets = data?.facets;

  // Category facet = backend task categories (slug+name+count)
  const catFacets = facets?.categories?.filter((c) => c.count > 0) || [];
  const countByDtype = (d: string) => facets?.dataTypes?.find((x) => x.value === d)?.count || 0;
  const countByDiff = (d: DifficultyFilter) =>
    d === 'All' ? (facets?.total ?? data?.total ?? 0) : (facets?.difficulties?.find((x) => x.value === d.toLowerCase())?.count || 0);

  // Client-side category tag filter (API filters by categorySlug)
  const visible = useMemo(() => {
    if (!selCats.size) return tasks;
    return tasks.filter((t) => t.tags.some((tag) => [...selCats].some((s) => tag.toLowerCase().includes(s))));
  }, [tasks, selCats]);

  const clearAll = () => {
    setSelDtypes(new Set());
    setSelCats(new Set());
    setDiff('All');
    setQuery('');
  };

  return (
    <section className="tp-portfolio-area pt-120 pb-90">
      <div className="container">
        <div className="pf2-head">
          <div>
            <h3 className="pf2-title">{t('Task List')}</h3>
            <p className="pf2-sub">{t('Explore real-world tasks and start contributing to AI projects.')}</p>
          </div>
          <div className="pf2-controls">
            <div className="pf2-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder={t('Search tasks...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="pf2-sort">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pf2-layout">
          <aside className="pf2-sidebar">
            <div className="pf2-side-head">
              <h4><i className="fa-solid fa-filter"></i> {t('Filters')}</h4>
              <button type="button" className="pf2-clear" onClick={clearAll}>{t('Clear All')}</button>
            </div>

            <div className="pf2-group">
              <h5>{t('Data Type')}</h5>
              {DATA_TYPES.map((d) => (
                <label key={d} className="pf2-check">
                  <input
                    type="checkbox"
                    checked={selDtypes.has(d)}
                    onChange={() => toggleDtype(d)}
                  />
                  <span>{t(DTYPE_LABELS[d] || d)}</span>
                  <em>{countByDtype(d)}</em>
                </label>
              ))}
            </div>

            {catFacets.length > 0 && (
              <div className="pf2-group">
                <h5>{t('Task Category')}</h5>
                {catFacets.map((c) => (
                  <label key={c.slug} className="pf2-check">
                    <input
                      type="checkbox"
                      checked={selCats.has(c.slug)}
                      onChange={() => toggleCat(c.slug)}
                    />
                    <span>{c.name}</span>
                    <em>{c.count}</em>
                  </label>
                ))}
              </div>
            )}

            <div className="pf2-group">
              <h5>{t('Difficulty Level')}</h5>
              {DIFFICULTIES.map((d) => (
                <label key={d} className="pf2-check">
                  <input
                    type="checkbox"
                    checked={diff === d}
                    onChange={() => setDiff(d)}
                  />
                  <span>{t(d)}</span>
                  <em>{countByDiff(d)}</em>
                </label>
              ))}
            </div>
          </aside>

          <div className="pf2-list">
            {(isLoading || isError) && <SkeletonRows count={4} label={t('Loading')} />}
            {!isLoading && !isError && visible.map((task) => (
              <article key={task.slug} className="pf2-row">
                <div className={`pf2-thumb pf2-tone-${task.tone}`}>
                  <i className={task.typeIcon}></i>
                </div>
                <div className="pf2-main">
                  <h4 className="pf2-task-title">
                    <Link href={taskHref(task)}>{task.title}</Link>
                  </h4>
                  <div className="pf2-tags">
                    <span className="pf2-tag pf2-tag-type">{t(task.typeLabel)}</span>
                    <span className="pf2-tag">{t(task.statusLabel)}</span>
                    {task.tags.map((tag) => <span key={tag} className="pf2-tag">{tag}</span>)}
                  </div>
                  <p className="pf2-desc">{task.desc}</p>
                  <div className="pf2-meta">
                    {task.unit && <span><i className="fa-regular fa-image"></i> {task.unit}</span>}
                    {task.daysLeft !== null && <span><i className="fa-regular fa-clock"></i> {t('{count} days left', { count: task.daysLeft })}</span>}
                    <span className="pf2-diff">
                      <i className={`pf2-diff-dot pf2-diff-${difficultyTone[task.difficulty]}`}></i> {t(task.difficulty)}
                    </span>
                  </div>
                </div>
                <div className="pf2-side">
                  <div className="pf2-price">
                    <strong>Rp {task.price.toLocaleString(locale)}</strong>
                    <span>{t('per task')}</span>
                  </div>
                  <div className="pf2-people">
                    <em>{t('+{count} contributors', { count: task.contributors.toLocaleString(locale) })}</em>
                  </div>
                  {task.status === 'OPEN' || task.status === 'ACTIVE' ? (
                    <Link href={taskHref(task)} className="pf2-join">{t('Join')}</Link>
                  ) : (
                    <span className="pf2-join" style={{ opacity: 0.5 }}>{t('Closed')}</span>
                  )}
                </div>
              </article>
            ))}
            {!isLoading && !isError && visible.length === 0 && (
              <p className="pf2-empty">
                {hasFilters ? t('No tasks match your filters. Try clearing some filters.') : t('No tasks published yet.')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TasksArea;
