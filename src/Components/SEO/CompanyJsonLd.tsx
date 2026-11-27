import type { CompanyJsonLdProps } from "@/types/props/layout";
import { getSocialProfiles, serializeJsonLd } from "@/lib/seo/jsonLd";
import { rec } from "@/lib/json";

const CompanyJsonLd = ({ companySetting, seo }: CompanyJsonLdProps) => {
  // ✅ destructure props
  const s = rec(seo);
  const cs = rec(companySetting);
  const canonical = s?.canonical || (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const name = s?.siteName ?? s?.title ?? "Tekzo-Gadgets & Tech Distributor in Bangladesh";
  const orgId = `${canonical}/#organization`;
  const logoId = `${canonical}/#logo`;
  // Freshness: the time this HTML was generated. Pages are static and get
  // regenerated when products/settings change, so this is the real "last updated".
  const dateModified = new Date().toISOString();
  const datePublished = s?.foundingDate ? String(s.foundingDate) : undefined;

  const jsonLd = {
    // ✅ store object in a variable
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
        ...(datePublished ? { datePublished } : {}),
        dateModified,
      },
      {
        "@type": ["LocalBusiness", "Organization"],
        "@id": orgId,
        name: s?.title ?? name,
        url: `${canonical}/`,
        ...(s?.foundingDate ? { foundingDate: s.foundingDate } : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dhaka",
          addressCountry: { "@type": "Country", name: "Bangladesh" },
          postalCode: 1229,
          ...(s?.streetAddress ? { streetAddress: s.streetAddress } : {}),
        },
        logo: s?.ogImage ?? "",
        image: { "@id": logoId },
        description: s?.description ?? "",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "09:00",
            closes: "20:00",
          },
        ],
        sameAs: getSocialProfiles(companySetting, s?.socialLink),
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: cs?.primary_phone_number ?? "",
            email: cs?.support_email ?? "",
            contactType: "customer service",
          },
        ],
      },
      {
        "@type": "ImageObject",
        "@id": logoId,
        url: s?.ogImage ?? "",
        width: 256,
        height: 256,
      },
    ],
  };

  return <script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />;
};

export default CompanyJsonLd;
