import type { JsonRecord } from "@/types/json";

// Checked helpers for reading untyped backend JSON with the exact semantics
// of the JavaScript they replace (`a?.b`, `x || []`, `err.message`). They
// exist so converted code needs no `as` assertions; see
// docs/context/AUDIT_NOTES.md "Boundary assertions".

/** True for any non-null object (arrays included, like `typeof v === "object"`). */
export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

/**
 * `Array.isArray` that narrows to `unknown[]` instead of `any[]`, so array
 * contents from the API stay unknown until checked. Use this in converted
 * code instead of `Array.isArray`.
 */
export function isList(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** `value` as a readable record, or undefined — `rec(a)?.b` behaves like JS `a?.b` for objects. */
export function rec(value: unknown): JsonRecord | undefined {
  return isRecord(value) ? value : undefined;
}

/**
 * Source for JS object destructuring (`const { a, b } = value`): throws the
 * same TypeError for null/undefined, and yields no fields for primitives.
 */
export function fieldsOf(value: unknown): JsonRecord {
  if (value === null || value === undefined) throw new TypeError("Cannot destructure a null or undefined value");
  return rec(value) ?? {};
}

/**
 * JS `value || []` followed by an array method: falsy → [], array → itself,
 * anything else throws the TypeError the original `.map/.filter/.flat`
 * call would have thrown (callers rely on try/catch fallbacks).
 */
export function orList(value: unknown): unknown[] {
  if (!value) return [];
  if (isList(value)) return value;
  throw new TypeError("value is not an array");
}

/** A string, or the TypeError a string method call on a non-string would throw. */
export function requireString(value: unknown): string {
  if (typeof value === "string") return value;
  throw new TypeError("value is not a string");
}

/**
 * What JS `new Date(value)` receives for an arbitrary value: strings,
 * numbers and Dates pass through; booleans/bigints are ToNumber'd; plain API
 * objects/arrays fall back to their string form (ToPrimitive → toString), so
 * `new Date(toDateInput(v))` equals `new Date(v)` for JSON values.
 */
export function toDateInput(value: unknown): string | number | Date {
  // `new Date(null)` is the epoch (ToNumber(null) = 0), not an Invalid Date.
  if (value === null) return 0;
  if (typeof value === "string" || typeof value === "number" || value instanceof Date) return value;
  if (typeof value === "boolean" || typeof value === "bigint") return Number(value);
  return String(value);
}

/**
 * JS `value?.toLowerCase()`: null/undefined → undefined, a string → lower
 * case, anything else throws (as calling a missing method did).
 */
export function lowerOpt(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  return requireString(value).toLowerCase();
}

/**
 * JS `value[0]` for a value already known to be truthy: a string's first
 * character, an array's/object's "0" entry; other primitives give undefined.
 */
export function firstOf(value: unknown): unknown {
  if (typeof value === "string") return value[0];
  return rec(value)?.[0];
}

/**
 * JS `value?.map(fn)`: null/undefined → undefined, an array → mapped,
 * anything else throws (calling a missing .map did too).
 */
export function mapOpt<T>(value: unknown, fn: (item: unknown, index: number) => T): T[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!isList(value)) throw new TypeError("value.map is not a function");
  return value.map(fn);
}

/**
 * JS `value.map(fn)` (no optional chaining): an array is mapped; anything
 * else — including null/undefined — throws, as calling a missing .map did.
 */
export function mapList<T>(value: unknown, fn: (item: unknown, index: number) => T): T[] {
  if (!isList(value)) throw new TypeError("value.map is not a function");
  return value.map(fn);
}

/**
 * JS `value[index]` (no optional chaining): throws for null/undefined; a
 * string gives its character; arrays/objects their entry; other primitives undefined.
 */
export function itemAt(value: unknown, index: number): unknown {
  if (value === null || value === undefined) throw new TypeError(`Cannot read properties of ${value} (reading '${index}')`);
  if (typeof value === "string") return value[index];
  return rec(value)?.[index];
}

/** JS `value.filter(fn)` (no optional chaining): arrays filter; anything else throws, as before. */
export function filterList(value: unknown, fn: (item: unknown, index: number) => unknown): unknown[] {
  if (!isList(value)) throw new TypeError("value.filter is not a function");
  return value.filter(fn);
}

