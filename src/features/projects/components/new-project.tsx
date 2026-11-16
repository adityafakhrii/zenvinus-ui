import React, { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FolderOpen,
  Info,
  LayoutDashboard,
  Save,
  Send,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  CustomDatePicker,
  CustomSelect,
  FileDropzone,
  TextInput,
  Textarea,
  cn,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { DashboardFooter, DashboardHeader } from '@/features/dashboard';
import { POSTED_TASK_EXCEPTIONS, POSTED_TASK_STATUS_FLOW } from '@/features/tasks';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectStorageHydrated } from '@/store/persistence';
import { budgetLabel, formatDate } from '../data/project-store';
import { postProjectRequest } from '../store/projects-slice';
import {
  draftCleared,
  draftSaved as draftSavedAction,
  selectRequestDraft,
} from '../store/request-draft-slice';
import type {
  DomainKey,
  DomainOption,
  KeyedOption,
  NeedKey,
  NeedOption,
  ProjectRequestForm,
  RequestFormListItem,
  RequestFormListPath,
  RequestFormPath,
  RequestFormSection,
  RequestFormValue,
} from '../types/project';
import { ProjectIcon } from './project-icons';

const NEEDS: readonly NeedOption[] = [
  { key: 'dataset', label: 'Dataset', icon: 'fa-solid fa-database', desc: "Get a ready-to-use, curated dataset from Zenvinus' collection." },
  { key: 'ai_model', label: 'AI / ML Model', icon: 'fa-solid fa-microchip', desc: 'Have us build, fine-tune or evaluate a model for your use case.' },
  { key: 'annotation', label: 'Data Annotation', icon: 'fa-solid fa-tags', desc: 'You already have the data — we label it (boxes, classes, transcripts).' },
  { key: 'collection', label: 'Data Collection', icon: 'fa-solid fa-magnifying-glass', desc: "You don't have data yet — we collect it from the field or legal public sources." },
  { key: 'evaluation', label: 'Model Evaluation', icon: 'fa-solid fa-clipboard-check', desc: 'Benchmark or audit the quality of a model you already have.' },
  { key: 'consulting', label: 'Research / Consulting', icon: 'fa-solid fa-flask', desc: 'Feasibility study, data strategy and expert guidance.' },
];

const DOMAINS: readonly DomainOption[] = [
  { key: 'cv', label: 'Computer Vision', icon: 'fa-solid fa-eye', tone: 'blue' },
  { key: 'nlp', label: 'NLP', icon: 'fa-solid fa-language', tone: 'mint' },
  { key: 'llm', label: 'LLM / Generative AI', icon: 'fa-solid fa-wand-magic-sparkles', tone: 'purple' },
  { key: 'speech', label: 'Speech & Audio', icon: 'fa-solid fa-headphones', tone: 'orange' },
  { key: 'timeseries', label: 'Time Series', icon: 'fa-solid fa-chart-line', tone: 'mint' },
  { key: 'recsys', label: 'Recommendation', icon: 'fa-solid fa-thumbs-up', tone: 'blue' },
  { key: 'tabular', label: 'Tabular ML', icon: 'fa-solid fa-table', tone: 'mint' },
  { key: 'multimodal', label: 'Multimodal', icon: 'fa-solid fa-layer-group', tone: 'purple' },
  { key: 'geospatial', label: 'Geospatial', icon: 'fa-solid fa-earth-asia', tone: 'orange' },
  { key: 'other', label: 'Other', icon: 'fa-solid fa-shapes', tone: 'blue' },
];

const USE_CASES: Readonly<Record<DomainKey, readonly string[]>> = {
  cv: ['Object Detection', 'Image Classification', 'Segmentation', 'OCR', 'Pose Estimation', 'Other'],
  nlp: ['Text Classification', 'Named Entity Recognition', 'Sentiment Analysis', 'Summarization', 'Other'],
  llm: ['Fine-tuning Dataset', 'Model Evaluation', 'RAG / Knowledge Base', 'Prompt Engineering', 'Other'],
  speech: ['Transcription (ASR)', 'Text to Speech', 'Speaker Identification', 'Audio Classification', 'Other'],
  timeseries: ['Forecasting', 'Anomaly Detection', 'Demand Planning', 'Other'],
  recsys: ['Ranking', 'Personalization', 'Next-item Prediction', 'Other'],
  tabular: ['Prediction', 'Fraud Detection', 'Risk Scoring', 'Other'],
  multimodal: ['Visual Question Answering', 'Image Captioning', 'Cross-modal Search', 'Other'],
  geospatial: ['Land Use Mapping', 'Change Detection', 'Object Counting from Imagery', 'Other'],
  other: ['Other'],
};

const INDUSTRIES = [
  'Transportation & Infrastructure',
  'E-commerce & Retail',
  'Healthcare & Medical',
  'Finance & Insurance',
  'Manufacturing',
  'Agriculture',
  'Education',
  'Media & Entertainment',
  'Government & Public Sector',
  'Other',
];

