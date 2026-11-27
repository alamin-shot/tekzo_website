// src/Components/SEO/ProductJsonLd.tsx
import type { ProductJsonLdProps } from "@/types/props/layout";
import { SITE_URL, absoluteUrl, serializeJsonLd } from "@/lib/seo/jsonLd";
import { rec } from "@/lib/json";

const ProductJsonLd = ({ seo, product }: ProductJsonLdProps) => {
  if (!seo && !product) return null;

  const baseUrl = SITE_URL;
  const s = rec(seo);
  const p = rec(product);

  // 1. Resolve the best possible data (SEO first, then fallback to raw product data)
  const name = s?.productName || p?.product_name || p?.name;
  const description = s?.description || p?.headline || p?.short_description;

  // Image fallback
  // absoluteUrl() also returns undefined for non-strings instead of crashing the page
  const image = [s?.ogImage, rec(rec(p?.images)?.[0])?.image_path, p?.product_image].map(absoluteUrl).find(Boolean) || `${baseUrl}/placeholder.jpg`;

  // Price fallback (from variants)
  const variant = rec(rec(p?.variants)?.[0]);
  const price = s?.price || variant?.final_price || p?.regular_price;
  const availability = s?.availability || (variant?.stock || p?.stock ? "InStock" : "OutOfStock");
  const canonical = s?.canonical || (p?.slug ? `${baseUrl}/product/${p.slug}` : undefined);
  const seoBrand = rec(s?.brand);
  const productBrand = rec(p?.brand);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    image: [image],
    url: canonical,
    sku: variant?.sku || p?.sku,

    // ─── Brand ───────────────────────────────
    ...(seoBrand?.name || productBrand?.name
      ? {
          brand: {
            "@type": "Brand",
            name: seoBrand?.name || productBrand?.name,
            logo: seoBrand?.logo || productBrand?.primary_logo,
            url: seoBrand?.url || (productBrand?.slug ? `${baseUrl}/brands/${productBrand.slug}` : undefined),
          },
        }
      : {}),

    // ─── Price ─────────────────────────────────
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: s?.currency || "BDT",
      itemCondition: s?.isUsed || p?.is_refurbished ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
      availability: `https://schema.org/${availability}`,
      url: canonical,
      seller: {
        "@type": "Organization",
        name: "TEKZO",
      },
    },

    // ─── Rating — reviewCount ─
    // (`seo?.reviewCount > 0`: the comparison applies ToNumber, as Number() does)
    ...(Number(s?.reviewCount) > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: s?.ratingValue,
            reviewCount: s?.reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />;
};

export default ProductJsonLd;
