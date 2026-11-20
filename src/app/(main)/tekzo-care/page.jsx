import Banner from "@/Components/ReuseableComponent/Banner";
import TekzoCareAbout from "@/Components/TekzoCare/TekzoCareAbout";
import TekzoCareFeatures from "@/Components/TekzoCare/TekzoCareFeatures";
import TekzoCareHero from "@/Components/TekzoCare/TekzoCareHero";
import TekzoCareMetrics from "@/Components/TekzoCare/TekzoCareMetrics";
import TekzoCarePromises from "@/Components/TekzoCare/TekzoCarePromises";
import TekzoCareServices from "@/Components/TekzoCare/TekzoCareServices";
import TekzoCareValueProposition from "@/Components/TekzoCare/TekzoCareValueProposition";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getSeoPage } from "@/lib/api";

export const revalidate = 3600;

const FALLBACK_TITLE = "Tekzo Care | Device Protection & Support Plans";
const FALLBACK_DESCRIPTION = "Explore Tekzo Care protection plans and support services for your devices. Reliable coverage, fast service and peace of mind.";
const FALLBACK_IMAGE = "/all-product-banner.webp";

export async function generateMetadata() {
  const seoData = await getSeoPage("tekzo-care");

  const title = seoData?.title || FALLBACK_TITLE;
  const description = seoData?.description || FALLBACK_DESCRIPTION;
  const image = seoData?.ogImage || FALLBACK_IMAGE;
  const canonical = seoData?.canonicalUrl ? `${seoData.canonicalUrl}/tekzo-care` : "/tekzo-care";

  return {
    title,
    description,
    keywords: seoData?.tags ? seoData.tags.split(",").map((t) => t.trim()) : "tekzo care, device protection plan, device support, warranty, tekzo",
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: seoData?.siteName,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function page() {
  const seoData = await getSeoPage("tekzo-care");

  return (
    <div>
      <Banner image={seoData?.banner || FALLBACK_IMAGE} title={seoData?.title || "Tekzo Care"} />
      <TekzoCareHero></TekzoCareHero>
      <TekzoCareAbout></TekzoCareAbout>
      <TekzoCareServices></TekzoCareServices>
      <TekzoCareMetrics></TekzoCareMetrics>
      <TekzoCarePromises></TekzoCarePromises>
      <TekzoCareFeatures></TekzoCareFeatures>
      <TekzoCareValueProposition></TekzoCareValueProposition>
      <div className="">
        <PageDescription title="Learn More About TEKZO Care & Warranty" description={seoData?.description || FALLBACK_DESCRIPTION} />
      </div>
    </div>
  );
}