/** JS `value.find(fn)` (no optional chaining): arrays search; anything else throws, as before. */
export function findList(value: unknown, fn: (item: unknown, index: number) => unknown): unknown {
  if (!isList(value)) throw new TypeError("value.find is not a function");
  return value.find(fn);
}

/** JS `value.findIndex(fn)` (no optional chaining): arrays search; anything else throws, as before. */
export function findIndexList(value: unknown, fn: (item: unknown, index: number) => unknown): number {
  if (!isList(value)) throw new TypeError("value.findIndex is not a function");
  return value.findIndex(fn);
}

/** JS `[...value]`: arrays copy, strings split into characters; anything else throws (not iterable). */
export function spreadList(value: unknown): unknown[] {
  if (isList(value)) return [...value];
  if (typeof value === "string") return [...value];
  throw new TypeError("value is not iterable");
}

/**
 * JS `Object.values(value)` for a non-nullish value: objects/arrays give their
 * values, a string its characters, other primitives nothing. Throws for
 * null/undefined, as Object.values does.
 */
export function valuesOf(value: unknown): unknown[] {
  if (value === null || value === undefined) throw new TypeError("Cannot convert undefined or null to object");
  if (typeof value === "string") return [...value];
  return isRecord(value) ? Object.values(value) : [];
}

/**
 * JS `Object.values(value ?? {})?.[0]?.[0]` — the first entry of an API
 * `errors` object, then its first element (a string's first character).
 * `Object.values` wraps primitives: a string gives its characters, other
 * primitives give no values.
 */
export function firstErrorOf(value: unknown): unknown {
  const first = valuesOf(value ?? {})[0];
  return first === null || first === undefined ? undefined : firstOf(first);
}

/**
 * JS `a + b` for API values: after ToPrimitive (objects/arrays become their
 * string form), a string on either side concatenates; otherwise both sides
 * are added as numbers. So a price sent as "1000" plus 0 gives "10000", as
 * the original code did.
 */
export function addJs(a: unknown, b: unknown): string | number {
  const x = isRecord(a) ? String(a) : a;
  const y = isRecord(b) ? String(b) : b;
  if (typeof x === "string" || typeof y === "string") return String(x) + String(y);
  return Number(x) + Number(y);
}

/**
 * JS `a > b` for two API values: after ToPrimitive (objects/arrays become
 * their string form), two strings compare as text; otherwise both sides are
 * compared as numbers.
 */
export function greaterJs(a: unknown, b: unknown): boolean {
  const x = isRecord(a) ? String(a) : a;
  const y = isRecord(b) ? String(b) : b;
  if (typeof x === "string" && typeof y === "string") return x > y;
  return Number(x) > Number(y);
}

/** JS `value?.[index]`: undefined for null/undefined, else `itemAt`. */
export function itemOpt(value: unknown, index: number): unknown {
  return value === null || value === undefined ? undefined : itemAt(value, index);
}

/** JS `value.slice(start, end)`: arrays and strings slice; anything else throws, as before. */
export function sliceOf(value: unknown, start?: number, end?: number): unknown {
  if (isList(value) || typeof value === "string") return value.slice(start, end);
  throw new TypeError("value.slice is not a function");
}

/** JS `value.length` for a value known to be non-nullish (strings and arrays have one; objects may). */
export function lengthOf(value: unknown): unknown {
  return typeof value === "string" ? value.length : rec(value)?.length;
}

/**
 * JS `value?.toLocaleString()` for JSON values: numbers use
 * Number#toLocaleString; strings, booleans and objects return their string
 * form (what String/Object#toLocaleString give); null/undefined → undefined.
 */
export function localeOpt(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}

/** JS `value.length` (no optional chaining): throws for null/undefined, as reading it did. */
export function lengthStrict(value: unknown): unknown {
  if (value === null || value === undefined) throw new TypeError(`Cannot read properties of ${value} (reading 'length')`);
  return lengthOf(value);
}

/** JS `value?.length` (undefined for null/undefined). */
export function lengthOpt(value: unknown): unknown {
  return value === null || value === undefined ? undefined : lengthOf(value);
}

/** `err.message` from a caught value (undefined when absent). */
export function errMessage(err: unknown): unknown {
  return rec(err)?.message;
}

/** `err?.digest?.startsWith("NEXT_REDIRECT")` — Next.js redirect errors must be rethrown. */
export function isNextRedirect(err: unknown): boolean {
  const digest = rec(err)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
