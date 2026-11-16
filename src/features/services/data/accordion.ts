export interface ServiceFaqItem {
  id: number;
  question: string;
  answer: string;
}

const SERVICE_FAQ: ReadonlyArray<ServiceFaqItem> = [
  {
    id: 1,
    question: 'How quickly does a custom data or annotation project start?',
    answer:
      'Our team reviews project briefs within 1–2 business days and issues a scoped proposal with sample rubrics, throughput estimates, and milestone pricing before any escrow payment begins.',
  },
  {
    id: 2,
    question: 'How does Zenvinus verify label quality across large batches?',
    answer:
      'Every batch passes a two-tier workflow: qualified community or specialist contributors label items against written edge-case guidelines, and independent domain experts audit sampled outputs against gold-standard sets.',
  },
  {
    id: 3,
    question: 'Can you cover Indonesian regional accents and mixed-language text?',
    answer:
      'Yes. Our distributed contributor network across Indonesia covers formal Bahasa Indonesia, colloquial social text, code-switching, and regional accents across Java, Sumatra, Kalimantan, and eastern Indonesia.',
  },
  {
    id: 4,
    question: 'How are deliverables formatted and licensed?',
    answer:
      'Completed datasets are delivered as versioned splits (JSONL, Parquet, COCO, or WAV/transcripts) with schema documentation, QA reports, and clear commercial ownership or catalog licensing.',
  },
];

export default SERVICE_FAQ;
