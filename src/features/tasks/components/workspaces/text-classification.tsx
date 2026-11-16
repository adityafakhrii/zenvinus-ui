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
    <div className="tflow-ws-grid">
      <div className="tflow-canvas tflow-canvas-text">
        <span className="tflow-canvas-tag">{item.id}</span>
        <p>{item.text}</p>
      </div>
      <div className="tflow-ws-side">
        <h4>{t('Dominant topic')}</h4>
        <p>{t('Pick the one category that best represents the document.')}</p>
        <LabelPicker labels={item.labels} value={answer.label} onChange={(label) => onChange({ ...answer, label })} />
      </div>
    </div>
  );
};

export default TextClassification;
