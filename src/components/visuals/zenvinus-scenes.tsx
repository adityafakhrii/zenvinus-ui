import React from 'react';
import {
  CheckCircle2,
  Cpu,
  Database,
  Filter,
  Hand,
  Image as ImageIcon,
  Layers,
  MousePointer,
  Pentagon,
  ShieldCheck,
  Square,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Badge,
  CustomProgressBar,
  CustomSemiCircleGauge,
  SegmentedBreakdownBar,
  cn,
} from '@/components/ui';
import { useT } from '@/i18n';

/**
 * Product-world scene: 4-layer data curation & quality pipeline card replacing generic 3D hologram graphics.
 */
export function PipelineScene() {
  const { t } = useT();

  const stages = [
    {
      Icon: Database,
      label: t('Raw Data'),
      meta: 'Image · Text · Audio',
      progress: 100,
    },
    {
      Icon: Filter,
      label: t('Curation'),
      meta: 'De-duplicated',
      progress: 96,
    },
    {
      Icon: Tag,
      label: t('Annotation'),
      meta: '4,821 ' + t('contributors'),
      progress: 92,
    },
    {
      Icon: ShieldCheck,
      label: t('Quality Control'),
      meta: '94% pass rate',
      progress: 94,
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.10)] bg-surface p-5 shadow-[0_8px_28px_rgba(2,6,38,0.05)]">
      <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-teal">
            <Layers className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <div>
            <span className="block text-xs font-semibold text-ink">{t('Data Engine')}</span>
            <span className="block font-mono text-[11px] text-ink-muted">pipeline-v2.4</span>
          </div>
        </div>
        <Badge tone="mint" dot>
          {t('Approved')}
        </Badge>
      </div>

      <div className="mt-4 space-y-2.5">
        {stages.map(({ Icon, label, meta, progress }, i) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-xl border border-line-subtle bg-canvas px-3.5 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-teal-ink shadow-[0_1px_2px_rgba(2,6,38,0.04)]">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-ink">
                  {String(i + 1).padStart(2, '0')} · {label}
                </span>
                <span className="block truncate text-[11px] text-ink-muted">{meta}</span>
              </div>
            </div>
            <span className="shrink-0 font-mono text-xs font-semibold text-teal-ink tabular-nums">
              {progress}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 text-xs text-ink-secondary">
        <span>train / val / test</span>
        <span className="font-mono font-semibold text-ink tabular-nums">19,432 items</span>
      </div>
    </div>
  );
}

/**
 * Product-world scene: Unified Data Engine + Community + AI Lab workflow bridge.
 */
export function LifecycleHubScene() {
  const { t } = useT();

  const engines = [
    {
      Icon: Database,
      title: t('Data Engine'),
      sub: 'Schema · Versioning',
      tone: 'bg-tint-mint text-teal-ink',
    },
    {
      Icon: Users,
      title: t('Community'),
      sub: '4,821 ' + t('contributors'),
      tone: 'bg-tone-blue-bg text-tone-blue-fg',
    },
    {
      Icon: Cpu,
      title: t('AI Lab'),
      sub: 'Eval · Fine-tuning',
      tone: 'bg-canvas text-navy',
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-[rgba(8,13,53,0.10)] bg-surface p-5 shadow-[0_8px_28px_rgba(2,6,38,0.05)] sm:p-6">
      <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal" />
          <span className="text-xs font-semibold text-ink">Zenvinus AI Lifecycle</span>
        </div>
        <span className="font-mono text-[11px] text-ink-muted">ID / EN</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {engines.map(({ Icon, title, sub, tone }) => (
          <div key={title} className="rounded-xl border border-line-subtle bg-canvas p-3.5">
            <span className={cn('mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg', tone)}>
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <span className="block text-xs font-semibold text-ink">{title}</span>
            <span className="mt-0.5 block text-[11px] text-ink-muted">{sub}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line-subtle bg-canvas p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-ink-secondary">{t('QA Pass Rate')}</span>
          <span className="font-mono font-semibold text-teal-ink tabular-nums">97.8%</span>
        </div>
        <CustomProgressBar value={97.8} tone="teal" height="sm" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['train · 80%', 'validation · 10%', 'test · 10%'].map((split) => (
            <span
              key={split}
              className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-ink-secondary"
            >
              {split}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Product-world scene: Active contributor queue & quality clearance view (supports light & dark Navy sections).
 */
export function WorkforceScene({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { t } = useT();
  const isDark = variant === 'dark';

  const batches = [
    {
      title: t('Street Scene Bounding Boxes'),
      type: t('Object Annotation'),
      rate: 'Rp 1.200 / item',
      progress: 84,
      status: t('In Progress'),
    },
    {
      title: t('Chatbot Response Ranking'),
      type: t('LLM Evaluation'),
      rate: 'Rp 1.500 / pair',
      progress: 100,
      status: t('In Review'),
    },
    {
      title: t('Call Center Speech-to-Text'),
      type: t('Audio Transcription'),
      rate: 'Rp 1.400 / clip',
      progress: 68,
      status: t('In Progress'),
    },
  ] as const;

  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        isDark
          ? 'border-white/12 bg-white/[0.04] text-white'
          : 'border-[rgba(8,13,53,0.10)] bg-surface text-ink shadow-[0_8px_28px_rgba(2,6,38,0.05)]',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b pb-3.5',
          isDark ? 'border-white/10' : 'border-line-subtle',
        )}
      >
        <div className="flex items-center gap-2">
          <Users className={cn('h-4 w-4', isDark ? 'text-teal' : 'text-teal-ink')} strokeWidth={1.6} />
          <span className="text-xs font-semibold">{t('Community')} Queue</span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 font-mono text-[11px] tabular-nums',
            isDark ? 'text-teal' : 'text-teal-ink',
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          94% QC
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {batches.map((b) => (
          <div
            key={b.title}
            className={cn(
              'rounded-xl border p-3',
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-line-subtle bg-canvas',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold">{b.title}</span>
                <span className={cn('mt-0.5 block text-[11px]', isDark ? 'text-white/65' : 'text-ink-muted')}>
                  {b.type} · <span className="font-mono">{b.rate}</span>
                </span>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium',
                  isDark ? 'bg-white/10 text-teal' : 'bg-tint-mint text-teal-ink',
                )}
              >
                {b.status}
              </span>
            </div>
            <div className={cn('mt-2.5 h-1.5 overflow-hidden rounded-full', isDark ? 'bg-white/10' : 'bg-surface-muted')}>
              <div className="h-full rounded-full bg-teal" style={{ width: `${b.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Engine 01 scene: Precision Annotation Studio + Dataset Quality gauge built purely in Zenvinus UI components & SVG.
 */
export function DataEnginePreviewScene() {
  const { t } = useT();

  const metrics = [
    { Icon: ImageIcon, value: '50,000', label: t('Total Items') },
    { Icon: CheckCircle2, value: '48,320', label: t('Annotated') },
    { Icon: ShieldCheck, value: '94.2%', label: t('QA Pass Rate') },
    { Icon: Layers, value: '4', label: t('Classes') },
  ] as const;

  const tools = [
    { Icon: MousePointer, label: 'Select', active: true },
    { Icon: Square, label: 'Bounding Box', active: false },
    { Icon: Pentagon, label: 'Polygon', active: false },
    { Icon: Hand, label: 'Pan', active: false },
  ] as const;

  const scores = [
    { label: 'Relevance', val: 92 },
    { label: 'Label Quality', val: 95 },
    { label: 'Diversity', val: 88 },
  ] as const;

  return (
    <div className="rounded-xl border border-[rgba(8,13,53,0.08)] bg-surface p-4 shadow-[0_6px_22px_rgba(2,6,38,0.04)]">
      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {metrics.map(({ Icon, value, label }) => (
          <div key={label} className="rounded-xl border border-line-subtle bg-canvas px-3 py-2">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Icon className="h-3.5 w-3.5 text-teal-ink" strokeWidth={1.6} />
              <span className="truncate text-[11px]">{label}</span>
            </div>
            <div className="mt-1 font-mono text-sm font-semibold text-ink tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      {/* Main Precision Canvas + Tool Rail */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_144px]">
        <div className="relative overflow-hidden rounded-xl bg-[#0B1220] p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-white/60">
            <span className="font-mono">frame-01842.jpg</span>
            <span className="font-mono text-teal">100%</span>
          </div>

          <svg viewBox="0 0 360 156" className="w-full rounded-lg bg-[#0E1729]" aria-hidden="true">
            {/* Clean perspective grid & street geometry */}
            <path d="M 40 156 L 155 46 L 205 46 L 320 156 Z" fill="#162136" />
            <line x1="180" y1="54" x2="180" y2="152" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" />
            <ellipse cx="132" cy="116" rx="44" ry="15" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <path d="M 218 122 L 266 130 L 294 128" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Pothole Bounding Box (Zenvinus Teal) */}
            <rect
              x="80"
              y="92"
              width="106"
              height="46"
              rx="2"
              fill="rgba(5, 218, 195, 0.14)"
              stroke="#05DAC3"
              strokeWidth="1.75"
            />
            <rect x="80" y="73" width="84" height="18" rx="3" fill="#05DAC3" />
            <text x="86" y="85.5" fill="#020626" fontSize="9.5" fontWeight="600" fontFamily="monospace">
              Pothole 0.96
            </text>
            <rect x="77" y="89" width="6" height="6" fill="#FFFFFF" stroke="#020626" strokeWidth="1" />
            <rect x="183" y="135" width="6" height="6" fill="#FFFFFF" stroke="#020626" strokeWidth="1" />

            {/* Crack Bounding Box (Blue semantic info) */}
            <rect
              x="210"
              y="108"
              width="94"
              height="34"
              rx="2"
              fill="rgba(22, 132, 237, 0.14)"
              stroke="#1684ED"
              strokeWidth="1.75"
            />
            <rect x="210" y="89" width="72" height="18" rx="3" fill="#1684ED" />
            <text x="216" y="101.5" fill="#FFFFFF" fontSize="9.5" fontWeight="600" fontFamily="monospace">
              Crack 0.91
            </text>
          </svg>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-canvas p-2.5">
          <div className="space-y-1">
            {tools.map(({ Icon, label, active }) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium',
                  active ? 'bg-navy text-white' : 'text-ink-secondary',
                )}
              >
                <Icon className={cn('h-3.5 w-3.5 shrink-0', active && 'text-teal')} strokeWidth={1.6} />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 border-t border-line-subtle pt-2 text-[11px] font-mono text-ink-muted">
            2 objects · v2.1
          </div>
        </div>
      </div>

      {/* Bottom Quality Gauge Row */}
      <div className="mt-3 grid grid-cols-1 items-center gap-4 rounded-xl border border-line-subtle bg-canvas p-4 sm:grid-cols-[176px_minmax(0,1fr)]">
        <div className="flex justify-center">
          <CustomSemiCircleGauge value={94} label={t('Quality score')} />
        </div>
        <div className="space-y-2">
          {scores.map((s) => (
            <div key={s.label} className="grid grid-cols-[90px_minmax(0,1fr)_34px] items-center gap-2 text-xs">
              <span className="truncate text-ink-secondary">{s.label}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <span className="block h-full rounded-full bg-teal" style={{ width: `${s.val}%` }} />
              </span>
              <span className="text-right font-mono font-semibold text-ink tabular-nums">{s.val}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Engine 02 scene: Community Workforce Distribution + Live Task Marketplace feed in Zenvinus tokens.
 */
export function CommunityEngineScene() {
  const { t } = useT();

  const stats = [
    { label: t('contributors'), value: '2,483' },
    { label: t('Rating'), value: '4.8' },
    { label: t('QA Pass Rate'), value: '96.2%' },
    { label: t('Done'), value: '12,430' },
  ] as const;

  const tiers = [
    { id: 'beg', label: 'Beginner', percent: 28, color: '#CBD5E1' },
    { id: 'int', label: 'Intermediate', percent: 42, color: '#2DD4BF' },
    { id: 'spc', label: 'Specialist', percent: 20, color: '#0D9488' },
    { id: 'exp', label: 'Expert', percent: 10, color: '#020626' },
  ] as const;

  const avatars = [
    { init: 'AR', cls: 'bg-tint-mint text-teal-ink' },
    { init: 'BW', cls: 'bg-tone-blue-bg text-tone-blue-fg' },
    { init: 'CH', cls: 'bg-surface text-ink border border-line' },
    { init: 'DR', cls: 'bg-surface-muted text-ink-secondary' },
  ] as const;

  const tasks = [
    { title: t('Street Scene Bounding Boxes'), meta: 'Computer Vision · Rp 1.200', badge: t('Open'), tone: 'mint' as const },
    { title: t('Chatbot Response Ranking'), meta: 'LLM Evaluation · Rp 1.500', badge: t('Active'), tone: 'blue' as const },
    { title: t('Call Center Speech-to-Text'), meta: 'Speech · Rp 1.400', badge: t('Open'), tone: 'mint' as const },
  ];

  return (
    <div className="rounded-xl border border-[rgba(8,13,53,0.08)] bg-surface p-4 shadow-[0_6px_22px_rgba(2,6,38,0.04)]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="rounded-xl border border-line-subtle bg-canvas px-3 py-2">
            <div className="truncate text-[11px] text-ink-muted">{st.label}</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-ink tabular-nums">{st.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-line-subtle bg-canvas p-3.5">
        <div className="mb-2.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">{t('Workforce')} Tiers</span>
          <div className="flex items-center -space-x-1.5">
            {avatars.map(({ init, cls }) => (
              <span
                key={init}
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-surface font-mono text-[10px] font-semibold',
                  cls,
                )}
              >
                {init}
              </span>
            ))}
          </div>
        </div>
        <SegmentedBreakdownBar items={tiers} />
      </div>

      <div className="mt-3 space-y-2">
        {tasks.map((tk) => (
          <div
            key={tk.title}
            className="flex items-center justify-between gap-3 rounded-xl border border-line-subtle bg-canvas px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-ink">{tk.title}</div>
              <div className="truncate font-mono text-[11px] text-ink-muted">{tk.meta}</div>
            </div>
            <Badge tone={tk.tone} dot>
              {tk.badge}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Engine 03 scene: AI Lab Experiment Evaluation & Clean Teal/Navy Training SVG Chart.
 */
export function AiLabEngineScene() {
  const { t } = useT();

  const metrics = [
    { label: 'mAP50', value: '0.779', delta: '+2.4%' },
    { label: 'mAP50-95', value: '0.336', delta: '+1.8%' },
    { label: 'Precision', value: '0.810', delta: '+3.1%' },
    { label: 'Recall', value: '0.740', delta: '+2.6%' },
  ] as const;

  return (
    <div className="rounded-xl border border-[rgba(8,13,53,0.08)] bg-surface p-4 shadow-[0_6px_22px_rgba(2,6,38,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-ink">Experiment #1042</span>
          <Badge tone="mint" dot>
            {t('Approved')}
          </Badge>
        </div>
        <span className="font-mono text-[11px] text-ink-muted">YOLO11m · road-damage-v12</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-line-subtle bg-canvas px-3 py-2">
            <div className="text-[11px] text-ink-muted">{m.label}</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-semibold text-ink tabular-nums">{m.value}</span>
              <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold text-tone-mint-fg tabular-nums">
                <TrendingUp className="h-2.5 w-2.5" strokeWidth={2} />
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-line-subtle bg-canvas p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">Training Evaluation Curve</span>
          <div className="flex items-center gap-3 font-mono text-[11px] text-ink-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal" />
              mAP50
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-navy" />
              Precision
            </span>
          </div>
        </div>

        <svg viewBox="0 0 360 118" className="w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="zv-lab-teal-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05DAC3" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#05DAC3" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[20, 50, 80].map((y) => (
            <line key={y} x1="28" y1={y} x2="348" y2={y} stroke="#E6E9EE" strokeWidth="1" />
          ))}

          {/* mAP50 area & curve (Zenvinus Teal) */}
          <path
            d="M 28 86 C 90 54, 175 34, 348 24 L 348 96 L 28 96 Z"
            fill="url(#zv-lab-teal-fill)"
          />
          <path
            d="M 28 86 C 90 54, 175 34, 348 24"
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.25"
            strokeLinecap="round"
          />

          {/* Precision curve (Zenvinus Deep Navy) */}
          <path
            d="M 28 90 C 96 68, 180 54, 348 38"
            fill="none"
            stroke="#020626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />

          <circle cx="348" cy="24" r="4" fill="#05DAC3" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="348" cy="38" r="3.5" fill="#020626" stroke="#FFFFFF" strokeWidth="1.5" />

          <text x="6" y="23" fill="#6B7280" fontSize="9" fontFamily="monospace">
            0.9
          </text>
          <text x="6" y="53" fill="#6B7280" fontSize="9" fontFamily="monospace">
            0.6
          </text>
          <text x="6" y="83" fill="#6B7280" fontSize="9" fontFamily="monospace">
            0.3
          </text>
          <text x="28" y="112" fill="#6B7280" fontSize="9" fontFamily="monospace">
            0
          </text>
          <text x="132" y="112" fill="#6B7280" fontSize="9" fontFamily="monospace">
            50
          </text>
          <text x="234" y="112" fill="#6B7280" fontSize="9" fontFamily="monospace">
            100
          </text>
          <text x="328" y="112" fill="#6B7280" fontSize="9" fontFamily="monospace">
            150 epochs
          </text>
        </svg>
      </div>
    </div>
  );
}
