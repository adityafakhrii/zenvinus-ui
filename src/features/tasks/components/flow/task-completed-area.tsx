import React, { useEffect } from 'react';
import useTaskRoute from '../../hooks/use-task-route';
import FlowStepper from './flow-stepper';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { progressReset, selectProgress } from '../../store/submissions-slice';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';

const TaskCompletedArea = () => {
  const { router, ready, task } = useTaskRoute();
  const { t, locale } = useT();
  const dispatch = useAppDispatch();
  const stored = useAppSelector((state) => (task ? selectProgress(state, task.slug) : null));
  const progress = ready && task ? stored : null;

  useEffect(() => {
    if (ready && task && progress && progress.accepted.length === 0) {
      // No accepted work in context (direct visit) — back to the workspace.
      router.replace(`/task-studio?task=${task.slug}`);
    }
  }, [ready, task, progress, router]);

  if (!ready || !task || !progress || progress.accepted.length === 0) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  const accepted = progress.accepted.length;
  const totalItems = (task.items || []).length;
  const earnings = accepted * task.rewardPerItem;

  return (
    <section className="tflow-area pt-40 pb-120">
      <div className="container">
        <FlowStepper current="completed" />

        <div className="tflow-narrow">
          <div className="tflow-panel tflow-result">
            <span className="tflow-result-icon tflow-result-pass">
              <i className="fa-solid fa-circle-check"></i>
            </span>
            <h3 className="tflow-title">{t('Task complete — great work!')}</h3>
            <p className="tflow-desc">
              {t('{accepted} of {total} items in this session passed the quality check for {title}. Continue with the next items at any time, or claim your reward.', {
                accepted: <strong>{accepted}</strong>,
                total: totalItems,
                title: <strong>{task.title}</strong>,
              })}
            </p>

            <div className="tflow-stat-grid tflow-stat-grid-3">
              <div className="tflow-stat"><strong>{accepted}</strong><span>{t('items accepted')}</span></div>
              <div className="tflow-stat"><strong>{totalItems}</strong><span>{t('items in batch')}</span></div>
              <div className="tflow-stat"><strong>Rp {earnings.toLocaleString(locale)}</strong><span>{t('base earnings')}</span></div>
            </div>

            <div className="tflow-done-list">
              {progress.accepted.map((id) => (
                <span key={id} className="tflow-region-pill tflow-region-pill-done">
                  <i className="fa-solid fa-check"></i> {id}
                </span>
              ))}
            </div>

            <div className="tflow-actions tflow-actions-center">
              <button
                type="button"
                className="tflow-btn-ghost"
                // WHY: Reset after leaving: resetting first re-renders this page with no progress, and its redirect to the studio would race the push
                onClick={() => { router.push(`/tasks`).then(() => dispatch(progressReset(task.slug))); }}
              >
                <i className="fa-solid fa-list-check"></i> {t('Back to task list')}
              </button>
              <Button href={`/task-reward?task=${task.slug}`} className="tflow-btn">
                {t('Claim Reward')} <i className="fa-solid fa-coins"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskCompletedArea;
