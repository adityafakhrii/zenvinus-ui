import type { PostDetailDto, PostKind, SidebarDto } from '../types/post';

const BLOG_POSTS: readonly PostDetailDto[] = [
  {
    id: 101,
    slug: 'building-indonesian-multimodal-datasets',
    title: 'Building High-Quality Indonesian Multimodal Datasets at Scale',
    excerpt:
      'How community contributors and domain experts collaborate to curate clean Indonesian text, audio, and vision datasets for foundation models.',
    coverImageUrl: '/assets/img/blog/blog-img-1.jpg',
    category: { slug: 'data-engineering', name: 'Data Engineering' },
    publishedAt: '2026-10-12T09:00:00Z',
    readTimeMinutes: 6,
    author: {
      name: 'Raka Pratama',
      headline: 'Lead Data Architect, Zenvinus',
      bio: 'Designs multimodal curation pipelines and quality gates across Indonesian regional languages.',
      image: '/assets/img/blog/user.png',
      socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    },
    tags: [{ name: 'Multimodal' }, { name: 'Indonesia AI' }, { name: 'Curation' }],
    content: `## Why local multimodal data matters\n\nGlobal open datasets rarely capture Indonesian street signage, regional dialects, or local retail receipts accurately.\n\n### Three-stage verification\n\n- Automated deduplication and license screening at ingestion\n- Community annotation in task-specific workspaces\n- Expert adjudication for edge cases and rubric compliance\n\nWith strict provenance tracking, every dataset version remains auditable from raw source to production model.`,
  },
  {
    id: 102,
    slug: 'human-in-the-loop-llm-evaluation',
    title: 'Designing Reliable Human-in-the-Loop Evaluation for Bahasa LLM',
    excerpt:
      'Practical rubrics for measuring factuality, cultural nuance, and safety when benchmarking Indonesian language models.',
    coverImageUrl: '/assets/img/blog/blog-img-2.jpg',
    category: { slug: 'llm-eval', name: 'LLM Evaluation' },
    publishedAt: '2026-10-05T08:30:00Z',
    readTimeMinutes: 5,
    author: {
      name: 'Nadia Kusuma',
      headline: 'Head of AI Quality',
      bio: 'Focuses on RLHF, preference datasets, and inter-annotator agreement metrics.',
      image: '/assets/img/blog/user-2.jpg',
      socialLinks: { linkedin: 'https://linkedin.com' },
    },
    tags: [{ name: 'LLM' }, { name: 'RLHF' }, { name: 'Benchmark' }],
    content: `## Beyond automated perplexity\n\nAutomated metrics miss subtle register shifts between formal Indonesian and everyday conversational phrasing.\n\n- Pairwise preference ranking with explicit tie-break criteria\n- Hallucination tagging against grounded reference passages\n- Continuous calibration checks across reviewer cohorts`,
  },
  {
    id: 103,
    slug: 'road-damage-computer-vision-pipeline',
    title: 'From Dashcam Frames to Road Damage Segmentation Models',
    excerpt:
      'Lessons from labeling 45,000 urban road images across Java and Sumatra with bounding boxes and polygon masks.',
    coverImageUrl: '/assets/img/blog/blog-img-3.jpg',
    category: { slug: 'computer-vision', name: 'Computer Vision' },
    publishedAt: '2026-09-24T10:15:00Z',
    readTimeMinutes: 7,
    author: {
      name: 'Bima Wijaya',
      headline: 'Computer Vision Engineer',
      bio: 'Builds annotation tooling and active learning loops for infrastructure inspection.',
      image: '/assets/img/blog/user.png',
    },
    tags: [{ name: 'Computer Vision' }, { name: 'Segmentation' }],
    content: `## Consistent class definitions\n\nDistinguishing hairline cracks from alligator cracking and potholes requires clear visual exemplars inside the studio canvas.\n\n- Standardized camera angle and lighting tags\n- Two-pass QA review before dataset versioning\n- Zero train/validation leakage across road segments`,
  },
  {
    id: 104,
    slug: 'regional-speech-asr-corpus',
    title: 'Capturing Regional Accents for Indonesian Speech Recognition',
    excerpt:
      'How distributed voice collection and phonetic transcription improve ASR accuracy outside major metropolitan areas.',
    coverImageUrl: '/assets/img/blog/img-1.jpg',
    category: { slug: 'speech-audio', name: 'Speech & Audio' },
    publishedAt: '2026-09-14T11:00:00Z',
    readTimeMinutes: 4,
    author: {
      name: 'Sari Dewi',
      headline: 'Computational Linguist',
      bio: 'Leads speech corpus guidelines for Javanese, Sundanese, and Minang.',
      image: '/assets/img/blog/user-2.jpg',
    },
    tags: [{ name: 'ASR' }, { name: 'Audio' }, { name: 'Indonesia AI' }],
    content: `## Acoustic diversity in the wild\n\nStudio-clean recordings fail in real call centers and roadside environments. Collecting natural acoustic conditions alongside verbatim timestamps dramatically lowers word error rate.`,
  },
  {
    id: 105,
    slug: 'enterprise-data-governance-checklist',
    title: 'Enterprise Data Governance & Privacy Checklist for Custom AI',
    excerpt:
      'Key safeguards for PII redaction, NDA-scoped contributor access, and reproducible model evaluation.',
    coverImageUrl: '/assets/img/blog/img-2.jpg',
    category: { slug: 'governance', name: 'Governance' },
    publishedAt: '2026-09-02T07:45:00Z',
    readTimeMinutes: 5,
    author: {
      name: 'Raka Pratama',
      headline: 'Lead Data Architect, Zenvinus',
      image: '/assets/img/blog/user.png',
    },
    tags: [{ name: 'Enterprise' }, { name: 'Privacy' }],
    content: `## Private by default\n\nEnterprise assets never enter public catalogs. Scoped task batches ensure only vetted contributors and experts view assigned slices under strict audit logging.`,
  },
  {
    id: 106,
    slug: 'tabular-validation-financial-docs',
    title: 'Validating Structured Financial Records with Domain Experts',
    excerpt:
      'Combining schema rules with human verification to eliminate OCR drift in Indonesian tax and invoice documents.',
    coverImageUrl: '/assets/img/blog/img-3.jpg',
    category: { slug: 'data-engineering', name: 'Data Engineering' },
    publishedAt: '2026-08-21T09:00:00Z',
    readTimeMinutes: 4,
    author: {
      name: 'Nadia Kusuma',
      headline: 'Head of AI Quality',
      image: '/assets/img/blog/user-2.jpg',
    },
    tags: [{ name: 'Tabular' }, { name: 'OCR' }],
    content: `## Precision at field level\n\nWhen extracting line items from scanned invoices, even a 1% digit error breaks downstream accounting reconciliation. Field-level validation flags anomalies before export.`,
  },
  {
    id: 107,
    slug: 'active-learning-dataset-studio',
    title: 'Exploring Dataset Splits Faster with Dataset Studio',
    excerpt:
      'Inspect distributions, filter edge-case rows, and publish versioned splits directly from the browser.',
    coverImageUrl: '/assets/img/blog/img-7.jpg',
    category: { slug: 'product', name: 'Product' },
    publishedAt: '2026-08-10T10:00:00Z',
    readTimeMinutes: 3,
    author: {
      name: 'Bima Wijaya',
      headline: 'Computer Vision Engineer',
      image: '/assets/img/blog/user.png',
    },
    tags: [{ name: 'Dataset Studio' }, { name: 'Curation' }],
    content: `## Tight feedback loops\n\nDataset Studio lets engineers inspect column statistics, sample thumbnails, and CSV imports side by side before triggering a training run.`,
  },
];

