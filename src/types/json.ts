// Untyped JSON as it arrives from the backend, before any domain typing.

/** A plain object (or array) read with `?.`-style access; every value is unknown until narrowed. */
export type JsonRecord = Record<string, unknown>;

/** Value accepted by URLSearchParams.set after `String(value)` — callers pass strings, numbers, or searchParams entries. */
export type QueryValue = unknown;

/** Loose filter bag (`filterParams`, `params`) read with `?.`. */
export type FilterParams = JsonRecord;
