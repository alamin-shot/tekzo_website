import Banner from "@/Components/ReuseableComponent/Banner";
import { getFaqs } from "@/lib/api";
import React, { Suspense } from "react";
import TekzoFAQ from "./TekzoFAQ";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";

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

  return (
    <div>
      <Banner
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
