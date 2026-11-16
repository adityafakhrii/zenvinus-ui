import React from 'react';
import { useT } from '@/i18n';
import type { LlmEvaluationAnswer, LlmResponse, WorkspaceProps } from '../../types/workspace';

/**
 * LLM Evaluation workspace — rendered when task.type === 'llm_evaluation'.
 * Rate each model response on 1–5 scales, then pick a preference.
 */
interface ScaleProps {
  label: string;
  value?: number;
  onChange: (n: number) => void;
}

const Scale = ({ label, value, onChange }: ScaleProps) => (
  <div className="tflow-scale">
    <span className="tflow-scale-label">{label}</span>
    <div className="tflow-scale-opts">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={`tflow-scale-btn${value === n ? ' tflow-scale-on' : ''}`} onClick={() => onChange(n)}>
          {n}
        </button>
      ))}
    </div>
  </div>
);

interface ResponseCardProps {
  resp: LlmResponse;
  answer: LlmEvaluationAnswer;
  onChange: (next: LlmEvaluationAnswer) => void;
}

const ResponseCard = ({ resp, answer, onChange }: ResponseCardProps) => {
  const { t } = useT();
  const helpfulnessKey = `helpfulness${resp.label}` as const;
  const accuracyKey = `accuracy${resp.label}` as const;
  return (
    <div className="tflow-llm-card">
      <div className="tflow-llm-head">
        <span className="tflow-llm-badge">{t('Response {label}', { label: resp.label })}</span>
      </div>
      <p className="tflow-llm-text">{resp.text}</p>
      <Scale label={t('Helpfulness')} value={answer[helpfulnessKey]} onChange={(n) => onChange({ ...answer, [helpfulnessKey]: n })} />
      <Scale label={t('Accuracy')} value={answer[accuracyKey]} onChange={(n) => onChange({ ...answer, [accuracyKey]: n })} />
      <button
        type="button"
        className={`tflow-chip tflow-chip-pref${answer.preference === resp.label ? ' tflow-chip-active' : ''}`}
        onClick={() => onChange({ ...answer, preference: resp.label })}
      >
        <i className="fa-solid fa-trophy"></i> {t('Prefer this response')}
      </button>
    </div>
  );
};

const LLMEvaluation = ({ item, answer, onChange }: WorkspaceProps<'llm_evaluation'>) => (
  <div className="tflow-ws-full">
    <div className="tflow-prompt">
      <span className="tflow-canvas-tag">{item.id}</span>
      <p>{item.prompt}</p>
    </div>
    <div className="tflow-llm-grid">
      {(item.responses || []).map((resp) => (
        <ResponseCard key={resp.label} resp={resp} answer={answer} onChange={onChange} />
      ))}
    </div>
  </div>
);

export default LLMEvaluation;
