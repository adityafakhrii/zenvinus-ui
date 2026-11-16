import React from 'react';
import type { ComponentType } from 'react';
import { TASK_TYPES } from '../../data/tasks';
import type { TaskTypeId, TaskTypeMeta } from '../../data/tasks';
import type { TaskItem, WorkspaceAnswer, WorkspaceProps } from '../../types/workspace';
import { workspaceInput } from '../../utils/workspace-input';

import ImageClassification from './image-classification';
import TextClassification from './text-classification';
import AudioTranscription from './audio-transcription';
import LLMEvaluation from './llm-evaluation';
import TabularValidation from './tabular-validation';
import ObjectAnnotation from './object-annotation';

export interface WorkspaceEntry<K extends TaskTypeId> {
  meta: TaskTypeMeta;
  Component: ComponentType<WorkspaceProps<K>>;
}

export type WorkspaceRegistry = { [K in TaskTypeId]: WorkspaceEntry<K> };

/**
 * task.type -> workspace component.
 *
 * This is the single resolution point for the whole "universal workspace"
 * behaviour: the backend decides task.type, this map decides which editor UI
 * the contributor gets. Nothing else in the app should branch on workspace
 * kind, and the contributor never chooses one.
 */
export const WORKSPACE_REGISTRY: WorkspaceRegistry = {
  image_classification: { meta: TASK_TYPES.image_classification, Component: ImageClassification },
  text_classification: { meta: TASK_TYPES.text_classification, Component: TextClassification },
  audio_transcription: { meta: TASK_TYPES.audio_transcription, Component: AudioTranscription },
  llm_evaluation: { meta: TASK_TYPES.llm_evaluation, Component: LLMEvaluation },
  tabular_validation: { meta: TASK_TYPES.tabular_validation, Component: TabularValidation },
  object_annotation: { meta: TASK_TYPES.object_annotation, Component: ObjectAnnotation },
};

/** Pure resolver — the ONLY supported way to get a workspace for a task. */
export const resolveWorkspace = (task: { type: TaskTypeId } | null | undefined): WorkspaceRegistry[TaskTypeId] | null =>
  (task && WORKSPACE_REGISTRY[task.type]) || null;

/** All known workspace types, for the dev-only demo switcher. */
export const allWorkspaceTypes = (): TaskTypeMeta[] => Object.values(TASK_TYPES);

export interface WorkspaceViewProps {
  type: TaskTypeId;
  item: TaskItem;
  answer: WorkspaceAnswer;
  onChange: (next: WorkspaceAnswer) => void;
}

function renderWorkspace<K extends TaskTypeId>(type: K, item: TaskItem, answer: WorkspaceAnswer, onChange: (next: WorkspaceAnswer) => void) {
  const { Component }: WorkspaceEntry<K> = WORKSPACE_REGISTRY[type];
  const input = workspaceInput(type, item, answer);
  return <Component item={input.item} answer={input.answer} onChange={onChange} />;
}

/** The workspace editor of `type` for one item; the studio renders every workspace through this. */
export const WorkspaceView = ({ type, item, answer, onChange }: WorkspaceViewProps) => renderWorkspace(type, item, answer, onChange);
