import React from 'react';
import { BookOpen, CheckCircle2, Keyboard, ListOrdered, PenLine } from 'lucide-react';
import { useT } from '@/i18n';
import type { TaskTypeMeta } from '../../data/tasks';
import type { TaskDetail } from '../../types/task';
import type { StudioItemState } from '../../types/submission';

export interface StudioSidebarProps {
  task: Pick<TaskDetail, 'language'>;
  meta?: TaskTypeMeta;
  guidelines: readonly string[];
  itemStates: StudioItemState[];
  onSelect: (idx: number) => void;
}

const itemButtonClass = (state: StudioItemState['state']): string => {
  if (state === 'current') {
    return 'border-[#132B45] bg-[#132B45] text-white shadow-xs';
  }
  if (state === 'draft') {
    return 'border-[#99E0DC] bg-[#E6F7F6] text-[#008C85] hover:bg-[#D1F1EF]';
  }
  return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#52525B] hover:border-[#D4D4D8] hover:bg-white hover:text-[#18181B]';
};

/**
 * Studio right sidebar: item navigator (jump between items, see which ones
 * already have a draft), the task guidelines, and shortcut hints.
 */
const StudioSidebar = ({ task, meta, guidelines, itemStates, onSelect }: StudioSidebarProps) => {
  const { t } = useT();
  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 border-t border-[#EAEAEA] bg-[#F9FAFB] p-4 lg:w-[304px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          <ListOrdered className="h-3.5 w-3.5 text-[#132B45]" strokeWidth={1.75} />
          {t('Items')}
        </h4>
        <div className="grid grid-cols-6 gap-1.5">
          {itemStates.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`inline-flex h-8 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-colors ${itemButtonClass(s.state)}`}
              onClick={() => onSelect(i)}
              aria-label={s.state === 'draft' ? t('Item {n} — has a draft', { n: i + 1 }) : t('Item {n}', { n: i + 1 })}
              aria-current={s.state === 'current' ? 'step' : undefined}
              title={s.id}
            >
              {s.state === 'draft' ? <PenLine className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> : i + 1}
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <PenLine className="h-3 w-3 text-[#008C85]" strokeWidth={1.75} />
          {t('has a saved draft')}
        </p>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4">
        <h4 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          <BookOpen className="h-3.5 w-3.5 text-[#132B45]" strokeWidth={1.75} />
          {t('Guidelines')}
        </h4>
        <p className="mb-3 text-xs text-[#6B7280]">
          {meta?.label ? t(meta.label) : ''} · {t(task.language)}
        </p>
        <ul className="space-y-2">
          {(guidelines || []).map((g) => (
            <li key={g} className="flex items-start gap-2 text-xs leading-relaxed text-[#3F3F46]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00B2A9]" strokeWidth={1.75} />
              <span>{t(g)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          <Keyboard className="h-3.5 w-3.5 text-[#132B45]" strokeWidth={1.75} />
          {t('Shortcuts')}
        </h4>
        <ul className="space-y-2 text-xs text-[#52525B]">
          <li className="flex items-center justify-between gap-2">
            <span>{t('switch item')}</span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[#D4D4D8] bg-[#F4F4F5] px-1.5 font-mono text-[11px] font-semibold text-[#18181B]">
                ←
              </kbd>
              <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[#D4D4D8] bg-[#F4F4F5] px-1.5 font-mono text-[11px] font-semibold text-[#18181B]">
                →
              </kbd>
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span>{t('open/close this panel')}</span>
            <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[#D4D4D8] bg-[#F4F4F5] px-1.5 font-mono text-[11px] font-semibold text-[#18181B]">
              G
            </kbd>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default StudioSidebar;
