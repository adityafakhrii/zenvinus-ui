import React from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  Database,
  FileArchive,
  FileCheck2,
  FileText,
  Flag,
  FlaskConical,
  FolderKanban,
  Handshake,
  Layers,
  Microchip,
  RotateCw,
  Search,
  Tag,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import type { BadgeTone } from '@/components/ui';

type LucideGlyph = typeof FolderKanban;

const FA_MAP: Readonly<Record<string, LucideGlyph>> = {
  'fa-database': Database,
  'fa-microchip': Microchip,
  'fa-tags': Tag,
  'fa-tag': Tag,
  'fa-magnifying-glass': Search,
  'fa-clipboard-check': ClipboardCheck,
  'fa-flask': FlaskConical,
  'fa-flask-vial': FlaskConical,
  'fa-diagram-project': FolderKanban,
  'fa-layer-group': Layers,
  'fa-truck-fast': Truck,
  'fa-users': Users,
  'fa-wallet': Wallet,
  'fa-circle-check': CheckCircle2,
  'fa-check': Check,
  'fa-clock': Clock,
  'fa-hourglass-half': Clock,
  'fa-triangle-exclamation': AlertTriangle,
  'fa-file-zipper': FileArchive,
  'fa-file-lines': FileText,
  'fa-file-signature': FileCheck2,
  'fa-handshake': Handshake,
  'fa-rotate': RotateCw,
  'fa-credit-card': CreditCard,
  'fa-flag-checkered': Flag,
};

function extractKey(icon?: string): string {
  if (!icon) return '';
  const match = icon.match(/fa-[a-z0-9-]+/g);
  if (!match) return '';
  return match.find((tok) => tok !== 'fa-solid' && tok !== 'fa-regular') ?? '';
}

export function ProjectIcon({
  icon,
  className = 'h-4 w-4',
}: {
  icon?: string;
  className?: string;
}) {
  const Glyph = FA_MAP[extractKey(icon)] ?? FolderKanban;
  return <Glyph className={className} strokeWidth={1.6} aria-hidden="true" />;
}

const BADGE_MAP: Readonly<Record<string, BadgeTone>> = {
  blue: 'blue',
  mint: 'mint',
  green: 'mint',
  purple: 'purple',
  orange: 'orange',
  amber: 'amber',
  red: 'red',
};

export function badgeToneOf(tone?: string): BadgeTone {
  return (tone && BADGE_MAP[tone]) || 'neutral';
}

const TILE_MAP: Readonly<Record<string, string>> = {
  blue: 'bg-tone-blue-bg text-tone-blue-fg',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  green: 'bg-tone-mint-bg text-tone-mint-fg',
  purple: 'bg-tone-purple-bg text-tone-purple-fg',
  orange: 'bg-tone-orange-bg text-tone-orange-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
  red: 'bg-tone-red-bg text-tone-red-fg',
};

export function iconTileClassOf(tone?: string): string {
  return (tone && TILE_MAP[tone]) || 'bg-canvas text-ink-secondary';
}
