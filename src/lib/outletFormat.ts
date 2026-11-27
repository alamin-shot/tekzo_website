import { requireString } from "@/lib/json";

// The outlet pages' formatTime / capitalize (identical in both pages),
// with their JS behavior: a truthy non-string threw at `.split` / `.charAt`
// and still does.

/** "09:30" → "9:30 AM" (today's date at that local time); falsy → "". */
export function formatOutletTime(timeStr: unknown): string {
  if (!timeStr) return "";
  const [h, m] = requireString(timeStr).split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "friday" → "Friday"; falsy → "". */
export function capitalize(str: unknown): string {
  if (!str) return "";
  const s = requireString(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
