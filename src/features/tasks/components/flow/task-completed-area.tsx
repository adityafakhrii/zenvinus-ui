import React, { useEffect } from 'react';
import { Check, CheckCircle2, Coins, ListChecks } from 'lucide-react';
import { Badge, BentoSkeleton, Button } from '@/components/ui';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import useTaskRoute from '../../hooks/use-task-route';
import { progressReset, selectProgress } from '../../store/submissions-slice';
import FlowStepper from './flow-stepper';

/**
 * Calm task completion summary (/task-completed) without confetti or pulsing animations.
 */
const TaskCompletedArea = () => {
  const { router, ready, task } = useTaskRoute();
  const { t, locale } = useT();
  const dispatch = useAppDispatch();
  const stored = useAppSelector((state) => (task ? selectProgress(state, task.slug) : null));
  const progress = ready && task ? stored : null;

  useEffect(() => {
    if (ready && task && progress && progress.accepted.length === 0) {
      router.replace(`/task-studio?task=${task.slug}`);
    }
  }, [ready, task, progress, router]);

  if (!ready || !task || !progress || progress.accepted.length === 0) {
    return (
      <section className="min-h-screen bg-canvas py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BentoSkeleton />
        </div>
      </section>
    );
  }

  const accepted = progress.accepted.length;
  const totalItems = (task.items || []).length;
  const earnings = accepted * task.rewardPerItem;

  return (
    <section className="min-h-screen bg-canvas py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <FlowStepper current="completed" />

        <div className="mx-auto max-w-2xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 text-center shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tint-mint text-teal-ink">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
          </span>

          <h1 className="mt-4 mb-2 text-2xl font-semibold tracking-tight text-ink">
            {t('Task complete')}
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-ink-secondary">
            {t(
              '{accepted} of {total} items in this session passed the quality check for {title}. Continue with the next items at any time, or claim your reward.',
              {
                accepted: <strong className="font-semibold text-ink">{accepted}</strong>,
                total: totalItems,
                title: <strong className="font-semibold text-ink">{task.title}</strong>,
              },
            )}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-canvas p-4">
              <div className="font-mono text-2xl font-semibold text-ink tabular-nums">{accepted}</div>
              <div className="mt-0.5 text-xs text-ink-muted">{t('items accepted')}</div>
            </div>
            <div className="rounded-xl bg-canvas p-4">
              <div className="font-mono text-2xl font-semibold text-ink tabular-nums">{totalItems}</div>
              <div className="mt-0.5 text-xs text-ink-muted">{t('items in batch')}</div>
            </div>
            <div className="rounded-xl bg-canvas p-4">
              <div className="font-mono text-2xl font-semibold text-teal-ink tabular-nums">
                Rp {earnings.toLocaleString(locale)}
              </div>
              <div className="mt-0.5 text-xs text-ink-muted">{t('base earnings')}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {progress.accepted.map((id) => (
              <Badge key={id} tone="mint" mono>
                <Check className="h-3 w-3" strokeWidth={1.75} />
                <span>{id}</span>
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              leftIcon={<ListChecks className="h-4 w-4" strokeWidth={1.5} />}
              onClick={() => {
                router.push('/tasks').then(() => dispatch(progressReset(task.slug)));
              }}
            >
              {t('Back to task list')}
            </Button>

            <Button
              href={`/task-reward?task=${task.slug}`}
              variant="primary"
              size="md"
              rightIcon={<Coins className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('Claim Reward')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskCompletedArea;
