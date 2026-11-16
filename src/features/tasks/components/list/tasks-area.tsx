import React, { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Bot,
  Clock,
  Headphones,
  Image as ImageIcon,
  Layers,
  ScanLine,
  SlidersHorizontal,
  Table2,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  CustomCheckbox,
  CustomRadioGroup,
  CustomSelect,
  Drawer,
  EmptyState,
  SearchInput,
  cn,
} from '@/components/ui';
import type { BadgeTone, RadioOption, SelectOption } from '@/components/ui';
import { SkeletonRows } from '@/components/ui/skeleton';
import { DATA_TYPES, type DataType } from '@/config/data-types';
import { useT } from '@/i18n';
import { difficultyTone } from '../../data/tasks';
import { DIFFICULTIES, fetchTasks, taskHref, type DifficultyFilter } from '../../services/tasks-api';
import type { TaskListParams } from '../../types/task';

const DTYPE_LABELS: Readonly<Record<DataType, string>> = {
  image: 'Image',
  text: 'Text',
  audio: 'Audio',
  video: 'Video',
  '3d': '3D',
  document: 'Document',
  tabular: 'Tabular',
  geospatial: 'Geospatial',
  time_series: 'Time Series',
};

const ICON_SURFACE: Readonly<Record<string, string>> = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  green: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-purple-bg text-tone-purple-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
};

const DIFFICULTY_DOT: Readonly<Record<string, string>> = {
  mint: 'bg-tone-mint-fg',
  green: 'bg-tone-mint-fg',
  amber: 'bg-tone-amber-accent',
  orange: 'bg-tone-orange-fg',
  red: 'bg-tone-red-fg',
};

const STATUS_BADGE: Readonly<Record<string, BadgeTone>> = {
  OPEN: 'mint',
  ACTIVE: 'blue',
  CLOSED: 'neutral',
};

function TaskGlyph({ icon }: { icon?: string }) {
  const key = icon || '';
  if (key.includes('object-group')) return <ScanLine className="h-5 w-5" strokeWidth={1.6} />;
  if (key.includes('robot')) return <Bot className="h-5 w-5" strokeWidth={1.6} />;
  if (key.includes('headphones')) return <Headphones className="h-5 w-5" strokeWidth={1.6} />;
  if (key.includes('table')) return <Table2 className="h-5 w-5" strokeWidth={1.6} />;
  return <Layers className="h-5 w-5" strokeWidth={1.6} />;
}

/**
 * Public & Dashboard Task Marketplace (/tasks and /dashboard/tasks) refactored into Tailwind CSS + Custom UI Kit.
 */
