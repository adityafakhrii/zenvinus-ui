import React, { useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Bot,
  Check,
  ClipboardCheck,
  Lightbulb,
  ListChecks,
  Pencil,
  X,
} from 'lucide-react';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomSemiCircleGauge,
  cn,
} from '@/components/ui';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { reviewSubmission } from '../../data/quality-check';
import useTaskRoute from '../../hooks/use-task-route';
import { itemAccepted, selectLastSubmission } from '../../store/submissions-slice';
import { resolveWorkspace } from '../workspaces/registry';
import FlowStepper from './flow-stepper';

/**
 * Automated submission QA scorecard (/task-quality-check) using CustomSemiCircleGauge & custom Tailwind breakdown.
 */
const QualityCheckArea = () => {
  const { router, ready, task } = useTaskRoute();
  const { t } = useT();
  const dispatch = useAppDispatch();
  const last = useAppSelector((state) => (task ? selectLastSubmission(state, task.slug) : null));

  const submission = useMemo(() => {
    if (!ready || !task) return null;
    if (!last) return null;
    const item = (task.items || []).find((i) => i.id === last.itemId);
    if (!item) return null;
    return { ...last, item, review: reviewSubmission({ task, item, answer: last.answer }) };
  }, [ready, task, last]);

  useEffect(() => {
    if (ready && task && !submission) {
      router.replace(`/task-studio?task=${task.slug}`);
    }
  }, [ready, task, submission, router]);

  useEffect(() => {
    if (submission?.review.passed) {
      dispatch(itemAccepted({ slug: submission.slug, itemId: submission.item.id }));
    }
  }, [submission, dispatch]);

  if (!ready || !task || !submission) {
    return (
      <section className="min-h-screen bg-canvas py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BentoSkeleton />
        </div>
      </section>
    );
  }

  const { item, review } = submission;
  const workspace = resolveWorkspace(task);
  const meta = workspace?.meta;

  const handleRevise = () => router.push(`/task-studio?task=${task.slug}`);
  const handleAccept = () => router.push(`/task-completed?task=${task.slug}`);

  return (
    <section className="min-h-screen bg-canvas py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <FlowStepper current="quality" />

        <div className="mx-auto max-w-2xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line-subtle pb-4">
            <div>
              <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">{t('Quality Check')}</h1>
              <p className="mt-1 mb-0 text-xs text-ink-secondary">
                {task.title} ·{' '}
                {t('item {id}', { id: <strong className="font-mono text-ink">{item.id}</strong> })} ·{' '}
                {t('workspace {name}', { name: meta?.label ? t(meta.label) : '' })}
              </p>
            </div>
            <Badge tone="blue" dot>
              <Bot className="h-3 w-3" strokeWidth={1.75} />
              <span>{t('Auto-review vs gold')}</span>
            </Badge>
          </div>

          {/* Verdict + Semi-Circular Gauge */}
          <div
            className={cn(
              'mb-6 grid grid-cols-1 items-center gap-6 rounded-2xl border p-5 sm:grid-cols-[200px_minmax(0,1fr)]',
              review.passed
                ? 'border-teal-ink/25 bg-tint-mint'
                : 'border-tone-amber-accent/35 bg-tone-amber-bg/40',
            )}
          >
            <CustomSemiCircleGauge value={review.score} label={t('Quality score')} />
            <div>
              <Badge tone={review.passed ? 'mint' : 'amber'} dot>
                {review.passed ? t('Item accepted') : t('Needs revision')}
              </Badge>
              <h2 className="mt-2 mb-1 text-lg font-semibold text-ink">
                {review.passed ? t('Item accepted') : t('Needs revision')}
              </h2>
              <p className="m-0 text-xs leading-relaxed text-ink-secondary sm:text-sm">
                {review.passed
                  ? t(
                      'Score {score} passes the {threshold} threshold. Your contribution goes into the consensus aggregation.',
                      { score: review.score, threshold: review.threshold },
                    )
                  : t(
                      'Score {score} is below the {threshold} threshold. Fix the flagged fields and submit again.',
                      { score: review.score, threshold: review.threshold },
                    )}
              </p>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
            <h2 className="m-0 text-base font-semibold text-ink">{t('Check details')}</h2>
          </div>

          <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle rounded-xl border border-line-subtle p-0">
            {review.checks.map((c, i) => (
              <li key={i} className="flex items-start gap-3 p-4">
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    c.ok ? 'bg-tone-mint-bg text-tone-mint-fg' : 'bg-tone-red-bg text-tone-red-fg',
                  )}
                >
                  {c.ok ? <Check className="h-4 w-4" strokeWidth={1.75} /> : <X className="h-4 w-4" strokeWidth={1.75} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink">{t(c.label, c.vars)}</div>
                  <div className="mt-0.5 text-xs text-ink-secondary">
                    {t('Your answer: {value}', {
                      value: <strong className="font-semibold text-ink">{t(String(c.submitted))}</strong>,
                    })}
                    {!c.ok && (
                      <>
                        {' '}
                        ·{' '}
                        {t('Gold standard: {value}', {
                          value: <strong className="font-semibold text-teal-ink">{t(String(c.expected))}</strong>,
                        })}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {review.note && !review.passed && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-tone-amber-accent/30 bg-tone-amber-bg/40 px-4 py-3 text-xs text-tone-amber-fg">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>{t('Hint: {note}', { note: t(review.note) })}</span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5">
            <Button
              href="/tasks"
              variant="secondary"
              size="sm"
              leftIcon={<ListChecks className="h-4 w-4" strokeWidth={1.5} />}
            >
              {t('Task list')}
            </Button>

            {review.passed ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAccept}
                rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Continue')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleRevise}
                leftIcon={<Pencil className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Revise Item')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityCheckArea;
