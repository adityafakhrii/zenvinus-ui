import { twMerge } from 'tailwind-merge';

/** Merges conditional Tailwind class strings with conflict resolution. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return twMerge(parts);
}
