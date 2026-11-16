/**
 * Zenvinus — Company projects data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getCompanyProjects()     -> GET /api/company/projects
 *   getProjectDetail()       -> GET /api/company/projects/:id
 *   getProjectBatches()      -> GET /api/company/projects/:id/batches
 *   getProjectWorkforce()    -> GET /api/company/projects/:id/workforce
 *   getProjectDeliverables() -> GET /api/company/projects/:id/deliverables
 *   getProjectQa()           -> GET /api/company/projects/:id/qa
 *
 * /dashboard/projects renders the list; ?id=PRJ-xxxx renders the detail —
 * this file is the single source for both. Projects posted through the
 * wizard (Redux, store/projects-slice.ts) are passed in as `posted` and merge into the same list.
 */

import { POSTED_TASK_STATUS_FLOW } from "@/features/tasks";
import { translate, currentLocale } from "@/i18n";
import type {
  CompanyProject,
  PostedProject,
  DeliverableFile,
  ProjectBatch,
  ProjectTeam,
  QaFlag,
  QaSummary,
  SeededProject,
  StatusStep,
  TeamPerson,
  Tone,
  WorkforceMember,
} from "../types/project";

/* Seed data — the company's demo projects. */
const SEEDED_PROJECTS: SeededProject[] = [
  {
    id: "PRJ-1041",
    name: "Street Scene Bounding Boxes",
    type: "object_annotation",
    typeLabel: "Object Annotation",
    icon: "fa-solid fa-object-group",
    tone: "blue",
    items: 42000,
    delivered: 84,
    spend: 8400,
    status: "In Progress",
    statusTone: "blue",
    desc: "Bounding-box annotation of vehicles, pedestrians and traffic signs across 42,000 street-level frames, feeding the perception model for autonomous driving training.",
    budget: 10000,
    qaPass: 97.8,
    workforce: 14,
    started: "Aug 04, 2026",
    deadline: "Nov 28, 2026",
    owner: "Faris A.",
  },
  {
    id: "PRJ-1039",
    name: "Chatbot Response Ranking",
    type: "llm_evaluation",
    typeLabel: "LLM Evaluation",
    icon: "fa-solid fa-robot",
    tone: "orange",
    items: 12500,
    delivered: 100,
    spend: 6250,
    status: "Completed",
    statusTone: "mint",
    desc: "Pairwise helpfulness and accuracy ranking of 12,500 LLM responses, producing a preference dataset for RLHF fine-tuning of the support assistant.",
    budget: 7000,
    qaPass: 98.4,
    workforce: 9,
    started: "May 18, 2026",
    deadline: "Aug 30, 2026",
    owner: "Nadia K.",
  },
  {
    id: "PRJ-1036",
    name: "Call Center Speech-to-Text",
    type: "audio_transcription",
    typeLabel: "Audio Transcription",
    icon: "fa-solid fa-headphones",
    tone: "purple",
    items: 8600,
    delivered: 62,
    spend: 2580,
    status: "In Progress",
    statusTone: "blue",
    desc: "Verbatim transcription of 8,600 call-center recordings with speaker turns and PII redaction, powering the voice-analytics pipeline.",
    budget: 4200,
    qaPass: 96.9,
    workforce: 11,
    started: "Sep 01, 2026",
    deadline: "Dec 15, 2026",
    owner: "Nadia K.",
  },
  {
    id: "PRJ-1032",
    name: "Customer Records Cleanup",
    type: "tabular_validation",
    typeLabel: "Tabular Validation",
    icon: "fa-solid fa-table",
    tone: "mint",
    items: 30000,
    delivered: 100,
    spend: 4400,
    status: "Completed",
    statusTone: "mint",
    desc: "Field-level validation and dedup of 30,000 customer records — normalizing addresses, phones and IDs before CRM migration.",
    budget: 4800,
    qaPass: 99.1,
    workforce: 6,
    started: "Mar 02, 2026",
    deadline: "Jun 20, 2026",
    owner: "Faris A.",
  },
  {
    id: "PRJ-1044",
    name: "Receipt OCR Field Check",
    type: "text_classification",
    typeLabel: "Text Classification",
    icon: "fa-solid fa-file-lines",
    tone: "mint",
    items: 15000,
    delivered: 8,
    spend: 410,
    status: "Review",
    statusTone: "amber",
    desc: "Human verification of OCR-extracted fields (merchant, total, date) across 15,000 grocery receipts for the spend-analytics engine.",
    budget: 1500,
    qaPass: 95.2,
    workforce: 7,
    started: "Sep 26, 2026",
    deadline: "Dec 08, 2026",
    owner: "Yoga P.",
  },
];

/** Combined list: wizard requests on top, demo seed below. `posted` comes from selectPostedProjects. */
export const getCompanyProjects = (posted: readonly PostedProject[]): CompanyProject[] => [...posted, ...SEEDED_PROJECTS];

const findPosted = (posted: readonly PostedProject[], id: string): PostedProject | undefined => posted.find((p) => p.id === id);

