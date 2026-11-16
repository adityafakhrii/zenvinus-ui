import React, { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n';
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

  const bars = Array.from({ length: 42 }, (_, i) => 18 + Math.round(38 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.33))));

  return (
    <div className="tflow-ws-grid">
      <div className="tflow-canvas tflow-canvas-audio">
        <span className="tflow-canvas-tag">
          {item.id} · {item.duration}
        </span>
        <div className="tflow-audio-head">
          <span className="tflow-audio-meta">
            <i className="fa-solid fa-user-group"></i> {t('{count} speakers', { count: item.speakers })}
          </span>
          <span className="tflow-audio-meta">{t(item.hint)}</span>
        </div>
        <div className="tflow-wave">
          {bars.map((h, i) => (
            <span key={i} style={{ height: `${h}px` }} className={i / bars.length <= elapsed / total ? 'tflow-wave-on' : ''}></span>
          ))}
        </div>
        <div className="tflow-audio-controls">
          <button
            type="button"
            className="tflow-play"
            onClick={() => {
              if (elapsed >= total) setElapsed(0);
              setPlaying((p) => !p);
            }}
          >
            <i className={playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
          </button>
          <span className="tflow-audio-time">
            00:{String(elapsed).padStart(2, '0')} / {item.duration}
          </span>
          <button type="button" className="tflow-audio-speed" onClick={() => setPlaying(false)}>
            1.0×
          </button>
        </div>
      </div>
      <div className="tflow-ws-side">
        <h4>{t('Verbatim transcript')}</h4>
        <p>{t('Type exactly what you hear. Mark crosstalk with [overlap] and noise with [noise].')}</p>
        <textarea
          className="tflow-textarea"
          rows={7}
          placeholder={'Speaker 1: …\nSpeaker 2: …'}
          value={answer.text || ''}
          onChange={(e) => onChange({ ...answer, text: e.target.value })}
        />
      </div>
    </div>
  );
};

export default AudioTranscription;
