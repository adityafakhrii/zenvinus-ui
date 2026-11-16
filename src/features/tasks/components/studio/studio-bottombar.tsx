import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CloudUpload,
  PenSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useT } from '@/i18n';
import { Button } from '@/components/ui';
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

const DECISION_META: Readonly<
  Record<
    string,
    {
      Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
      className: string;
    }
  >
> = {
  approved: {
    Icon: Check,
    className: 'border-[#10B981] bg-[#10B981] text-white hover:bg-[#059669]',
  },
  revision: {
    Icon: RotateCcw,
    className: 'border-[#FCD34D] bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]',
  },
  rejected: {
    Icon: X,
    className: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]',
  },
  escalate: {
    Icon: ArrowUpRight,
    className: 'border-line-input bg-canvas text-navy hover:bg-[#E4E4E7]',
  },
};

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
    <footer className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(8,13,53,0.08)] bg-white px-4 py-2.5 sm:px-5">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || itemIdx === 0}
          onClick={onPrev}
          leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.6} />}
        >
          {t('Previous')}
        </Button>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        {props.reviewMode ? (
          <>
            <ShieldCheck className="h-4 w-4 text-navy" strokeWidth={1.6} />
            <span>{t('Inspect any item, then decide — the decision applies to the whole submission')}</span>
          </>
        ) : draftSavedAt ? (
          <>
            <CloudUpload className="h-4 w-4 text-teal-ink" strokeWidth={1.6} />
            <span className="text-teal-ink">{t('Draft saved automatically')}</span>
          </>
        ) : props.hasAnswer ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" strokeWidth={1.6} />
            <span className="text-[#059669]">{t('Answer ready to submit')}</span>
          </>
        ) : (
          <>
            <PenSquare className="h-4 w-4 text-ink-subtle" strokeWidth={1.6} />
            <span>{t('No answer yet')}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {props.reviewMode ? (
          props.actions.map((a) => {
            const meta = DECISION_META[a.key] || DECISION_META.escalate;
            const Icon = meta.Icon;
            return (
              <button
                key={a.key}
                type="button"
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${meta.className}`}
                disabled={submitting}
                title={t('Mark this submission as {status}', { status: t(a.to) })}
                onClick={() => props.onDecision(a.key)}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t(a.label)}
              </button>
            );
          })
        ) : (
          <>
            {itemIdx < total - 1 ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled || submitting}
                onClick={onNext}
                rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('Skip for now')}
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="sm"
              disabled={disabled || submitting}
              onClick={props.onSubmit}
              rightIcon={<Send className="h-3.5 w-3.5" strokeWidth={1.75} />}
            >
              {t('Submit Item')}
            </Button>
          </>
        )}
      </div>
    </footer>
  );
};

export default StudioBottombar;
