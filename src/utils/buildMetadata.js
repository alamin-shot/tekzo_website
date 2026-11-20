/**
 * Reusable metadata builder for all pages.
 * @param {object} seo - seoData object from API
 * @param {string} fallbackImage - page-specific fallback image path
 */
export function buildMetadata(seo, seoType = "", fallbackImage = "/default-og.webp") {
  if (!seo) return {};

  const title       = seo.title       ?? "";
  const description = seo.description ?? "";
  const canonicalBase =
    seo.canonicalUrl ||
    (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical   = `${canonicalBase}/${seoType}`;
  const siteName    = seo.siteName    ?? "";
  const ogImage     = seo.ogImage     || fallbackImage;
  const keywords    = seo.tags
    ? seo.tags.split(",").map((t) => t.trim())
    : [];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url:      canonical,
      siteName,
      type:     "website",
      images:   [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:               true,
        follow:              true,
        "max-image-preview": "large",
        "max-snippet":       -1,
      },
    },
  };
}