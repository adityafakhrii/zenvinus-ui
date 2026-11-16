/**
 * Quality-check scoring: compares a submitted answer with the item's gold
 * standard, per workspace type. In production this runs server-side
 * (review service + consensus with other contributors); the shapes are
 * identical so the UI does not change when the real backend lands.
 */
import type { TaskTypeId } from './tasks';
import type { TaskItem, WorkspaceAnswer, WorkspaceAnswerMap, WorkspaceItemMap } from '../types/workspace';
import type { QualityCheck, QualityReview } from '../types/quality';
import { workspaceInput } from '../utils/workspace-input';

type Checker<K extends TaskTypeId> = (input: { answer: WorkspaceAnswerMap[K]; item: WorkspaceItemMap[K] }) => QualityCheck[];

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const setB = new Set(b.split(' '));
  const words = a.split(' ');
  const hit = words.filter((w) => setB.has(w)).length;
  return hit / Math.max(words.length, setB.size);
}

const labelCheck = ({ answer, item }: { answer: WorkspaceAnswerMap['image_classification']; item: { gold: string } }): QualityCheck[] => [
  { label: 'Label', submitted: answer.label || '—', expected: item.gold, ok: answer.label === item.gold },
];

/* type-specific checkers -> [{ label, submitted, expected, ok }] */
const CHECKERS: { [K in TaskTypeId]: Checker<K> } = {
  image_classification: labelCheck,
  text_classification: labelCheck,
  audio_transcription: ({ answer, item }) => {
    const submitted = (answer.text || '').trim();
    const expected = item.gold;
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const sim = similarity(norm(submitted), norm(expected));
    return [{ label: 'Transcript match (WER proxy)', submitted: submitted || '—', expected, ok: sim >= 0.8, score: sim }];
  },
  llm_evaluation: ({ answer, item }) => {
    const g = item.gold;
    return [
      { label: 'Preferred response', submitted: answer.preference || '—', expected: g.preference, ok: answer.preference === g.preference },
      { label: `Helpfulness ${g.helpfulnessA ? 'A' : ''}`, submitted: answer.helpfulnessA ?? '—', expected: g.helpfulnessA, ok: Math.abs((answer.helpfulnessA ?? 9) - g.helpfulnessA) <= 1 },
      { label: 'Helpfulness B', submitted: answer.helpfulnessB ?? '—', expected: g.helpfulnessB, ok: Math.abs((answer.helpfulnessB ?? 9) - g.helpfulnessB) <= 1 },
      { label: 'Accuracy A', submitted: answer.accuracyA ?? '—', expected: g.accuracyA, ok: Math.abs((answer.accuracyA ?? 9) - g.accuracyA) <= 1 },
      { label: 'Accuracy B', submitted: answer.accuracyB ?? '—', expected: g.accuracyB, ok: Math.abs((answer.accuracyB ?? 9) - g.accuracyB) <= 1 },
    ];
  },
  tabular_validation: ({ answer, item }) =>
    (item.fields || []).map((f) => {
      const expected = item.gold[f.key] || 'valid';
      const submitted = answer.rows?.[f.key]?.verdict || '—';
      return { label: f.label, submitted, expected, ok: submitted === expected };
    }),
  object_annotation: ({ answer, item }) => {
    const gold = item.gold || {};
    // shape id prefix: r* = bounding box (answer.boxes), s* = mask (answer.segments)
    return Object.keys(gold).map((sid) => {
      const expected = gold[sid];
      const isMask = sid.startsWith('s');
      const submitted = (isMask ? answer.segments?.[sid] : answer.boxes?.[sid]) || '—';
      return {
        // label is an English template; the page fills {n} when it translates it
        label: isMask ? 'Segment {n}' : 'Region {n}',
        vars: { n: sid.replace(isMask ? 's' : 'r', '#') },
        submitted,
        expected,
        ok: submitted === expected,
      };
    });
  },
};

function runChecker<K extends TaskTypeId>(type: K, item: TaskItem, answer: WorkspaceAnswer): QualityCheck[] {
  const checker: Checker<K> = CHECKERS[type];
  return checker(workspaceInput(type, item, answer));
}

export const reviewSubmission = ({
  task,
  item,
  answer,
}: {
  task: { type: TaskTypeId };
  item: TaskItem;
  answer: WorkspaceAnswer;
}): QualityReview => {
  const checks = runChecker(task.type, item, answer);

  const scored = checks.filter((c): c is QualityCheck & { score: number } => typeof c.score === 'number');
  const score = scored.length
    ? Math.round((scored.reduce((s, c) => s + c.score, 0) / scored.length) * 100)
    : Math.round((checks.filter((c) => c.ok).length / Math.max(checks.length, 1)) * 100);

  const threshold = 80;
  return {
    checks,
    score,
    passed: score >= threshold,
    threshold,
    note: item.goldNote || null,
  };
};
