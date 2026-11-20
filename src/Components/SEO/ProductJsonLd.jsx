const ProductJsonLd = ({seo}) => {
    if (!seo) return null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: seo?.productName,
        description: seo?.description,
        image: seo?.ogImage,
        url: seo?.canonical,

        // ─── Brand ───────────────────────────────
        ...(seo?.brand?.name && {
            brand: {
                "@type": "Brand",
                name:     seo.brand.name,
                logo:     seo.brand?.logo,
                url:      seo.brand.url,
            },
        }),

        // ─── Price ─────────────────────────────────
        offers: {
            "@type": "Offer",
            price: seo?.price,
            priceCurrency: seo?.currency || "BDT",
            itemCondition: seo?.isUsed
                ? "https://schema.org/UsedCondition"
                : "https://schema.org/NewCondition",
            availability: `https://schema.org/${seo?.availability || "InStock"}`,
            url: seo?.canonical,
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
            dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
    );
};

export default ProductJsonLd;