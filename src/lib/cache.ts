import type { AssessmentResponse } from "@/lib/types";

interface CacheEntry {
  expiresAt: number;
  value: AssessmentResponse;
}

const TTL_MS = 10 * 60 * 1000;
const store = new Map<string, CacheEntry>();

export function cacheKey(
  originCity: string,
  destinationCity: string,
  date: string,
): string {
  return `${originCity.trim().toLowerCase()}|${destinationCity.trim().toLowerCase()}|${date}`;
}

export function getCached(key: string): AssessmentResponse | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key: string, value: AssessmentResponse): void {
  store.set(key, { value, expiresAt: Date.now() + TTL_MS });
}
