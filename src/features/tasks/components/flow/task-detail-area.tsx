import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Image as ImageIcon,
  Info,
  Laptop,
  LineChart,
  Tag,
  Users,
} from 'lucide-react';
import { Badge, BentoSkeleton, Button, EmptyState, cn } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useT } from '@/i18n';
import { ApiError } from '@/services/api';
import { TASK_TYPES, difficultyTone } from '../../data/tasks';
import { taskSlugOf } from '../../hooks/use-task-route';
import { fetchTaskBySlug, joinTask, leaveTask } from '../../services/tasks-api';

const TONE_BADGE: Readonly<Record<string, BadgeTone>> = {
  blue: 'blue',
  mint: 'mint',
  green: 'mint',
  purple: 'purple',
  orange: 'orange',
  amber: 'amber',
  red: 'red',
};

const DIFFICULTY_DOT: Readonly<Record<string, string>> = {
  mint: 'bg-tone-mint-fg',
  green: 'bg-tone-mint-fg',
  amber: 'bg-tone-amber-accent',
  orange: 'bg-tone-orange-fg',
  red: 'bg-tone-red-fg',
};

function renderInstructions(markdown: string) {
  if (!markdown) return null;
  const blocks = markdown.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const b = block.trim();
    if (!b) return null;
    if (b.startsWith('### ')) {
      return (
        <h4 key={i} className="mt-5 mb-2 text-sm font-semibold text-ink">
          {b.slice(4)}
        </h4>
      );
    }
    if (b.startsWith('## ')) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-base font-semibold text-ink">
          {b.slice(3)}
        </h3>
      );
    }
    if (b.startsWith('# ')) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-lg font-semibold text-ink">
          {b.slice(2)}
        </h3>
      );
    }
    if (/^[-*] /m.test(b)) {
      const items = b
        .split('\n')
        .filter((l) => /^[-*] /.test(l.trim()))
        .map((l) => l.trim().slice(2));
      return (
        <ul key={i} className="my-3 flex list-none flex-col gap-2 p-0">
          {items.map((it, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-secondary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-ink" strokeWidth={1.75} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-3 text-sm leading-relaxed text-ink-secondary">
        {b}
      </p>
    );
  });
}

/**
 * Task detail preview & join entry point (/task-details) refactored in Tailwind CSS.
 */
const TaskDetailArea = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, locale } = useT();
  const [actionError, setActionError] = useState('');

  const slug = router.isReady ? taskSlugOf(router.query.task) : null;

  const { data: task, isLoading, isError, error } = useQuery({
    queryKey: ['task', slug],
    queryFn: () => fetchTaskBySlug(slug ?? ''),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const joinMutation = useMutation({
    mutationFn: () => {
      if (!task) return Promise.reject(new Error(t('Action failed.')));
      return task.joined ? leaveTask(task.id) : joinTask(task.id);
    },
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['task', slug] });
    },
    onError: (err: Error) => setActionError(err.message || t('Action failed.')),
  });

  const handleJoin = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    joinMutation.mutate();
  };

  if (!router.isReady || isLoading) {
    return (
      <section className="min-h-screen bg-canvas py-10 sm:py-14">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BentoSkeleton />
        </div>
      </section>
    );
  }

  if (isError || !task) {
    return (
      <section className="min-h-[70vh] bg-canvas py-16">
        <div className="mx-auto max-w-lg px-4">
          <EmptyState
            title={
              error instanceof ApiError && error.status === 404
                ? t('Task not found.')
                : t('Task not found ({reason}).', { reason: error?.message || t('load failed') })
            }
            action={
              <Button href="/tasks" variant="primary" size="sm">
                {t('Back to Task List')}
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  const meta = TASK_TYPES[task.type];
  const joinable = task.status === 'OPEN' || task.status === 'ACTIVE';
  const diffDot = DIFFICULTY_DOT[difficultyTone[task.difficulty]] ?? 'bg-ink-muted';

  return (
    <section className="min-h-screen bg-canvas py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Link
          href="/tasks"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{t('Back to Task List')}</span>
        </Link>

        {/* Task Hero Banner Card */}
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] lg:grid-cols-12 sm:p-8">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={TONE_BADGE[meta.tone] ?? 'blue'}>
                {t('{type} workspace', { type: t(meta.label) })}
              </Badge>
              <Badge tone="neutral">
                <span className={cn('h-2 w-2 rounded-full', diffDot)} aria-hidden="true" />
                <span>{t(task.difficulty)}</span>
              </Badge>
              <Badge tone="mint" dot>
                {t(task.statusLabel)}
              </Badge>
            </div>

            <h1 className="mt-4 mb-0 text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[32px]">
              {task.title}
            </h1>
            <p className="mt-3 mb-0 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {task.desc}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
              {task.unit && (
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{task.unit}</span>
                </span>
              )}
              {task.daysLeft !== null && (
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t('{count} days left', { count: task.daysLeft })}</span>
                </span>
              )}
              {task.organization && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{task.organization}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{t('{count} contributors', { count: task.contributors.toLocaleString(locale) })}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-canvas p-5 lg:col-span-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-semibold text-ink tabular-nums">
                  Rp {task.price.toLocaleString(locale)}
                </span>
                <span className="text-xs text-ink-muted">{t('/ per task')}</span>
              </div>

              <ul className="mt-4 mb-5 flex list-none flex-col gap-2 p-0 text-xs text-ink-secondary">
                {task.bonus > 0 && (
                  <li className="flex items-center gap-2">
                    <Coins className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.6} />
                    <span>{t('Bonus up to Rp {amount}', { amount: task.bonus.toLocaleString(locale) })}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.5} />
                  <span>
                    {t('{count} contributors joined', { count: task.contributors.toLocaleString(locale) })}
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2.5">
              {joinable ? (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant={task.joined ? 'secondary' : 'primary'}
                    size="md"
                    block
                    loading={joinMutation.isPending}
                    onClick={handleJoin}
                    rightIcon={!task.joined ? <ArrowRight className="h-4 w-4" strokeWidth={1.6} /> : undefined}
                  >
                    {task.joined
                      ? joinMutation.isPending
                        ? t('Processing…')
                        : t('Leave Task')
                      : joinMutation.isPending
                        ? t('Joining…')
                        : t('Join Task')}
                  </Button>
                  {task.joined && (
                    <Button
                      href={`/task-join?task=${task.slug}`}
                      variant="teal"
                      size="md"
                      block
                      rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
                    >
                      {t('Continue')}
                    </Button>
                  )}
                </div>
              ) : (
                <Button type="button" variant="secondary" size="md" block disabled>
                  {t('Closed')}
                </Button>
              )}

              {actionError && (
                <p role="alert" className="m-0 text-xs font-medium text-tone-red-ink">
                  {actionError}
                </p>
              )}

              {!user && joinable && (
                <p className="m-0 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  <span>
                    {t('You need to {link} to join.', {
                      link: (
                        <Link
                          href={`/login?next=${encodeURIComponent(router.asPath)}`}
                          className="font-semibold text-teal-ink hover:underline"
                        >
                          {t('sign in')}
                        </Link>
                      ),
                    })}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom 2-Column Body */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8">
              <div className="mb-4 flex items-center gap-2 border-b border-line-subtle pb-3">
                <BookOpen className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <h2 className="m-0 text-base font-semibold text-ink">{t('Instructions')}</h2>
              </div>
              {task.instructions ? (
                renderInstructions(task.instructions)
              ) : (
                <p className="m-0 text-sm leading-relaxed text-ink-secondary">{task.desc}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8">
              <div className="mb-3 flex items-center gap-2">
                <Laptop className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <h2 className="m-0 text-base font-semibold text-ink">{t('How the workspace works')}</h2>
              </div>
              <p className="m-0 text-sm leading-relaxed text-ink-secondary">
                {t(
                  'The {name} workspace is picked automatically from the {field} sent by the backend — you do not need to choose any tool.',
                  {
                    name: <strong className="font-semibold text-ink">{t(meta.label)}</strong>,
                    field: (
                      <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs text-ink">
                        dataType
                      </code>
                    ),
                  },
                )}{' '}
                {t(meta.desc)}
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <h2 className="m-0 text-base font-semibold text-ink">{t('Tags')}</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge tone="neutral">{task.dataType}</Badge>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
              <div className="mb-4 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
                <h2 className="m-0 text-base font-semibold text-ink">{t('Statistics')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-canvas p-4">
                  <div className="font-mono text-xl font-semibold text-ink tabular-nums">
                    {task.contributors.toLocaleString(locale)}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-muted">{t('contributors')}</div>
                </div>
                {task.quantity && (
                  <div className="rounded-xl bg-canvas p-4">
                    <div className="font-mono text-xl font-semibold text-ink tabular-nums">
                      {task.quantity.toLocaleString(locale)}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">{task.unit || t('items')}</div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default TaskDetailArea;
