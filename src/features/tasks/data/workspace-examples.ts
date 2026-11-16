/**
 * Complete per-type example items for the dev-only workspace preview.
 *
 * When the studio's dev switcher selects a type other than the task's real
 * type, the task's items no longer match the editor's expected shape (an
 * audio task has no `labels`, a tabular task has no `regions`, …). These
 * examples give every workspace a fully populated demo — items AND matching
 * guidelines — so the whole editor surface can be reviewed from any task.
 *
 * Item ids are type-prefixed so demo drafts never collide with each other or
 * with the real task's drafts. Dev-only: never read outside development.
 */
import type { TaskTypeId } from './tasks';
import type { WorkspaceContent } from '../types/workspace';

export const WORKSPACE_EXAMPLES: { [K in TaskTypeId]: WorkspaceContent<K> } = {
  image_classification: {
    guidelines: [
      'Classify the main product, ignore backgrounds and props.',
      'If multiple products share the frame equally, pick "Multi-item".',
      'Wrongly photographed labels (mirrored text) still follow the product.',
    ],
    items: [
      {
        id: 'imgc-demo-1',
        image: '/assets/img/blog/img-1.jpg',
        labels: ['Electronics', 'Fashion', 'Food', 'Books', 'Toys', 'Multi-item'],
        gold: 'Electronics',
      },
      {
        id: 'imgc-demo-2',
        image: '/assets/img/blog/img-3.jpg',
        labels: ['Electronics', 'Fashion', 'Food', 'Books', 'Toys', 'Multi-item'],
        gold: 'Food',
      },
    ],
  },

  text_classification: {
    guidelines: [
      'Pick the single dominant topic of the article.',
      'Use "Other" only when no topic fits at all.',
      'Opinion pieces follow the topic they discuss, not "Opinion".',
    ],
    items: [
      {
        id: 'text-demo-1',
        text: 'Pemerintah mengumumkan peta jalan nasional pengembangan kecerdasan buatan untuk lima tahun ke depan. Program ini mencakup pembangunan pusat komputasi awan, pelatihan sepuluh ribu talenta digital, serta insentif pajak bagi perusahaan yang meneliti model bahasa lokal. Sejumlah startup menyambut positif rencana tersebut dan menilai ekosistem data nasional akan makin kompetitif.',
        labels: ['Economy', 'Politics', 'Sports', 'Technology', 'Health', 'Other'],
        gold: 'Technology',
      },
      {
        id: 'text-demo-2',
        text: 'Kementerian Kesehatan mencatat penurunan kasus demam berdarah sebesar 28 persen dibanding tahun lalu berkat gerakan 3M Plus dan perluasan vaksinasi dengue di sembilan provinsi. Puskesmas diminta melanjutkan penyuluhan lingkungan menjelang musim hujan agar angkanya terus menurun.',
        labels: ['Economy', 'Politics', 'Sports', 'Technology', 'Health', 'Other'],
        gold: 'Health',
      },
    ],
  },

  audio_transcription: {
    guidelines: [
      'Verbatim rules: type exactly what is said, including "eh" and "gak".',
      'Mark cross-talk with [overlap], noise with [noise], inaudible with [inaudible].',
      'Speaker turns start with Speaker 1 / Speaker 2.',
      'Numbers are written as spoken (e.g., "dua ribu dua puluh lima").',
    ],
    items: [
      {
        id: 'audio-demo-1',
        duration: '00:12',
        speakers: 2,
        hint: 'Demo — buyer and seller Q&A',
        gold: 'Speaker 1: Permisi, warung ini buka sampai sore?\nSpeaker 2: Iya, sampai enam. [noise] Biasanya ramai menjelang maghrib.',
      },
      {
        id: 'audio-demo-2',
        duration: '00:10',
        speakers: 3,
        hint: 'Demo — three-speaker discussion',
        gold: 'Speaker 1: Agenda rapat besok ada tiga poin.\nSpeaker 2: Poin kedua gak usah, [overlap] sudah selesai kok.\nSpeaker 3: Oke, saya catat dua poin saja.',
      },
    ],
  },

  llm_evaluation: {
    guidelines: [
      'Correctness always outweighs style or length.',
      'Rate each response 1–5 on helpfulness and factual accuracy.',
      'Pick a preference only after rating both responses.',
      'Never reward hallucinated specifics (dates, numbers, citations).',
    ],
    items: [
      {
        id: 'llm-demo-1',
        prompt: 'User: Jelaskan perbedaan kopi robusta dan arabika dalam dua kalimat.',
        responses: [
          {
            label: 'A',
            text: 'Robusta memiliki kafein lebih tinggi dengan rasa pahit dan body tebal, sedangkan arabika lebih asam, aromatik, dan kompleks rasanya.',
          },
          {
            label: 'B',
            text: 'Robusta itu kopi yang pahit dan murah, arabika itu yang enak. Keduanya sama-sama berasal dari biji kopi yang dijual di pasar.',
          },
        ],
        gold: { preference: 'A', helpfulnessA: 5, helpfulnessB: 2, accuracyA: 5, accuracyB: 3 },
      },
      {
        id: 'llm-demo-2',
        prompt: 'User: Why does my sourdough loaf collapse right after scoring?',
        responses: [
          {
            label: 'A',
            text: 'Most likely over-proofing — the gluten can no longer hold the gas, so the loaf deflates when scored. Shorten the final proof and use the poke test to check.',
          },
          {
            label: 'B',
            text: 'Your oven is definitely too hot. Add more yeast next time and the loaf will hold its shape much better.',
          },
        ],
        gold: { preference: 'A', helpfulnessA: 5, helpfulnessB: 1, accuracyA: 5, accuracyB: 1 },
      },
    ],
  },

  tabular_validation: {
    guidelines: [
      'A record is valid only if every required field passes its check.',
      'Phone numbers must be E.164 (+62…); emails must have a valid domain.',
      'Flag impossible dates (future birthdates) and mismatched name formats.',
      'Add a short note for every flagged field.',
    ],
    items: [
      {
        id: 'tab-demo-1',
        fields: [
          { key: 'full_name', label: 'Full Name', value: 'Dewi Lestari', rule: 'Capitalized, no digits' },
          { key: 'email', label: 'Email', value: 'dewi.lestari@mailinator.com', rule: 'Deliverable domain' },
          { key: 'phone', label: 'Phone', value: '+62811-2233-445', rule: 'E.164 format' },
          { key: 'birth_date', label: 'Birth Date', value: '2002-12-30', rule: 'Past date, age ≥ 17' },
        ],
        gold: { full_name: 'valid', email: 'invalid', phone: 'invalid', birth_date: 'valid' },
        goldNote: 'mailinator.com is a disposable domain and the phone is not E.164.',
      },
      {
        id: 'tab-demo-2',
        fields: [
          { key: 'full_name', label: 'Full Name', value: 'agus setiawan99', rule: 'Capitalized, no digits' },
          { key: 'email', label: 'Email', value: 'agus.setiawan@gmail.com', rule: 'Deliverable domain' },
          { key: 'phone', label: 'Phone', value: '+6281234567890', rule: 'E.164 format' },
          { key: 'birth_date', label: 'Birth Date', value: '2035-05-01', rule: 'Past date, age ≥ 17' },
        ],
        gold: { full_name: 'invalid', email: 'valid', phone: 'valid', birth_date: 'invalid' },
        goldNote: 'Digits in the name and a future birthdate.',
      },
    ],
  },

  object_annotation: {
    guidelines: [
      'One box per object instance, classed from the shared palette.',
      'Masks trace object outlines; boxes mark the visible extent.',
      'Occluded parts: complete the plausible silhouette.',
      'Do not annotate objects outside the task scope.',
    ],
    items: [
      {
        id: 'obja-demo-1',
        image: '/assets/img/blog/img-2.jpg',
        classes: ['Car', 'Person', 'Bus', 'Truck'],
        regions: [
          { id: 'r1', x: 10, y: 42, w: 30, h: 34 },
          { id: 'r2', x: 55, y: 28, w: 26, h: 32 },
        ],
        segments: [
          { id: 's1', clip: 'polygon(6% 18%, 46% 8%, 82% 26%, 90% 64%, 62% 90%, 20% 84%, 4% 52%)' },
        ],
        gold: { r1: 'Car', r2: 'Bus', s1: 'Person' },
      },
      {
        id: 'obja-demo-2',
        image: '/assets/img/blog/details/blog-1.jpg',
        classes: ['Cat', 'Dog', 'Bird', 'Other Animal'],
        segments: [
          { id: 's1', clip: 'polygon(6% 18%, 46% 8%, 82% 26%, 90% 64%, 62% 90%, 20% 84%, 4% 52%)' },
          { id: 's2', clip: 'polygon(58% 60%, 88% 46%, 98% 78%, 70% 94%, 50% 82%)' },
        ],
        gold: { s1: 'Cat', s2: 'Dog' },
      },
    ],
  },
};
