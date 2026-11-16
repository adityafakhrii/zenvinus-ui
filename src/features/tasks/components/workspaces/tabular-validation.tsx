import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { useT } from '@/i18n';
import { TextInput } from '@/components/ui';
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
    <div className="overflow-hidden rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white">
      {/* Mobile field validation cards (< md) */}
      <div className="divide-y divide-line-subtle md:hidden">
        {(item.fields || []).map((f) => {
          const row: TabularRowAnswer = answer.rows?.[f.key] || {};
          const valid = row.verdict === 'valid';
          const invalid = row.verdict === 'invalid';
          return (
            <div key={f.key} className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{t(f.label)}</span>
                <span className="rounded bg-canvas px-2 py-0.5 font-mono text-xs text-ink break-all">
                  {f.value}
                </span>
              </div>

              <p className="m-0 text-xs text-ink-muted">{t(f.rule)}</p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={valid}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    valid
                      ? 'border-[#10B981] bg-[#10B981] text-white'
                      : 'border-line bg-canvas text-ink-secondary hover:border-[#10B981]/50 hover:bg-white'
                  }`}
                  onClick={() => setRow(f.key, { verdict: 'valid' })}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t('Valid')}
                </button>
                <button
                  type="button"
                  aria-pressed={invalid}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    invalid
                      ? 'border-[#FF5A5F] bg-[#FF5A5F] text-white'
                      : 'border-line bg-canvas text-ink-secondary hover:border-[#FF5A5F]/50 hover:bg-white'
                  }`}
                  onClick={() => setRow(f.key, { verdict: 'invalid' })}
                >
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t('Flag')}
                </button>
              </div>

              <TextInput
                size="sm"
                placeholder={t('Note (optional)')}
                value={row.note || ''}
                onChange={(e) => setRow(f.key, { note: e.target.value })}
              />
            </div>
          );
        })}
      </div>

      {/* Desktop table (>= md) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(8,13,53,0.08)] bg-canvas text-xs font-semibold text-ink-muted">
              <th className="px-4 py-3">{t('Field')}</th>
              <th className="px-4 py-3">{t('Value')}</th>
              <th className="px-4 py-3">{t('Rule')}</th>
              <th className="px-4 py-3">{t('Verdict')}</th>
              <th className="px-4 py-3">{t('Note')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {(item.fields || []).map((f) => {
              const row: TabularRowAnswer = answer.rows?.[f.key] || {};
              const valid = row.verdict === 'valid';
              const invalid = row.verdict === 'invalid';
              return (
                <tr key={f.key} className="hover:bg-surface-soft">
                  <td className="px-4 py-3 font-semibold text-ink">{t(f.label)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink">{f.value}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{t(f.rule)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-pressed={valid}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          valid
                            ? 'border-[#10B981] bg-[#10B981] text-white'
                            : 'border-line bg-canvas text-ink-secondary hover:border-[#10B981]/50 hover:bg-white'
                        }`}
                        onClick={() => setRow(f.key, { verdict: 'valid' })}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t('Valid')}
                      </button>
                      <button
                        type="button"
                        aria-pressed={invalid}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          invalid
                            ? 'border-[#FF5A5F] bg-[#FF5A5F] text-white'
                            : 'border-line bg-canvas text-ink-secondary hover:border-[#FF5A5F]/50 hover:bg-white'
                        }`}
                        onClick={() => setRow(f.key, { verdict: 'invalid' })}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t('Flag')}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TextInput
                      size="sm"
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