export const getProjectById = (posted: readonly PostedProject[], id: string | null | undefined): CompanyProject | undefined =>
  (id && findPosted(posted, id)) || SEEDED_PROJECTS.find((p) => p.id === id);

/** Detail by id (compatible with old callers: no argument = the first project). */
export const getProjectDetail = (posted: readonly PostedProject[], id?: string | null): CompanyProject => getProjectById(posted, id) || SEEDED_PROJECTS[0];

/**
 * Position of a project in the status lifecycle (POSTED_TASK_STATUS_FLOW).
 * Posted projects use their own statusKey; seeds are mapped from their demo
 * status. REQ (custom orders) do not go through here — they have the 8-stage pipeline.
 */
const SEED_STATUS_KEYS: Readonly<Record<string, string>> = { "In Progress": "in_progress", Completed: "completed", Review: "in_review" };

export const getProjectStatus = (posted: readonly PostedProject[], id: string): StatusStep => {
  const postedProject = findPosted(posted, id);
  const seedStatus = getProjectById(posted, id)?.status;
  const key = postedProject ? postedProject.statusKey : (seedStatus && SEED_STATUS_KEYS[seedStatus]) || "pending";
  return (
    POSTED_TASK_STATUS_FLOW.find((s) => s.key === key) ||
    POSTED_TASK_STATUS_FLOW[0]
  );
};

export const getProjectBatches = (posted: readonly PostedProject[], id?: string | null): ProjectBatch[] => {
  const p = getProjectDetail(posted, id);
  const themes: Readonly<Record<string, string[]>> = {
    object_annotation: ["Daylight traffic", "Urban rain", "Residential", "Highway dusk", "Night scenes"],
    llm_evaluation: ["Single-turn QA", "Multi-turn support", "Code answers", "Safety probes", "Long-form"],
    audio_transcription: ["Retail support", "Billing disputes", "Onboarding calls", "Technical desk", "Escalations"],
    tabular_validation: ["Jakarta region", "Surabaya region", "Bandung region", "Medan region", "Other regions"],
    text_classification: ["Minimart receipts", "Supermarket receipts", "Restaurant bills", "Pharmacy slips", "Online orders"],
  };
  const themesFor = themes[p.type] || themes.object_annotation;
  const count = Math.min(5, Math.max(3, Math.round(p.items / 8000)));
  const per = Math.round(p.items / count);
  const doneBatchCount = Math.round((count * p.delivered) / 100);

  return Array.from({ length: count }, (_, i) => {
    const done = i < doneBatchCount;
    const active = !done && i === doneBatchCount;
    const deliveredPct = done ? 100 : active ? Math.max(8, (p.delivered * count) % 100) : 0;
    const batchNo = 40 + count - i;
    // Posted requests may have no deadline: new Date(0), as new Date(null) did before
    const due = new Date(p.deadline ?? 0);
    due.setDate(due.getDate() - (count - 1 - i) * 14);
    const dueLabel = due.toLocaleDateString(currentLocale(), { month: "short", day: "2-digit" });
    const statusTone: Tone = done ? "mint" : active ? (p.status === "Review" ? "amber" : "blue") : "grey";
    return {
      id: `B-${String(batchNo).padStart(2, "0")}`,
      label: translate("Batch {no} — {theme}", {
        no: String(batchNo).padStart(2, "0"),
        theme: translate(themesFor[i % themesFor.length]),
      }),
      items: per,
      delivered: deliveredPct,
      status: done ? (p.delivered === 100 ? "Completed" : "Approved") : active ? (p.status === "Review" ? "In Review" : "In Progress") : "Queued",
      statusTone,
      due: dueLabel,
      dueDate: due,
    };
  });
};

export const getProjectWorkforce = (posted: readonly PostedProject[], id?: string | null): WorkforceMember[] => {
  const p = getProjectDetail(posted, id);
  const pool: Array<Omit<WorkforceMember, "items">> = [
    { name: "Adinda P.", initials: "AP", tone: "blue", accuracy: 99.1 },
    { name: "Bagas W.", initials: "BW", tone: "mint", accuracy: 98.7 },
    { name: "Citra H.", initials: "CH", tone: "purple", accuracy: 98.9 },
    { name: "Dimas R.", initials: "DR", tone: "orange", accuracy: 97.8 },
    { name: "Eka S.", initials: "ES", tone: "blue", accuracy: 98.2 },
    { name: "Fajar N.", initials: "FN", tone: "mint", accuracy: 98.5 },
    { name: "Gita L.", initials: "GL", tone: "orange", accuracy: 97.9 },
  ];
  const seed = Number(p.id.slice(-2)) || 0;
  // Posted requests have no workforce yet: NaN gives an empty list, as before
  const top = Math.min(5, Math.max(3, Number(p.workforce)));
  const share = Math.round((p.delivered / 100) * p.items);
  return Array.from({ length: top }, (_, i) => {
    const w = pool[(seed + i) % pool.length];
    return { ...w, items: Math.max(120, Math.round((share * (46 - i * 7)) / 220)) };
  });
};

