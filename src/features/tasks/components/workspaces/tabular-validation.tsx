import React from 'react';
import { useT } from '@/i18n';
import type { TabularRowAnswer, WorkspaceProps } from '../../types/workspace';

/**
 * Tabular Validation workspace — rendered when task.type === 'tabular_validation'.
 * Field-by-field verdicts (valid / invalid) plus a short note per flagged field.
 */
const TabularValidation = ({ item, answer, onChange }: WorkspaceProps<'tabular_validation'>) => {
  const { t } = useT();
  const setRow = (key: string, patch: TabularRowAnswer) =>
    onChange({ ...answer, rows: { ...answer.rows, [key]: { ...answer.rows?.[key], ...patch } } });

  return (
    <div className="tflow-ws-full">
      <div className="tflow-table-wrap">
        <table className="tflow-table">
          <thead>
            <tr>
              <th>{t('Field')}</th>
              <th>{t('Value')}</th>
              <th>{t('Rule')}</th>
              <th>{t('Verdict')}</th>
              <th>{t('Note')}</th>
            </tr>
          </thead>
          <tbody>
            {(item.fields || []).map((f) => {
              const row: TabularRowAnswer = answer.rows?.[f.key] || {};
              return (
                <tr key={f.key}>
                  <td className="tflow-table-field">{t(f.label)}</td>
                  <td className="tflow-table-value">{f.value}</td>
                  <td className="tflow-table-rule">{t(f.rule)}</td>
                  <td>
                    <div className="tflow-verdict">
                      <button
                        type="button"
                        className={`tflow-chip tflow-chip-valid${row.verdict === 'valid' ? ' tflow-chip-active' : ''}`}
                        onClick={() => setRow(f.key, { verdict: 'valid' })}
                      >
                        <i className="fa-solid fa-check"></i> {t('Valid')}
                      </button>
                      <button
                        type="button"
                        className={`tflow-chip tflow-chip-invalid${row.verdict === 'invalid' ? ' tflow-chip-active' : ''}`}
                        onClick={() => setRow(f.key, { verdict: 'invalid' })}
                      >
                        <i className="fa-solid fa-triangle-exclamation"></i> {t('Flag')}
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="tflow-input"
                      placeholder={t('Note (optional)')}
                      value={row.note || ''}
                      onChange={(e) => setRow(f.key, { note: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabularValidation;
