import React from 'react';
import { useT } from '@/i18n';

export interface LabelPickerProps {
  /** English i18n keys */
  labels?: readonly string[];
  value?: string;
  onChange: (label: string) => void;
  name?: string;
}

/** Shared radio-chip label picker used by several workspaces. */
const LabelPicker = ({ labels = [], value, onChange, name = 'label' }: LabelPickerProps) => {
  const { t } = useT();
  return (
    <div className="tflow-chips" role="radiogroup" aria-label={name}>
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          className={`tflow-chip${value === label ? ' tflow-chip-active' : ''}`}
          onClick={() => onChange(label)}
        >
          {value === label && <i className="fa-solid fa-check"></i>}
          {t(label)}
        </button>
      ))}
    </div>
  );
};

export default LabelPicker;
