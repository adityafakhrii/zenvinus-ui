import React from 'react';
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

/**
 * Studio right sidebar: item navigator (jump between items, see which ones
 * already have a draft), the task guidelines, and shortcut hints.
 */
const StudioSidebar = ({ task, meta, guidelines, itemStates, onSelect }: StudioSidebarProps) => {
  const { t } = useT();
  return (
    <aside className="tflow-studio-side">
      <div className="tflow-studio-sidecard">
        <h4 className="tflow-studio-sidehead">
          <i className="fa-solid fa-list-ol"></i> {t('Items')}
        </h4>
        <div className="tflow-studio-items">
          {itemStates.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`tflow-studio-itemdot tflow-studio-itemdot-${s.state}`}
              onClick={() => onSelect(i)}
              aria-label={s.state === 'draft' ? t('Item {n} — has a draft', { n: i + 1 }) : t('Item {n}', { n: i + 1 })}
              title={s.id}
            >
              {s.state === 'draft' ? <i className="fa-solid fa-pen" aria-hidden="true"></i> : i + 1}
            </button>
          ))}
        </div>
        <p className="tflow-studio-sidefoot">
          <i className="fa-solid fa-pen"></i> {t('has a saved draft')}
        </p>
      </div>

      <div className="tflow-studio-sidecard">
        <h4 className="tflow-studio-sidehead">
          <i className="fa-solid fa-book-open"></i> {t('Guidelines')}
        </h4>
        <p className="tflow-studio-sidemeta">
          {meta?.label ? t(meta.label) : ''} · {t(task.language)}
        </p>
        <ul className="tflow-checklist">
          {(guidelines || []).map((g) => (
            <li key={g}>
              <i className="fa-solid fa-circle-check"></i> {t(g)}
            </li>
          ))}
        </ul>
      </div>

      <div className="tflow-studio-sidecard">
        <h4 className="tflow-studio-sidehead">
          <i className="fa-solid fa-keyboard"></i> {t('Shortcuts')}
        </h4>
        <ul className="tflow-studio-keys">
          <li>
            <kbd>←</kbd>
            <kbd>→</kbd> {t('switch item')}
          </li>
          <li>
            <kbd>G</kbd> {t('open/close this panel')}
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default StudioSidebar;
