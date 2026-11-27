import type { BuiltMetadata } from "@/types/seo";
import { rec, requireString } from "@/lib/json";

/**
 * Reusable metadata builder for all pages.
 * @param seo - seoData object from API
 * @param seoType - path segment appended to the canonical base
 * @param fallbackImage - page-specific fallback image path
 */
export function buildMetadata(seo: unknown, seoType: unknown = "", fallbackImage: unknown = "/default-og.webp"): BuiltMetadata | Record<string, never> {
  if (!seo) return {};
  const s = rec(seo);

  const title = s?.title ?? "";
  const description = s?.description ?? "";
  const canonicalBase = s?.canonicalUrl || (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = `${canonicalBase}/${seoType}`;
  const siteName = s?.siteName ?? "";
  const ogImage = s?.ogImage || fallbackImage;
  const keywords = s?.tags
    ? requireString(s.tags)
        .split(",")
        .map((t) => t.trim())
    : [];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
