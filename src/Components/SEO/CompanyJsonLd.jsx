import { getSocialProfiles, serializeJsonLd } from "@/lib/seo/jsonLd";

const CompanyJsonLd = ({ companySetting, seo }) => {  // ✅ destructure props
    const canonical =
        seo?.canonical ||
        (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
    const name = seo?.siteName ?? seo?.title ?? "Tekzo-Gadgets & Tech Distributor in Bangladesh";
    const orgId = `${canonical}/#organization`;
    const logoId = `${canonical}/#logo`;
    // Freshness: the time this HTML was generated. Pages are static and get
    // regenerated when products/settings change, so this is the real "last updated".
    const dateModified = new Date().toISOString();
    const datePublished = seo?.foundingDate ? String(seo.foundingDate) : undefined;

    const jsonLd = {         // ✅ store object in a variable
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": `${canonical}/#website`,
                url: `${canonical}/`,
                name,
                potentialAction: {
                    "@type": "SearchAction",
                    target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${canonical}/search?query={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                },
                inLanguage: "en-US",
                // Author + freshness signals for search/AI engines.
                author: { "@id": orgId },
                publisher: { "@id": orgId },
                copyrightHolder: { "@id": orgId },
                ...(datePublished && { datePublished }),
                dateModified,
            },
            {
                "@type": ["LocalBusiness", "Organization"],
                "@id": orgId,
                name: seo?.title ?? name,
                url: `${canonical}/`,
                ...(seo?.foundingDate && { foundingDate: seo.foundingDate }),
                address: {
                    "@type": "PostalAddress",
                    addressLocality: "Dhaka",
                    addressCountry: { "@type": "Country", name: "Bangladesh" },
                    postalCode: 1229,
                    ...(seo?.streetAddress && { streetAddress: seo.streetAddress }),
                },
                logo: seo?.ogImage ?? "",
                image: { "@id": logoId },
                description: seo?.description ?? "",
                openingHoursSpecification: [
                    {
                        "@type": "OpeningHoursSpecification",
                        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                        opens: "09:00",
                        closes: "20:00",
                    },
                ],
                sameAs: getSocialProfiles(companySetting, seo?.socialLink),
                contactPoint: [
                    {
                        "@type": "ContactPoint",
                        telephone: companySetting?.primary_phone_number ?? "",
                        email: companySetting?.support_email ?? "",
                        contactType: "customer service",
                    },
                ],
            },
            {
                "@type": "ImageObject",
                "@id": logoId,
                url: seo?.ogImage ?? "",
                width: 256,
                height: 256,
            },
        ],
    };

    return (
        <script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
    );
};

export default CompanyJsonLd;