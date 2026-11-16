import Link from "next/link";
import React, { useEffect, useState } from "react";
import { DashboardHeader, DashboardFooter } from "@/features/dashboard";
import {
  POSTED_TASK_STATUS_FLOW,
  POSTED_TASK_EXCEPTIONS,
} from "@/features/tasks";
import { budgetLabel, formatDate } from "../data/project-store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectStorageHydrated } from "@/store/persistence";
import { postProjectRequest } from "../store/projects-slice";
import { draftCleared, draftSaved as draftSavedAction, selectRequestDraft } from "../store/request-draft-slice";
import { useT } from "@/i18n";
import type { ReactNode } from "react";
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
} from "../types/project";

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

const NEEDS: readonly NeedOption[] = [
  { key: "dataset", label: "Dataset", icon: "fa-solid fa-database", desc: "Get a ready-to-use, curated dataset from Zenvinus' collection." },
  { key: "ai_model", label: "AI / ML Model", icon: "fa-solid fa-microchip", desc: "Have us build, fine-tune or evaluate a model for your use case." },
  { key: "annotation", label: "Data Annotation", icon: "fa-solid fa-tags", desc: "You already have the data — we label it (boxes, classes, transcripts)." },
  { key: "collection", label: "Data Collection", icon: "fa-solid fa-magnifying-glass", desc: "You don't have data yet — we collect it from the field or legal public sources." },
  { key: "evaluation", label: "Model Evaluation", icon: "fa-solid fa-clipboard-check", desc: "Benchmark or audit the quality of a model you already have." },
  { key: "consulting", label: "Research / Consulting", icon: "fa-solid fa-flask", desc: "Feasibility study, data strategy and expert guidance." },
];

const DOMAINS: readonly DomainOption[] = [
  { key: "cv", label: "Computer Vision", icon: "fa-solid fa-eye", tone: "blue" },
  { key: "nlp", label: "NLP", icon: "fa-solid fa-language", tone: "mint" },
  { key: "llm", label: "LLM / Generative AI", icon: "fa-solid fa-wand-magic-sparkles", tone: "purple" },
  { key: "speech", label: "Speech & Audio", icon: "fa-solid fa-headphones", tone: "orange" },
  { key: "timeseries", label: "Time Series", icon: "fa-solid fa-chart-line", tone: "mint" },
  { key: "recsys", label: "Recommendation", icon: "fa-solid fa-thumbs-up", tone: "blue" },
  { key: "tabular", label: "Tabular ML", icon: "fa-solid fa-table", tone: "mint" },
  { key: "multimodal", label: "Multimodal", icon: "fa-solid fa-layer-group", tone: "purple" },
  { key: "geospatial", label: "Geospatial", icon: "fa-solid fa-earth-asia", tone: "orange" },
  { key: "other", label: "Other", icon: "fa-solid fa-shapes", tone: "blue" },
];

const USE_CASES: Readonly<Record<DomainKey, readonly string[]>> = {
  cv: ["Object Detection", "Image Classification", "Segmentation", "OCR", "Pose Estimation", "Other"],
  nlp: ["Text Classification", "Named Entity Recognition", "Sentiment Analysis", "Summarization", "Other"],
  llm: ["Fine-tuning Dataset", "Model Evaluation", "RAG / Knowledge Base", "Prompt Engineering", "Other"],
  speech: ["Transcription (ASR)", "Text to Speech", "Speaker Identification", "Audio Classification", "Other"],
  timeseries: ["Forecasting", "Anomaly Detection", "Demand Planning", "Other"],
  recsys: ["Ranking", "Personalization", "Next-item Prediction", "Other"],
  tabular: ["Prediction", "Fraud Detection", "Risk Scoring", "Other"],
  multimodal: ["Visual Question Answering", "Image Captioning", "Cross-modal Search", "Other"],
  geospatial: ["Land Use Mapping", "Change Detection", "Object Counting from Imagery", "Other"],
  other: ["Other"],
};

const INDUSTRIES = [
  "Transportation & Infrastructure",
  "E-commerce & Retail",
  "Healthcare & Medical",
  "Finance & Insurance",
  "Manufacturing",
  "Agriculture",
  "Education",
  "Media & Entertainment",
  "Government & Public Sector",
  "Other",
];

const MODALITIES = ["Image", "Video", "Text", "Audio", "Tabular", "Geospatial", "Multimodal"];
const SIZE_UNITS = ["Images", "Videos", "Texts", "Hours", "Rows", "Samples"];
const HAVE_DATA: readonly KeyedOption[] = [
  { key: "yes", label: "Yes, we have our own data" },
  { key: "partial", label: "Partially" },
  { key: "no", label: "No, help us find/collect it" },
];
const DATA_SOURCES = [
  "Company-owned data",
  "Public/open datasets",
  "Internet/publicly accessible sources",
  "Newly collected data",
];
const DIVERSITY_PRESETS = ["Urban", "Rural", "Day", "Night", "Indoor", "Outdoor", "Indonesian", "English"];

