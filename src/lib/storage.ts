/**
 * Safe access to localStorage / sessionStorage: no-ops on the server, and a blocked or corrupt storage never
 * throws. Values come back as `unknown`; callers narrow them with a type guard.
 */
export type StorageKind = 'local' | 'session';

const area = (kind: StorageKind): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // storage blocked (privacy settings)
  }
};

/** Parsed JSON at `key`, or null when it is missing, unreadable or not JSON. */
export function readJson(kind: StorageKind, key: string): unknown {
  const s = area(kind);
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Raw string at `key` (not parsed), or null. */
export function readString(kind: StorageKind, key: string): string | null {
  const s = area(kind);
  if (!s) return null;
  try {
    return s.getItem(key);
  } catch {
    return null;
  }
}

/** Store `value` as JSON at `key`; `undefined` removes the key. */
export function writeJson(kind: StorageKind, key: string, value: unknown): void {
  const s = area(kind);
  if (!s) return;
  try {
    if (value === undefined) s.removeItem(key);
    else s.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or blocked: the state stays in memory for this visit */
  }
}

/** Store a raw string at `key`. */
export function writeString(kind: StorageKind, key: string, value: string): void {
  const s = area(kind);
  if (!s) return;
  try {
    s.setItem(key, value);
  } catch {
    /* see writeJson */
  }
}

/** Every key in the storage that starts with `prefix`. */
export function keysWithPrefix(kind: StorageKind, prefix: string): string[] {
  const s = area(kind);
  if (!s) return [];
  const keys: string[] = [];
  try {
    for (let i = 0; i < s.length; i += 1) {
      const k = s.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
  } catch {
    return [];
  }
  return keys;
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
