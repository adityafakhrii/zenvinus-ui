import React from 'react';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';
import type { ReviewAction } from '../../data/expert-workspace';

interface BottombarBaseProps {
  itemIdx: number;
  total: number;
  draftSavedAt: number | null;
  submitting: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Contributor mode: Skip + Submit */
export interface SubmitBottombarProps extends BottombarBaseProps {
  reviewMode?: false;
  hasAnswer: boolean;
  onSubmit: () => void;
}

/** Review mode: the review decisions replace Skip + Submit */
export interface ReviewBottombarProps extends BottombarBaseProps {
  reviewMode: true;
  actions: readonly ReviewAction[];
  onDecision: (actionKey: string) => void;
}

export type StudioBottombarProps = SubmitBottombarProps | ReviewBottombarProps;

/**
 * Studio bottom bar: item navigation on the left, autosave status in the
 * middle, skip + submit on the right. Sticky so submit is always reachable.
 *
 * In review mode the right side carries the four review decisions and the
 * middle explains them — the contributor's Submit/Skip flow is replaced,
 * not appended.
 */
const StudioBottombar = (props: StudioBottombarProps) => {
  const { itemIdx, total, draftSavedAt, submitting, disabled, onPrev, onNext } = props;
  const { t } = useT();
  return (
    <footer className="tflow-studio-bottom">
      <div className="tflow-studio-bottom-left">
        <button type="button" className="tflow-btn-ghost" disabled={disabled || itemIdx === 0} onClick={onPrev}>
          <i className="fa-solid fa-arrow-left"></i> {t('Previous')}
        </button>
      </div>

      <div className="tflow-studio-savestate">
        {props.reviewMode ? (
          <>
            <i className="fa-solid fa-shield-halved"></i> {t('Inspect any item, then decide — the decision applies to the whole submission')}
          </>
        ) : draftSavedAt ? (
          <>
            <i className="fa-solid fa-cloud-arrow-up"></i> {t('Draft saved automatically')}
          </>
        ) : props.hasAnswer ? (
          <>
            <i className="fa-solid fa-circle-check"></i> {t('Answer ready to submit')}
          </>
        ) : (
          <>
            <i className="fa-regular fa-pen-to-square"></i> {t('No answer yet')}
          </>
        )}
      </div>

      <div className="tflow-studio-bottom-right">
        {props.reviewMode ? (
          props.actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`tflow-review-decide tflow-review-decide-${a.tone}`}
              disabled={submitting}
              title={t('Mark this submission as {status}', { status: t(a.to) })}
              onClick={() => props.onDecision(a.key)}
            >
              <i className={a.icon}></i> {t(a.label)}
            </button>
          ))
        ) : (
          <>
            {itemIdx < total - 1 ? (
              <button type="button" className="tflow-btn-ghost" disabled={disabled || submitting} onClick={onNext}>
                {t('Skip for now')} <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : null}
            <Button className="tflow-btn" disabled={disabled || submitting} onClick={props.onSubmit}>
              {t('Submit Item')} <i className="fa-solid fa-paper-plane"></i>
            </Button>
          </>
        )}
      </div>
    </footer>
  );
};

export default StudioBottombar;