const ANNOTATION_TYPES = ["Object Detection", "Image Classification", "Segmentation", "Text Classification", "Transcription", "Ranking", "Tabular Labeling", "Other"];
const ANNOTATION_METHODS = ["Bounding Box", "Polygon", "Segmentation Mask", "Classification", "Keypoints", "Text / Metadata"];
const WORKFORCES: ReadonlyArray<KeyedOption & { desc: string }> = [
  { key: "community", label: "Zenvinus Community", desc: "Skilled community annotators" },
  { key: "verified", label: "Verified Contributors", desc: "Contributors passed qualification tests" },
  { key: "expert", label: "Expert Workforce", desc: "Vetted domain experts" },
  { key: "hybrid", label: "Hybrid Community + Expert Review", desc: "Community labels, expert QA" },
];
const QUALITY_TARGETS = ["90%+", "95%+", "98%+", "99%+"];
const REVIEW_LEVELS = ["Basic Sampling", "Standard Review", "Expert Review", "Full Double-pass"];
const CONSENSUS = ["1 annotator", "2 annotators + 1 reviewer", "3 annotators + 1 reviewer", "Custom"];

const DEV_TYPES: readonly KeyedOption[] = [
  { key: "train", label: "Train a new model" },
  { key: "finetune", label: "Fine-tune an existing model" },
  { key: "improve", label: "Improve our existing model" },
  { key: "evaluate", label: "Model evaluation / benchmarking" },
  { key: "unsure", label: "Not sure — recommend an approach" },
];
const PLATFORMS = ["Cloud", "Edge Device", "Mobile", "Browser", "On-premise"];
const OBJECTIVES = ["Accuracy", "Latency", "Cost Efficiency", "Robustness", "Balanced"];

const DELIVERABLES = [
  "Curated Dataset",
  "Annotated Dataset",
  "Trained Model",
  "Model Weights",
  "Evaluation Report",
  "Training Code",
  "Deployment API",
  "Production Deployment",
  "MLOps Pipeline",
  "Technical Documentation",
];
const DATASET_FORMATS = ["YOLO", "COCO JSON", "Pascal VOC", "CSV", "Parquet", "JSONL", "Custom"];
const MODEL_FORMATS = ["PyTorch (.pt)", "ONNX", "TensorFlow SavedModel", "TensorRT", "Hugging Face", "No preference"];
const URGENCY = ["Flexible", "Standard", "Priority"];
const BUDGETS = ["< Rp 10 juta", "Rp 10–50 juta", "Rp 50–100 juta", "Rp 100–500 juta", "Rp 500 juta+", "Let's discuss"];
const COMPANY_SIZES = ["1–10 employees", "11–50 employees", "51–200 employees", "201–1000 employees", "1000+ employees"];


const emptyForm: ProjectRequestForm = {
  name: "",
  needs: [],
  description: "",
  domain: "",
  useCase: "",
  industry: "",
  data: { modalities: [], haveData: "", sampleUrl: "", currentSize: "", currentUnit: "Images", targetSize: "", targetUnit: "Images", coverage: "", language: "Indonesian", sources: [], diversity: [], notes: "" },
  annotation: { type: "", classes: [], methods: [], workforce: "", quality: "95%+", reviewLevel: "Standard Review", consensus: "1 annotator", options: ["Automated validation"] },
  model: { devType: "", task: "", preferred: "", existing: "", platforms: ["Cloud"], objective: "Accuracy", map: "", precision: "", recall: "", latency: "", hardware: "" },
  delivery: { items: [], datasetFormat: "COCO JSON", modelFormat: "PyTorch (.pt)", completion: "", urgency: "Standard", budget: "" },
  company: { name: "", size: "51–200 employees", contact: "", email: "", role: "", phone: "" },
};

/* ------------------------------------------------------------------ */
/* Small inputs used repeatedly                                        */
/* ------------------------------------------------------------------ */

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
}

const CheckPill = ({ active, onClick, children }: ChoiceProps & { children: ReactNode }) => (
  <button
    type="button"
    className={`edash-pill${active ? " edash-pill-active" : ""}`}
    onClick={onClick}
  >
    {children}
  </button>
);

interface ChoiceCardProps extends ChoiceProps {
  label: string;
  desc?: string;
}

const RadioCard = ({ active, onClick, label, desc }: ChoiceCardProps) => (
  <button
    type="button"
    className={`edash-choice${active ? " edash-choice-active" : ""}`}
    onClick={onClick}
  >
    <span className="edash-choice-dot" />
    <span>
      <strong>{label}</strong>
      {desc && <small>{desc}</small>}
    </span>
  </button>
);

