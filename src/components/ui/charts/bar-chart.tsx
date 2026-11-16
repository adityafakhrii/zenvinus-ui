import React, { useState } from 'react';
import { cn } from '../cn';

export interface BarChartSeries {
  key: string;
  label: string;
  /** Highlight color used when this bar is active/hovered; defaults to Zenvinus Teal tokens. */
  color: string;
}

export interface BarChartDatum {
  label: string;
  title?: string;
  /** Single-value mode or stacked values keyed by series key. */
  value?: number;
  segments?: Record<string, number>;
}

export interface CustomBarChartProps {
  data: ReadonlyArray<BarChartDatum>;
  series?: ReadonlyArray<BarChartSeries>;
  /** Index highlighted by default before hover (defaults to the last bar). */
  defaultActiveIndex?: number;
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

const DEFAULT_SERIES: ReadonlyArray<BarChartSeries> = [
  { key: 'primary', label: 'Volume', color: '#05DAC3' },
];

const DEFAULT_FORMAT = (v: number): string => v.toLocaleString('en-US');

/**
 * Custom SVG BarChart styled after the ACRU reference with Zenvinus colors:
 * neutral inactive bars, single highlighted column in Zenvinus Teal, dashed gridlines, and floating popover tooltip.
 */
export function CustomBarChart({
  data,
  series = DEFAULT_SERIES,
  defaultActiveIndex,
  height = 240,
  formatValue = DEFAULT_FORMAT,
  className,
}: CustomBarChartProps) {
  const fallbackIndex = data.length > 0 ? (defaultActiveIndex ?? data.length - 1) : -1;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? fallbackIndex;

  if (data.length === 0) return null;

  const totals = data.map((d) => {
    if (d.segments) {
      return series.reduce((sum, s) => sum + Math.max(0, d.segments?.[s.key] ?? 0), 0);
    }
    return Math.max(0, d.value ?? 0);
  });

  const rawMax = Math.max(1, ...totals);
  const niceStep = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const maxVal = Math.ceil(rawMax / niceStep) * niceStep;
  const ticks = [0, 0.33, 0.66, 1].map((r) => Math.round(maxVal * r));

  const viewWidth = 640;
  const padLeft = 44;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 30;
  const plotW = viewWidth - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const colWidth = plotW / data.length;
  const barWidth = Math.min(42, Math.max(16, colWidth * 0.54));

  const activeDatum = activeIndex >= 0 && activeIndex < data.length ? data[activeIndex] : null;
  const tooltipLeftPct = activeIndex >= 0 ? ((padLeft + colWidth * (activeIndex + 0.5)) / viewWidth) * 100 : 50;

  return (
    <div
      className={cn('relative w-full select-none', className)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg
        viewBox={`0 0 ${viewWidth} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Activity bar chart"
      >
        {ticks.map((tick) => {
          const y = padTop + plotH - (tick / maxVal) * plotH;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                x2={viewWidth - padRight}
                y1={y}
                y2={y}
                stroke="#E6E9EE"
                strokeWidth="1"
                strokeDasharray={tick === 0 ? undefined : '4 4'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#9CA3AF] font-mono text-[11px]"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : tick}
              </text>
            </g>
          );
        })}

        {data.map((datum, idx) => {
          const isActive = idx === activeIndex;
          const xCenter = padLeft + colWidth * (idx + 0.5);
          const x = xCenter - barWidth / 2;

          let currentY = padTop + plotH;
          const segmentRects = datum.segments
            ? series.map((s) => {
                const v = Math.max(0, datum.segments?.[s.key] ?? 0);
                const h = (v / maxVal) * plotH;
                currentY -= h;
                return { key: s.key, y: currentY, h, color: s.color };
              })
            : [
                {
                  key: series[0]?.key ?? 'primary',
                  y: padTop + plotH - (Math.max(0, datum.value ?? 0) / maxVal) * plotH,
                  h: (Math.max(0, datum.value ?? 0) / maxVal) * plotH,
                  color: series[0]?.color ?? '#05DAC3',
                },
              ];

          return (
            <g
              key={`${datum.label}-${idx}`}
              tabIndex={0}
              role="button"
              aria-label={`${datum.title ?? datum.label}: ${formatValue(totals[idx] ?? 0)}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onFocus={() => setHoveredIndex(idx)}
              className="cursor-pointer focus:outline-none"
            >
              <rect
                x={x - 6}
                y={padTop}
                width={barWidth + 12}
                height={plotH}
                fill="transparent"
              />
              {segmentRects.map((seg, segIdx) => {
                if (seg.h <= 0) return null;
                const fillColor = isActive
                  ? seg.color
                  : segIdx === 0
                    ? '#E8ECF1'
                    : '#DCE2EA';
                return (
                  <rect
                    key={seg.key}
                    x={x}
                    y={seg.y}
                    width={barWidth}
                    height={Math.max(3, seg.h)}
                    rx={6}
                    fill={fillColor}
                    className="transition-[fill,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                );
              })}
              <text
                x={xCenter}
                y={height - 6}
                textAnchor="middle"
                className={cn(
                  'text-[11px] font-medium transition-colors duration-150',
                  isActive ? 'fill-[#020626]' : 'fill-[#6B7280]',
                )}
              >
                {datum.label}
              </text>
            </g>
          );
        })}
      </svg>

      {activeDatum && (
        <div
          style={{
            left: `${Math.max(16, Math.min(84, tooltipLeftPct))}%`,
            transform: 'translateX(-50%)',
          }}
          className="pointer-events-none absolute top-2 z-20 min-w-[152px] rounded-xl border border-[rgba(8,13,53,0.10)] bg-surface px-3 py-2 shadow-[var(--shadow-popover)] zv-animate-fade"
        >
          <p className="m-0 mb-1.5 text-[11px] font-medium text-ink-muted">
            {activeDatum.title ?? activeDatum.label}
          </p>
          <div className="flex flex-col gap-1">
            {activeDatum.segments ? (
              series.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-4 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatValue(activeDatum.segments?.[s.key] ?? 0)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: series[0]?.color ?? '#05DAC3' }}
                  />
                  {series[0]?.label ?? 'Value'}
                </span>
                <span className="font-semibold text-ink tabular-nums">
                  {formatValue(activeDatum.value ?? 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
