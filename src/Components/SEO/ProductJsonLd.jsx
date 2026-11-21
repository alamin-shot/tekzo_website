// src/Components/SEO/ProductJsonLd.jsx
import { SITE_URL, absoluteUrl, serializeJsonLd } from "@/lib/seo/jsonLd";

const ProductJsonLd = ({ seo, product }) => {
    if (!seo && !product) return null;

    const baseUrl = SITE_URL;

    // 1. Resolve the best possible data (SEO first, then fallback to raw product data)
    const name = seo?.productName || product?.product_name || product?.name;
    const description = seo?.description || product?.headline || product?.short_description;
    
    // Image fallback
    // absoluteUrl() also returns undefined for non-strings instead of crashing the page
    const image =
        [seo?.ogImage, product?.images?.[0]?.image_path, product?.product_image]
            .map(absoluteUrl)
            .find(Boolean) || `${baseUrl}/placeholder.jpg`;

    // Price fallback (from variants)
    const variant = product?.variants?.[0];
    const price = seo?.price || variant?.final_price || product?.regular_price;
    const availability = seo?.availability || (variant?.stock || product?.stock ? "InStock" : "OutOfStock");
    const canonical = seo?.canonical || (product?.slug ? `${baseUrl}/product/${product.slug}` : undefined);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: name,
        description: description,
        image: [image],
        url: canonical,
        sku: variant?.sku || product?.sku,

        // ─── Brand ───────────────────────────────
        ...((seo?.brand?.name || product?.brand?.name) && {
            brand: {
                "@type": "Brand",
                name: seo?.brand?.name || product?.brand?.name,
                logo: seo?.brand?.logo || product?.brand?.primary_logo,
                url: seo?.brand?.url || (product?.brand?.slug ? `${baseUrl}/brands/${product.brand.slug}` : undefined),
            },
        }),

        // ─── Price ─────────────────────────────────
        offers: {
            "@type": "Offer",
            price: price,
            priceCurrency: seo?.currency || "BDT",
            itemCondition: seo?.isUsed || product?.is_refurbished ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
            availability: `https://schema.org/${availability}`,
            url: canonical,
            seller: {
                "@type": "Organization",
                name: "TEKZO"
            }
        },

        // ─── Rating — reviewCount ─
        ...(seo?.reviewCount > 0 && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: seo?.ratingValue,
                reviewCount: seo?.reviewCount,
                bestRating: "5",
                worstRating: "1",
            },
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: serializeJsonLd(jsonLd)}}
        />
    );
};

export default ProductJsonLd;