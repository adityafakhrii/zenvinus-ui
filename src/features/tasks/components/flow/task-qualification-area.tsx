import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useTaskRoute from '../../hooks/use-task-route';
import FlowStepper from './flow-stepper';
import { resolveWorkspace } from '../workspaces/registry';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';
import { scoreStyle } from '../../utils/score-style';

interface QualificationResult {
  score: number;
  passed: boolean;
}

const TaskQualificationArea = () => {
  const { router, ready, task } = useTaskRoute();
  const { t } = useT();
  // chosen option index per question index
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Tasks that don't need qualification skip straight to the workspace.
  useEffect(() => {
    if (ready && task && !task.requiresQualification) {
      router.replace(`/task-studio?task=${task.slug}`);
    }
  }, [ready, task, router]);

  const qualification = task?.qualification;
  if (!ready || !task || !task.requiresQualification || !qualification) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  const workspace = resolveWorkspace(task);
  const meta = workspace?.meta;
  const allAnswered = qualification.questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    setSubmitting(true);
    const correct = qualification.questions.filter((q, i) => answers[i] === q.answer).length;
    const score = Math.round((correct / qualification.questions.length) * 100);
    setTimeout(() => {
      setResult({ score, passed: score >= qualification.passScore });
      setSubmitting(false);
    }, 700);
  };

  return (
    <section className="tflow-area pt-40 pb-120">
      <div className="container">
        <FlowStepper current="qualification" />

        <div className="tflow-narrow">
          {result ? (
            <div className="tflow-panel tflow-result">
              <span className={`tflow-result-icon ${result.passed ? 'tflow-result-pass' : 'tflow-result-fail'}`}>
                <i className={result.passed ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
              </span>
              <h3 className="tflow-title">
                {result.passed ? t('Qualification passed!') : t('Not passed yet')}
              </h3>
              <div className="tflow-score-ring" style={scoreStyle(result.score)}>
                <strong>{result.score}</strong><span>/100</span>
              </div>
              <p className="tflow-desc">
                {result.passed
                  ? t('Minimum score of {score} reached. The {name} workspace is now open to you.', { score: qualification.passScore, name: <strong>{meta?.label ? t(meta.label) : ''}</strong> })
                  : t('Minimum score is {score}. Review the guidelines on the detail page, then try again.', { score: qualification.passScore })}
              </p>
              <div className="tflow-actions tflow-actions-center">
                <Link href={`/task-details?task=${task.slug}`} className="tflow-btn-ghost">
                  <i className="fa-solid fa-book-open"></i> {t('Review guidelines')}
                </Link>
                {result.passed ? (
                  <Button className="tflow-btn" onClick={() => router.push(`/task-studio?task=${task.slug}`)}>
                    {t('Open Studio')} <i className="fa-solid fa-arrow-right"></i>
                  </Button>
                ) : (
                  <Button className="tflow-btn" onClick={() => { setResult(null); setAnswers({}); }}>
                    {t('Try Again')} <i className="fa-solid fa-rotate-right"></i>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="tflow-panel">
              <div className="tflow-qual-head">
                <div>
                  <h3 className="tflow-title">{t('Qualification')} — {task.title}</h3>
                  <p className="tflow-desc">
                    {t('{count} questions · minimum score {score} · workspace {name}', {
                      count: qualification.questions.length,
                      score: qualification.passScore,
                      name: <strong>{meta?.label ? t(meta.label) : ''}</strong>,
                    })}
                  </p>
                </div>
                <span className="tflow-badge-soft tflow-badge-qual">
                  <i className="fa-solid fa-graduation-cap"></i> {t('Required')}
                </span>
              </div>

              <ol className="tflow-quiz">
                {qualification.questions.map((q, qi) => (
                  <li key={qi} className="tflow-quiz-item">
                    <h5>{q.q}</h5>
                    <div className="tflow-quiz-opts">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          type="button"
                          className={`tflow-quiz-opt${answers[qi] === oi ? ' tflow-quiz-opt-active' : ''}`}
                          onClick={() => setAnswers({ ...answers, [qi]: oi })}
                        >
                          <span className="tflow-quiz-key">{String.fromCharCode(65 + oi)}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="tflow-actions">
                <Link href={`/task-join?task=${task.slug}`} className="tflow-btn-ghost">
                  <i className="fa-solid fa-arrow-left"></i> {t('Back')}
                </Link>
                <Button className="tflow-btn" disabled={!allAnswered || submitting} onClick={handleSubmit}>
                  {t('Submit Qualification')} <i className="fa-solid fa-paper-plane"></i>
                </Button>
              </div>
              {!allAnswered && (
                <p className="tflow-note"><i className="fa-solid fa-circle-info"></i> {t('Answer every question to submit.')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TaskQualificationArea;
