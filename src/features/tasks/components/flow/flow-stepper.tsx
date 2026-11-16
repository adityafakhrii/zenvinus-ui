import React from 'react';
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Coins,
  FileText,
  GraduationCap,
  Laptop,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/components/ui';
import { useT } from '@/i18n';
import { FLOW_STEPS, type FlowStepKey } from '../../data/tasks';

const STEP_ICONS = {
  list: ClipboardList,
  detail: FileText,
  join: UserCheck,
  qualification: GraduationCap,
  workspace: Laptop,
  quality: ShieldCheck,
  completed: CheckCircle2,
  reward: Coins,
} as const;

export interface FlowStepperProps {
  current: FlowStepKey;
}

/**
 * Clean responsive contributor flow progression bar rendered across task detail/join/qualify/QA/reward screens.
 */
const FlowStepper = ({ current }: FlowStepperProps) => {
  const { t } = useT();
  const idx = FLOW_STEPS.findIndex((s) => s.key === current);

  return (
    <nav aria-label={t('Task flow')} className="mb-6 overflow-x-auto pb-1">
      <ol className="m-0 flex min-w-max list-none items-center gap-2 rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-3 shadow-[0_1px_2px_rgba(2,6,38,0.03)]">
        {FLOW_STEPS.map((step, i) => {
          const state = i < idx ? 'done' : i === idx ? 'active' : 'todo';
          const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] ?? ClipboardList;

          return (
            <li key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                  state === 'active'
                    ? 'bg-navy text-white'
                    : state === 'done'
                      ? 'bg-tint-mint text-teal-ink'
                      : 'bg-canvas text-ink-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    state === 'active'
                      ? 'bg-teal text-navy'
                      : state === 'done'
                        ? 'bg-teal-ink text-white'
                        : 'bg-surface text-ink-muted',
                  )}
                >
                  {state === 'done' ? (
                    <Check className="h-3 w-3" strokeWidth={1.75} />
                  ) : (
                    <Icon className="h-3 w-3" strokeWidth={1.5} />
                  )}
                </span>
                <span className="whitespace-nowrap">{t(step.label)}</span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <span className="h-px w-4 bg-line hidden sm:inline-block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default FlowStepper;
