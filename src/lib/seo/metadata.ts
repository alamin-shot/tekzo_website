import { requireString } from "@/lib/json";

// Helpers shared by the listing pages' generateMetadata (P5c-2). Each one
// reproduces the JavaScript it replaced, including where it threw.

/**
 * `tags ? tags.split(",").map((t) => t.trim()) : fallback` — a truthy
 * non-string threw (no .split) and still does.
 */
export function tagsOr(tags: unknown, fallback: string[]): string[] {
  return tags
    ? requireString(tags)
        .split(",")
        .map((t) => t.trim())
    : fallback;
}

/**
 * The pages' "ensure the OG image is absolute" block:
 *   if (og && og.startsWith("/")) og = base + og;
 *   else if (og && !og.startsWith("http")) og = `${base}/${og}`;
 * A falsy image gives undefined (Next skips images without a url, so this
 * renders the same as the falsy value did); a truthy non-string threw and still does.
 */
export function absoluteOgImage(ogImage: unknown, baseUrl: string): string | undefined {
  if (!ogImage) return undefined;
  const url = requireString(ogImage);
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  if (!url.startsWith("http")) return `${baseUrl}/${url}`;
  return url;
}
