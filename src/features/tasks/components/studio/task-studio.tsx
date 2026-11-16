import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, PackageOpen } from 'lucide-react';
import useTaskRoute, { taskSlugOf } from '../../hooks/use-task-route';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';
import {
  draftCleared,
  draftSaved,
  selectDraft,
  selectLastSubmission,
  selectTaskDrafts,
  submissionSaved,
} from '../../store/submissions-slice';
import { reviewSubmission, selectSubmissionForReview } from '../../store/reviews-slice';
import { WORKSPACE_EXAMPLES } from '../../data/workspace-examples';
import { resolveWorkspace, WorkspaceView } from '../workspaces/registry';
import { REVIEW_ACTIONS, CURRENT_REVIEWER } from '../../data/expert-workspace';
import type { TaskTypeId } from '../../data/tasks';
import type { TaskItem, WorkspaceAnswer } from '../../types/workspace';
import type { StudioItemState } from '../../types/submission';
import StudioTopbar from './studio-topbar';
import StudioSidebar from './studio-sidebar';
import StudioBottombar from './studio-bottombar';
import ReviewBanner from './review-banner';
import { useT } from '@/i18n';
import { BentoSkeleton, EmptyState } from '@/components/ui';

/**
 * Annotation Studio — the contributor's full-screen working environment.
 *
 * The studio is chrome-free on purpose (no site header, breadcrumb, or
 * footer): everything on screen serves the item being annotated. The editor
 * itself still resolves from registry.tsx via task.type, so the studio and
 * any other surface render the exact same workspace components.
 *
 * Answers autosave as per-item drafts (store/submissions-slice.ts), so switching
 * items or refreshing never loses work; submitting clears the draft and
 * hands the item to the Quality Check flow.
 *
 * When opened with ?review=SUB-xxxx (expert dashboard link), the studio
 * runs in REVIEW MODE: the contributor's submission is displayed through
 * the same workspace, edits are discarded (drafts are not saved), and the
 * bottom bar holds the review decisions instead of Submit.
 */
