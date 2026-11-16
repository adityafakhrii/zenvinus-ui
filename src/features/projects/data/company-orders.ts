/**
 * Zenvinus — Enterprise custom order pipeline data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getCompanyOrders()      -> GET /api/company/orders
 *   getCompanyOrderDetail() -> GET /api/company/orders/:id
 *
 * Pipeline (8 stages):
 *   Request → Expert Review → Proposal → Acceptance & 50% Payment →
 *   In Progress → Completed → Full Payment → Delivery (Datasets, Models
 *   & Inference).
 */

import {
  getProjectById,
  getProjectDeliverables,
} from "./company-projects";
import { translate, currentLocale } from "@/i18n";
import type { DeliverableFile, PostedProject, Tone } from "../types/project";
import type {
  CompanyOrder,
  OrderDeliverables,
  OrderDetail,
  OrderStageDetail,
  PipelineStage,
  StageContent,
  StageState,
  TimelineStep,
} from "../types/order";

export const ORDER_PIPELINE: readonly PipelineStage[] = [
  { key: "request",    label: "Request Received",      icon: "fa-solid fa-file-signature" },
  { key: "review",     label: "Expert Team Review",    icon: "fa-solid fa-user-graduate" },
  { key: "proposal",   label: "Proposal Sent",         icon: "fa-solid fa-file-lines" },
  { key: "acceptance", label: "Acceptance & 50% Payment", icon: "fa-solid fa-handshake" },
  { key: "work",       label: "Work in Progress",      icon: "fa-solid fa-diagram-project" },
  { key: "completed",  label: "Work Completed",        icon: "fa-solid fa-flag-checkered" },
  { key: "final",      label: "Full Payment",          icon: "fa-solid fa-money-check-dollar" },
  { key: "delivery",   label: "Datasets, Models & Inference", icon: "fa-solid fa-rocket" },
];

const STAGE_LABELS = ORDER_PIPELINE.map((s) => s.label);

export const getCompanyOrders = (): CompanyOrder[] => [
  {
    id: "REQ-2064",
    items: 42000,
    workforce: 14,
    qaPass: 97.6,
    title: "Street Scenes HD Frames + Bounding Boxes",
    type: "Object Annotation",
    icon: "fa-solid fa-object-group",
    tone: "blue",
    date: "Jul 02, 2026",
    amount: 18400,
    stage: 8,
    stageLabel: STAGE_LABELS[7],
    status: "Delivered",
    statusTone: "mint",
    progress: 100,
  },
  {
    id: "REQ-2071",
    items: 8600,
    workforce: 11,
    qaPass: 96.9,
    title: "50k Hours Call-Center Audio Transcription",
    type: "Audio Transcription",
    icon: "fa-solid fa-headphones",
    tone: "purple",
    date: "Sep 12, 2026",
    amount: 42000,
    stage: 5,
    stageLabel: STAGE_LABELS[4],
    status: "In Progress",
    statusTone: "blue",
    progress: 55,
  },
  {
    id: "REQ-2075",
    items: 12500,
    workforce: 9,
    qaPass: 98.4,
    title: "LLM Evaluation Set — Bahasa Indonesia",
    type: "LLM Evaluation",
    icon: "fa-solid fa-robot",
    tone: "orange",
    date: "Oct 01, 2026",
    amount: 12750,
    stage: 3,
    stageLabel: STAGE_LABELS[2],
    status: "Proposal Sent",
    statusTone: "amber",
    progress: 20,
  },
];


/**
 * Wrap a regular project (PRJ-*, wizard requests included) in the order shape
 * so the pipeline can render as a child view of the project detail.
 * The stage is inferred from progress: 8 stages with percentage thresholds.
 */
const STAGE_THRESHOLDS = [0, 12, 25, 40, 55, 80, 92, 100];

