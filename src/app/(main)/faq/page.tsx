import Banner from "@/Components/ReuseableComponent/Banner";
import { getFaqs } from "@/lib/api";
import React, { Suspense } from "react";
import TekzoFAQ from "./TekzoFAQ";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import { SITE_URL, serializeJsonLd } from "@/lib/seo/jsonLd";
import type { Metadata } from "next";
import { isList, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

// Plain-text answer for FAQPage schema (answers come from the CMS as HTML).
const stripHtml = (html: unknown): string =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  const seoData = rec((await getFaqs()).seoData);
  return {
    title: str(seoData?.title) || "FAQ | TEKZO",
    description: str(seoData?.description) || "",
    keywords: tagsOr(seoData?.tags, []),
    openGraph: {
      title: str(seoData?.title) || "FAQ | TEKZO",
      description: str(seoData?.description) || "",
      url: `${String(seoData?.canonicalUrl || "")}/faq`,
      siteName: str(seoData?.siteName) || "Tekzo",
      images: [
        {
          url: str(seoData?.ogImage) || "/all-product-banner.webp",
          width: 1200,
          height: 630,
          alt: str(seoData?.title) || "FAQ",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: str(seoData?.title) || "FAQ | TEKZO",
      description: str(seoData?.description) || "",
      images: [str(seoData?.ogImage) || "/all-product-banner.webp"],
    },
    alternates: {
      canonical: `${String(seoData?.canonicalUrl || "")}/faq`,
    },
  };
}

export default async function FAQPage() {
  const { faqs, seoData: seo } = await getFaqs();
  const seoData = rec(seo);

  // FAQPage content schema — every question/answer shown on the page (EN + BN).
  const faqItems = (isList(faqs) ? faqs.flat() : []).filter((f) => rec(f)?.question && rec(f)?.answer);
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
          name: stripHtml(rec(f)?.question),
          inLanguage: rec(f)?.lang === "bn" ? "bn" : "en",
          acceptedAnswer: { "@type": "Answer", text: stripHtml(rec(f)?.answer) },
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
