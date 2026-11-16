import React from 'react';
import LabelPicker from './label-picker';
import { useT } from '@/i18n';
import type { WorkspaceProps } from '../../types/workspace';

/**
 * Image Classification workspace — rendered when task.type === 'image_classification'.
 * Contract: { item, answer, onChange }
 */
const ImageClassification = ({ item, answer, onChange }: WorkspaceProps<'image_classification'>) => {
  const { t } = useT();
  return (
    <div className="tflow-ws-grid">
      <div className="tflow-canvas">
        <img src={item.image} alt={item.id} />
        <span className="tflow-canvas-tag">{item.id}</span>
      </div>
      <div className="tflow-ws-side">
        <h4>{t('Choose the product category')}</h4>
        <p>{t('Use the main product as the reference; ignore the background and other props.')}</p>
        <LabelPicker labels={item.labels} value={answer.label} onChange={(label) => onChange({ ...answer, label })} />
      </div>
    </div>
  );
};

export default ImageClassification;