export const getProjectDeliverables = (posted: readonly PostedProject[], id?: string | null): DeliverableFile[] => {
  const p = getProjectDetail(posted, id);
  const batches = getProjectBatches(posted, id);
  const ext = p.type === "audio_transcription" ? "json" : p.type === "tabular_validation" ? "parquet" : "zip";
  const done = batches.filter((b) => b.delivered === 100);
  const files: DeliverableFile[] = done.slice(0, 3).map((b, i) => ({
    name: `${b.id.toLowerCase()}-annotated.${ext}`,
    items: b.items,
    size: `${(1.9 - i * 0.2).toFixed(1)} GB`,
    date: b.dueDate.toLocaleDateString(currentLocale(), { month: "short", day: "2-digit", year: "numeric" }),
    tone: "mint",
  }));
  if (files.length === 0) {
    files.push({
      name: "sample-annotated.zip",
      items: 250,
      size: "86 MB",
      date: "Pilot batch",
      tone: "blue",
    });
  }
  files.push({
    name: `qa-report-${p.id.toLowerCase()}.pdf`,
    items: null,
    size: "420 KB",
    date: "Latest QA cycle",
    tone: "purple",
  });
  return files;
};

export const getProjectQa = (posted: readonly PostedProject[], id?: string | null): QaSummary => {
  const p = getProjectDetail(posted, id);
  const themes: Readonly<Record<string, QaFlag[]>> = {
    object_annotation: [
      { icon: "fa-solid fa-triangle-exclamation", tone: "amber", title: "214 items flagged for re-review", meta: "Occluded pedestrians — ambiguous boxes" },
      { icon: "fa-solid fa-rotate", tone: "orange", title: "162 items sent to re-work", meta: "Missing license-plate boxes" },
    ],
    llm_evaluation: [
      { icon: "fa-solid fa-triangle-exclamation", tone: "amber", title: "78 pairs flagged", meta: "Tie cases without clear preference" },
      { icon: "fa-solid fa-rotate", tone: "orange", title: "41 rankings re-done", meta: "Annotator disagreed with guideline v3" },
    ],
    audio_transcription: [
      { icon: "fa-solid fa-triangle-exclamation", tone: "amber", title: "129 clips flagged", meta: "Heavy accent — low confidence segments" },
      { icon: "fa-solid fa-rotate", tone: "orange", title: "54 transcripts re-done", meta: "Missed speaker turns" },
    ],
    tabular_validation: [
      { icon: "fa-solid fa-triangle-exclamation", tone: "amber", title: "96 records flagged", meta: "Ambiguous duplicate identities" },
      { icon: "fa-solid fa-rotate", tone: "orange", title: "38 records re-checked", meta: "Non-standard phone formats" },
    ],
    text_classification: [
      { icon: "fa-solid fa-triangle-exclamation", tone: "amber", title: "63 receipts flagged", meta: "Blurry total field — OCR mismatch" },
      { icon: "fa-solid fa-rotate", tone: "orange", title: "27 fields re-verified", meta: "Merchant name ambiguity" },
    ],
  };
  const reviewed = Math.round((p.delivered / 100) * p.items);
  return {
    passRate: Number(p.qaPass),
    rework: 1.9,
    avgReview: "6h 12m",
    reviewed,
    flags: [
      ...themes[p.type],
      { icon: "fa-solid fa-circle-check", tone: "mint", title: p.delivered === 100 ? "QA cycle closed" : "QA cycle on track", meta: translate("{count} labelers · double-pass sampling", { count: p.workforce }) },
    ],
  };
};


/* ------------------------------------------------------------------ */
/* Project team — Zenvinus PIC, QA reviewer and annotators            */
/* ------------------------------------------------------------------ */

const PIC_POOL: TeamPerson[] = [
  { name: "Rani W.", initials: "RW", tone: "purple", role: "Solutions Architect", email: "rani.w@zenvinus.io" },
  { name: "Hendra S.", initials: "HS", tone: "blue", role: "Delivery Manager", email: "hendra.s@zenvinus.io" },
  { name: "Maya K.", initials: "MK", tone: "mint", role: "Customer Success Lead", email: "maya.k@zenvinus.io" },
];

const REVIEWER_POOL: TeamPerson[] = [
  { name: "Bima S.", initials: "BS", tone: "blue", role: "QA Reviewer" },
  { name: "Tari A.", initials: "TA", tone: "orange", role: "Senior QA Reviewer" },
  { name: "Leo P.", initials: "LP", tone: "purple", role: "QA Reviewer" },
];

export const getProjectTeam = (posted: readonly PostedProject[], id: string): ProjectTeam => {
  const project = getProjectById(posted, id);
  const seed = Number(String(id).replace(/\D/g, "")) || 0;
  return {
    pic: PIC_POOL[seed % PIC_POOL.length],
    reviewer: REVIEWER_POOL[seed % REVIEWER_POOL.length],
    annotators: getProjectWorkforce(posted, id),
    count: project?.workforce,
  };
};
