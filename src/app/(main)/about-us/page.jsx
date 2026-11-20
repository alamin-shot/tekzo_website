import { getSeoPage } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import AboutHeading from "@/Components/AboutUs/AboutHeading";

export const revalidate = 3600;

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata() {
  const seoData = await getSeoPage("about-us");
  if(!seoData) return {};
 
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.tags
      ? seoData.tags.split(",").map((t) => t.trim())
      : [],
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: `${seoData.canonicalUrl}/about-us`,
      siteName: seoData.siteName,
      images: [{ 
        url: seoData?.ogImage || "/loginPage/contact-about-bg.webp", 
        width: 1200, 
        height: 630, 
        alt: seoData.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData?.description,
      images: [{ url: seoData?.ogImage, width: 1200, height: 630, alt: seoData.title }]
    },
    alternates: {
      canonical: `${seoData.canonicalUrl}/about-us`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AboutUs() {
  const seoData = await getSeoPage("about-us");
  return (
    <div>
      <Banner image={seoData?.banner || "/all-product-banner.webp"} 
      title={seoData?.title || "About Us"} />
      <main className="container">
        <Breadcrumbs />
        <AboutHeading/>
      </main>
    </div>
  );
}