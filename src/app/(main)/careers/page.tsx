// app/(main)/careers/page.tsx  ← SERVER COMPONENT ONLY

import type { Metadata } from "next";
import { getCareers } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import CareersClient from "@/Components/Careers/CareersClient";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const jobs = await getCareers();
  const seoData = rec(rec(jobs)?.seoData);

  if (!seoData) return {};

  const canonicalBase =
    str(seoData?.canonical) ||
    (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

  return {
    title: str(seoData?.title),
    description: str(seoData?.description),
    keywords: tagsOr(seoData?.tags, []),
    openGraph: {
      title: str(seoData?.title),
      description: str(seoData?.description),
      url: `${canonicalBase}/careers`,
      locale: "en_US",
      siteName: str(seoData?.siteName),
      images: [
        {
          url: str(seoData?.ogImage) || "/all-product-banner.webp",
          width: 1200,
          height: 630,
          alt: str(seoData?.title),
        },
      ],
      type: "website",
    },
    // (main also sent twitter.siteName, which Next does not support and drops)
    twitter: {
      card: "summary_large_image",
      title: str(seoData?.title),
      description: str(seoData?.description),
      images: [str(seoData?.ogImage) || "/all-product-banner.webp"],
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
      <CareersClient jobs={rec(careersData)?.jobs} />
    </div>
  );
}
