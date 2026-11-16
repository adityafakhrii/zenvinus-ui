import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Info,
  RotateCw,
  Send,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  BentoSkeleton,
  Button,
  CustomRadioGroup,
  CustomSemiCircleGauge,
} from '@/components/ui';
import { useT } from '@/i18n';
import useTaskRoute from '../../hooks/use-task-route';
import { resolveWorkspace } from '../workspaces/registry';
import FlowStepper from './flow-stepper';

interface QualificationResult {
  score: number;
  passed: boolean;
}

/**
 * Interactive task qualification assessment (/task-qualification) using CustomRadioGroup & CustomSemiCircleGauge.
 */
const TaskQualificationArea = () => {
  const { router, ready, task } = useTaskRoute();
  const { t } = useT();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && task && !task.requiresQualification) {
      router.replace(`/task-studio?task=${task.slug}`);
    }
  }, [ready, task, router]);

  const qualification = task?.qualification;
  if (!ready || !task || !task.requiresQualification || !qualification) {
    return (
      <section className="min-h-screen bg-canvas py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <BentoSkeleton />
        </div>
      </section>
    );
  }

  const workspace = resolveWorkspace(task);
  const meta = workspace?.meta;
  const allAnswered = qualification.questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    setSubmitting(true);
    const correct = qualification.questions.filter((q, i) => Number(answers[i]) === q.answer).length;
    const score = Math.round((correct / qualification.questions.length) * 100);
    window.setTimeout(() => {
      setResult({ score, passed: score >= qualification.passScore });
      setSubmitting(false);
    }, 700);
  };

  return (
    <section className="min-h-screen bg-canvas py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <FlowStepper current="qualification" />

        <div className="mx-auto max-w-2xl">
          {result ? (
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 text-center shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
              <span
                className={
                  result.passed
                    ? 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tint-mint text-teal-ink'
                    : 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tone-red-bg text-tone-red-fg'
                }
              >
                {result.passed ? (
                  <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
                ) : (
                  <XCircle className="h-6 w-6" strokeWidth={1.75} />
                )}
              </span>

              <h1 className="mt-4 mb-2 text-2xl font-semibold text-ink">
                {result.passed ? t('Qualification passed') : t('Not passed yet')}
              </h1>

              <div className="my-4">
                <CustomSemiCircleGauge value={result.score} label={t('Qualification score')} />
              </div>

              <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-secondary">
                {result.passed
                  ? t('Minimum score of {score} reached. The {name} workspace is now open to you.', {
                      score: qualification.passScore,
                      name: (
                        <strong className="font-semibold text-ink">
                          {meta?.label ? t(meta.label) : ''}
                        </strong>
                      ),
                    })
                  : t(
                      'Minimum score is {score}. Review the guidelines on the detail page, then try again.',
                      { score: qualification.passScore },
                    )}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  href={`/task-details?task=${task.slug}`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<BookOpen className="h-4 w-4" strokeWidth={1.5} />}
                >
                  {t('Review guidelines')}
                </Button>

                {result.passed ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => router.push(`/task-studio?task=${task.slug}`)}
                    rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
                  >
                    {t('Open Studio')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                    }}
                    rightIcon={<RotateCw className="h-4 w-4" strokeWidth={1.6} />}
                  >
                    {t('Try Again')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line-subtle pb-4">
                <div>
                  <h1 className="m-0 text-xl font-semibold text-ink sm:text-2xl">
                    {t('Qualification')} — {task.title}
                  </h1>
                  <p className="mt-1 mb-0 text-xs text-ink-secondary">
                    {t('{count} questions · minimum score {score} · workspace {name}', {
                      count: qualification.questions.length,
                      score: qualification.passScore,
                      name: (
                        <strong className="font-semibold text-ink">
                          {meta?.label ? t(meta.label) : ''}
                        </strong>
                      ),
                    })}
                  </p>
                </div>
                <Badge tone="amber" dot>
                  <GraduationCap className="h-3 w-3" strokeWidth={1.75} />
                  <span>{t('Required')}</span>
                </Badge>
              </div>

              <ol className="m-0 flex list-none flex-col gap-6 p-0">
                {qualification.questions.map((q, qi) => (
                  <li key={qi} className="flex flex-col gap-3">
                    <h2 className="m-0 text-sm font-semibold text-ink">
                      {qi + 1}. {q.q}
                    </h2>
                    <CustomRadioGroup
                      name={`qual-q-${qi}`}
                      value={answers[qi] ?? ''}
                      onChange={(val) => setAnswers((prev) => ({ ...prev, [qi]: val }))}
                      variant="card"
                      columnsClassName="grid grid-cols-1 gap-2.5"
                      options={q.options.map((opt, oi) => ({
                        value: String(oi),
                        label: (
                          <span className="inline-flex items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-canvas font-mono text-xs font-semibold text-ink">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span>{opt}</span>
                          </span>
                        ),
                      }))}
                    />
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5">
                <Button
                  href={`/task-join?task=${task.slug}`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.6} />}
                >
                  {t('Back')}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!allAnswered}
                  loading={submitting}
                  onClick={handleSubmit}
                  rightIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
                >
                  {t('Submit Qualification')}
                </Button>
              </div>

              {!allAnswered && (
                <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{t('Answer every question to submit.')}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TaskQualificationArea;
