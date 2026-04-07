const TTL_MS = 5 * 60 * 1000; // 5 минут

interface CacheEntry {
  data: unknown;
  ts: number;
}

const store = new Map<string, CacheEntry>();

export function getCached(key: string): unknown | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) { store.delete(key); return null; }
  return entry.data;
}

export function setCache(key: string, data: unknown): void {
  store.set(key, { data, ts: Date.now() });
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

export function invalidateAll(): void {
  store.clear();
}
