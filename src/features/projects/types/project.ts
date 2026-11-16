/**
 * Company projects: requests posted through the Create AI Project Request wizard (Redux state in
 * store/projects-slice.ts, saved in localStorage) and the seeded demo projects (data/company-projects.ts). Both render
 * in /dashboard/projects.
 */

/** Colour family of icons, chips and status badges (`edash-tone-*`, `edash-status-*` classes). */
export type Tone = 'blue' | 'mint' | 'purple' | 'orange' | 'amber' | 'grey';

/** One step of the posted-request lifecycle (POSTED_TASK_STATUS_FLOW in the tasks feature). */
export interface StatusStep {
  key: string;
  label: string;
  desc: string;
  icon: string;
}

/* ----------------------------- Wizard form ----------------------------- */

export type NeedKey = 'dataset' | 'ai_model' | 'annotation' | 'collection' | 'evaluation' | 'consulting';

export interface NeedOption {
  key: NeedKey;
  label: string;
  icon: string;
  desc: string;
}

export type DomainKey = 'cv' | 'nlp' | 'llm' | 'speech' | 'timeseries' | 'recsys' | 'tabular' | 'multimodal' | 'geospatial' | 'other';

export interface DomainOption {
  key: DomainKey;
  label: string;
  icon: string;
  tone: Tone;
}

/** A choice with a stored key and an English label (i18n key) */
export interface KeyedOption {
  key: string;
  label: string;
  desc?: string;
}

export interface RequestDataForm {
  modalities: string[];
  /** '' until chosen, then "yes" | "partial" | "no" */
  haveData: string;
  sampleUrl: string;
  currentSize: string;
  currentUnit: string;
  targetSize: string;
  targetUnit: string;
  coverage: string;
  language: string;
  sources: string[];
  diversity: string[];
  notes: string;
}

export interface RequestAnnotationForm {
  type: string;
  classes: string[];
  methods: string[];
  workforce: string;
  quality: string;
  reviewLevel: string;
  consensus: string;
  options: string[];
}

export interface RequestModelForm {
  /** '' until chosen, then "train" | "finetune" | "improve" | "evaluate" | "unsure" */
  devType: string;
  task: string;
  preferred: string;
  existing: string;
  platforms: string[];
  objective: string;
  map: string;
  precision: string;
  recall: string;
  latency: string;
  hardware: string;
}

export interface RequestDeliveryForm {
  items: string[];
  datasetFormat: string;
  modelFormat: string;
  /** yyyy-mm-dd from the date input */
  completion: string;
  urgency: string;
  /** One of the wizard's budget ranges (stored as-is; it is also the key of the display label) */
  budget: string;
}

export interface RequestCompanyForm {
  name: string;
  size: string;
  contact: string;
  email: string;
  role: string;
  phone: string;
}

/** Everything the wizard collects; also the shape of the saved draft */
export interface ProjectRequestForm {
  name: string;
  needs: NeedOption[];
  description: string;
  /** DomainKey, or '' until chosen */
  domain: string;
  useCase: string;
  industry: string;
  data: RequestDataForm;
  annotation: RequestAnnotationForm;
  model: RequestModelForm;
  delivery: RequestDeliveryForm;
  company: RequestCompanyForm;
}

/** Form sections edited field by field (form.data.x, form.model.x, ...) */
export type RequestFormSection = 'data' | 'annotation' | 'model' | 'delivery' | 'company';

/** "name", "needs", ... or "data.targetSize", "model.platforms", ... */
export type RequestFormPath =
  | Exclude<keyof ProjectRequestForm, RequestFormSection>
  | { [S in RequestFormSection]: `${S}.${Extract<keyof ProjectRequestForm[S], string>}` }[RequestFormSection];

/** Value stored at a RequestFormPath */
export type RequestFormValue<P extends RequestFormPath> = P extends `${infer S}.${infer K}`
  ? S extends RequestFormSection
    ? K extends keyof ProjectRequestForm[S]
      ? ProjectRequestForm[S][K]
      : never
    : never
  : P extends keyof ProjectRequestForm
    ? ProjectRequestForm[P]
    : never;

/** Paths whose value is a list (toggled item by item) */
export type RequestFormListPath = {
  [P in RequestFormPath]: RequestFormValue<P> extends ReadonlyArray<unknown> ? P : never;
}[RequestFormPath];

