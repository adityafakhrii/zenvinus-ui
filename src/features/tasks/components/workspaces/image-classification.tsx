import React from 'react';
import Image from 'next/image';
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-[#EAEAEA] bg-[#F3F4F6] p-4 lg:col-span-7">
        <span className="absolute left-3.5 top-3.5 z-10 rounded-md border border-[#EAEAEA] bg-white/95 px-2 py-0.5 font-mono text-[11px] font-medium text-[#18181B] shadow-xs">
          {item.id}
        </span>
        <Image
          src={item.image}
          alt={item.id}
          width={960}
          height={640}
          unoptimized
          className="max-h-[460px] w-full rounded-xl object-contain"
        />
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-[#EAEAEA] bg-white p-5 lg:col-span-5">
        <div>
          <h4 className="text-base font-semibold text-[#18181B]">{t('Choose the product category')}</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
            {t('Use the main product as the reference; ignore the background and other props.')}
          </p>
          <div className="mt-5">
            <LabelPicker labels={item.labels} value={answer.label} onChange={(label) => onChange({ ...answer, label })} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageClassification;
