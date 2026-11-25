// app/(main)/careers/page.jsx  ← SERVER COMPONENT ONLY

import { getCareers } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import CareersClient from "@/Components/Careers/CareersClient";

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata() {
  const jobs = await getCareers();
  const seoData = jobs?.seoData;

  if (!seoData) return {};

  const canonicalBase =
    seoData?.canonical ||
    (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

  return {
    title: seoData?.title,
    description: seoData?.description,
    keywords: seoData?.tags ? seoData.tags.split(",").map((t) => t.trim()) : [],
    openGraph: {
      title: seoData?.title,
      description: seoData?.description,
      url: `${canonicalBase}/careers`,
      locale: "en_US",
      siteName: seoData?.siteName,
      images: [
        {
          url: seoData?.ogImage || "/all-product-banner.webp",
          width: 1200,
          height: 630,
          alt: seoData?.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData?.title,
      description: seoData?.description,
      siteName: seoData?.siteName,
      images: [seoData?.ogImage || "/all-product-banner.webp"],
    },
    alternates: {
      canonical: `${canonicalBase}/careers`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CareersPage() {
  const careersData = await getCareers();

  return (
    <div>
      <Banner h1="Careers at TEKZO" image={"/all-product-banner.webp"} title={"careers"} />
      <Breadcrumbs />
      <CareersClient jobs={careersData?.jobs} />
    </div>
  );
}