const NEWS_POSTS: readonly PostDetailDto[] = [
  {
    id: 201,
    slug: 'zenvinus-launches-v3-community-enterprise-workflow',
    title: 'Zenvinus Introduces Unified Community & Enterprise AI Data Pipeline',
    excerpt:
      'New multi-role workspace connects enterprise project scoping, community annotation, and expert quality gates in one platform.',
    coverImageUrl: '/assets/img/blog/img-4.png',
    category: { slug: 'announcement', name: 'Announcement' },
    publishedAt: '2026-10-18T08:00:00Z',
    readTimeMinutes: 4,
    author: {
      name: 'Zenvinus Editorial',
      headline: 'Zenvinus Communications',
      bio: 'Official product and ecosystem updates from the Zenvinus team.',
      image: '/assets/img/blog/user.png',
    },
    tags: [{ name: 'Release' }, { name: 'Platform' }],
    content: `## Built for Indonesian AI teams\n\nThe v3 release unifies four dedicated workspaces — Enterprise, Community, Expert, and Internal Operations — under a single RBAC account.`,
  },
  {
    id: 202,
    slug: 'nusantara-open-benchmark-initiative',
    title: 'Open Call: Nusantara Public-Interest Benchmark Initiative 2026',
    excerpt:
      'Inviting researchers, universities, and contributors to co-create open evaluation sets for healthcare, agriculture, and public services.',
    coverImageUrl: '/assets/img/blog/img-5.png',
    category: { slug: 'community', name: 'Community' },
    publishedAt: '2026-10-01T09:30:00Z',
    readTimeMinutes: 3,
    author: {
      name: 'Sari Dewi',
      headline: 'Computational Linguist',
      image: '/assets/img/blog/user-2.jpg',
    },
    tags: [{ name: 'Community' }, { name: 'Open Data' }],
    content: `## Collaborative public benchmarks\n\nQualified contributors and domain experts can now join public-interest collection tasks directly from the task marketplace.`,
  },
  {
    id: 203,
    slug: 'jakarta-ai-summit-showcase',
    title: 'Zenvinus Showcases Local Vision & Speech Datasets at Jakarta AI Summit',
    excerpt:
      'Highlights from our live demo of Dataset Studio, automated quality checks, and regional speech transcription benchmarks.',
    coverImageUrl: '/assets/img/blog/img-6.png',
    category: { slug: 'events', name: 'Events' },
    publishedAt: '2026-09-19T12:00:00Z',
    readTimeMinutes: 3,
    author: {
      name: 'Zenvinus Editorial',
      headline: 'Zenvinus Communications',
      image: '/assets/img/blog/user.png',
    },
    tags: [{ name: 'Events' }, { name: 'Indonesia AI' }],
    content: `## Meeting builders across Indonesia\n\nOver 400 engineers and product leads tested our annotation studio and enterprise project request flow during the two-day summit.`,
  },
  {
    id: 204,
    slug: 'expert-reviewer-cohort-expansion',
    title: 'Expanding Our Verified Expert Reviewer Network Across 12 Domains',
    excerpt:
      'Adding medical, legal, geospatial, and regional language specialists to strengthen dataset quality assurance.',
    coverImageUrl: '/assets/img/blog/img-8.jpg',
    category: { slug: 'ecosystem', name: 'Ecosystem' },
    publishedAt: '2026-09-05T10:00:00Z',
    readTimeMinutes: 4,
    author: {
      name: 'Nadia Kusuma',
      headline: 'Head of AI Quality',
      image: '/assets/img/blog/user-2.jpg',
    },
    tags: [{ name: 'Experts' }, { name: 'Quality' }],
    content: `## Domain precision matters\n\nSpecialized datasets require domain-trained reviewers to resolve edge cases and maintain inter-annotator agreement above 95%.`,
  },
];

export function getDummyPosts(kind: PostKind): readonly PostDetailDto[] {
  return kind === 'news' ? NEWS_POSTS : BLOG_POSTS;
}

export function buildDummySidebar(kind: PostKind): SidebarDto {
  const posts = getDummyPosts(kind);
  const categoryMap = new Map<string, { slug: string; name: string; articleCount: number }>();
  const tagMap = new Map<string, { name: string }>();

  for (const post of posts) {
    if (post.category) {
      const existing = categoryMap.get(post.category.slug);
      if (existing) {
        existing.articleCount += 1;
      } else {
        categoryMap.set(post.category.slug, {
          slug: post.category.slug,
          name: post.category.name ?? post.category.slug,
          articleCount: 1,
        });
      }
    }
    for (const tag of post.tags) {
      const key = tag.name.toLowerCase();
      if (!tagMap.has(key)) {
        tagMap.set(key, tag);
      }
    }
  }

  return {
    recent: posts.slice(0, 4).map((p) => ({
      slug: p.slug,
      title: p.title,
      coverImageUrl: p.coverImageUrl,
      publishedAt: p.publishedAt,
    })),
    categories: Array.from(categoryMap.values()),
    tags: Array.from(tagMap.values()),
  };
}
