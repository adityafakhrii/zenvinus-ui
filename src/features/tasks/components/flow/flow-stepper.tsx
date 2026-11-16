import React from 'react';
import { FLOW_STEPS } from '../../data/tasks';
import type { FlowStepKey } from '../../data/tasks';
import { useT } from '@/i18n';

/**
 * Visual map of the contributor flow:
 * Task List → Task Detail → Join → Qualification → Workspace →
 * Submit Item → Quality Check → Completed → Reward.
 * `current` is a FLOW_STEPS key; completed keys render as done.
 */
export interface FlowStepperProps {
  current: FlowStepKey;
}

const FlowStepper = ({ current }: FlowStepperProps) => {
  const { t } = useT();
  const idx = FLOW_STEPS.findIndex((s) => s.key === current);

  return (
    <div className="tflow-steps">
      <div className="tflow-steps-track">
        {FLOW_STEPS.map((step, i) => {
          const state = i < idx ? 'done' : i === idx ? 'active' : 'todo';
          return (
            <div key={step.key} className={`tflow-step tflow-step-${state}`}>
              <span className="tflow-step-dot">
                {state === 'done' ? (
                  <i className="fa-solid fa-check"></i>
                ) : (
                  <i className={step.icon}></i>
                )}
              </span>
              <span className="tflow-step-label">{t(step.label)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowStepper;