const MODALITIES = ['Image', 'Video', 'Text', 'Audio', 'Tabular', 'Geospatial', 'Multimodal'];
const SIZE_UNITS = ['Images', 'Videos', 'Texts', 'Hours', 'Rows', 'Samples'];
const LANGUAGES = ['Indonesian', 'English', 'Indonesian + English', 'Regional languages', 'Other'];
const HAVE_DATA: readonly KeyedOption[] = [
  { key: 'yes', label: 'Yes, we have our own data' },
  { key: 'partial', label: 'Partially' },
  { key: 'no', label: 'No, help us find/collect it' },
];
const DATA_SOURCES = [
  'Company-owned data',
  'Public/open datasets',
  'Internet/publicly accessible sources',
  'Newly collected data',
];
const DIVERSITY_PRESETS = ['Urban', 'Rural', 'Day', 'Night', 'Indoor', 'Outdoor', 'Indonesian', 'English'];

const ANNOTATION_TYPES = [
  'Object Detection',
  'Image Classification',
  'Segmentation',
  'Text Classification',
  'Transcription',
  'Ranking',
  'Tabular Labeling',
  'Other',
];
const ANNOTATION_METHODS = [
  'Bounding Box',
  'Polygon',
  'Segmentation Mask',
  'Classification',
  'Keypoints',
  'Text / Metadata',
];
const WORKFORCES: ReadonlyArray<KeyedOption & { desc: string }> = [
  { key: 'community', label: 'Zenvinus Community', desc: 'Skilled community annotators' },
  { key: 'verified', label: 'Verified Contributors', desc: 'Contributors passed qualification tests' },
  { key: 'expert', label: 'Expert Workforce', desc: 'Vetted domain experts' },
  { key: 'hybrid', label: 'Hybrid Community + Expert Review', desc: 'Community labels, expert QA' },
];
const QUALITY_TARGETS = ['90%+', '95%+', '98%+', '99%+'];
const REVIEW_LEVELS = ['Basic Sampling', 'Standard Review', 'Expert Review', 'Full Double-pass'];
const CONSENSUS = ['1 annotator', '2 annotators + 1 reviewer', '3 annotators + 1 reviewer', 'Custom'];
const QUALITY_OPTIONS = [
  'Gold-standard samples',
  'Automated validation',
  'Manual quality control',
  'Duplicate detection',
];

const DEV_TYPES: readonly KeyedOption[] = [
  { key: 'train', label: 'Train a new model' },
  { key: 'finetune', label: 'Fine-tune an existing model' },
  { key: 'improve', label: 'Improve our existing model' },
  { key: 'evaluate', label: 'Model evaluation / benchmarking' },
  { key: 'unsure', label: 'Not sure — recommend an approach' },
];
const PREFERRED_MODELS = ['YOLO', 'RT-DETR', 'ViT', 'LLaMA / Qwen', 'XGBoost', 'Whisper', 'Custom architecture'];
const PLATFORMS = ['Cloud', 'Edge Device', 'Mobile', 'Browser', 'On-premise'];
const OBJECTIVES = ['Accuracy', 'Latency', 'Cost Efficiency', 'Robustness', 'Balanced'];
const HARDWARE_OPTIONS = ['NVIDIA GPU / Cloud', 'CPU only', 'Jetson / Edge', 'Mobile NPU', 'TPU'];

const DELIVERABLES = [
  'Curated Dataset',
  'Annotated Dataset',
  'Trained Model',
  'Model Weights',
  'Evaluation Report',
  'Training Code',
  'Deployment API',
  'Production Deployment',
  'MLOps Pipeline',
  'Technical Documentation',
];
const DATASET_FORMATS = ['YOLO', 'COCO JSON', 'Pascal VOC', 'CSV', 'Parquet', 'JSONL', 'Custom'];
const MODEL_FORMATS = ['PyTorch (.pt)', 'ONNX', 'TensorFlow SavedModel', 'TensorRT', 'Hugging Face', 'No preference'];
const URGENCY = ['Flexible', 'Standard', 'Priority'];
const BUDGETS = ['< Rp 10 juta', 'Rp 10–50 juta', 'Rp 50–100 juta', 'Rp 100–500 juta', 'Rp 500 juta+', "Let's discuss"];
const COMPANY_SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '201–1000 employees', '1000+ employees'];

