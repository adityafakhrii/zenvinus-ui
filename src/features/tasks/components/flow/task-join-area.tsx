import React, { useState } from 'react';
import Link from 'next/link';
import useTaskRoute from '../../hooks/use-task-route';
import FlowStepper from './flow-stepper';
import { resolveWorkspace } from '../workspaces/registry';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';

const REQUIREMENTS = [
  { icon: 'fa-solid fa-id-card', title: 'Verified account', desc: 'Your email and phone number are verified.' },
  { icon: 'fa-solid fa-wallet', title: 'Payout account', desc: 'At least one reward payout method is registered.' },
  { icon: 'fa-solid fa-gauge-high', title: 'Device ready', desc: 'A modern browser with a stable connection (Chrome/Edge/Firefox).' },
  { icon: 'fa-solid fa-clock-rotate-left', title: 'Account reputation', desc: 'Average accuracy of 70%+ on previous contributions (new contributors start at 100%).' },
];

const TaskJoinArea = () => {
  const { ready, task } = useTaskRoute();
  const { t } = useT();
  const [agreed, setAgreed] = useState(false);
  const [joining, setJoining] = useState(false);

  if (!ready || !task) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  const workspace = resolveWorkspace(task);
  const meta = workspace?.meta;

  const nextRoute = task.requiresQualification
    ? `/task-qualification?task=${task.slug}`
    : `/task-studio?task=${task.slug}`;

  const handleJoin = () => {
    setJoining(true);
    // POST /api/tasks/:slug/join would happen here in production.
    setTimeout(() => window.location.assign(nextRoute), 700);
  };

  return (
    <section className="tflow-area pt-40 pb-120">
      <div className="container">
        <FlowStepper current="join" />

        <div className="tflow-narrow">
          <div className="tflow-panel">
            <span className={`tflow-type-badge tflow-tone-${meta?.tone || 'blue'}`}>
              <i className={meta?.icon || 'fa-solid fa-th-large'}></i> {t('{type} workspace', { type: meta?.label ? t(meta.label) : task.type })}
            </span>
            <h3 className="tflow-title">{task.title}</h3>
            <p className="tflow-desc">{t('Complete the following steps to join and unlock the workspace.')}</p>

            <div className="tflow-req-list">
              {REQUIREMENTS.map((r) => (
                <div key={r.title} className="tflow-req">
                  <span className="tflow-req-icon"><i className={r.icon}></i></span>
                  <div>
                    <h5>{t(r.title)} <i className="fa-solid fa-circle-check tflow-req-ok"></i></h5>
                    <p>{t(r.desc)}</p>
                  </div>
                </div>
              ))}
            </div>

            <label className="tflow-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                {t('I agree to the Zenvinus {agreement} and {policy}, including the rule that submissions failing the quality check may be rejected.', {
                  agreement: <a href="#">{t('Contributor Agreement')}</a>,
                  policy: <a href="#">{t('Quality Policy')}</a>,
                })}
              </span>
            </label>

            <div className="tflow-actions">
              <Link href={`/task-details?task=${task.slug}`} className="tflow-btn-ghost">
                <i className="fa-solid fa-arrow-left"></i> {t('Back to detail')}
              </Link>
              <Button className="tflow-btn" disabled={!agreed || joining} onClick={handleJoin}>
                {task.requiresQualification ? t('Continue to Qualification') : t('Enter Studio')}
                <i className="fa-solid fa-arrow-right"></i>
              </Button>
            </div>
            {!agreed && (
              <p className="tflow-note"><i className="fa-solid fa-circle-info"></i> {t('Tick the agreement to continue.')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskJoinArea;
