import React from 'react';
import { cn } from '../cn';

export interface CustomSemiCircleGaugeProps {
  /** Percentage from 0 to 100. */
  value: number;
  label?: string;
  segments?: number;
  className?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArcSegment(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number,
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p3 = polarToCartesian(cx, cy, rInner, endDeg);
  const p4 = polarToCartesian(cx, cy, rInner, startDeg);
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 0 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/**
 * Segmented semi-circular SVG gauge matching the reference Health/Quality widget with Zenvinus Teal ramp.
 */
export function CustomSemiCircleGauge({
  value,
  label = 'Health score',
  segments = 8,
  className,
}: CustomSemiCircleGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const filledCount = Math.round((clamped / 100) * segments);
  const cx = 120;
  const cy = 112;
  const rOuter = 96;
  const rInner = 64;
  const gapDeg = 3.5;
  const totalSweep = 180;
  const segSweep = (totalSweep - gapDeg * (segments - 1)) / segments;

  return (
    <div className={cn('relative mx-auto flex w-full max-w-[240px] flex-col items-center', className)}>
      <svg viewBox="0 0 240 132" className="h-auto w-full" role="img" aria-label={`${label}: ${clamped}%`}>
        {Array.from({ length: segments }, (_, i) => {
          const startDeg = 180 + i * (segSweep + gapDeg);
          const endDeg = startDeg + segSweep;
          const isFilled = i < filledCount;
          const progressRatio = i / Math.max(1, segments - 1);
          const fill = isFilled ? (progressRatio < 0.5 ? '#05DAC3' : '#09AD86') : '#E6E9EE';

          return (
            <path
              key={i}
              d={describeArcSegment(cx, cy, rOuter, rInner, startDeg, endDeg)}
              fill={fill}
              className="transition-[fill] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          );
        })}
      </svg>
      <div className="pointer-events-none -mt-12 flex flex-col items-center text-center">
        <span className="text-[28px] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {clamped}%
        </span>
        <span className="mt-1 text-xs text-ink-muted">{label}</span>
      </div>
    </div>
  );
}