const TaskStudio = () => {
  const { router, ready, task } = useTaskRoute();
  const { t } = useT();
  const [itemIdx, setItemIdx] = useState(0);
  const [answer, setAnswer] = useState<WorkspaceAnswer>({});
  const [submitting, setSubmitting] = useState(false);
  const [devType, setDevType] = useState<TaskTypeId | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(true);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const store = useAppStore();
  // Effects and handlers read drafts at the moment they run (like the old storage reads); rendering subscribes
  const loadDraft = (slug: string, itemId: string) => selectDraft(store.getState(), slug, itemId);
  const loadLastSubmission = (slug: string) => selectLastSubmission(store.getState(), slug);

  // Review mode: resolved from the URL once the router is ready.
  const reviewId = ready ? taskSlugOf(router.query.review) : null;
  const reviewRow = useAppSelector((state) => selectSubmissionForReview(state, reviewId));
  const review = reviewId && task ? reviewRow : null;
  const taskDrafts = useAppSelector((state) => selectTaskDrafts(state, task?.slug ?? ''));
  const reviewMode = Boolean(reviewId) && ready;

  const isDev = process.env.NODE_ENV === 'development';

  // Dev-only: when the switcher picks a type other than the task's real type,
  // the task's items don't match the editor shape (an audio item has no
  // `labels`, a tabular item has no `regions`, …). Render a complete example
  // for that type instead — see src/features/tasks/data/workspace-examples.ts.
  const example = isDev && devType && task && devType !== task.type ? WORKSPACE_EXAMPLES[devType] : null;
  const demoMode = Boolean(example);
  const items: readonly TaskItem[] = example ? example.items : task?.items || [];
  const guidelines: readonly string[] = example ? example.guidelines : task?.guidelines || [];

  useEffect(() => {
    if (task) setDevType(task.type);
  }, [task?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // A new task (or dev workspace override) resets the working session.
  useEffect(() => {
    setItemIdx(0);
    setAnswer({});
    setInitialized(false);
    setDraftSavedAt(null);
  }, [task?.slug, devType]);

  // Resume where the contributor left off: if a submission exists for this
  // task, reopen that item (e.g. returning from a quality-check revision).
  // Skipped in review mode — the reviewer starts at the first item.
  useEffect(() => {
    if (!ready || !task || initialized || reviewMode) return;
    setInitialized(true);
    const last = loadLastSubmission(task.slug);
    if (!last) return;
    const idx = items.findIndex((i) => i.id === last.itemId);
    if (idx >= 0) setItemIdx(idx);
  }, [ready, task, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Seed the answer for the current item: its saved draft wins, then the
  // last submission for that item, then a fresh answer. In review mode the
  // reviewer sees the workspace empty — contributor answers are not stored
  // client-side in this mock, so nothing is faked.
  useEffect(() => {
    if (!task || !initialized) return;
    const item = items[itemIdx];
    if (!item) return;
    if (reviewMode) {
      setAnswer({});
      return;
    }
    const draft = loadDraft(task.slug, item.id);
    if (draft) {
      setAnswer(draft);
      return;
    }
    const last = loadLastSubmission(task.slug);
    setAnswer(last && last.itemId === item.id ? last.answer || {} : {});
    setDraftSavedAt(null);
  }, [task?.slug, itemIdx, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveType: TaskTypeId | null = task ? (isDev && devType ? devType : task.type) : null;
  const workspace = useMemo(() => (effectiveType ? resolveWorkspace({ type: effectiveType }) : null), [effectiveType]);

  // Drafts save exactly when the contributor edits (not in an effect), so an
  // in-flight answer can never be written onto the next item. In review mode
  // edits are local-only — a reviewer must never write into the contributor's
  // drafts.
  const handleChange = (next: WorkspaceAnswer) => {
    setAnswer(next);
    const item = items[itemIdx];
    if (!reviewMode && task && item) {
      dispatch(draftSaved(task.slug, item.id, next));
      setDraftSavedAt(Date.now());
    }
  };

  const goToItem = (idx: number) => {
    const it = items[idx];
    if (!task || !it) return;
    if (reviewMode) {
      setAnswer({});
      setItemIdx(Math.max(0, Math.min(items.length - 1, idx)));
      return;
    }
    // seed the answer synchronously with the switch so shape-carrying
    // workspaces never render one frame of another item's geometry
    const draft = loadDraft(task.slug, it.id);
    if (draft) {
      setAnswer(draft);
      setDraftSavedAt(Date.now());
    } else {
      const last = loadLastSubmission(task.slug);
      setAnswer(last && last.itemId === it.id ? last.answer || {} : {});
      setDraftSavedAt(null);
    }
    setItemIdx(Math.max(0, Math.min(items.length - 1, idx)));
  };

  // Keyboard: ←/→ move between items, G toggles the guidelines panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (target?.closest('[role="combobox"], [role="listbox"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') goToItem(itemIdx - 1);
      else if (e.key === 'ArrowRight') goToItem(itemIdx + 1);
      else if (e.key.toLowerCase() === 'g') setGuidelinesOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [itemIdx, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready || !task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-4xl">
          <BentoSkeleton />
        </div>
      </div>
    );
  }

  const item: TaskItem | undefined = items[itemIdx];

  const handleSubmit = () => {
    if (!item) return;
    setSubmitting(true);
    dispatch(submissionSaved({ slug: task.slug, itemId: item.id, answer }));
    dispatch(draftCleared({ slug: task.slug, itemId: item.id }));
    // POST /api/tasks/:slug/submissions would happen here in production.
    setTimeout(() => router.push(`/task-quality-check?task=${task.slug}`), 900);
  };

  // Review decision: POST /api/expert/reviews/:id in production; returns to
  // the expert dashboard where the queue reflects the new status.
  const handleDecision = (actionKey: string) => {
    if (!review) return;
    setSubmitting(true);
    dispatch(reviewSubmission(review.id, actionKey));
    setTimeout(() => router.push('/dashboard?as=expert'), 900);
  };

  const itemStates = items.map((it, i): StudioItemState => ({
    id: it.id,
    state: i === itemIdx ? 'current' : taskDrafts[it.id] ? 'draft' : 'todo',
  }));

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas lg:h-dvh lg:overflow-hidden">
      {reviewMode && review && (
        <ReviewBanner
          review={review}
          reviewerName={CURRENT_REVIEWER.name}
          rubric={review.decision?.rubric || 'rubric-v1.2'}
        />
      )}

      <StudioTopbar
        task={task}
        meta={workspace?.meta}
        itemIdx={itemIdx}
        total={items.length}
        isDev={isDev && !reviewMode}
        devType={devType || task.type}
        onDevChange={setDevType}
        guidelinesOpen={guidelinesOpen}
        onToggleGuidelines={() => setGuidelinesOpen((v) => !v)}
        demoMode={demoMode}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-6">
          {!workspace && (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.6} />}
                title={t('Workspace not available yet')}
                action={
                  <p className="m-0 text-sm text-ink-secondary">
                    {t('Task type {type} has no editor yet. Please contact the task manager.', {
                      type: <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs">{task.type}</code>,
                    })}
                  </p>
                }
              />
            </div>
          )}

          {workspace && !item && (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<PackageOpen className="h-6 w-6" strokeWidth={1.6} />}
                title={t('No items yet')}
                description={t('This task has no items to work on yet.')}
              />
            </div>
          )}

          {workspace && item && effectiveType && (
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
              <WorkspaceView type={effectiveType} item={item} answer={answer} onChange={handleChange} />
            </div>
          )}
        </div>

        {guidelinesOpen && (
          <StudioSidebar
            task={task}
            meta={workspace?.meta}
            guidelines={guidelines}
            itemStates={itemStates}
            onSelect={goToItem}
          />
        )}
      </div>

      {reviewMode && review ? (
        <StudioBottombar
          itemIdx={itemIdx}
          total={items.length}
          reviewMode
          actions={REVIEW_ACTIONS}
          draftSavedAt={null}
          submitting={submitting}
          disabled={!workspace || !item}
          onPrev={() => goToItem(itemIdx - 1)}
          onNext={() => goToItem(itemIdx + 1)}
          onDecision={handleDecision}
        />
      ) : (
        <StudioBottombar
          itemIdx={itemIdx}
          total={items.length}
          hasAnswer={Object.keys(answer).length > 0}
          draftSavedAt={draftSavedAt}
          submitting={submitting}
          disabled={!workspace || !item}
          onPrev={() => goToItem(itemIdx - 1)}
          onNext={() => goToItem(itemIdx + 1)}
          onSubmit={handleSubmit}
        />
      )}

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-[2px]">
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[rgba(8,13,53,0.08)] bg-white p-6 text-center shadow-xl">
            <Loader2 className="mb-3 h-7 w-7 animate-spin text-teal-ink" strokeWidth={1.75} />
            <h4 className="text-base font-semibold text-ink">
              {reviewMode ? t('Recording decision…') : t('Submitting item…')}
            </h4>
            <p className="mt-1 text-sm text-ink-muted">
              {reviewMode
                ? t('Your decision is being sent to the Expert Workspace.')
                : t('Your answer is being sent to Quality Check.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStudio;