const emptyForm: ProjectRequestForm = {
  name: '',
  needs: [],
  description: '',
  domain: '',
  useCase: '',
  industry: '',
  data: {
    modalities: [],
    haveData: '',
    sampleUrl: '',
    currentSize: '',
    currentUnit: 'Images',
    targetSize: '',
    targetUnit: 'Images',
    coverage: '',
    language: 'Indonesian',
    sources: [],
    diversity: [],
    notes: '',
  },
  annotation: {
    type: '',
    classes: [],
    methods: [],
    workforce: '',
    quality: '95%+',
    reviewLevel: 'Standard Review',
    consensus: '1 annotator',
    options: ['Automated validation'],
  },
  model: {
    devType: '',
    task: '',
    preferred: '',
    existing: '',
    platforms: ['Cloud'],
    objective: 'Accuracy',
    map: '',
    precision: '',
    recall: '',
    latency: '',
    hardware: '',
  },
  delivery: {
    items: [],
    datasetFormat: 'COCO JSON',
    modelFormat: 'PyTorch (.pt)',
    completion: '',
    urgency: 'Standard',
    budget: '',
  },
  company: {
    name: '',
    size: '51–200 employees',
    contact: '',
    email: '',
    role: '',
    phone: '',
  },
};

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink leading-snug">{label}</span>
      {children}
    </div>
  );
}

function CheckPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
        active
          ? 'border-teal-ink bg-tint-mint text-teal-ink font-semibold'
          : 'border-[rgba(8,13,53,0.10)] bg-surface text-ink-secondary hover:border-ink/25 hover:text-ink',
      )}
    >
      {active && <Check className="h-3 w-3 shrink-0" strokeWidth={1.75} />}
      <span>{children}</span>
    </button>
  );
}

function RadioCard({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150 cursor-pointer',
        active
          ? 'border-teal-ink bg-tint-mint shadow-[0_0_0_1px_var(--color-teal-ink)]'
          : 'border-[rgba(8,13,53,0.10)] bg-surface hover:border-ink/25',
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink">{label}</div>
        {desc && <div className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{desc}</div>}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border',
          active ? 'border-teal-ink bg-surface' : 'border-line-input bg-surface',
        )}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-teal-ink" />}
      </span>
    </button>
  );
}

function CheckCard({
  active,
  onClick,
  label,
  desc,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150 cursor-pointer',
        active
          ? 'border-teal-ink bg-tint-mint shadow-[0_0_0_1px_var(--color-teal-ink)]'
          : 'border-[rgba(8,13,53,0.10)] bg-surface hover:border-ink/25',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs',
          active
            ? 'border-teal-ink bg-teal-ink text-white'
            : 'border-line-subtle bg-canvas text-ink-secondary',
        )}
      >
        {active ? <Check className="h-4 w-4" strokeWidth={1.75} /> : <ProjectIcon icon={icon} />}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink">{label}</div>
        {desc && <div className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{desc}</div>}
      </div>
    </button>
  );
}

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}) {
  const { t: tr } = useT();
  const [value, setValue] = useState('');
  const commit = () => {
    const v = value.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setValue('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-[10px] border border-line-input bg-surface px-3 py-2 focus-within:border-teal-ink focus-within:ring-3 focus-within:ring-teal-ink/15">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-canvas px-2 py-1 text-xs font-medium text-ink"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => onRemove(tag)}
            aria-label={tr('Remove {tag}', { tag })}
            className="text-ink-muted hover:text-ink cursor-pointer"
          >
            <X className="h-3 w-3" strokeWidth={1.75} />
          </button>
        </span>
      ))}
      <input
        className="min-w-[160px] flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
        value={value}
        placeholder={placeholder || tr('Type and press Enter')}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

const SECTIONS: readonly RequestFormSection[] = ['data', 'annotation', 'model', 'delivery', 'company'];
const isSection = (key: string): key is RequestFormSection => (SECTIONS as readonly string[]).includes(key);

const getAt = <P extends RequestFormPath>(form: ProjectRequestForm, path: P): RequestFormValue<P> => {
  const [a, b] = path.split('.');
  const value =
    b && isSection(a)
      ? (form[a] as unknown as Record<string, unknown>)[b]
      : (form as unknown as Record<string, unknown>)[a];
  return value as RequestFormValue<P>;
};

const setAt = <P extends RequestFormPath>(
  form: ProjectRequestForm,
  path: P,
  value: RequestFormValue<P>,
): ProjectRequestForm => {
  const [a, b] = path.split('.');
  if (b && isSection(a)) return { ...form, [a]: { ...form[a], [b]: value } };
  return { ...form, [a]: value };
};

/**
 * Multi-step Create AI Project Request Wizard (/dashboard/new-project) using 100% custom Zenvinus UI controls.
 */
