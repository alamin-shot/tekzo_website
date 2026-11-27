import { toDateInput } from "@/lib/json";

/**
 * The blog cards' `formatDate(value)`: falsy → "", an invalid date → the
 * value itself (unchanged, so it renders as before), else "Mon D, YYYY".
 */
export function formatPostDate(value: unknown): unknown {
  if (!value) return "";
  const d = new Date(toDateInput(value));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
