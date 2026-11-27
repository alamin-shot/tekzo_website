import { isValidElement } from "react";
import type { ReactNode } from "react";
import { fieldsOf, isList, rec, requireString } from "@/lib/json";

/** Any value used as a React key, converted the way React does (`"" + key`); null/undefined → no key. */
export function keyFrom(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

/** React key from `item.id`: throws for a null item (as `item.id` did); a missing id stays an undefined key. */
export function idKey(item: unknown): string | undefined {
  const id = fieldsOf(item).id;
  return id === undefined || id === null ? undefined : String(id);
}

/** React key from `item?.id` (no throw for a null item). */
export function idKeyOpt(item: unknown): string | undefined {
  const id = rec(item)?.id;
  return id === undefined || id === null ? undefined : String(id);
}

// Helpers for rendering untyped CMS/API values in typed JSX without `as`.
// See docs/context/AUDIT_NOTES.md (P4 forced narrowings).

/**
 * A string for typed string props (`src`, `alt`, `href`, `aria-*`).
 * Strings pass unchanged; anything else becomes undefined. Non-string values
 * already broke those props at runtime (next/image, next/link throw), so this
 * only changes malformed-payload cases.
 */
export function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * An API value rendered as a React child, with React's own rules: strings,
 * numbers, booleans, null/undefined, elements and arrays of those render as
 * before; a plain object still throws ("Objects are not valid as a React
 * child"), just from here instead of from React.
 */
export function nodeOf(value: unknown): ReactNode {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return value;
  if (isValidElement(value)) return value;
  if (isList(value)) return value.map(nodeOf);
  throw new Error("Objects are not valid as a React child");
}

/**
 * A form value passed to an input/select `value` as React reads it: null/undefined
 * leave the field empty (uncontrolled), numbers stay numbers, anything else is
 * stringified the way React does (`"" + value`).
 */
export function inputValue(value: unknown): string | number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  return String(value);
}

/** `name.split(" ").map((n) => n[0]).join("").slice(0, 2)` (a non-string name throws, as before). */
export function initialsOf(name: unknown): string {
  return requireString(name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}
