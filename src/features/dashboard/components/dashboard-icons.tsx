import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  CreditCard,
  Download,
  FileArchive,
  FileCheck2,
  FileText,
  Flame,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Handshake,
  Headphones,
  Inbox,
  Layers,
  Lightbulb,
  LineChart,
  Lock,
  Microchip,
  Plus,
  Receipt,
  Rocket,
  RotateCw,
  Scale,
  ScanLine,
  Table2,
  Tag,
  Target,
  Truck,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import type { BadgeTone } from '@/components/ui';
import type { Tone } from '../types/dashboard';

type LucideGlyph = typeof Activity;

const FA_ICON_MAP: Readonly<Record<string, LucideGlyph>> = {
  'fa-diagram-project': FolderKanban,
  'fa-layer-group': Layers,
  'fa-clipboard-check': ClipboardCheck,
  'fa-wallet': Wallet,
  'fa-circle-check': CheckCircle2,
  'fa-upload': Upload,
  'fa-user-plus': UserPlus,
  'fa-file-invoice-dollar': Receipt,
  'fa-file-invoice': FileText,
  'fa-triangle-exclamation': AlertTriangle,
  'fa-bullseye': Target,
  'fa-fire': Flame,
  'fa-object-group': ScanLine,
  'fa-robot': Bot,
  'fa-headphones': Headphones,
  'fa-table': Table2,
  'fa-inbox': Inbox,
  'fa-users': Users,
  'fa-sack-dollar': CircleDollarSign,
  'fa-hourglass-half': Clock,
  'fa-clock': Clock,
  'fa-handshake-angle': Handshake,
  'fa-handshake': Handshake,
  'fa-chart-line': LineChart,
  'fa-check': Check,
  'fa-credit-card': CreditCard,
  'fa-download': Download,
  'fa-file-lines': FileText,
  'fa-file-signature': FileCheck2,
  'fa-file-zipper': FileArchive,
  'fa-flag-checkered': CheckCircle2,
  'fa-flask-vial': FlaskConical,
  'fa-lightbulb': Lightbulb,
  'fa-lock': Lock,
  'fa-microchip': Microchip,
  'fa-money-check-dollar': CircleDollarSign,
  'fa-plus': Plus,
  'fa-rocket': Rocket,
  'fa-rotate': RotateCw,
  'fa-scale-balanced': Scale,
  'fa-tag': Tag,
  'fa-truck-fast': Truck,
  'fa-user-graduate': GraduationCap,
  'fa-user-tie': UserCheck,
  'fa-calendar': Calendar,
  'fa-angle-right': ArrowUpRight,
};

function extractFaKey(iconClass: string | undefined): string {
  if (!iconClass) return '';
  const match = iconClass.match(/fa-[a-z0-9-]+/g);
  if (!match) return '';
  return match.find((token) => token !== 'fa-solid' && token !== 'fa-regular') ?? '';
}

export interface DashboardLucideIconProps {
  /** Legacy Font Awesome class string stored in dashboard data (e.g. "fa-solid fa-wallet"). */
  icon?: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * Resolves a data-layer icon key (legacy Font Awesome class name) to a uniform Lucide glyph.
 */
export function DashboardLucideIcon({
  icon,
  className = 'h-4 w-4',
  strokeWidth = 1.5,
}: DashboardLucideIconProps) {
  const key = extractFaKey(icon);
  const Glyph = FA_ICON_MAP[key] ?? Activity;
  return <Glyph className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

/**
 * Normalizes dashboard data `Tone` into the 6-tone BadgeTone scale from ai-guidelines/color-system.md.
 */
export function toBadgeTone(tone: string | undefined): BadgeTone {
  switch (tone) {
    case 'mint':
    case 'green':
      return 'mint';
    case 'blue':
      return 'blue';
    case 'purple':
      return 'purple';
    case 'orange':
      return 'orange';
    case 'amber':
      return 'amber';
    case 'red':
      return 'red';
    default:
      return 'neutral';
  }
}

const ICON_TONE_CLASSES: Readonly<Record<Tone, string>> = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  green: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-purple-bg text-tone-purple-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
  red: 'bg-tone-red-bg text-tone-red-fg',
};

/**
 * Returns the subtle pastel container classes for dashboard item/KPI icon tiles.
 */
export function iconTileToneClass(tone: Tone | string | undefined): string {
  if (tone && tone in ICON_TONE_CLASSES) {
    return ICON_TONE_CLASSES[tone as Tone];
  }
  return 'bg-canvas text-ink-secondary';
}
