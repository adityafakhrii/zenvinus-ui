/**
 * Zenvinus — Posted project requests: pure helpers (mock backend).
 *
 * The requests themselves are Redux state (../store/projects-slice.ts, saved in localStorage). In production the
 * slice's thunks map to:
 *   postProjectRequest()   -> POST /api/company/requests
 *   selectPostedProjects() -> GET /api/company/projects?origin=request
 *
 * Requests created through the Create AI Project Request wizard start with status PENDING; the order pipeline
 * (8 stages) is their child view. Everything here is pure: the time is passed in by the caller.
 */

import { POSTED_TASK_STATUS_FLOW } from "@/features/tasks";
import { translate, currentLocale } from "@/i18n";
import type {
  DomainOption,
  PostedProject,
  Proposal,
  ProjectRequestForm,
  RequestActionSet,
  Tone,
} from "../types/project";

const nextId = (existing: readonly PostedProject[]): string => {
  const nums = existing
    .map((p) => Number(String(p.id).replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1044;
  return `PRJ-${max + 1}`;
};

const DOMAIN_LABELS: Readonly<Record<string, string>> = {
  cv: "Computer Vision",
  nlp: "NLP",
  llm: "LLM / Generative AI",
  speech: "Speech & Audio",
  timeseries: "Time Series",
  recsys: "Recommendation",
  tabular: "Tabular ML",
  multimodal: "Multimodal",
  geospatial: "Geospatial",
  other: "Other",
};

/** Normalize old entries that still store the domain key instead of a label */
export const normalizePosted = (p: PostedProject): PostedProject => ({
  ...p,
  typeLabel:
    p.typeLabel && p.typeLabel !== "Other"
      ? p.typeLabel
      : (p.domain && DOMAIN_LABELS[p.domain]) || p.typeLabel || "Other",
});

/**
 * Budget value saved by the wizard (kept as-is — it is used as a key)
 * -> English display label, translated with translate().
 */
const BUDGET_LABELS: Readonly<Record<string, string>> = {
  "< Rp 10 juta": "< Rp 10 million",
  "Rp 10–50 juta": "Rp 10–50 million",
  "Rp 50–100 juta": "Rp 50–100 million",
  "Rp 100–500 juta": "Rp 100–500 million",
  "Rp 500 juta+": "Rp 500 million+",
};

/** Budget label for display (current language); an empty range is returned as-is. */
export const budgetLabel = (range: string | null | undefined): string | null | undefined =>
  range ? translate(BUDGET_LABELS[range] || range) : range;

/** Stored date ("Nov 08, 2026" / "2026-11-30") -> current-language format; unparseable values are returned as-is. */
export const formatDate = (value: string | null | undefined): string | null | undefined => {
  if (!value) return value;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(currentLocale(), { day: "2-digit", month: "short", year: "numeric" });
};

const BUDGET_MIDPOINTS: Readonly<Record<string, number>> = {
  "< Rp 10 juta": 10,
  "Rp 10–50 juta": 30,
  "Rp 50–100 juta": 75,
  "Rp 100–500 juta": 300,
  "Rp 500 juta+": 500,
};

/** Midpoint of a budget range (million IDR) for pipeline estimates. */
export const budgetMidpoint = (range: string | null | undefined): number | null =>
  (range ? BUDGET_MIDPOINTS[range] : undefined) ?? null;

/** Wizard form, optionally with the chosen domain option attached */
export type PostedProjectInput = ProjectRequestForm & { domainObj?: DomainOption };

/** A new request from the wizard form; `existing` decides the next PRJ id */
export const buildPostedProject = (form: PostedProjectInput, existing: readonly PostedProject[]): PostedProject => {
  const id = nextId(existing);
  const mid = budgetMidpoint(form.delivery?.budget);
  const needs = (form.needs || []).map((n) => n.label);
  const project: PostedProject = {
    id,
    kind: "posted",
    name: form.name,
    type: form.domainObj?.key || form.domain || "other",
    typeLabel: form.domainObj?.label || DOMAIN_LABELS[form.domain] || "Other",
    icon: form.domainObj?.icon || "fa-solid fa-microchip",
    tone: form.domainObj?.tone || "blue",
    needs,
    useCase: form.useCase || null,
    industry: form.industry || null,
    desc: form.description,
    data: form.data || null,
    annotation: form.annotation || null,
    model: form.model || null,
    delivery: form.delivery || null,
    company: form.company || null,
    items: Number(form.data?.targetSize) || 0,
    delivered: 0,
    spend: 0,
    budget: null,
    budgetRange: form.delivery?.budget || null,
    estimate: mid,
    status: "PENDING",
    statusKey: "pending",
    statusTone: "amber",
    owner: form.company?.contact || "You",
    started: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    deadline: form.delivery?.completion || null,
  };
  return project;
};

/* ------------------------------------------------------------------ */
/* Lifecycle — current status + activity history (audit log)           */
/* ------------------------------------------------------------------ */

/** Actions available per status: company vs the Zenvinus side (demo simulation).
 * Flow: request → internal review (proposal attached) → pay down payment →
 * work → done → pay final. */
export const REQUEST_ACTIONS: Readonly<Record<string, RequestActionSet>> = {
  pending: {
    sla: "Zenvinus internal review typically takes 1–2 business days — the proposal comes with it.",
    company: [],
    zenvinus: { to: "in_review", label: "Start Internal Review" },
  },
  awaiting_dp: {
    sla: "Review the attached proposal, then pay the 50% down payment to start work.",
    company: [{ to: "in_progress", label: "Pay 50% Down Payment", primary: true }],
    zenvinus: null,
  },
  in_progress: {
    sla: "Batches are delivered progressively and visible in the pipeline.",
    company: [],
    zenvinus: { to: "awaiting_full", label: "Complete Work & QA" },
  },
  awaiting_full: {
    sla: "Work is done — pay the remaining 50% to unlock full delivery.",
    company: [{ to: "completed", label: "Pay 50% Final & Unlock Delivery", primary: true }],
    zenvinus: null,
  },
  completed: {
    sla: "Everything is delivered. Your datasets, models and reports are ready.",
    company: [],
    zenvinus: null,
  },
};

type JutaAmount = number | string | null | undefined;

const isMissingAmount = (m: JutaAmount): boolean => m === null || m === undefined || Number.isNaN(Number(m));

const idrLabel = (m: JutaAmount): string =>
  isMissingAmount(m) ? "To be discussed" : `Rp ${String(Math.round(Number(m) * 10) / 10).replace(".", ",")} juta`;

/** Amount (million IDR) -> display label in the current language. */
const idrDisplay = (m: JutaAmount): string =>
  isMissingAmount(m)
    ? translate("To be discussed")
    : translate("Rp {amount} million", {
        amount: (Math.round(Number(m) * 10) / 10).toLocaleString(currentLocale()),
      });

/** Timestamp label for the request history ("Nov 10, 08:15"), in the current language */
export const nowLabel = (): string =>
  new Date().toLocaleString(currentLocale(), {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/** The request moved to another status, with the change recorded in its history. */
export const withStatus = (p: PostedProject, toKey: string, note: string | undefined, at: string): PostedProject => {
  const target = STATUS_META[toKey];
  return {
    ...p,
    statusKey: toKey,
    status: target.label,
    statusTone: target.tone,
    history: [{ at, title: target.label, detail: note || target.historyNote }, ...(p.history || [])],
  };
};

export interface ProposalInput {
  /** Final price in million IDR */
  priceJuta: number | string;
  validUntil?: string;
  scopeNote?: string;
}

/** The request with the expert's final proposal attached (the price may differ from the requested range). */
export const withProposal = (p: PostedProject, { priceJuta, validUntil, scopeNote }: ProposalInput, at: string): PostedProject => ({
  ...p,
  proposalDoc: {
    docId: `PRP-${String(p.id).replace("PRJ-", "")}`,
    priceJuta: Number(priceJuta) || 0,
    priceLabel: idrLabel(priceJuta),
    upfrontLabel: idrLabel(Number(priceJuta) / 2),
    finalLabel: idrLabel(Number(priceJuta) / 2),
    validUntil: validUntil || "30 days",
    scopeNote: scopeNote || "",
    sentAt: at,
  },
  history: [
    {
      at,
      title: "PROPOSAL_SENT",
      detail: `Proposal sent to company — ${idrLabel(priceJuta)}.`,
    },
    ...(p.history || []),
  ],
});

/** Proposal document: uses the price set by the expert, falling back to the budget range. */
export const buildProposal = (project: PostedProject): Proposal => {
  const doc = project.proposalDoc;
  const mid = budgetMidpoint(project.budgetRange) || 0;
  // WHY: Price labels are recomputed from the numbers (not the stored labels) so they follow the current language
  const fmt = (m: number | null): string => (m === null || m === undefined ? translate("To be discussed") : idrDisplay(m));
  const deliverables = (project.delivery?.items?.length
    ? project.delivery.items
    : ["Curated Dataset", "Trained Model", "Evaluation Report"]
  ).map((d) => translate(d));
  const docPrice = doc && doc.priceJuta !== undefined && doc.priceJuta !== null ? doc.priceJuta : null;
  return {
    docId: `PRP-${project.id.replace("PRJ-", "")}`,
    scope: project.desc,
    items: [
      { label: "Scope of work", value: project.needs?.map((n) => translate(n)).join(" + ") || "—" },
      { label: "Approach", value: proposalApproach(project) },
      { label: "Team", value: teamFor(project) },
      { label: "Timeline", value: `${formatDate(project.started)} → ${formatDate(project.deadline) || translate("to be agreed")}` },
      {
        label: "Quality",
        value: project.annotation?.quality
          ? translate("{quality} with {review}", {
              quality: project.annotation.quality,
              review: project.annotation.reviewLevel ? translate(project.annotation.reviewLevel) : translate("standard review"),
            })
          : translate("QA double-pass, 95%+"),
      },
    ],
    price: {
      total: docPrice !== null ? idrDisplay(docPrice) : doc ? doc.priceLabel : budgetLabel(project.budgetRange) || fmt(mid),
      upfront: docPrice !== null ? idrDisplay(docPrice / 2) : doc ? doc.upfrontLabel : fmt(mid ? mid / 2 : null),
      final: docPrice !== null ? idrDisplay(docPrice / 2) : doc ? doc.finalLabel : fmt(mid ? mid / 2 : null),
      note: doc?.scopeNote || translate("Final invoice reflects approved items only — unspent escrow is returned."),
    },
    deliverables,
    validUntil: translate(doc?.validUntil || "30 days from proposal date"),
  };
};

const proposalApproach = (p: PostedProject): string => {
  if (p.model?.devType === "finetune") return translate("Fine-tune a foundation model on the prepared dataset");
  if (p.model?.devType === "train") return translate("Train a custom model from a proven architecture");
  if (p.model?.devType === "unsure") return translate("Architecture recommended by Zenvinus experts after data audit");
  if (p.annotation?.type)
    return translate(
      p.annotation.workforce === "expert" ? "{type} pipeline with expert workforce" : "{type} pipeline with community workforce",
      { type: translate(p.annotation.type) }
    );
  return translate("Data pipeline tailored to your use case");
};

const teamFor = (p: PostedProject): string =>
  translate("1 Solutions Architect · 1 QA Lead · {count} qualified annotators", {
    count: Math.max(3, Math.round((p.items || 5000) / 2500)),
  });

interface StatusMeta {
  label: string;
  tone: Tone;
  historyNote: string;
}

/* Label/tone meta for each status (used by updateRequestStatus). */
const STATUS_META: Readonly<Record<string, StatusMeta>> = POSTED_TASK_STATUS_FLOW.reduce<Record<string, StatusMeta>>((acc, s) => {
  const key: string = s.key;
  acc[key] = {
    label: s.label,
    tone: key === "completed" ? "mint" : key === "proposal_ready" ? "blue" : "amber",
    historyNote: s.desc,
  };
  return acc;
}, {});
