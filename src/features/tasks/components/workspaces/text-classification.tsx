import React from 'react';
import LabelPicker from './label-picker';
import { useT } from '@/i18n';
import type { WorkspaceProps } from '../../types/workspace';

/**
 * Text Classification workspace — rendered when task.type === 'text_classification'.
 */
const TextClassification = ({ item, answer, onChange }: WorkspaceProps<'text_classification'>) => {
  const { t } = useT();
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="relative flex min-h-[280px] flex-col justify-center rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-6 pt-12 lg:col-span-7">
        <span className="absolute left-5 top-4 rounded-md border border-[rgba(8,13,53,0.08)] bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
          {item.id}
        </span>
        <p className="text-[15px] leading-relaxed text-ink">{item.text}</p>
      </div>

      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-5 lg:col-span-5">
        <h4 className="text-base font-semibold text-ink">{t('Dominant topic')}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {t('Pick the one category that best represents the document.')}
        </p>
        <div className="mt-5">
          <LabelPicker labels={item.labels} value={answer.label} onChange={(label) => onChange({ ...answer, label })} />
        </div>
      </div>
    </div>
  );
};

export default TextClassification;
