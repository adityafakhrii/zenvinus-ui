import React from 'react';
import { Check } from 'lucide-react';
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
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {labels.map((label) => {
        const active = value === label;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={active}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-navy bg-navy text-white shadow-xs'
                : 'border-line bg-canvas text-ink hover:border-teal-ink/60 hover:bg-white'
            }`}
            onClick={() => onChange(label)}
          >
            {active && <Check className="h-3.5 w-3.5 text-teal-ink" strokeWidth={2.25} />}
            <span>{t(label)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LabelPicker;