/** One item of the list at a RequestFormListPath */
export type RequestFormListItem<P extends RequestFormListPath> = RequestFormValue<P> extends ReadonlyArray<infer I> ? I : never;

/* --------------------------- Stored projects --------------------------- */

/** Final proposal attached by a Zenvinus expert in the lab (prices in million IDR) */
export interface ProposalDoc {
  docId: string;
  priceJuta: number;
  priceLabel: string;
  upfrontLabel: string;
  finalLabel: string;
  validUntil: string;
  scopeNote: string;
  sentAt: string;
}

/** Audit-log entry of a posted request (newest first) */
export interface HistoryEntry {
  at: string;
  title: string;
  detail: string;
}

/** A request posted through the wizard (localStorage "zv-posted-projects") */
export interface PostedProject {
  id: string;
  kind: 'posted';
  name: string;
  type: string;
  typeLabel: string;
  icon: string;
  tone: Tone;
  /** Labels of the chosen needs */
  needs: string[];
  useCase: string | null;
  industry: string | null;
  desc: string;
  data: RequestDataForm | null;
  annotation: RequestAnnotationForm | null;
  model: RequestModelForm | null;
  delivery: RequestDeliveryForm | null;
  company: RequestCompanyForm | null;
  items: number;
  delivered: number;
  spend: number;
  budget: null;
  budgetRange: string | null;
  /** Midpoint of the budget range, million IDR */
  estimate: number | null;
  status: string;
  statusKey: string;
  statusTone: Tone;
  owner: string;
  started: string;
  deadline: string | null;
  history?: HistoryEntry[];
  proposalDoc?: ProposalDoc;
  /** Old entries stored the domain key instead of a label */
  domain?: string;
  // Only seeded projects carry these
  qaPass?: undefined;
  workforce?: undefined;
}

/** A demo project shipped with the app (USD amounts) */
export interface SeededProject {
  id: string;
  kind?: undefined;
  name: string;
  /** Task type id, e.g. "object_annotation" */
  type: string;
  typeLabel: string;
  icon: string;
  tone: Tone;
  items: number;
  /** Percent delivered */
  delivered: number;
  spend: number;
  status: string;
  statusTone: Tone;
  desc: string;
  budget: number;
  qaPass: number;
  workforce: number;
  started: string;
  deadline: string;
  owner: string;
  // Only posted requests carry these
  budgetRange?: undefined;
  estimate?: undefined;
  statusKey?: undefined;
  proposalDoc?: undefined;
  history?: undefined;
}

export type CompanyProject = PostedProject | SeededProject;

/* ------------------------- Project detail views ------------------------- */

export interface ProjectBatch {
  id: string;
  label: string;
  items: number;
  /** Percent delivered */
  delivered: number;
  status: string;
  statusTone: Tone;
  due: string;
  dueDate: Date;
}

export interface WorkforceMember {
  name: string;
  initials: string;
  tone: Tone;
  accuracy: number;
  items: number;
}

export interface DeliverableFile {
  name: string;
  items: number | null;
  size: string;
  date: string;
  tone: Tone;
}

export interface QaFlag {
  icon: string;
  tone: Tone;
  title: string;
  meta: string;
}

export interface QaSummary {
  passRate: number;
  rework: number;
  avgReview: string;
  reviewed: number;
  flags: QaFlag[];
}

export interface TeamPerson {
  name: string;
  initials: string;
  tone: Tone;
  role: string;
  email?: string;
}

export interface ProjectTeam {
  pic: TeamPerson;
  reviewer: TeamPerson;
  annotators: WorkforceMember[];
  count: number | undefined;
}

/* ----------------------------- Lifecycle ----------------------------- */

export interface RequestAction {
  /** Status key the action moves the request to */
  to: string;
  label: string;
  primary?: boolean;
}

/** What each side can do while a request is in a status */
export interface RequestActionSet {
  sla: string;
  company: RequestAction[];
  zenvinus: RequestAction | null;
}

export interface ProposalRow {
  label: string;
  value: string;
}

/** Proposal document shown to the company (labels already in the current language) */
export interface Proposal {
  docId: string;
  scope: string;
  items: ProposalRow[];
  price: { total: string; upfront: string; final: string; note: string };
  deliverables: string[];
  validUntil: string;
}
