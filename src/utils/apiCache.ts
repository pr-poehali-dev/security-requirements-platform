const STORAGE_KEY = "sa_cacheTtl";
const DEFAULT_TTL_MIN = 5;

interface CacheEntry {
  data: unknown;
  ts: number;
}

const store = new Map<string, CacheEntry>();

function getTtlMs(): number {
  try {
    const val = parseInt(localStorage.getItem(STORAGE_KEY) || "", 10);
    if (!isNaN(val) && val >= 0) return val * 60 * 1000;
  } catch { /* ignore */ }
  return DEFAULT_TTL_MIN * 60 * 1000;
}

export function getCacheTtlMin(): number {
  try {
    const val = parseInt(localStorage.getItem(STORAGE_KEY) || "", 10);
    if (!isNaN(val) && val >= 0) return val;
  } catch { /* ignore */ }
  return DEFAULT_TTL_MIN;
}

export function setCacheTtlMin(minutes: number): void {
  localStorage.setItem(STORAGE_KEY, String(Math.max(0, minutes)));
  store.clear();
}

export function getCached(key: string): unknown | null {
  const ttl = getTtlMs();
  if (ttl === 0) return null;
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttl) { store.delete(key); return null; }
  return entry.data;
}

export function setCache(key: string, data: unknown): void {
  if (getTtlMs() === 0) return;
  store.set(key, { data, ts: Date.now() });
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

export function invalidateAll(): void {
  store.clear();
}