const TasksArea = () => {
  const { t, locale } = useT();
  const [query, setQuery] = useState('');
  const [selDtypes, setSelDtypes] = useState<Set<string>>(new Set());
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [diff, setDiff] = useState<DifficultyFilter>('All');
  const [sort, setSort] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
  const activeFilterCount = selDtypes.size + selCats.size + (diff !== 'All' ? 1 : 0);

  const sortOptions: SelectOption[] = useMemo(
    () => [
      { value: 'newest', label: t('Newest First') },
      { value: 'reward', label: t('Highest Reward') },
      { value: 'deadline', label: t('Ending Soon') },
    ],
    [t],
  );

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

  const catFacets = facets?.categories?.filter((c) => c.count > 0) || [];
  const countByDtype = (d: string) => facets?.dataTypes?.find((x) => x.value === d)?.count || 0;

  const difficultyOptions: RadioOption<DifficultyFilter>[] = useMemo(() => {
    const countFor = (d: DifficultyFilter) =>
      d === 'All'
        ? facets?.total ?? data?.total ?? 0
        : facets?.difficulties?.find((x) => x.value === d.toLowerCase())?.count || 0;
    return DIFFICULTIES.map((d) => ({
      value: d,
      label: (
        <span className="inline-flex w-full items-center justify-between gap-2 text-sm">
          <span>{t(d)}</span>
          <span className="font-mono text-xs text-ink-muted tabular-nums">{countFor(d)}</span>
        </span>
      ),
    }));
  }, [facets, data, t]);

  const visible = useMemo(() => {
    if (!selCats.size) return tasks;
    return tasks.filter((item) =>
      item.tags.some((tag) => [...selCats].some((s) => tag.toLowerCase().includes(s))),
    );
  }, [tasks, selCats]);

  const clearAll = () => {
    setSelDtypes(new Set());
    setSelCats(new Set());
    setDiff('All');
    setQuery('');
  };

  const renderFilters = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
          {t('Data Type')}
        </h3>
        <div className="flex flex-col gap-2.5">
          {DATA_TYPES.map((d) => (
            <div key={d} className="flex items-center justify-between gap-2">
              <CustomCheckbox
                checked={selDtypes.has(d)}
                onChange={() => toggleDtype(d)}
                label={t(DTYPE_LABELS[d] || d)}
              />
              <span className="font-mono text-xs text-ink-muted tabular-nums">{countByDtype(d)}</span>
            </div>
          ))}
        </div>
      </div>

      {catFacets.length > 0 && (
        <div className="border-t border-line-subtle pt-5">
          <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
            {t('Task Category')}
          </h3>
          <div className="flex flex-col gap-2.5">
            {catFacets.map((c) => (
              <div key={c.slug} className="flex items-center justify-between gap-2">
                <CustomCheckbox
                  checked={selCats.has(c.slug)}
                  onChange={() => toggleCat(c.slug)}
                  label={c.name}
                />
                <span className="font-mono text-xs text-ink-muted tabular-nums">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-line-subtle pt-5">
        <h3 className="m-0 mb-3 text-xs font-medium text-ink-muted">
          {t('Difficulty Level')}
        </h3>
        <CustomRadioGroup<DifficultyFilter>
          name="task-difficulty"
          value={diff}
          onChange={setDiff}
          options={difficultyOptions}
        />
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-canvas py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m-0 text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[34px]">
              {t('Task List')}
            </h1>
            <p className="mt-1.5 mb-0 text-sm text-ink-secondary">
              {t('Explore real-world tasks and start contributing to AI projects.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t('Search tasks')}
              size="sm"
              containerClassName="w-full sm:w-64"
            />
            <CustomSelect
              value={sort}
              onChange={setSort}
              options={sortOptions}
              size="sm"
              ariaLabel={t('Sort by')}
              containerClassName="w-44"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="lg:hidden"
              leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />}
              onClick={() => setMobileFiltersOpen(true)}
            >
              {t('Filters')}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-22 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <div className="mb-5 flex items-center justify-between border-b border-line-subtle pb-3">
                <h2 className="m-0 text-sm font-semibold text-ink">{t('Filters')}</h2>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-medium text-teal-ink hover:underline cursor-pointer"
                  >
                    {t('Clear All')}
                  </button>
                )}
              </div>
              {renderFilters()}
            </div>
          </aside>

          <div className="flex flex-col gap-4">
            {(isLoading || isError) && <SkeletonRows count={4} label={t('Loading')} />}

            {!isLoading &&
              !isError &&
              visible.map((task) => {
                const iconCls = ICON_SURFACE[task.tone] ?? 'bg-canvas text-ink-secondary';
                const diffColor = DIFFICULTY_DOT[difficultyTone[task.difficulty]] ?? 'bg-ink-muted';
                const statusBadge = STATUS_BADGE[task.status] ?? 'neutral';
                const isOpen = task.status === 'OPEN' || task.status === 'ACTIVE';

                return (
                  <article
                    key={task.slug}
                    className="flex flex-col justify-between gap-5 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] transition-colors hover:border-teal-ink/40 sm:flex-row sm:items-center sm:p-6"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                          iconCls,
                        )}
                      >
                        <TaskGlyph icon={task.typeIcon} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="m-0 text-base font-semibold text-ink sm:text-[17px]">
                            <Link
                              href={taskHref(task)}
                              className="text-ink no-underline transition-colors hover:text-teal-ink"
                            >
                              {task.title}
                            </Link>
                          </h2>
                          <Badge tone={statusBadge} dot>
                            {t(task.statusLabel)}
                          </Badge>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge tone="blue">{t(task.typeLabel)}</Badge>
                          {task.tags.map((tag) => (
                            <Badge key={tag} tone="neutral">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-ink-secondary">
                          {task.desc}
                        </p>

                        <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-muted">
                          {task.unit && (
                            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                              <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                              <span>{task.unit}</span>
                            </span>
                          )}
                          {task.daysLeft !== null && (
                            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                              <span>{t('{count} days left', { count: task.daysLeft })}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 font-medium text-ink-secondary">
                            <span className={cn('h-2 w-2 rounded-full', diffColor)} aria-hidden="true" />
                            <span>{t(task.difficulty)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-line-subtle pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-base font-semibold text-ink tabular-nums">
                          Rp {task.price.toLocaleString(locale)}
                        </div>
                        <div className="text-[11px] text-ink-muted">{t('per task')}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-muted tabular-nums">
                          <Users className="h-3 w-3" strokeWidth={1.5} />
                          <span>
                            {t('+{count} contributors', {
                              count: task.contributors.toLocaleString(locale),
                            })}
                          </span>
                        </div>
                      </div>

                      {isOpen ? (
                        <Button href={taskHref(task)} variant="primary" size="sm">
                          {t('Join')}
                        </Button>
                      ) : (
                        <Button type="button" variant="secondary" size="sm" disabled>
                          {t('Closed')}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}

            {!isLoading && !isError && visible.length === 0 && (
              <EmptyState
                title={
                  hasFilters
                    ? t('No tasks match your filters. Try clearing some filters.')
                    : t('No tasks published yet.')
                }
                action={
                  hasFilters ? (
                    <Button type="button" variant="secondary" size="sm" onClick={clearAll}>
                      {t('Clear All')}
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        side="left"
        title={t('Filters')}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              {t('Clear All')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setMobileFiltersOpen(false)}
            >
              {t('Apply')}
            </Button>
          </div>
        }
      >
        {renderFilters()}
      </Drawer>
    </section>
  );
};

export default TasksArea;