const buildProjectAsOrder = (posted: readonly PostedProject[], id: string): OrderDetail => {
  const project = getProjectById(posted, id);
  if (!project) return getCompanyOrderDetail(posted);
  const progress = project.delivered ?? 0;
  let stageNum = 1;
  if (project.kind === "posted") {
    // request lifecycle status -> pipeline stage
    const byStatus: Readonly<Record<string, number>> = {
      pending: 2, in_review: 3, awaiting_dp: 4,
      in_progress: 5, awaiting_full: 7, completed: 8,
    };
    stageNum = byStatus[project.statusKey] || 1;
  } else {
    STAGE_THRESHOLDS.forEach((t, i) => {
      if (progress >= t) stageNum = i + 1;
    });
    if (progress >= 100) stageNum = 8;
  }

  const timeline: TimelineStep[] = ORDER_PIPELINE.map((meta, i) => {
    const state: StageState =
      progress >= 100 || i + 1 < stageNum
        ? "done"
        : i + 1 === stageNum
        ? "active"
        : "pending";
    return {
      ...meta,
      state,
      date: state === "done" && project.started ? project.started : null,
    };
  });

  const deliveredPct = Math.min(100, progress);
  const isPosted = project.kind === "posted";
  // Contract value in USD: the budget of a seeded project (posted requests have none, so their spend)
  const contractValue = project.kind === "posted" ? project.spend : project.budget;
  const budgetMid =
    typeof project.estimate === "number" ? project.estimate : null;
  const idr = (m: number | null): string =>
    m === null
      ? translate("To be discussed")
      : translate("Rp {amount} million", { amount: (m % 1 ? Number(m.toFixed(1)) : m).toLocaleString(currentLocale()) });
  return {
    id: project.id,
    title: project.name,
    type: project.typeLabel,
    icon: project.icon,
    tone: project.tone,
    date: project.started,
    amount: isPosted
      ? project.proposalDoc?.priceLabel || project.budgetRange || idr(budgetMid)
      : contractValue,
    items: project.items,
    workforce: project.workforce ?? 0,
    qaPass: project.qaPass ?? null,
    stage: stageNum,
    stageLabel: STAGE_LABELS[stageNum - 1],
    status:
      project.kind === "posted"
        ? project.status
        : project.status === "Completed"
        ? "Delivered"
        : STAGE_LABELS[stageNum - 1].split(" — ")[0],
    statusTone: ((): Tone =>
      project.kind === "posted"
        ? project.statusTone
        : project.status === "Completed"
        ? "mint"
        : deliveredPct > 0
        ? "blue"
        : "amber")(),
    progress: deliveredPct,
    timeline,
    payments: {
      upfront: {
        label: isPosted ? "Down payment (50%)" : "Upfront (50%)",
        amount: isPosted
          ? project.proposalDoc?.upfrontLabel || idr(budgetMid === null ? null : budgetMid / 2)
          : Math.round(contractValue / 2),
        state: stageNum >= 4 ? "paid" : "pending",
        date: stageNum >= 4 ? project.started : null,
      },
      final: {
        label: isPosted ? "Final payment (50%)" : "Final (50%)",
        amount: isPosted
          ? project.proposalDoc?.finalLabel || idr(budgetMid === null ? null : budgetMid / 2)
          : contractValue - Math.round(contractValue / 2),
        state: stageNum >= 7 ? "paid" : "pending",
        date: stageNum >= 7 ? project.deadline : null,
      },
    },
    deliverables:
      deliveredPct >= 100
        ? {
            datasets: getProjectDeliverables(posted, id)
              .filter((f): f is DeliverableFile & { items: number } => Boolean(f.items))
              .map((f) => ({ name: f.name, items: f.items, size: f.size, date: f.date })),
            models: [
              {
                name: `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-v1`,
                framework: `${project.typeLabel} · Production`,
                metric: project.qaPass ? `QA pass ${project.qaPass}%` : "QA passed",
                href: "/dashboard/model-details",
              },
            ],
            inference: {
              endpoint: `https://api.zenvinus.io/v1/infer/${project.id.toLowerCase()}`,
              region: "ap-southeast-3 (Jakarta)",
              latency: "48 ms p50",
              status: "Live",
            },
          }
        : null,
  };
};

