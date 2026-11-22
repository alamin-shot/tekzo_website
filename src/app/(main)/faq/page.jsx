import Banner from "@/Components/ReuseableComponent/Banner";
import { getFaqs } from "@/lib/api";
import React, { Suspense } from "react";
import TekzoFAQ from "./TekzoFAQ";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import { SITE_URL, serializeJsonLd } from "@/lib/seo/jsonLd";

// Plain-text answer for FAQPage schema (answers come from the CMS as HTML).
const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const revalidate = 3600;
export async function generateMetadata() {
  const { seoData } = await getFaqs();
  return {
    title: seoData?.title || "FAQ | TEKZO",
    description: seoData?.description || "",
    keywords: seoData?.tags ? seoData.tags.split(",").map((t) => t.trim()) : [],
    openGraph: {
      title: seoData?.title || "FAQ | TEKZO",
      description: seoData?.description || "",
      url: `${seoData?.canonicalUrl || ""}/faq`,
      siteName: seoData?.siteName || "Tekzo",
      images: [
        {
          url: seoData?.ogImage || "/all-product-banner.webp",
          width: 1200,
          height: 630,
          alt: seoData?.title || "FAQ",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData?.title || "FAQ | TEKZO",
      description: seoData?.description || "",
      images: [seoData?.ogImage || "/all-product-banner.webp"],
    },
    alternates: {
      canonical: `${seoData?.canonicalUrl || ""}/faq`,
    },
  };
}

export default async function FAQPage() {
  const { faqs, seoData } = await getFaqs();

  // FAQPage content schema — every question/answer shown on the page (EN + BN).
  const faqItems = (Array.isArray(faqs) ? faqs.flat() : []).filter((f) => f?.question && f?.answer);
  const faqJsonLd = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${SITE_URL}/faq#faqpage`,
        url: `${SITE_URL}/faq`,
        name: seoData?.title || "FAQ",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: stripHtml(f.question),
          inLanguage: f.lang === "bn" ? "bn" : "en",
          acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answer) },
        })),
      }
    : null;

  return (
    <div>
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />}
      <Banner h1="Frequently Asked Questions"
        image={seoData?.banner || "/loginPage/contact-about-bg.webp"}
        title={seoData?.title || "FAQ"}
      />
      <div className="container">
        <Breadcrumbs />
        <TekzoFAQ faqs={faqs} />
      </div>
    </div>
  );
}
