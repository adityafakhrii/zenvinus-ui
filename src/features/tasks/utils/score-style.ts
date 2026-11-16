import type { CSSProperties } from 'react';

/** Inline style that sets the --score custom property read by .tflow-score-ring */
export const scoreStyle = (score: number): CSSProperties => {
  const style: CSSProperties & { '--score': number } = { '--score': score };
  return style;
};
