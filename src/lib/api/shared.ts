import { errMessage, rec } from "@/lib/json";

// Small helpers shared by the lib/api/<domain> fetchers. Each mirrors the
// exact JavaScript it replaced in the old lib/api.js.

/** `result?.data` */
export const dataOf = (result: unknown): unknown => rec(result)?.data;

/** `if (value) query.set(key, value)` — URLSearchParams stringifies values the same way String() does. */
export function setIf(query: URLSearchParams, key: string, value: unknown): void {
  if (value) query.set(key, String(value));
}

/** `console.error(label, err.message)` from a fetcher's catch block. */
export function logFetchError(label: string, err: unknown): void {
  console.error(label, errMessage(err));
}