export const getCompanyOrderDetail = (posted: readonly PostedProject[], id?: string | null): OrderDetail => {
  // The pipeline is a child of any project: PRJ-* ids are wrapped in the order
  // shape from project data, REQ-* ids use the custom order data.
  if (id && !id.startsWith("REQ")) {
    return buildProjectAsOrder(posted, id);
  }
  const orders = getCompanyOrders();
  const order = orders.find((o) => o.id === id) || orders[0];
  const stage = order.stage;

  const timeline: TimelineStep[] = [
    {
      ...ORDER_PIPELINE[0],
      state: "done",
      date: order.date,
      desc: "Brief, volume, quality target and timeline received.",
    },
    {
      ...ORDER_PIPELINE[1],
      state: stage >= 2 ? "done" : "active",
      date: stage >= 2 ? "Oct 06, 2026" : null,
      desc: "The expert team assesses feasibility, annotator needs and the QA scheme.",
    },
    {
      ...ORDER_PIPELINE[2],
      state: stage >= 3 ? "done" : stage === 2 ? "active" : "pending",
      date: stage >= 3 ? "Oct 09, 2026" : null,
      desc: "A proposal with per-item pricing, batch schedule and SLA is sent.",
    },
    {
      ...ORDER_PIPELINE[3],
      state: stage >= 4 ? "done" : stage === 3 ? "active" : "pending",
      date: stage >= 4 ? "Oct 11, 2026" : null,
      desc: "The company accepts the proposal; 50% goes into escrow.",
    },
    {
      ...ORDER_PIPELINE[4],
      state: stage >= 5 ? "done" : stage === 4 ? "active" : "pending",
      date: stage >= 5 ? "Oct 13, 2026" : null,
      desc: "Batches are worked on by a qualified workforce with double-pass QA.",
    },
    {
      ...ORDER_PIPELINE[5],
      state: stage >= 6 ? "done" : stage === 5 ? "active" : "pending",
      date: stage >= 6 ? "Nov 02, 2026" : null,
      desc: "All items are complete and passed quality review.",
    },
    {
      ...ORDER_PIPELINE[6],
      state: stage >= 7 ? "done" : stage === 6 ? "active" : "pending",
      date: stage >= 7 ? "Nov 03, 2026" : null,
      desc: "The remaining 50% is paid; escrow is fully released.",
    },
    {
      ...ORDER_PIPELINE[7],
      state: stage >= 8 ? "done" : stage === 7 ? "active" : "pending",
      date: stage >= 8 ? "Nov 04, 2026" : null,
      desc: "Datasets & models are delivered; the inference endpoint is activated.",
    },
  ];

  // Deliverables only appear after full payment & delivery (stage 8).
  const deliverables: OrderDeliverables | null = stage >= 8
    ? {
        datasets: [
          { name: "street-scenes-frames-v1.zip", items: 42000, size: "18.2 GB", date: "Nov 04, 2026" },
          { name: "street-scenes-labels-v1.parquet", items: 42000, size: "310 MB", date: "Nov 04, 2026" },
        ],
        models: [
          { name: "street-object-detector-v1", framework: "YOLOv8 · PyTorch", metric: "mAP@50 91.4%", href: "/dashboard/model-details" },
          { name: "street-scene-classifier-v1", framework: "ViT-B · ONNX", metric: "Top-1 94.2%", href: "/dashboard/model-details" },
        ],
        inference: {
          endpoint: "https://api.zenvinus.io/v1/infer/req-2064",
          region: "ap-southeast-3 (Jakarta)",
          latency: "48 ms p50",
          status: "Live",
        },
      }
    : null;

  // Custom orders (REQ-*) always carry a USD number
  const amount = Number(order.amount);

  return {
    ...order,
    timeline,
    payments: {
      upfront: {
        label: "Upfront (50%)",
        amount: Math.round(amount / 2),
        state: stage >= 4 ? "paid" : "pending",
        date: stage >= 4 ? "Oct 11, 2026" : null,
      },
      final: {
        label: "Final (50%)",
        amount: amount - Math.round(amount / 2),
        state: stage >= 7 ? "paid" : "pending",
        date: stage >= 7 ? "Nov 03, 2026" : null,
      },
    },
    deliverables,
  };
};

/**
 * Detail of one pipeline stage — used by /dashboard/projects?id=..&stage=<key>.
 * The content is built from the order data so each order has its own story.
 */
