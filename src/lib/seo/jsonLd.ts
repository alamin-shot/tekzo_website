import { isList, rec, toDateInput } from "@/lib/json";

// Shared helpers for <script type="application/ld+json"> blocks.

export const SITE_URL = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

// Fallback social profiles, used only when the settings API returns none.
// Replace with the confirmed official URLs if any of these are wrong.
export const DEFAULT_SOCIAL_PROFILES = [
  "https://www.facebook.com/tekzobd",
  "https://www.instagram.com/tekzo.com.bd/",
  "https://www.linkedin.com/company/tekzo-com-bd/",
  "https://www.youtube.com/@TEKZO_BD",
  "https://www.tiktok.com/@tekzobd",
];

// JSON.stringify does not escape "<", so a CMS value containing
// "</script>" would close the tag early and inject HTML. < is
// equivalent JSON and cannot end the script element.
export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, "\\u003c");

// schema.org dates must be ISO 8601; the API sometimes sends display
// strings. Returns undefined (field omitted) when unparseable.
export function toIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(toDateInput(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// Turns "/path" into "https://site/path"; leaves absolute URLs alone.
export function absoluteUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  return value.startsWith("/") && !value.startsWith("//") ? `${SITE_URL}${value}` : value;
}

// Collects real http(s) profile URLs from the company settings, falling
// back to DEFAULT_SOCIAL_PROFILES. "/" placeholders are dropped.
export function getSocialProfiles(companySetting: unknown, extra?: unknown): string[] {
  const s = rec(companySetting);
  const candidates: unknown[] = [
    s?.facebook_link,
    s?.instagram_link,
    s?.tiktok_link,
    s?.youtube_link,
    s?.linkedin_link,
    ...(isList(extra) ? extra : []),
  ];
  const urls = [...new Set(candidates.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)))];
  return urls.length ? urls : DEFAULT_SOCIAL_PROFILES;
}

// Canonical for a sub-page. CMS-provided canonicals are used only when they
// point somewhere other than the homepage — a sub-page canonicalised to "/"
// tells Google to drop the page. Falls back to the page's own URL.
export function pageCanonical(cmsCanonical: unknown, path: unknown): string {
  const own = `${SITE_URL}${path}`;
  if (typeof cmsCanonical !== "string" || !cmsCanonical.trim()) return own;
  try {
    const url = new URL(cmsCanonical, SITE_URL);
    return url.pathname === "/" || url.pathname === "" ? own : url.toString().replace(/\/$/, "");
  } catch {
    return own;
  }
}
