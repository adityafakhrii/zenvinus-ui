export interface ZenvinusService {
  id: string;
  slug: string;
  category: string;
  iconKey: 'database' | 'scan' | 'bot' | 'shield' | 'layers' | 'cpu';
  title: string;
  summary: string;
  sla: string;
  deliverables: ReadonlyArray<string>;
}

const SERVICES_CATALOG: ReadonlyArray<ZenvinusService> = [
  {
    id: 'collection',
    slug: 'data-collection',
    category: 'Data Engine',
    iconKey: 'database',
    title: 'Data Collection & Sourcing',
    summary:
      'Capture compliant text, audio, image, and street-level video datasets tailored to Indonesian languages and real environments.',
    sla: '1–2 wks kickoff',
    deliverables: [
      'Regional dialect & accent coverage across Nusantara',
      'Consent-verified audio, visual & document capture',
      'Automated PII scrubbing and source metadata logging',
    ],
  },
  {
    id: 'annotation',
    slug: 'data-annotation',
    category: 'Community',
    iconKey: 'scan',
    title: 'Multi-Modal Data Annotation',
    summary:
      'High-precision bounding boxes, segmentation polygons, OCR field extraction, speech transcripts, and entity tagging at scale.',
    sla: '97.8% avg QA',
    deliverables: [
      '2D/polygon object labels & OCR key-value pairs',
      'Diarized Indonesian speech transcription with timestamps',
      'Written edge-case rubrics maintained per batch',
    ],
  },
  {
    id: 'rlhf',
    slug: 'llm-evaluation',
    category: 'AI Lab',
    iconKey: 'bot',
    title: 'LLM Evaluation & RLHF',
    summary:
      'Pairwise preference ranking, safety red-teaming, hallucination grading, and rubric-driven fine-tuning corpora.',
    sla: 'Dual-blind review',
    deliverables: [
      'SFT prompt-response pairs in Bahasa & local context',
      'Side-by-side preference judgments with written rationale',
      'Safety, cultural sensitivity & policy compliance checks',
    ],
  },
  {
    id: 'qa',
    slug: 'expert-qa',
    category: 'Quality Control',
    iconKey: 'shield',
    title: 'Expert Quality Assurance',
    summary:
      'Independent specialist auditing layered over community annotations with gold-standard calibration and dispute tracking.',
    sla: '6h avg review',
    deliverables: [
      'Inter-annotator agreement calibration benchmarks',
      'Automated revision routing for sub-threshold batches',
      'Sign-off audit report included with every delivery',
    ],
  },
  {
    id: 'curation',
    slug: 'dataset-engineering',
    category: 'Data Engine',
    iconKey: 'layers',
    title: 'Dataset Preparation & Versioning',
    summary:
      'Transform raw files into clean, de-duplicated, leak-free train/validation/test splits packaged with documentation and licensing.',
    sla: 'Parquet / JSONL / COCO',
    deliverables: [
      'Perceptual & hash-based duplicate filtering',
      'Stratified split balancing across rare edge classes',
      'Versioned schema cards & commercial license manifest',
    ],
  },
  {
    id: 'training',
    slug: 'model-training',
    category: 'AI Lab',
    iconKey: 'cpu',
    title: 'Model Training & Hosted Inference',
    summary:
      'Fine-tune vision, speech, and language models with reproducible experiment runs, quantitative benchmarks, and private endpoints.',
    sla: 'Custom SLA',
    deliverables: [
      'Baseline comparison against domain test suites',
      'Quantized edge or private cloud endpoint packaging',
      'Continuous failure-slice monitoring & active learning loop',
    ],
  },
];

export default SERVICES_CATALOG;
