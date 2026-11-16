import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gauge,
  History,
  IdCard,
  Info,
  Wallet,
} from 'lucide-react';
import { Badge, BentoSkeleton, Button, CustomCheckbox } from '@/components/ui';
import { useT } from '@/i18n';
import useTaskRoute from '../../hooks/use-task-route';
import { resolveWorkspace } from '../workspaces/registry';
import FlowStepper from './flow-stepper';

const REQUIREMENTS = [
  { icon: IdCard, title: 'Verified account', desc: 'Your email and phone number are verified.' },
  { icon: Wallet, title: 'Payout account', desc: 'At least one reward payout method is registered.' },
  { icon: Gauge, title: 'Device ready', desc: 'A modern browser with a stable connection (Chrome/Edge/Firefox).' },
  {
    icon: History,
    title: 'Account reputation',
    desc: 'Average accuracy of 70%+ on previous contributions (new contributors start at 100%).',
  },
] as const;

/**
 * Contributor task onboarding & agreement step (/task-join) using CustomCheckbox & Tailwind UI Kit.
 */
const TaskJoinArea = () => {
  const { ready, task } = useTaskRoute();
  const { t } = useT();
  const [agreed, setAgreed] = useState(false);
  const [joining, setJoining] = useState(false);

  if (!ready || !task) {
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
  const nextRoute = task.requiresQualification
    ? `/task-qualification?task=${task.slug}`
    : `/task-studio?task=${task.slug}`;

  const handleJoin = () => {
    setJoining(true);
    window.setTimeout(() => window.location.assign(nextRoute), 700);
  };

  return (
    <section className="min-h-screen bg-canvas py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <FlowStepper current="join" />

        <div className="mx-auto max-w-2xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
          <Badge tone="blue">
            {t('{type} workspace', { type: meta?.label ? t(meta.label) : task.type })}
          </Badge>
          <h1 className="mt-3 mb-1 text-2xl font-semibold tracking-tight text-ink">{task.title}</h1>
          <p className="m-0 text-sm text-ink-secondary">
            {t('Complete the following steps to join and unlock the workspace.')}
          </p>

          <ul className="mt-6 mb-6 flex list-none flex-col gap-3 p-0">
            {REQUIREMENTS.map((req) => {
              const Icon = req.icon;
              return (
                <li
                  key={req.title}
                  className="flex items-start gap-3.5 rounded-xl border border-line-subtle bg-canvas p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink">
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <span>{t(req.title)}</span>
                      <CheckCircle2 className="h-4 w-4 text-teal-ink" strokeWidth={1.75} />
                    </div>
                    <p className="mt-0.5 mb-0 text-xs leading-relaxed text-ink-secondary">{t(req.desc)}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-line-subtle bg-canvas p-4">
            <CustomCheckbox
              checked={agreed}
              onChange={setAgreed}
              label={
                <span className="text-xs leading-relaxed text-ink-secondary font-normal">
                  {t(
                    'I agree to the Zenvinus {agreement} and {policy}, including the rule that submissions failing the quality check may be rejected.',
                    {
                      agreement: (
                        <a href="#" className="font-semibold text-teal-ink underline">
                          {t('Contributor Agreement')}
                        </a>
                      ),
                      policy: (
                        <a href="#" className="font-semibold text-teal-ink underline">
                          {t('Quality Policy')}
                        </a>
                      ),
                    },
                  )}
                </span>
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              href={`/task-details?task=${task.slug}`}
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.6} />}
            >
              {t('Back to detail')}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!agreed}
              loading={joining}
              onClick={handleJoin}
              rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
            >
              {task.requiresQualification ? t('Continue to Qualification') : t('Enter Studio')}
            </Button>
          </div>

          {!agreed && (
            <p className="mt-3 mb-0 inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{t('Tick the agreement to continue.')}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TaskJoinArea;
