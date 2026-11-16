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
    <div className="overflow-hidden rounded-2xl border border-[#EAEAEA] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#F9FAFB] text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              <th className="px-4 py-3">{t('Field')}</th>
              <th className="px-4 py-3">{t('Value')}</th>
              <th className="px-4 py-3">{t('Rule')}</th>
              <th className="px-4 py-3">{t('Verdict')}</th>
              <th className="px-4 py-3">{t('Note')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F2]">
            {(item.fields || []).map((f) => {
              const row: TabularRowAnswer = answer.rows?.[f.key] || {};
              const valid = row.verdict === 'valid';
              const invalid = row.verdict === 'invalid';
              return (
                <tr key={f.key} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-semibold text-[#18181B]">{t(f.label)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#18181B]">{f.value}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{t(f.rule)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-pressed={valid}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          valid
                            ? 'border-[#10B981] bg-[#10B981] text-white'
                            : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#52525B] hover:border-[#10B981]/50 hover:bg-white'
                        }`}
                        onClick={() => setRow(f.key, { verdict: 'valid' })}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                        {t('Valid')}
                      </button>
                      <button
                        type="button"
                        aria-pressed={invalid}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          invalid
                            ? 'border-[#FF5A5F] bg-[#FF5A5F] text-white'
                            : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#52525B] hover:border-[#FF5A5F]/50 hover:bg-white'
                        }`}
                        onClick={() => setRow(f.key, { verdict: 'invalid' })}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
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