export const getOrderStageDetail = (posted: readonly PostedProject[], orderId: string, stageKey: string): OrderStageDetail => {
  const order = getCompanyOrderDetail(posted, orderId);
  const stage = order.timeline.find((s) => s.key === stageKey) || order.timeline[0];
  const idx = ORDER_PIPELINE.findIndex((s) => s.key === stage.key);
  const meta = ORDER_PIPELINE[idx];
  // Posted requests carry an IDR label as amount; it is shown as-is and the arithmetic gives NaN, as before
  const money2 = (n: number | string) => `$${typeof n === "number" ? n.toLocaleString(currentLocale()) : n}`;
  const amount = Number(order.amount);
  const itemsLabel = (n: number) => translate("{count} items", { count: n.toLocaleString(currentLocale()) });
  const perItem = amount / order.items;

  let content: StageContent = { kind: "info", rows: [] };
  if (stage.key === "request") {
    content = {
      kind: "info",
      intro: "The brief the company team sent when creating the request.",
      rows: [
        { icon: "fa-solid fa-layer-group", label: "Volume", value: itemsLabel(order.items) },
        { icon: "fa-solid fa-bullseye", label: "Quality target", value: "Double-pass QA, accuracy ≥ 95%" },
        { icon: "fa-regular fa-calendar", label: "Timeline", value: translate("Starts {date} · staged deadlines per batch", { date: order.date }) },
        { icon: "fa-solid fa-tag", label: "Category", value: order.type },
      ],
    };
  } else if (stage.key === "review") {
    content = {
      kind: "info",
      intro: "The expert team assesses feasibility before the proposal is drafted.",
      rows: [
        { icon: "fa-solid fa-user-graduate", label: "Reviewer", value: "Rani W. — Solutions Architect" },
        { icon: "fa-solid fa-clock", label: "Review duration", value: "3 business days" },
        { icon: "fa-solid fa-lightbulb", label: "Notes", value: "Requires certified annotators; a two-stage QA pipeline is recommended." },
        { icon: "fa-solid fa-scale-balanced", label: "Outcome", value: "Feasible — moving on to drafting the proposal." },
      ],
    };
  } else if (stage.key === "proposal") {
    content = {
      kind: "proposal",
      intro: translate("Proposal {id} has been sent and is awaiting the company's decision.", { id: `${order.id}-PRP` }),
      doc: {
        id: `${order.id}-PRP`,
        rows: [
          { label: "Price per item", value: `$${perItem.toFixed(2)}` },
          { label: "Volume", value: itemsLabel(order.items) },
          { label: "Total contract", value: money2(order.amount) },
          { label: "Payment scheme", value: "50% upfront · 50% on completion" },
          { label: "Batch SLA", value: "2 batches / week" },
          { label: "Valid until", value: "Nov 30, 2026" },
        ],
      },
    };
  } else if (stage.key === "acceptance") {
    content = {
      kind: "payment",
      intro: "The company accepts the proposal; the 50% payment goes into escrow to start the work.",
      rows: [
        { icon: "fa-solid fa-money-check-dollar", label: "Escrow amount", value: money2(Math.round(amount / 2)) },
        { icon: "fa-regular fa-calendar", label: "Payment date", value: stage.date || "—" },
        { icon: "fa-solid fa-lock", label: "Status", value: stage.state === "done" ? "Funds secured in escrow" : "Awaiting payment" },
      ],
    };
  } else if (stage.key === "work") {
    const batchCount = 3;
    const per = Math.round(order.items / batchCount);
    content = {
      kind: "batches",
      intro: translate("Batches are worked on by {count} qualified annotators with double-pass QA.", { count: order.workforce }),
      batches: Array.from({ length: batchCount }, (_, i) => {
        const base = Math.round((order.progress - i * 25) / batchCount);
        const pct = Math.min(100, Math.max(0, base < 0 ? 0 : base));
        return {
          id: `WB-${i + 1}`,
          label: translate("Work batch {n}", { n: i + 1 }),
          items: per,
          delivered: pct,
        };
      }),
    };
  } else if (stage.key === "completed") {
    content = {
      kind: "info",
      intro: "All items are complete and passed quality review.",
      rows: [
        { icon: "fa-solid fa-clipboard-check", label: "QA pass rate", value: `${order.qaPass}%` },
        { icon: "fa-solid fa-layer-group", label: "Items approved", value: itemsLabel(Math.round((order.progress / 100) * order.items)) },
        { icon: "fa-solid fa-rotate", label: "Re-work", value: "1.9% — re-work completed" },
        { icon: "fa-solid fa-clock", label: "Average review", value: "6h 12m per item" },
      ],
    };
  } else if (stage.key === "final") {
    content = {
      kind: "payment",
      intro: "Paying the remaining 50% releases the full escrow.",
      rows: [
        { icon: "fa-solid fa-money-check-dollar", label: "Final amount", value: money2(amount - Math.round(amount / 2)) },
        { icon: "fa-solid fa-file-invoice", label: "Invoice", value: `INV-${order.id.replace("REQ-", "")}` },
        { icon: "fa-solid fa-lock", label: "Status", value: stage.state === "done" ? "Paid in full — escrow released" : "Awaiting payment" },
      ],
    };
  } else if (stage.key === "delivery") {
    content = {
      kind: "delivery",
      intro: "Datasets & models are delivered; the inference endpoint is activated.",
    };
  }

  return { order, idx, meta, stage, content };
};
