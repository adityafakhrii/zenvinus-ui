import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Users } from 'lucide-react';
import { useT } from '@/i18n';
import { Textarea } from '@/components/ui';
import type { WorkspaceProps } from '../../types/workspace';

/**
 * Audio Transcription workspace — rendered when task.type === 'audio_transcription'.
 * The player is a visual mock (no real audio asset needed); the transcription
 * workflow and verbatim rules are the real interaction.
 */
const AudioTranscription = ({ item, answer, onChange }: WorkspaceProps<'audio_transcription'>) => {
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const total = 14; // seconds represented by the mock clip

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((sec) => {
          if (sec + 1 >= total) {
            clearInterval(timerRef.current);
            setPlaying(false);
            return total;
          }
          return sec + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [item.id]);

  const bars = Array.from(
    { length: 42 },
    (_, i) => 18 + Math.round(38 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.33))),
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="flex flex-col justify-between rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-6 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-md border border-[rgba(8,13,53,0.08)] bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
            {item.id} · {item.duration}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Users className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.75} />
              {t('{count} speakers', { count: item.speakers })}
            </span>
            <span>{t(item.hint)}</span>
          </div>
        </div>

        <div className="my-8 flex h-20 items-end justify-between gap-1 rounded-xl border border-line-subtle bg-canvas px-4 py-3">
          {bars.map((h, i) => {
            const active = i / bars.length <= elapsed / total;
            return (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1.5 flex-1 rounded-full transition-colors ${
                  active ? 'bg-teal' : 'bg-[#D1D5DB]'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-navy-hover"
              onClick={() => {
                if (elapsed >= total) setElapsed(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? (
                <Pause className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Play className="ml-0.5 h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
            <span className="font-mono text-sm font-semibold tabular-nums text-ink">
              00:{String(elapsed).padStart(2, '0')} <span className="text-ink-subtle">/ {item.duration}</span>
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg border border-line bg-canvas px-2.5 py-1 font-mono text-xs font-semibold text-ink-secondary transition-colors hover:border-line-input hover:bg-white hover:text-ink"
            onClick={() => setPlaying(false)}
          >
            1.0×
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-5 lg:col-span-6">
        <h4 className="text-base font-semibold text-ink">{t('Verbatim transcript')}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {t('Type exactly what you hear. Mark crosstalk with [overlap] and noise with [noise].')}
        </p>
        <div className="mt-4">
          <Textarea
            rows={8}
            placeholder={'Speaker 1: …\nSpeaker 2: …'}
            value={answer.text || ''}
            onChange={(e) => onChange({ ...answer, text: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioTranscription;
