export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholder.jpg";

// Must mirror `images.remotePatterns` in next.config.mjs: next/image throws
// (dev) or returns 400 (prod) for any host that isn't listed there.
const ALLOWED_HOSTS = new Set([
  "d2c2zgda4zwbg9.cloudfront.net",
  "web-api.tekzo.com.bd",
  "web-api.salamatinnovation.com",
  "salamat-innovation.s3.ap-south-1.amazonaws.com",
]);

// The S3 bucket is private (direct URLs return 403 AccessDenied); the same
// objects are served publicly through CloudFront at the same path.
const S3_BUCKET_HOST = "salamat-innovation.s3.ap-south-1.amazonaws.com";
const CDN_ORIGIN = "https://d2c2zgda4zwbg9.cloudfront.net";

// Returns a URL next/image can always render: an allowed https host, a local
// /public path, or the placeholder for anything missing or unknown.
export function resolveProductImage(url) {
  if (typeof url !== "string" || !url.trim()) return PRODUCT_IMAGE_PLACEHOLDER;
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  try {
    const { protocol, hostname, pathname, search } = new URL(url);
    if (protocol !== "https:" || !ALLOWED_HOSTS.has(hostname)) {
      return PRODUCT_IMAGE_PLACEHOLDER;
    }
    return hostname === S3_BUCKET_HOST ? `${CDN_ORIGIN}${pathname}${search}` : url;
  } catch {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
}
