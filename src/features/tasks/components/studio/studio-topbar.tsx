import React from 'react';
import Link from 'next/link';
import { allWorkspaceTypes } from '../workspaces/registry';
import { isTaskTypeId } from '../../data/tasks';
import type { TaskTypeId, TaskTypeMeta } from '../../data/tasks';
import type { TaskDetail } from '../../types/task';
import { useT } from '@/i18n';

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
  return (
    <header className="tflow-studio-bar">
      <div className="tflow-studio-bar-left">
        <Link href={`/task-details?task=${task.slug}`} className="tflow-studio-exit" title={t('Exit studio')}>
          <i className="fa-solid fa-angle-left"></i>
        </Link>
        <span className="tflow-studio-brand">
          <i className="fa-solid fa-cube"></i> Zenvinus Studio
        </span>
        <span className="tflow-studio-divider"></span>
        {meta && (
          <span className={`tflow-type-badge tflow-tone-${meta.tone}`}>
            <i className={meta.icon}></i> {t(meta.label)}
          </span>
        )}
        <span className="tflow-studio-task" title={task.title}>
          {task.title}
        </span>
        {demoMode && (
          <span className="tflow-studio-demo" title={t('Example items to preview this workspace')}>
            <i className="fa-solid fa-flask"></i> {t('Example')}
          </span>
        )}
      </div>

      <div className="tflow-studio-progress">
        <span>{t('Item {current} / {total}', { current: <strong>{Math.min(itemIdx + 1, total || 1)}</strong>, total })}</span>
        <div className="tflow-progress tflow-progress-dark">
          <span style={{ width: `${total ? ((itemIdx + 1) / total) * 100 : 0}%` }}></span>
        </div>
      </div>

      <div className="tflow-studio-bar-right">
        {isDev && (
          <select
            className="tflow-studio-devselect"
            value={devType || task.type}
            onChange={(e) => {
              if (isTaskTypeId(e.target.value)) onDevChange(e.target.value);
            }}
            title={t('Development only — override task.type')}
          >
            {allWorkspaceTypes().map((wt) => (
              <option key={wt.id} value={wt.id}>
                {t(wt.label)}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className={`tflow-studio-barbtn${guidelinesOpen ? ' tflow-studio-barbtn-on' : ''}`}
          onClick={onToggleGuidelines}
        >
          <i className="fa-solid fa-book-open"></i> {t('Guidelines')}
          <kbd>G</kbd>
        </button>
      </div>
    </header>
  );
};

export default StudioTopbar;