/** Checkbox card — like RadioCard but multi-select. */
const CheckCard = ({ active, onClick, label, desc, icon }: ChoiceCardProps & { icon: string }) => (
  <button
    type="button"
    className={`edash-choice edash-choice-check${active ? " edash-choice-active" : ""}`}
    onClick={onClick}
  >
    <span className="edash-choice-dot">
      <i className={`fa-solid ${active ? "fa-check" : icon}`}></i>
    </span>
    <span>
      <strong>{label}</strong>
      {desc && <small>{desc}</small>}
    </span>
  </button>
);

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}

const TagInput = ({ tags, onAdd, onRemove, placeholder }: TagInputProps) => {
  const { t: tr } = useT();
  const [value, setValue] = useState("");
  const commit = () => {
    const v = value.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setValue("");
  };
  return (
    <div className="edash-tagbox">
      {tags.map((t) => (
        <span className="edash-tag" key={t}>
          {t}
          <button type="button" onClick={() => onRemove(t)} aria-label={tr("Remove {tag}", { tag: t })}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </span>
      ))}
      <input
        className="edash-tag-input"
        value={value}
        placeholder={placeholder || tr("Type and press Enter")}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Wizard — Create AI Project Request                                  */
/* ------------------------------------------------------------------ */

const SECTIONS: readonly RequestFormSection[] = ["data", "annotation", "model", "delivery", "company"];
const isSection = (key: string): key is RequestFormSection => (SECTIONS as readonly string[]).includes(key);

// WHY: The paths are runtime strings, so the form is read and written as a plain record here; the generic
// path types keep every call site checked (set("data.targetSize", value) only takes a string)

/** Read the value at "field" or "section.field" */
const getAt = <P extends RequestFormPath>(form: ProjectRequestForm, path: P): RequestFormValue<P> => {
  const [a, b] = path.split(".");
  const value = b && isSection(a) ? (form[a] as unknown as Record<string, unknown>)[b] : (form as unknown as Record<string, unknown>)[a];
  // The path type ties the path to the value type it holds (RequestFormValue)
  return value as RequestFormValue<P>;
};

/** Copy of the form with the value at "field" or "section.field" replaced */
const setAt = <P extends RequestFormPath>(form: ProjectRequestForm, path: P, value: RequestFormValue<P>): ProjectRequestForm => {
  const [a, b] = path.split(".");
  if (b && isSection(a)) return { ...form, [a]: { ...form[a], [b]: value } };
  return { ...form, [a]: value };
};

const NewProjectWizard = () => {
  const { t, locale } = useT();
  const [form, setForm] = useState<ProjectRequestForm>(emptyForm);
  const [stepKey, setStepKey] = useState("overview");
  const [posted, setPosted] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  const dispatch = useAppDispatch();
  const savedDraft = useAppSelector(selectRequestDraft);
  const storageHydrated = useAppSelector(selectStorageHydrated);

  // The saved draft is restored once, as soon as the store has loaded it from storage.
  // WHY wait for the flag: with React 19 an effect of the first (hydration) render still sees the state from before
  // the store was restored, so checking the draft right away would miss it.
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
      // The list holds RequestFormListItem<P> items: it was read from this path and only gained `value`
      return setAt(f, path, list as RequestFormValue<P>);
    });
  };

  const hasNeed = (...keys: NeedKey[]) => form.needs.some((n) => keys.includes(n.key));
  const needsData = hasNeed("dataset", "annotation", "collection");
  const needsAnnotation = hasNeed("dataset", "annotation");
  const needsModel = form.needs.some((n) => n.key === "ai_model");

  const ALL_STEPS = [
    { key: "overview", label: "Overview" },
    ...(needsData ? [{ key: "data", label: "Data" }] : []),
    ...(needsAnnotation ? [{ key: "annotation", label: "Annotation" }] : []),
    ...(needsModel ? [{ key: "model", label: "Model" }] : []),
    { key: "delivery", label: "Delivery" },
    { key: "review", label: "Review" },
  ];
  const stepIdx = Math.max(
    0,
    ALL_STEPS.findIndex((s) => s.key === stepKey)
  );
  const step = ALL_STEPS[stepIdx];
  const domain = DOMAINS.find((d) => d.key === form.domain);
  const caseOptions = (domain && USE_CASES[domain.key]) || USE_CASES.other;

  const canContinue = () => {
    if (step.key === "overview")
      return Boolean(
        form.name.trim() && form.needs.length && form.description.trim() && form.domain && form.useCase
      );
    if (step.key === "data") return form.data.modalities.length > 0 && form.data.haveData;
    if (step.key === "annotation") return Boolean(form.annotation.type && form.annotation.workforce);
    if (step.key === "model") return Boolean(form.model.devType);
    if (step.key === "delivery")
      return Boolean(form.delivery.completion && form.delivery.budget && form.delivery.items.length);
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
        <main>
          <section className="edash-area pt-40 pb-120">
            <div className="container">
              <div className="edash-card edash-success">
                <span className="edash-success-icon">
                  <i className="fa-solid fa-check"></i>
                </span>
                <h4>{t("Request submitted")}</h4>
                <p>
                  {t("Your AI project request is in the expert queue. Our team will prepare a tailored proposal — you will be able to review scope, pricing and methodology before any payment.")}
                </p>
                <div className="edash-success-meta">
                  <span>{domain ? t(domain.label) : t("Request")}</span>
                  <span>{form.name}</span>
                  <span>{budgetLabel(form.delivery.budget)}</span>
                </div>

                <ul className="edash-pipeline edash-status-pipeline">
                  {POSTED_TASK_STATUS_FLOW.map((s, i) => (
                    <li
                      key={s.key}
                      className={`edash-pipeline-step ${i === 0 ? "edash-pipeline-active" : ""}`}
                    >
                      <span className="edash-pipeline-dot">
                        <i className={s.icon}></i>
                      </span>
                      <div className="edash-pipeline-body">
                        <h5>{t(s.label)}</h5>
                        <p>{t(s.desc)}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="edash-status-exceptions">
                  <span className="edash-status-exceptions-label">
                    <i className="fa-solid fa-triangle-exclamation"></i> {t("Exception states")}
                  </span>
                  {POSTED_TASK_EXCEPTIONS.map((s) => (
                    <span key={s.key} className="edash-status-exception" title={t(s.desc)}>
                      <i className={s.icon}></i> {t(s.label)}
                    </span>
                  ))}
                </div>

                <div className="edash-success-actions">
                  <Link href={`/dashboard/projects?id=${createdId}`} className="edash-btn">
                    <i className="fa-solid fa-folder-open"></i> {t("View Project")}
                  </Link>
                  <Link href="/dashboard" className="edash-btn-ghost">
                    <i className="fa-solid fa-gauge-high"></i> {t("Go to Dashboard")}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main>
        <section className="edash-area pt-40 pb-120">
          <div className="container">
            <div className="edash-head">
              <div>
                <h3 className="edash-title">{t("Create AI Project Request")}</h3>
                <p className="edash-sub">
                  {t("Tell us what you want to build. Our team will review your requirements and prepare a tailored proposal.")}
                </p>
              </div>
              <div className="edash-head-actions">
                {draftSaved && (
                  <span className="edash-saved-note">
                    <i className="fa-solid fa-circle-check"></i> {t("Draft saved")}
                  </span>
                )}
              </div>
            </div>

            <div className="edash-steps">
              {ALL_STEPS.map((s, i) => (
                <div
                  key={s.key}
                  className={`edash-step${i === stepIdx ? " edash-step-active" : ""}${
                    i < stepIdx ? " edash-step-done" : ""
                  }`}
                >
                  <span className="edash-step-dot">
                    {i < stepIdx ? <i className="fa-solid fa-check"></i> : i + 1}
                  </span>
                  <span className="edash-step-label d-none d-md-inline">{t(s.label)}</span>
                </div>
              ))}
            </div>

            <div className="edash-card">
              {/* ---------------- 1. PROJECT OVERVIEW ---------------- */}
              {step.key === "overview" && (
                <>
                  <div className="edash-field">
                    <label>{t("Project Name *")}</label>
                    <input
                      className="edash-input"
                      placeholder={t("e.g. Indonesian Road Damage Detection")}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div className="edash-field">
                    <label>{t("What do you need? *")}</label>
                    <div className="edash-choices">
                      {NEEDS.map((n) => (
                        <CheckCard
                          key={n.key}
                          active={form.needs.some((x) => x.key === n.key)}
                          icon={n.icon}
                          label={t(n.label)}
                          desc={t(n.desc)}
                          onClick={() => toggleIn("needs", n)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Project Description *")}</label>
                    <textarea
                      className="edash-input"
                      placeholder={t("What should the system do? What problem are you solving?")}
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("AI Domain *")}</label>
                      <select
                        className="edash-input"
                        value={form.domain}
                        onChange={(e) => {
                          set("domain", e.target.value);
                          set("useCase", "");
                        }}
                      >
                        <option value="">{t("Select domain…")}</option>
                        {DOMAINS.map((d) => (
                          <option key={d.key} value={d.key}>
                            {t(d.label)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="edash-field">
                      <label>{t("Use Case *")}</label>
                      <select
                        className="edash-input"
                        value={form.useCase}
                        onChange={(e) => set("useCase", e.target.value)}
                        disabled={!form.domain}
                      >
                        <option value="">{t("Select use case…")}</option>
                        {caseOptions.map((u) => (
                          <option key={u} value={u}>
                            {t(u)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Industry")}</label>
                    <select
                      className="edash-input"
                      value={form.industry}
                      onChange={(e) => set("industry", e.target.value)}
                    >
                      <option value="">{t("Select industry…")}</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>{t(i)}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* ---------------- 2. DATA REQUIREMENTS ---------------- */}
              {step.key === "data" && (
                <>
                  <div className="edash-field">
                    <label>{t("Data Modality *")}</label>
                    <div className="edash-pills">
                      {MODALITIES.map((m) => (
                        <CheckPill
                          key={m}
                          active={form.data.modalities.includes(m)}
                          onClick={() => toggleIn("data.modalities", m)}
                        >
                          {t(m)}
                        </CheckPill>
                      ))}
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Do you already have data? *")}</label>
                    <div className="edash-choices">
                      {HAVE_DATA.map((h) => (
                        <RadioCard
                          key={h.key}
                          active={form.data.haveData === h.key}
                          label={t(h.label)}
                          onClick={() => set("data.haveData", h.key)}
                        />
                      ))}
                    </div>
                  </div>
                  {form.data.haveData && form.data.haveData !== "no" && (
                    <>
                      <div className="edash-field-row">
                        <div className="edash-field">
                          <label>{t("Dataset / Storage URL")}</label>
                          <input
                            className="edash-input"
                            placeholder="https://…"
                            value={form.data.sampleUrl}
                            onChange={(e) => set("data.sampleUrl", e.target.value)}
                          />
                        </div>
                        <div className="edash-field">
                          <label>{t("Upload sample data")}</label>
                          <label className="edash-upload edash-upload-compact">
                            <input type="file" hidden onChange={() => {}} />
                            <i className="fa-solid fa-paperclip"></i>
                            <strong>{t("Attach sample")}</strong>
                          </label>
                        </div>
                      </div>
                      <div className="edash-field-row">
                        <div className="edash-field">
                          <label>{t("Current Dataset Size")}</label>
                          <div className="edash-metric">
                            <input
                              className="edash-input"
                              type="number"
                              min="0"
                              placeholder="12000"
                              value={form.data.currentSize}
                              onChange={(e) => set("data.currentSize", e.target.value)}
                            />
                            <select
                              className="edash-input"
                              value={form.data.currentUnit}
                              onChange={(e) => set("data.currentUnit", e.target.value)}
                            >
                              {SIZE_UNITS.map((u) => (
                                <option key={u} value={u}>{t(u)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="edash-field">
                          <label>{t("Target Dataset Size")}</label>
                          <div className="edash-metric">
                            <input
                              className="edash-input"
                              type="number"
                              min="0"
                              placeholder="50000"
                              value={form.data.targetSize}
                              onChange={(e) => set("data.targetSize", e.target.value)}
                            />
                            <select
                              className="edash-input"
                              value={form.data.targetUnit}
                              onChange={(e) => set("data.targetUnit", e.target.value)}
                            >
                              {SIZE_UNITS.map((u) => (
                                <option key={u} value={u}>{t(u)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="edash-field">
                    <label>{t("Data Specification")}</label>
                    <div className="edash-field-row">
                      <div className="edash-field" style={{ marginBottom: 0 }}>
                        <label>{t("Geographic Coverage")}</label>
                        <input
                          className="edash-input"
                          placeholder="Indonesia"
                          value={form.data.coverage}
                          onChange={(e) => set("data.coverage", e.target.value)}
                        />
                      </div>
                      <div className="edash-field" style={{ marginBottom: 0 }}>
                        <label>{t("Language")}</label>
                        <select
                          className="edash-input"
                          value={form.data.language}
                          onChange={(e) => set("data.language", e.target.value)}
                        >
                          {["Indonesian", "English", "Indonesian + English", "Regional languages", "Other"].map((l) => (
                            <option key={l} value={l}>{t(l)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Data Source Preference")}</label>
                    <div className="edash-pills">
                      {DATA_SOURCES.map((s) => (
                        <CheckPill
                          key={s}
                          active={form.data.sources.includes(s)}
                          onClick={() => toggleIn("data.sources", s)}
                        >
                          {t(s)}
                        </CheckPill>
                      ))}
                    </div>
                    <p className="edash-field-hint">
                      <i className="fa-solid fa-circle-info"></i>{" "}
                      {t("Internet/public sources are subject to license & privacy review — our team determines which sources are legal and usable.")}
                    </p>
                  </div>
                  <div className="edash-field">
                    <label>{t("Data Diversity")}</label>
                    <div className="edash-pills">
                      {DIVERSITY_PRESETS.map((p) => (
                        <CheckPill
                          key={p}
                          active={form.data.diversity.includes(p)}
                          onClick={() => toggleIn("data.diversity", p)}
                        >
                          {t(p)}
                        </CheckPill>
                      ))}
                    </div>
                    <TagInput
                      tags={form.data.diversity.filter((d) => !DIVERSITY_PRESETS.includes(d))}
                      onAdd={(v) => toggleIn("data.diversity", v)}
                      onRemove={(v) => toggleIn("data.diversity", v)}
                      placeholder={t("Add custom condition…")}
                    />
                  </div>
                  <div className="edash-field">
                    <label>{t("Additional Requirements")}</label>
                    <textarea
                      className="edash-input"
                      placeholder={t("e.g. images should represent Indonesian road conditions, different weather, camera angles, etc.")}
                      value={form.data.notes}
                      onChange={(e) => set("data.notes", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* ---------------- 3. ANNOTATION & QUALITY ---------------- */}
              {step.key === "annotation" && (
                <>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Annotation Type *")}</label>
                      <select
                        className="edash-input"
                        value={form.annotation.type}
                        onChange={(e) => set("annotation.type", e.target.value)}
                      >
                        <option value="">{t("Select type…")}</option>
                        {ANNOTATION_TYPES.map((at) => (
                          <option key={at} value={at}>{t(at)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edash-field">
                      <label>{t("Annotation Method")}</label>
                      <div className="edash-pills">
                        {ANNOTATION_METHODS.map((m) => (
                          <CheckPill
                            key={m}
                            active={form.annotation.methods.includes(m)}
                            onClick={() => toggleIn("annotation.methods", m)}
                          >
                            {t(m)}
                          </CheckPill>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Classes / Labels")}</label>
                    <TagInput
                      tags={form.annotation.classes}
                      onAdd={(v) => toggleIn("annotation.classes", v)}
                      onRemove={(v) => toggleIn("annotation.classes", v)}
                      placeholder={t("e.g. Pothole — press Enter to add")}
                    />
                  </div>
                  <div className="edash-field">
                    <label>{t("Who should annotate?")}</label>
                    <div className="edash-choices">
                      {WORKFORCES.map((w) => (
                        <RadioCard
                          key={w.key}
                          active={form.annotation.workforce === w.key}
                          label={t(w.label)}
                          desc={t(w.desc)}
                          onClick={() => set("annotation.workforce", w.key)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Quality Target")}</label>
                    <div className="edash-field-row">
                      <div className="edash-field" style={{ marginBottom: 0 }}>
                        <label>{t("Target Quality")}</label>
                        <select
                          className="edash-input"
                          value={form.annotation.quality}
                          onChange={(e) => set("annotation.quality", e.target.value)}
                        >
                          {QUALITY_TARGETS.map((q) => (
                            <option key={q} value={q}>{t(q)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="edash-field" style={{ marginBottom: 0 }}>
                        <label>{t("Review Level")}</label>
                        <select
                          className="edash-input"
                          value={form.annotation.reviewLevel}
                          onChange={(e) => set("annotation.reviewLevel", e.target.value)}
                        >
                          {REVIEW_LEVELS.map((r) => (
                            <option key={r} value={r}>{t(r)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="edash-field" style={{ marginBottom: 0 }}>
                        <label>{t("Consensus")}</label>
                        <select
                          className="edash-input"
                          value={form.annotation.consensus}
                          onChange={(e) => set("annotation.consensus", e.target.value)}
                        >
                          {CONSENSUS.map((c) => (
                            <option key={c} value={c}>{t(c)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="edash-pills" style={{ marginTop: 12 }}>
                      {["Gold-standard samples", "Automated validation", "Manual quality control", "Duplicate detection"].map((o) => (
                        <CheckPill
                          key={o}
                          active={form.annotation.options.includes(o)}
                          onClick={() => toggleIn("annotation.options", o)}
                        >
                          {t(o)}
                        </CheckPill>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ---------------- 4. MODEL REQUIREMENTS ---------------- */}
              {step.key === "model" && (
                <>
                  <div className="edash-field">
                    <label>{t("Development Type *")}</label>
                    <div className="edash-choices">
                      {DEV_TYPES.map((d) => (
                        <RadioCard
                          key={d.key}
                          active={form.model.devType === d.key}
                          label={t(d.label)}
                          onClick={() => set("model.devType", d.key)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Task")}</label>
                      <select
                        className="edash-input"
                        value={form.model.task}
                        onChange={(e) => set("model.task", e.target.value)}
                      >
                        <option value="">{t("Select task…")}</option>
                        {caseOptions.map((u) => (
                          <option key={u} value={u}>{t(u)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edash-field">
                      <label>{t("Preferred Model (optional)")}</label>
                      <select
                        className="edash-input"
                        value={form.model.preferred}
                        onChange={(e) => set("model.preferred", e.target.value)}
                      >
                        <option value="">{t("No preference — let Zenvinus recommend")}</option>
                        {["YOLO", "RT-DETR", "ViT", "LLaMA / Qwen", "XGBoost", "Whisper", "Custom architecture"].map((m) => (
                          <option key={m} value={m}>{t(m)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Existing Model (URL / repository)")}</label>
                    <input
                      className="edash-input"
                      placeholder={t("https://github.com/… or model URL")}
                      value={form.model.existing}
                      onChange={(e) => set("model.existing", e.target.value)}
                    />
                  </div>
                  <div className="edash-field">
                    <label>{t("Target Platform")}</label>
                    <div className="edash-pills">
                      {PLATFORMS.map((p) => (
                        <CheckPill
                          key={p}
                          active={form.model.platforms.includes(p)}
                          onClick={() => toggleIn("model.platforms", p)}
                        >
                          {t(p)}
                        </CheckPill>
                      ))}
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Primary Objective")}</label>
                      <select
                        className="edash-input"
                        value={form.model.objective}
                        onChange={(e) => set("model.objective", e.target.value)}
                      >
                        {OBJECTIVES.map((o) => (
                          <option key={o} value={o}>{t(o)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edash-field">
                      <label>{t("Hardware / Environment")}</label>
                      <select
                        className="edash-input"
                        value={form.model.hardware}
                        onChange={(e) => set("model.hardware", e.target.value)}
                      >
                        <option value="">{t("No preference")}</option>
                        {["NVIDIA GPU / Cloud", "CPU only", "Jetson / Edge", "Mobile NPU", "TPU"].map((h) => (
                          <option key={h} value={h}>{t(h)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Target Metrics (optional)")}</label>
                    <div className="edash-metrics">
                      {(
                        [
                          ["map", "mAP50", "≥ 0.90"],
                          ["precision", "Precision", "≥ 0.90"],
                          ["recall", "Recall", "≥ 0.90"],
                        ] as const
                      ).map(([key, label, ph]) => (
                        <div className="edash-metric-row" key={key}>
                          <span>{t(label)}</span>
                          <input
                            className="edash-input"
                            placeholder={ph}
                            value={form.model[key]}
                            onChange={(e) => set(`model.${key}`, e.target.value)}
                          />
                        </div>
                      ))}
                      <div className="edash-metric-row">
                        <span>{t("Max inference latency")}</span>
                        <div className="edash-metric">
                          <input
                            className="edash-input"
                            type="number"
                            placeholder="100"
                            value={form.model.latency}
                            onChange={(e) => set("model.latency", e.target.value)}
                          />
                          <span className="edash-metric-unit">ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ---------------- 5. DELIVERY, TIMELINE & BUDGET ---------------- */}
              {step.key === "delivery" && (
                <>
                  <div className="edash-field">
                    <label>{t("What should we deliver?")}</label>
                    <div className="edash-pills">
                      {DELIVERABLES.map((d) => (
                        <CheckPill
                          key={d}
                          active={form.delivery.items.includes(d)}
                          onClick={() => toggleIn("delivery.items", d)}
                        >
                          {t(d)}
                        </CheckPill>
                      ))}
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Dataset Format")}</label>
                      <select
                        className="edash-input"
                        value={form.delivery.datasetFormat}
                        onChange={(e) => set("delivery.datasetFormat", e.target.value)}
                      >
                        {DATASET_FORMATS.map((f) => (
                          <option key={f} value={f}>{t(f)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="edash-field">
                      <label>{t("Model Format")}</label>
                      <select
                        className="edash-input"
                        value={form.delivery.modelFormat}
                        onChange={(e) => set("delivery.modelFormat", e.target.value)}
                      >
                        {MODEL_FORMATS.map((f) => (
                          <option key={f} value={f}>{t(f)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Desired Completion *")}</label>
                      <input
                        className="edash-input"
                        type="date"
                        value={form.delivery.completion}
                        onChange={(e) => set("delivery.completion", e.target.value)}
                      />
                    </div>
                    <div className="edash-field">
                      <label>{t("Urgency")}</label>
                      <div className="edash-pills">
                        {URGENCY.map((u) => (
                          <CheckPill
                            key={u}
                            active={form.delivery.urgency === u}
                            onClick={() => set("delivery.urgency", u)}
                          >
                            {t(u)}
                          </CheckPill>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="edash-field">
                    <label>{t("Estimated Budget *")}</label>
                    <div className="edash-choices edash-choices-wide">
                      {BUDGETS.map((b) => (
                        <RadioCard
                          key={b}
                          active={form.delivery.budget === b}
                          label={budgetLabel(b) || b}
                          onClick={() => set("delivery.budget", b)}
                        />
                      ))}
                    </div>
                    <p className="edash-field-hint">
                      <i className="fa-solid fa-circle-info"></i>{" "}
                      {t("A range is enough — the final quote is in the proposal prepared by our team.")}
                    </p>
                  </div>
                </>
              )}

              {/* ---------------- 6. COMPANY & REVIEW ---------------- */}
              {step.key === "review" && (
                <>
                  <div className="edash-summary">
                    <h4 className="edash-summary-title">{form.name || t("Untitled request")}</h4>
                    <div className="edash-summary-grid">
                      <div>
                        <span>{t("Request")}</span>
                        <strong>{form.needs.map((n) => t(n.label)).join(" + ") || "—"}</strong>
                      </div>
                      <div>
                        <span>{t("Domain")}</span>
                        <strong>
                          {domain ? t(domain.label) : "—"}
                          {form.useCase ? ` · ${t(form.useCase)}` : ""}
                        </strong>
                      </div>
                      {needsData && (
                        <div>
                          <span>{t("Data")}</span>
                          <strong>
                            {form.data.targetSize
                              ? `${Number(form.data.targetSize).toLocaleString(locale)} ${t(form.data.targetUnit)}`
                              : t("To be scoped")}
                            {form.data.coverage ? ` · ${form.data.coverage}` : ""}
                          </strong>
                        </div>
                      )}
                      {needsAnnotation && (
                        <div>
                          <span>{t("Annotation")}</span>
                          <strong>
                            {form.annotation.type ? t(form.annotation.type) : "—"}
                            {form.annotation.classes.length
                              ? ` · ${t("{count} classes", { count: form.annotation.classes.length })}`
                              : ""}
                            {` · ${form.annotation.quality}`}
                          </strong>
                        </div>
                      )}
                      {needsModel && (
                        <div>
                          <span>{t("Model")}</span>
                          <strong>
                            {t(DEV_TYPES.find((d) => d.key === form.model.devType)?.label ?? "") || "—"}
                            {form.model.map ? ` · mAP50 ${form.model.map}` : ""}
                          </strong>
                        </div>
                      )}
                      <div>
                        <span>{t("Deliverables")}</span>
                        <strong>{form.delivery.items.map((d) => t(d)).join(" · ") || "—"}</strong>
                      </div>
                      <div>
                        <span>{t("Timeline")}</span>
                        <strong>
                          {formatDate(form.delivery.completion) || "—"} · {t(form.delivery.urgency)}
                        </strong>
                      </div>
                      <div>
                        <span>{t("Budget")}</span>
                        <strong>{budgetLabel(form.delivery.budget) || "—"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Company Name *")}</label>
                      <input
                        className="edash-input"
                        value={form.company.name}
                        onChange={(e) => set("company.name", e.target.value)}
                      />
                    </div>
                    <div className="edash-field">
                      <label>{t("Company Size")}</label>
                      <select
                        className="edash-input"
                        value={form.company.size}
                        onChange={(e) => set("company.size", e.target.value)}
                      >
                        {COMPANY_SIZES.map((s) => (
                          <option key={s} value={s}>{t(s)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Contact Person *")}</label>
                      <input
                        className="edash-input"
                        value={form.company.contact}
                        onChange={(e) => set("company.contact", e.target.value)}
                      />
                    </div>
                    <div className="edash-field">
                      <label>{t("Work Email *")}</label>
                      <input
                        className="edash-input"
                        type="email"
                        placeholder="name@company.com"
                        value={form.company.email}
                        onChange={(e) => set("company.email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="edash-field-row">
                    <div className="edash-field">
                      <label>{t("Job title")}</label>
                      <input
                        className="edash-input"
                        value={form.company.role}
                        onChange={(e) => set("company.role", e.target.value)}
                      />
                    </div>
                    <div className="edash-field">
                      <label>{t("Phone / WhatsApp")}</label>
                      <input
                        className="edash-input"
                        placeholder="+62 …"
                        value={form.company.phone}
                        onChange={(e) => set("company.phone", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="edash-wizard-actions">
                <button type="button" className="edash-btn-ghost" onClick={saveDraft}>
                  <i className="fa-regular fa-floppy-disk"></i> {t("Save Draft")}
                </button>
                {stepIdx > 0 && (
                  <button
                    type="button"
                    className="edash-btn-ghost"
                    onClick={() => setStepKey(ALL_STEPS[stepIdx - 1].key)}
                  >
                    <i className="fa-solid fa-arrow-left"></i> {t("Back")}
                  </button>
                )}
                {step.key === "review" ? (
                  <button
                    type="button"
                    className="edash-btn"
                    disabled={
                      !form.company.name.trim() ||
                      !form.company.contact.trim() ||
                      !form.company.email.trim()
                    }
                    onClick={submit}
                  >
                    <i className="fa-solid fa-paper-plane"></i> {t("Submit Request")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="edash-btn"
                    disabled={!canContinue()}
                    onClick={() => setStepKey(ALL_STEPS[stepIdx + 1].key)}
                  >
                    {t("Continue")} <i className="fa-solid fa-arrow-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <DashboardFooter />
    </>
  );
};

export default NewProjectWizard;
