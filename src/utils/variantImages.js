// Builds the ordered, de-duplicated list of gallery slides for a product
// variant from `variant.attribute.images` (backend payload), falling back to
// `variant.attribute.image` and then to a caller-supplied fallback image.
//
// URL policy (matches the existing PDP gallery, which only rendered CDN URLs):
// - Absolute http(s) URLs (and protocol-relative //host/...) are kept only
//   when the host is one next/image is allowed to load (the remotePatterns
//   in next.config.mjs). Any other host would make next/image throw.
// - Bare relative filenames from the API (e.g. "Artboard 2__68259bb8b99c7__.jpg")
//   are skipped: the project has no media base URL for them, and none of the
//   configured hosts (CloudFront, web-api, S3) or the site origin serves them
//   (verified: 403/404). Guessing a base would render broken images.
// - Empty / null / whitespace paths are skipped.
// Inputs are never mutated.

// Keep in sync with images.remotePatterns in next.config.mjs.
export const ALLOWED_IMAGE_HOSTS = [
  "d2c2zgda4zwbg9.cloudfront.net",
  "web-api.tekzo.com.bd",
  "web-api.salamatinnovation.com",
  "salamat-innovation.s3.ap-south-1.amazonaws.com",
];

// Returns a URL next/image can load, or null when the path can't be resolved.
export function resolveImageSrc(path) {
  if (typeof path !== "string") return null;
  const raw = path.trim();
  if (!raw) return null;

  const absolute = raw.startsWith("//") ? `https:${raw}` : raw;
  if (!/^https?:\/\//i.test(absolute)) return null; // bare relative filename

  let url;
  try {
    url = new URL(absolute);
  } catch {
    return null;
  }
  if (!ALLOWED_IMAGE_HOSTS.includes(url.hostname)) return null;
  return url.href;
}

// Accepts the `images` array items ({ image_path, alt_text, is_primary }).
// Returns [{ id, src, alt }] with primary image(s) first (stable order
// otherwise) and identical resolved URLs removed.
export function buildVariantSlides(variant, { fallbackSrc, fallbackAlt } = {}) {
  const attribute = variant?.attribute || {};
  // alt: image alt_text -> variant value (e.g. "Black") -> product name.
  const altBase = variant?.attribute_value || attribute.color || fallbackAlt || "Product image";
  const images = Array.isArray(attribute.images) ? attribute.images : [];

  // Stable partition: primaries first, then the rest in original order.
  const ordered = [
    ...images.filter((img) => img?.is_primary === true),
    ...images.filter((img) => img?.is_primary !== true),
  ];

  const slides = [];
  const seen = new Set();
  const push = (src, alt, id) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    slides.push({ id: id ?? src, src, alt: alt || altBase });
  };

  for (const img of ordered) {
    const alt = typeof img?.alt_text === "string" && img.alt_text.trim() ? img.alt_text.trim() : altBase;
    push(resolveImageSrc(img?.image_path), alt, img?.id);
  }

  // Older payloads (no `images`, or none resolvable): single featured image.
  if (slides.length === 0) push(resolveImageSrc(attribute.image), altBase);
  if (slides.length === 0) push(resolveImageSrc(fallbackSrc), altBase);

  return slides;
}
