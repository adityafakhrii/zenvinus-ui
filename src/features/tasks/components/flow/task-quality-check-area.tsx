import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import useTaskRoute from '../../hooks/use-task-route';
import FlowStepper from './flow-stepper';
import { reviewSubmission } from '../../data/quality-check';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { itemAccepted, selectLastSubmission } from '../../store/submissions-slice';
import { resolveWorkspace } from '../workspaces/registry';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';
import { scoreStyle } from '../../utils/score-style';

const QualityCheckArea = () => {
  const { router, ready, task } = useTaskRoute();
  const { t } = useT();

  const dispatch = useAppDispatch();
  const last = useAppSelector((state) => (task ? selectLastSubmission(state, task.slug) : null));

  const submission = useMemo(() => {
    if (!ready || !task) return null;
    const sub = last;
    if (!sub) return null;
    const item = (task.items || []).find((i) => i.id === sub.itemId);
    if (!item) return null;
    return { ...sub, item, review: reviewSubmission({ task, item, answer: sub.answer }) };
  }, [ready, task, last]);

  // No submission in context (e.g. direct visit) — send back to the workspace.
  useEffect(() => {
    if (ready && task && !submission) {
      router.replace(`/task-studio?task=${task.slug}`);
    }
  }, [ready, task, submission, router]);

  // A passing review counts as an accepted contribution for this item.
  useEffect(() => {
    if (submission?.review.passed) {
      dispatch(itemAccepted({ slug: submission.slug, itemId: submission.item.id }));
    }
  }, [submission, dispatch]);

  if (!ready || !task || !submission) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  const { item, review } = submission;
  const workspace = resolveWorkspace(task);
  const meta = workspace?.meta;

  const handleRevise = () => router.push(`/task-studio?task=${task.slug}`);
  const handleAccept = () => router.push(`/task-completed?task=${task.slug}`);

  return (
    <section className="tflow-area pt-40 pb-120">
      <div className="container">
        <FlowStepper current="quality" />

        <div className="tflow-narrow">
          <div className="tflow-panel">
            <div className="tflow-qual-head">
              <div>
                <h3 className="tflow-title">{t('Quality Check')}</h3>
                <p className="tflow-desc">
                  {task.title} · {t('item {id}', { id: <strong>{item.id}</strong> })} · {t('workspace {name}', { name: meta?.label ? t(meta.label) : '' })}
                </p>
              </div>
              <span className="tflow-badge-soft tflow-badge-auto">
                <i className="fa-solid fa-robot"></i> {t('Auto-review vs gold')}
              </span>
            </div>

            <div className={`tflow-verdict-banner ${review.passed ? 'tflow-verdict-pass' : 'tflow-verdict-revise'}`}>
              <div className="tflow-score-ring tflow-score-ring-lg" style={scoreStyle(review.score)}>
                <strong>{review.score}</strong><span>/100</span>
              </div>
              <div>
                <h4>{review.passed ? t('Item accepted') : t('Needs revision')}</h4>
                <p>
                  {review.passed
                    ? t('Score {score} passes the {threshold} threshold. Your contribution goes into the consensus aggregation.', { score: review.score, threshold: review.threshold })
                    : t('Score {score} is below the {threshold} threshold. Fix the flagged fields and submit again.', { score: review.score, threshold: review.threshold })}
                </p>
              </div>
            </div>

            <h4 className="tflow-subtitle"><i className="fa-solid fa-clipboard-check"></i> {t('Check details')}</h4>
            <div className="tflow-check-table">
              {review.checks.map((c, i) => (
                <div key={i} className={`tflow-check-row ${c.ok ? 'tflow-check-ok' : 'tflow-check-bad'}`}>
                  <span className="tflow-check-icon">
                    <i className={c.ok ? 'fa-solid fa-check' : 'fa-solid fa-xmark'}></i>
                  </span>
                  <div className="tflow-check-body">
                    <h5>{t(c.label, c.vars)}</h5>
                    <p>
                      {t('Your answer: {value}', { value: <strong>{t(String(c.submitted))}</strong> })}
                      {!c.ok && <> · {t('Gold standard: {value}', { value: <strong>{t(String(c.expected))}</strong> })}</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {review.note && !review.passed && (
              <p className="tflow-note"><i className="fa-solid fa-lightbulb"></i> {t('Hint: {note}', { note: t(review.note) })}</p>
            )}

            <div className="tflow-actions">
              <Link href={`/tasks`} className="tflow-btn-ghost">
                <i className="fa-solid fa-list-check"></i> {t('Task list')}
              </Link>
              {review.passed ? (
                <Button className="tflow-btn" onClick={handleAccept}>
                  {t('Continue')} <i className="fa-solid fa-arrow-right"></i>
                </Button>
              ) : (
                <Button className="tflow-btn" onClick={handleRevise}>
                  {t('Revise Item')} <i className="fa-solid fa-pen"></i>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityCheckArea;
