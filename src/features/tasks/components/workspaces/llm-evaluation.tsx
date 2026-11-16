import React from 'react';
import { Trophy } from 'lucide-react';
import { useT } from '@/i18n';
import { Badge } from '@/components/ui';
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
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-xs font-medium text-[#52525B]">{label}</span>
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
              active
                ? 'border-[#132B45] bg-[#132B45] text-white'
                : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#52525B] hover:border-[#00B2A9]/60 hover:bg-white hover:text-[#18181B]'
            }`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        );
      })}
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
  const preferred = answer.preference === resp.label;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 transition-colors ${
        preferred ? 'border-[#00B2A9] ring-1 ring-[#00B2A9]/25' : 'border-[#EAEAEA]'
      }`}
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Badge tone={preferred ? 'mint' : 'blue'}>{t('Response {label}', { label: resp.label })}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-[#18181B]">{resp.text}</p>
      </div>

      <div className="mt-5 border-t border-[#F0F0F2] pt-4">
        <Scale
          label={t('Helpfulness')}
          value={answer[helpfulnessKey]}
          onChange={(n) => onChange({ ...answer, [helpfulnessKey]: n })}
        />
        <Scale
          label={t('Accuracy')}
          value={answer[accuracyKey]}
          onChange={(n) => onChange({ ...answer, [accuracyKey]: n })}
        />
        <button
          type="button"
          aria-pressed={preferred}
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
            preferred
              ? 'border-[#00B2A9] bg-[#E6F7F6] text-[#008C85]'
              : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#52525B] hover:border-[#132B45]/30 hover:bg-white hover:text-[#18181B]'
          }`}
          onClick={() => onChange({ ...answer, preference: resp.label })}
        >
          <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t('Prefer this response')}
        </button>
      </div>
    </div>
  );
};

const LLMEvaluation = ({ item, answer, onChange }: WorkspaceProps<'llm_evaluation'>) => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
      <span className="mb-2 inline-block rounded-md border border-[#EAEAEA] bg-[#F9FAFB] px-2 py-0.5 font-mono text-[11px] font-medium text-[#52525B]">
        {item.id}
      </span>
      <p className="text-[15px] font-medium leading-relaxed text-[#18181B]">{item.prompt}</p>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(item.responses || []).map((resp) => (
        <ResponseCard key={resp.label} resp={resp} answer={answer} onChange={onChange} />
      ))}
    </div>
  </div>
);

export default LLMEvaluation;
