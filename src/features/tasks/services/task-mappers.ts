/** Task API payloads -> the shapes the task components render. */
import { TASK_TYPES, TASK_STATUS } from '../data/tasks';
import type { TaskStatusKey, TaskTypeId } from '../data/tasks';
import { currentLocale, translate as tr } from '@/i18n';
import { daysLeft } from '@/utils/format';
import { isDataType } from '@/config/data-types';
import type { DataType } from '@/config/data-types';
import type { TaskCard, TaskCardDto, TaskDetail, TaskDetailDto } from '../types/task';

const DATA_TYPE_TO_TASK_TYPE: Record<DataType, TaskTypeId> = {
  image: 'object_annotation',
  text: 'text_classification',
  audio: 'audio_transcription',
  video: 'object_annotation',
  tabular: 'tabular_validation',
  '3d': 'object_annotation',
  document: 'text_classification',
  geospatial: 'object_annotation',
  time_series: 'tabular_validation',
};

const STATUS_MAP: Readonly<Record<string, TaskStatusKey>> = {
  open: 'OPEN',
  active: 'ACTIVE',
  paused: 'PAUSED',
  closed: 'CLOSED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  draft: 'DRAFT',
};

/** Card from GET /api/tasks/ data[]. */
export function mapTaskCard(task: TaskCardDto): TaskCard {
  const type: TaskTypeId = isDataType(task.dataType) ? DATA_TYPE_TO_TASK_TYPE[task.dataType] : 'object_annotation';
  const meta = TASK_TYPES[type];
  const statusKey = STATUS_MAP[task.status] || 'OPEN';
  return {
    id: task.id,
    slug: task.slug,
    title: task.title,
    desc: task.description || '',
    tags: (task.tags || []).map((t) => t.name),
    dataType: task.dataType,
    type,
    typeLabel: meta.label,
    typeIcon: meta.icon,
    tone: meta.tone,
    category: meta.category,
    status: statusKey,
    statusLabel: TASK_STATUS[statusKey].label,
    quantity: task.quantity,
    unit: task.quantity ? `${task.quantity.toLocaleString(currentLocale())} ${task.unit || tr('items')}` : task.unit || '',
    daysLeft: daysLeft(task.deadline),
    deadline: task.deadline,
    difficulty: task.difficulty ? task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) : 'Beginner',
    price: task.reward || 0,
    bonus: task.bonus || 0,
    contributors: task.participantCount || 0,
    categorySlug: task.category?.slug || null,
  };
}

/** Detail from GET /api/tasks/{slug}. */
export function mapTaskDetail(task: TaskDetailDto): TaskDetail {
  const mapped = mapTaskCard(task);
  return {
    ...mapped,
    instructions: task.instructions || '',
    joined: !!task.joined,
    organization: task.organization?.name || null,
    dataset: task.dataset || null,
    // Flow pages (join/qualification/workspace/reward) expect these mock-era
    // fields; the backend doesn't send them yet, so default them safely:
    // no items until the submissions API exists, qualification skipped,
    // reward derived from the task reward.
    items: [],
    guidelines: [],
    requiresQualification: false,
    qualification: null,
    language: 'Visual',
    estimatedTime: '—',
    postedBy: task.organization?.name || 'Zenvinus Community',
    rewardPerItem: mapped.price || 0,
    bonusPct: mapped.bonus && mapped.price ? Math.round((mapped.bonus / mapped.price) * 100) : 0,
  };
}
