import { getSeoPage } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import AboutHeading from "@/Components/AboutUs/AboutHeading";
import type { Metadata } from "next";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoPage("about-us");
  if(!seo) return {};
  // `seoData.x` on a truthy payload; template strings stringify, as String() does.
  const seoData = rec(seo);
 
  return {
    title: str(seoData?.title),
    description: str(seoData?.description),
    keywords: tagsOr(seoData?.tags, []),
    openGraph: {
      title: str(seoData?.title),
      description: str(seoData?.description),
      url: `${String(seoData?.canonicalUrl)}/about-us`,
      siteName: str(seoData?.siteName),
      images: [{ 
        url: str(seoData?.ogImage) || "/loginPage/contact-about-bg.webp", 
        width: 1200, 
        height: 630, 
        alt: str(seoData?.title) }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: str(seoData?.title),
      description: str(seoData?.description),
      // A missing image leaves url empty; Next skips images without one, as before.
      images: [{ url: str(seoData?.ogImage) ?? "", width: 1200, height: 630, alt: str(seoData?.title) }]
    },
    alternates: {
      canonical: `${String(seoData?.canonicalUrl)}/about-us`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AboutUs() {
  const seoData = rec(await getSeoPage("about-us"));
  return (
    <div>
      <Banner h1="About TEKZO" image={seoData?.banner || "/all-product-banner.webp"} 
      title={seoData?.title || "About Us"} />
      <main className="container">
        <Breadcrumbs />
        <AboutHeading/>
      </main>
    </div>
  );
}