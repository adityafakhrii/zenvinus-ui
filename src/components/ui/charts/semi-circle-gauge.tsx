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

const TEAL_STEPS = ['#2DD4BF', '#14B8A6', '#0D9488'] as const;

/**
 * Segmented semi-circular SVG gauge with spacious proportional center figure and cohesive Zenvinus Teal tone ramp.
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
  const cy = 114;
  const rOuter = 102;
  const rInner = 76;
  const gapDeg = 3.2;
  const totalSweep = 180;
  const segSweep = (totalSweep - gapDeg * (segments - 1)) / segments;

  return (
    <div className={cn('mx-auto flex w-full max-w-[230px] flex-col items-center', className)}>
      <svg viewBox="0 0 240 124" className="h-auto w-full overflow-visible" role="img" aria-label={`${label}: ${clamped}%`}>
        {Array.from({ length: segments }, (_, i) => {
          const startDeg = 180 + i * (segSweep + gapDeg);
          const endDeg = startDeg + segSweep;
          const isFilled = i < filledCount;
          const stepIndex = Math.min(TEAL_STEPS.length - 1, Math.floor((i / Math.max(1, segments)) * TEAL_STEPS.length));
          const fill = isFilled ? TEAL_STEPS[stepIndex] : '#E6E9EE';

          return (
            <path
              key={i}
              d={describeArcSegment(cx, cy, rOuter, rInner, startDeg, endDeg)}
              fill={fill}
              className="transition-[fill] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          );
        })}

        <text
          x={cx}
          y={98}
          textAnchor="middle"
          fill="#020626"
          fontSize="26"
          fontWeight="600"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {clamped}%
        </text>
      </svg>
      <span className="mt-1 text-center text-xs text-ink-muted leading-tight">{label}</span>
    </div>
  );
}
