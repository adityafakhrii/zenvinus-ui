import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Box,
  FileText,
  FlaskConical,
  Headphones,
  Image as ImageIcon,
  Shapes,
  Table2,
} from 'lucide-react';
import { allWorkspaceTypes } from '../workspaces/registry';
import { isTaskTypeId } from '../../data/tasks';
import type { TaskTypeId, TaskTypeMeta, Tone } from '../../data/tasks';
import type { TaskDetail } from '../../types/task';
import { useT } from '@/i18n';
import { Badge, CustomProgressBar, CustomSelect, type BadgeTone } from '@/components/ui';

export interface StudioTopbarProps {
  task: Pick<TaskDetail, 'slug' | 'title' | 'type'>;
  meta?: TaskTypeMeta;
  itemIdx: number;
  total: number;
  isDev: boolean;
  devType: TaskTypeId;
  onDevChange: (type: TaskTypeId) => void;
  guidelinesOpen: boolean;
  onToggleGuidelines: () => void;
  demoMode?: boolean;
}

const TYPE_ICON: Readonly<Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>>> = {
  image_classification: ImageIcon,
  text_classification: FileText,
  audio_transcription: Headphones,
  llm_evaluation: Bot,
  tabular_validation: Table2,
  object_annotation: Shapes,
};

const TONE_BADGE: Readonly<Record<Tone, BadgeTone>> = {
  blue: 'blue',
  mint: 'mint',
  purple: 'neutral',
  orange: 'orange',
  amber: 'amber',
  red: 'red',
  green: 'mint',
};

/**
 * Studio top bar: identity + exit on the left, item progress in the middle,
 * guidelines toggle (+ dev-only workspace switcher) on the right.
 */
const StudioTopbar = ({
  task,
  meta,
  itemIdx,
  total,
  isDev,
  devType,
  onDevChange,
  guidelinesOpen,
  onToggleGuidelines,
  demoMode = false,
}: StudioTopbarProps) => {
  const { t } = useT();
  const TypeIcon = meta ? TYPE_ICON[meta.id] || Box : Box;
  const pct = total ? Math.round(((itemIdx + 1) / total) * 100) : 0;

  const devOptions = useMemo(
    () => allWorkspaceTypes().map((wt) => ({ value: wt.id, label: t(wt.label) })),
    [t],
  );

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2.5 border-b border-[rgba(8,13,53,0.08)] bg-white px-3 py-2.5 sm:gap-3 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:gap-2.5">
        <Link
          href={`/task-details?task=${task.slug}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(8,13,53,0.08)] bg-canvas text-ink-secondary transition-colors hover:border-navy/30 hover:bg-white hover:text-ink"
          title={t('Exit studio')}
          aria-label={t('Exit studio')}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
        </Link>

        <span className="hidden items-center gap-1.5 text-sm font-semibold text-navy sm:inline-flex shrink-0">
          <Box className="h-4 w-4 text-teal-ink" strokeWidth={1.75} />
          Zenvinus Studio
        </span>

        <span className="hidden h-4 w-px bg-[#EAEAEA] sm:inline-block shrink-0" aria-hidden="true" />

        {meta && (
          <Badge tone={TONE_BADGE[meta.tone] || 'mint'} className="hidden shrink-0 gap-1.5 sm:inline-flex">
            <TypeIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
            {t(meta.label)}
          </Badge>
        )}

        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink sm:flex-initial sm:max-w-[300px]" title={task.title}>
          {task.title}
        </span>

        {demoMode && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-tone-amber-bg px-2 py-1 text-xs font-medium text-tone-amber-fg"
            title={t('Example items to preview this workspace')}
          >
            <FlaskConical className="h-3 w-3" strokeWidth={1.75} />
            {t('Example')}
          </span>
        )}
      </div>

      <div className="order-3 flex w-full items-center justify-between gap-3 border-t border-line-subtle pt-2 sm:order-none sm:w-auto sm:justify-start sm:border-0 sm:pt-0 shrink-0">
        <span className="shrink-0 text-xs font-medium text-ink-muted tabular-nums">
          {t('Item {current} / {total}', {
            current: <strong className="font-semibold text-ink">{Math.min(itemIdx + 1, total || 1)}</strong>,
            total,
          })}
        </span>
        <div className="flex-1 sm:w-28 md:w-32 sm:flex-none">
          <CustomProgressBar value={pct} tone="teal" height="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isDev && (
          <div className="w-[140px] sm:w-[180px]" title={t('Development only — override task.type')}>
            <CustomSelect
              size="sm"
              options={devOptions}
              value={devType || task.type}
              onChange={(val) => {
                if (isTaskTypeId(val)) onDevChange(val);
              }}
              ariaLabel={t('Development only — override task.type')}
            />
          </div>
        )}
        <button
          type="button"
          onClick={onToggleGuidelines}
          aria-pressed={guidelinesOpen}
          className={`inline-flex h-8 items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 sm:px-3 text-xs font-medium transition-colors ${
            guidelinesOpen
              ? 'border-navy bg-navy text-white'
              : 'border-[rgba(8,13,53,0.08)] bg-white text-ink hover:border-line-input hover:bg-canvas'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span className="sr-only sm:not-sr-only">{t('Guidelines')}</span>
          <kbd
            className={`hidden sm:inline-flex h-4 min-w-4 items-center justify-center rounded px-1 font-mono text-[10px] font-semibold ${
              guidelinesOpen
                ? 'border border-white/25 bg-white/10 text-white'
                : 'border border-line-input bg-canvas text-ink-secondary'
            }`}
          >
            G
          </kbd>
        </button>
      </div>
    </header>
  );
};

export default StudioTopbar;