const NewProjectWizard = () => {
  const { t, locale } = useT();
  const [form, setForm] = useState<ProjectRequestForm>(emptyForm);
  const [sampleFiles, setSampleFiles] = useState<File[]>([]);
  const [stepKey, setStepKey] = useState('overview');
  const [posted, setPosted] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [restored, setRestored] = useState(false);

  const dispatch = useAppDispatch();
  const savedDraft = useAppSelector(selectRequestDraft);
  const storageHydrated = useAppSelector(selectStorageHydrated);

  useEffect(() => {
    if (restored || !storageHydrated) return;
    setRestored(true);
    if (savedDraft) setForm({ ...emptyForm, ...savedDraft });
  }, [restored, storageHydrated, savedDraft]);

  const set = <P extends RequestFormPath>(path: P, value: RequestFormValue<P>) => {
    setForm((f) => setAt(f, path, value));
  };

  const toggleIn = <P extends RequestFormListPath>(path: P, value: RequestFormListItem<P>) => {
    setForm((f) => {
      const list: unknown[] = [...(getAt(f, path) || [])];
      const idx = list.indexOf(value);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(value);
      return setAt(f, path, list as RequestFormValue<P>);
    });
  };

  const hasNeed = (...keys: NeedKey[]) => form.needs.some((n) => keys.includes(n.key));
  const needsData = hasNeed('dataset', 'annotation', 'collection');
  const needsAnnotation = hasNeed('dataset', 'annotation');
  const needsModel = form.needs.some((n) => n.key === 'ai_model');

  const ALL_STEPS = [
    { key: 'overview', label: 'Overview' },
    ...(needsData ? [{ key: 'data', label: 'Data' }] : []),
    ...(needsAnnotation ? [{ key: 'annotation', label: 'Annotation' }] : []),
    ...(needsModel ? [{ key: 'model', label: 'Model' }] : []),
    { key: 'delivery', label: 'Delivery' },
    { key: 'review', label: 'Review' },
  ];
  const rawIdx = ALL_STEPS.findIndex((s) => s.key === stepKey);
  const stepIdx = rawIdx >= 0 ? rawIdx : 0;
  const step = ALL_STEPS[stepIdx];

  const domain = DOMAINS.find((d) => d.key === form.domain);
  const caseOptions = useMemo(() => (domain && USE_CASES[domain.key]) || USE_CASES.other, [domain]);

  const toOptions = useMemo(
    () => (items: ReadonlyArray<string>): SelectOption[] =>
      items.map((item) => ({ value: item, label: t(item) })),
    [t],
  );

  const domainSelectOptions: SelectOption[] = useMemo(
    () => DOMAINS.map((d) => ({ value: d.key, label: t(d.label) })),
    [t],
  );

  const canContinue = () => {
    if (step.key === 'overview') {
      return Boolean(
        form.name.trim() && form.needs.length && form.description.trim() && form.domain && form.useCase,
      );
    }
    if (step.key === 'data') return form.data.modalities.length > 0 && Boolean(form.data.haveData);
    if (step.key === 'annotation') return Boolean(form.annotation.type && form.annotation.workforce);
    if (step.key === 'model') return Boolean(form.model.devType);
    if (step.key === 'delivery') {
      return Boolean(form.delivery.completion && form.delivery.budget && form.delivery.items.length);
    }
    return true;
  };

  const saveDraft = () => {
    dispatch(draftSavedAction(form));
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2200);
  };

  const submit = () => {
    const created = dispatch(postProjectRequest(form));
    dispatch(draftCleared());
    setCreatedId(created.id);
    setPosted(true);
  };

  if (posted) {
    return (
      <>
        <DashboardHeader />
        <main className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_1px_2px_rgba(2,6,38,0.04)] sm:p-8">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint-mint text-teal-ink">
                <Check className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h1 className="mt-4 mb-2 text-2xl font-semibold text-ink">{t('Request submitted')}</h1>
              <p className="m-0 max-w-xl text-sm leading-relaxed text-ink-secondary">
                {t(
                  'Your AI project request is in the expert queue. Our team will prepare a tailored proposal — you will be able to review scope, pricing and methodology before any payment.',
                )}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge tone="blue">{domain ? t(domain.label) : t('Request')}</Badge>
                <Badge tone="neutral">{form.name}</Badge>
                <Badge tone="mint">{budgetLabel(form.delivery.budget)}</Badge>
              </div>
            </div>

            <ul className="mt-8 mb-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {POSTED_TASK_STATUS_FLOW.map((s, i) => (
                <li
                  key={s.key}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3.5',
                    i === 0 ? 'border-teal-ink/40 bg-tint-mint' : 'border-line-subtle bg-canvas',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-teal-ink">
                    <ProjectIcon icon={s.icon} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{t(s.label)}</div>
                    <div className="mt-0.5 text-xs leading-snug text-ink-secondary">{t(s.desc)}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line-subtle bg-canvas px-4 py-3 text-xs text-ink-secondary">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                <AlertTriangle className="h-3.5 w-3.5 text-tone-amber-accent" strokeWidth={1.75} />
                <span>{t('Exception states')}:</span>
              </span>
              {POSTED_TASK_EXCEPTIONS.map((s) => (
                <Badge key={s.key} tone="amber">
                  {t(s.label)}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                href={`/dashboard/projects?id=${createdId}`}
                variant="primary"
                size="md"
                leftIcon={<FolderOpen className="h-4 w-4" strokeWidth={1.6} />}
              >
                {t('View Project')}
              </Button>
              <Button
                href="/dashboard"
                variant="secondary"
                size="md"
                leftIcon={<LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />}
              >
                {t('Go to Dashboard')}
              </Button>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />

      <main className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
                {t('Create AI Project Request')}
              </h1>
              <p className="mt-1 mb-0 text-sm text-ink-secondary">
                {t(
                  'Tell us what you want to build. Our team will review your requirements and prepare a tailored proposal.',
                )}
              </p>
            </div>
            {draftSaved && (
              <Badge tone="mint" dot>
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{t('Draft saved')}</span>
              </Badge>
            )}
          </div>

          {/* Stepper Bar */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {ALL_STEPS.map((s, i) => {
              const isActive = i === stepIdx;
              const isDone = i < stepIdx;
              return (
                <button
                  key={s.key}
                  type="button"
                  disabled={i > stepIdx}
                  onClick={() => i <= stepIdx && setStepKey(s.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors',
                    i <= stepIdx ? 'cursor-pointer' : 'cursor-default opacity-60',
                    isActive
                      ? 'border-navy bg-navy text-white'
                      : isDone
                        ? 'border-teal-ink/30 bg-tint-mint text-teal-ink'
                        : 'border-line-subtle bg-surface text-ink-muted',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold',
                      isActive ? 'bg-teal text-navy' : isDone ? 'bg-teal-ink text-white' : 'bg-canvas text-ink-muted',
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" strokeWidth={1.75} /> : i + 1}
                  </span>
                  <span className="truncate">{t(s.label)}</span>
                </button>
              );
            })}
          </div>

          {/* Form Container Card */}
          <div className="rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 shadow-[0_1px_2px_rgba(2,6,38,0.03)] sm:p-8">
            <div className="flex flex-col gap-5">
              {/* STEP 1: OVERVIEW */}
              {step.key === 'overview' && (
                <>
                  <TextInput
                    label={t('Project Name *')}
                    placeholder={t('e.g. Indonesian Road Damage Detection')}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />

                  <FieldGroup label={t('What do you need? *')}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {NEEDS.map((n) => (
                        <CheckCard
                          key={n.key}
                          active={form.needs.some((x) => x.key === n.key)}
                          icon={n.icon}
                          label={t(n.label)}
                          desc={t(n.desc)}
                          onClick={() => toggleIn('needs', n)}
                        />
                      ))}
                    </div>
                  </FieldGroup>

                  <Textarea
                    label={t('Project Description *')}
                    rows={4}
                    placeholder={t('What should the system do? What problem are you solving?')}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomSelect
                      label={t('AI Domain *')}
                      value={form.domain}
                      placeholder={t('Select domain…')}
                      options={domainSelectOptions}
                      onChange={(val) => {
                        set('domain', val as ProjectRequestForm['domain']);
                        set('useCase', '');
                      }}
                    />
                    <CustomSelect
                      label={t('Use Case *')}
                      value={form.useCase}
                      placeholder={t('Select use case…')}
                      disabled={!form.domain}
                      options={toOptions(caseOptions)}
                      onChange={(val) => set('useCase', val)}
                    />
                  </div>

                  <CustomSelect
                    label={t('Industry')}
                    value={form.industry}
                    placeholder={t('Select industry…')}
                    options={toOptions(INDUSTRIES)}
                    onChange={(val) => set('industry', val)}
                  />
                </>
              )}

              {/* STEP 2: DATA REQUIREMENTS */}
              {step.key === 'data' && (
                <>
                  <FieldGroup label={t('Data Modality *')}>
                    <div className="flex flex-wrap gap-2">
                      {MODALITIES.map((m) => (
                        <CheckPill
                          key={m}
                          active={form.data.modalities.includes(m)}
                          onClick={() => toggleIn('data.modalities', m)}
                        >
                          {t(m)}
                        </CheckPill>
                      ))}
                    </div>
                  </FieldGroup>

                  <FieldGroup label={t('Do you already have data? *')}>
                    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {HAVE_DATA.map((h) => (
                        <RadioCard
                          key={h.key}
                          active={form.data.haveData === h.key}
                          label={t(h.label)}
                          onClick={() => set('data.haveData', h.key)}
                        />
                      ))}
                    </div>
                  </FieldGroup>

                  {form.data.haveData && form.data.haveData !== 'no' && (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                          label={t('Dataset / Storage URL')}
                          placeholder="https://…"
                          value={form.data.sampleUrl}
                          onChange={(e) => set('data.sampleUrl', e.target.value)}
                        />
                        <FileDropzone
                          label={t('Upload sample data')}
                          buttonText={t('Attach sample')}
                          files={sampleFiles}
                          onFilesChange={setSampleFiles}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FieldGroup label={t('Current Dataset Size')}>
                          <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
                            <TextInput
                              type="number"
                              min="0"
                              placeholder="12000"
                              value={form.data.currentSize}
                              onChange={(e) => set('data.currentSize', e.target.value)}
                            />
                            <CustomSelect
                              value={form.data.currentUnit}
                              options={toOptions(SIZE_UNITS)}
                              onChange={(val) => set('data.currentUnit', val)}
                            />
                          </div>
                        </FieldGroup>

                        <FieldGroup label={t('Target Dataset Size')}>
                          <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
                            <TextInput
                              type="number"
                              min="0"
                              placeholder="50000"
                              value={form.data.targetSize}
                              onChange={(e) => set('data.targetSize', e.target.value)}
                            />
                            <CustomSelect
                              value={form.data.targetUnit}
                              options={toOptions(SIZE_UNITS)}
                              onChange={(val) => set('data.targetUnit', val)}
                            />
                          </div>
                        </FieldGroup>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label={t('Geographic Coverage')}
                      placeholder="Indonesia"
                      value={form.data.coverage}
                      onChange={(e) => set('data.coverage', e.target.value)}
                    />
                    <CustomSelect
                      label={t('Language')}
                      value={form.data.language}
                      options={toOptions(LANGUAGES)}
                      onChange={(val) => set('data.language', val)}
                    />
                  </div>

                  <FieldGroup label={t('Data Source Preference')}>
                    <div className="flex flex-wrap gap-2">
                      {DATA_SOURCES.map((s) => (
                        <CheckPill
                          key={s}
                          active={form.data.sources.includes(s)}
                          onClick={() => toggleIn('data.sources', s)}
                        >
                          {t(s)}
                        </CheckPill>
                      ))}
                    </div>
                    <p className="mt-1 mb-0 inline-flex items-start gap-1.5 text-xs text-ink-muted">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      <span>
                        {t(
                          'Internet/public sources are subject to license & privacy review — our team determines which sources are legal and usable.',
                        )}
                      </span>
                    </p>
                  </FieldGroup>

                  <FieldGroup label={t('Data Diversity')}>
                    <div className="flex flex-wrap gap-2">
                      {DIVERSITY_PRESETS.map((p) => (
                        <CheckPill
                          key={p}
                          active={form.data.diversity.includes(p)}
                          onClick={() => toggleIn('data.diversity', p)}
                        >
                          {t(p)}
                        </CheckPill>
                      ))}
                    </div>
                    <TagInput
                      tags={form.data.diversity.filter((d) => !DIVERSITY_PRESETS.includes(d))}
                      onAdd={(v) => toggleIn('data.diversity', v)}
                      onRemove={(v) => toggleIn('data.diversity', v)}
                      placeholder={t('Add custom condition…')}
                    />
                  </FieldGroup>

                  <Textarea
                    label={t('Additional Requirements')}
                    rows={3}
                    placeholder={t(
                      'e.g. images should represent Indonesian road conditions, different weather, camera angles, etc.',
                    )}
                    value={form.data.notes}
                    onChange={(e) => set('data.notes', e.target.value)}
                  />
                </>
              )}

              {/* STEP 3: ANNOTATION & QUALITY */}
              {step.key === 'annotation' && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomSelect
                      label={t('Annotation Type *')}
                      value={form.annotation.type}
                      placeholder={t('Select type…')}
                      options={toOptions(ANNOTATION_TYPES)}
                      onChange={(val) => set('annotation.type', val)}
                    />
                    <FieldGroup label={t('Annotation Method')}>
                      <div className="flex flex-wrap gap-2">
                        {ANNOTATION_METHODS.map((m) => (
                          <CheckPill
                            key={m}
                            active={form.annotation.methods.includes(m)}
                            onClick={() => toggleIn('annotation.methods', m)}
                          >
                            {t(m)}
                          </CheckPill>
                        ))}
                      </div>
                    </FieldGroup>
                  </div>

                  <FieldGroup label={t('Classes / Labels')}>
                    <TagInput
                      tags={form.annotation.classes}
                      onAdd={(v) => toggleIn('annotation.classes', v)}
                      onRemove={(v) => toggleIn('annotation.classes', v)}
                      placeholder={t('e.g. Pothole — press Enter to add')}
                    />
                  </FieldGroup>

                  <FieldGroup label={t('Who should annotate?')}>
                    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {WORKFORCES.map((w) => (
                        <RadioCard
                          key={w.key}
                          active={form.annotation.workforce === w.key}
                          label={t(w.label)}
                          desc={t(w.desc)}
                          onClick={() => set('annotation.workforce', w.key)}
                        />
                      ))}
                    </div>
                  </FieldGroup>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <CustomSelect
                      label={t('Target Quality')}
                      value={form.annotation.quality}
                      options={toOptions(QUALITY_TARGETS)}
                      onChange={(val) => set('annotation.quality', val)}
                    />
                    <CustomSelect
                      label={t('Review Level')}
                      value={form.annotation.reviewLevel}
                      options={toOptions(REVIEW_LEVELS)}
                      onChange={(val) => set('annotation.reviewLevel', val)}
                    />
                    <CustomSelect
                      label={t('Consensus')}
                      value={form.annotation.consensus}
                      options={toOptions(CONSENSUS)}
                      onChange={(val) => set('annotation.consensus', val)}
                    />
                  </div>

                  <FieldGroup label={t('Quality Target')}>
                    <div className="flex flex-wrap gap-2">
                      {QUALITY_OPTIONS.map((o) => (
                        <CheckPill
                          key={o}
                          active={form.annotation.options.includes(o)}
                          onClick={() => toggleIn('annotation.options', o)}
                        >
                          {t(o)}
                        </CheckPill>
                      ))}
                    </div>
                  </FieldGroup>
                </>
              )}

              {/* STEP 4: MODEL REQUIREMENTS */}
              {step.key === 'model' && (
                <>
                  <FieldGroup label={t('Development Type *')}>
                    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {DEV_TYPES.map((d) => (
                        <RadioCard
                          key={d.key}
                          active={form.model.devType === d.key}
                          label={t(d.label)}
                          onClick={() => set('model.devType', d.key)}
                        />
                      ))}
                    </div>
                  </FieldGroup>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomSelect
                      label={t('Task')}
                      value={form.model.task}
                      placeholder={t('Select task…')}
                      options={toOptions(caseOptions)}
                      onChange={(val) => set('model.task', val)}
                    />
                    <CustomSelect
                      label={t('Preferred Model (optional)')}
                      value={form.model.preferred}
                      placeholder={t('No preference — let Zenvinus recommend')}
                      options={[
                        { value: '', label: t('No preference — let Zenvinus recommend') },
                        ...toOptions(PREFERRED_MODELS),
                      ]}
                      onChange={(val) => set('model.preferred', val)}
                    />
                  </div>

                  <TextInput
                    label={t('Existing Model (URL / repository)')}
                    placeholder={t('https://github.com/… or model URL')}
                    value={form.model.existing}
                    onChange={(e) => set('model.existing', e.target.value)}
                  />

                  <FieldGroup label={t('Target Platform')}>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p) => (
                        <CheckPill
                          key={p}
                          active={form.model.platforms.includes(p)}
                          onClick={() => toggleIn('model.platforms', p)}
                        >
                          {t(p)}
                        </CheckPill>
                      ))}
                    </div>
                  </FieldGroup>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomSelect
                      label={t('Primary Objective')}
                      value={form.model.objective}
                      options={toOptions(OBJECTIVES)}
                      onChange={(val) => set('model.objective', val)}
                    />
                    <CustomSelect
                      label={t('Hardware / Environment')}
                      value={form.model.hardware}
                      placeholder={t('No preference')}
                      options={[
                        { value: '', label: t('No preference') },
                        ...toOptions(HARDWARE_OPTIONS),
                      ]}
                      onChange={(val) => set('model.hardware', val)}
                    />
                  </div>

                  <FieldGroup label={t('Target Metrics (optional)')}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {(
                        [
                          ['map', 'mAP50', '≥ 0.90'],
                          ['precision', 'Precision', '≥ 0.90'],
                          ['recall', 'Recall', '≥ 0.90'],
                        ] as const
                      ).map(([key, label, ph]) => (
                        <TextInput
                          key={key}
                          label={t(label)}
                          placeholder={ph}
                          value={form.model[key]}
                          onChange={(e) => set(`model.${key}`, e.target.value)}
                        />
                      ))}
                      <TextInput
                        label={`${t('Max inference latency')} (ms)`}
                        type="number"
                        placeholder="100"
                        value={form.model.latency}
                        onChange={(e) => set('model.latency', e.target.value)}
                      />
                    </div>
                  </FieldGroup>
                </>
              )}

              {/* STEP 5: DELIVERY, TIMELINE & BUDGET */}
              {step.key === 'delivery' && (
                <>
                  <FieldGroup label={t('What should we deliver?')}>
                    <div className="flex flex-wrap gap-2">
                      {DELIVERABLES.map((d) => (
                        <CheckPill
                          key={d}
                          active={form.delivery.items.includes(d)}
                          onClick={() => toggleIn('delivery.items', d)}
                        >
                          {t(d)}
                        </CheckPill>
                      ))}
                    </div>
                  </FieldGroup>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomSelect
                      label={t('Dataset Format')}
                      value={form.delivery.datasetFormat}
                      options={toOptions(DATASET_FORMATS)}
                      onChange={(val) => set('delivery.datasetFormat', val)}
                    />
                    <CustomSelect
                      label={t('Model Format')}
                      value={form.delivery.modelFormat}
                      options={toOptions(MODEL_FORMATS)}
                      onChange={(val) => set('delivery.modelFormat', val)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomDatePicker
                      label={t('Desired Completion *')}
                      value={form.delivery.completion}
                      onChange={(val) => set('delivery.completion', val)}
                    />

                    <FieldGroup label={t('Urgency')}>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {URGENCY.map((u) => (
                          <CheckPill
                            key={u}
                            active={form.delivery.urgency === u}
                            onClick={() => set('delivery.urgency', u)}
                          >
                            {t(u)}
                          </CheckPill>
                        ))}
                      </div>
                    </FieldGroup>
                  </div>

                  <FieldGroup label={t('Estimated Budget *')}>
                    <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {BUDGETS.map((b) => (
                        <RadioCard
                          key={b}
                          active={form.delivery.budget === b}
                          label={budgetLabel(b) || b}
                          onClick={() => set('delivery.budget', b)}
                        />
                      ))}
                    </div>
                    <p className="mt-1 mb-0 inline-flex items-start gap-1.5 text-xs text-ink-muted">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      <span>
                        {t('A range is enough — the final quote is in the proposal prepared by our team.')}
                      </span>
                    </p>
                  </FieldGroup>
                </>
              )}

              {/* STEP 6: REVIEW & COMPANY INFO */}
              {step.key === 'review' && (
                <>
                  <div className="rounded-xl border border-line-subtle bg-canvas p-5">
                    <h2 className="m-0 mb-4 text-base font-semibold text-ink">
                      {form.name || t('Untitled request')}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-ink-muted">{t('Request')}</div>
                        <div className="mt-0.5 font-medium text-ink">
                          {form.needs.map((n) => t(n.label)).join(' + ') || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-muted">{t('Domain')}</div>
                        <div className="mt-0.5 font-medium text-ink">
                          {domain ? t(domain.label) : '—'}
                          {form.useCase ? ` · ${t(form.useCase)}` : ''}
                        </div>
                      </div>
                      {needsData && (
                        <div>
                          <div className="text-xs text-ink-muted">{t('Data')}</div>
                          <div className="mt-0.5 font-medium text-ink">
                            {form.data.targetSize
                              ? `${Number(form.data.targetSize).toLocaleString(locale)} ${t(form.data.targetUnit)}`
                              : t('To be scoped')}
                            {form.data.coverage ? ` · ${form.data.coverage}` : ''}
                          </div>
                        </div>
                      )}
                      {needsAnnotation && (
                        <div>
                          <div className="text-xs text-ink-muted">{t('Annotation')}</div>
                          <div className="mt-0.5 font-medium text-ink">
                            {form.annotation.type ? t(form.annotation.type) : '—'}
                            {form.annotation.classes.length
                              ? ` · ${t('{count} classes', { count: form.annotation.classes.length })}`
                              : ''}
                            {` · ${form.annotation.quality}`}
                          </div>
                        </div>
                      )}
                      {needsModel && (
                        <div>
                          <div className="text-xs text-ink-muted">{t('Model')}</div>
                          <div className="mt-0.5 font-medium text-ink">
                            {t(DEV_TYPES.find((d) => d.key === form.model.devType)?.label ?? '') || '—'}
                            {form.model.map ? ` · mAP50 ${form.model.map}` : ''}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-ink-muted">{t('Deliverables')}</div>
                        <div className="mt-0.5 font-medium text-ink">
                          {form.delivery.items.map((d) => t(d)).join(' · ') || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-muted">{t('Timeline')}</div>
                        <div className="mt-0.5 font-medium text-ink">
                          {formatDate(form.delivery.completion) || '—'} · {t(form.delivery.urgency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-muted">{t('Budget')}</div>
                        <div className="mt-0.5 font-medium text-ink">
                          {budgetLabel(form.delivery.budget) || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label={t('Company Name *')}
                      value={form.company.name}
                      onChange={(e) => set('company.name', e.target.value)}
                    />
                    <CustomSelect
                      label={t('Company Size')}
                      value={form.company.size}
                      options={toOptions(COMPANY_SIZES)}
                      onChange={(val) => set('company.size', val)}
                    />
                    <TextInput
                      label={t('Contact Person *')}
                      value={form.company.contact}
                      onChange={(e) => set('company.contact', e.target.value)}
                    />
                    <TextInput
                      label={t('Work Email *')}
                      type="email"
                      placeholder="name@company.com"
                      value={form.company.email}
                      onChange={(e) => set('company.email', e.target.value)}
                    />
                    <TextInput
                      label={t('Job title')}
                      value={form.company.role}
                      onChange={(e) => set('company.role', e.target.value)}
                    />
                    <TextInput
                      label={t('Phone / WhatsApp')}
                      placeholder="+62 …"
                      value={form.company.phone}
                      onChange={(e) => set('company.phone', e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Wizard Action Footer */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Save className="h-4 w-4" strokeWidth={1.5} />}
                  onClick={saveDraft}
                >
                  {t('Save Draft')}
                </Button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {stepIdx > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.6} />}
                      onClick={() => setStepKey(ALL_STEPS[stepIdx - 1].key)}
                    >
                      {t('Back')}
                    </Button>
                  )}

                  {step.key === 'review' ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      disabled={
                        !form.company.name.trim() ||
                        !form.company.contact.trim() ||
                        !form.company.email.trim()
                      }
                      leftIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
                      onClick={submit}
                    >
                      {t('Submit Request')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      disabled={!canContinue()}
                      rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.6} />}
                      onClick={() => setStepKey(ALL_STEPS[stepIdx + 1].key)}
                    >
                      {t('Continue')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </>
  );
};

export default NewProjectWizard;
