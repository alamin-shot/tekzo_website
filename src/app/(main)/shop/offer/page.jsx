import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Pagination from "@/Components/Shop/Pagination";
import OfferCard from "./OfferCard";
import { getOffers } from "@/lib/api";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";

export async function generateMetadata({ searchParams }) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const data = await getOffers({ page: currentPage });
  const seo = data?.seoData;

  const title = seo?.title ?? "Offers";
  const description = seo?.description ?? "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = seo?.canonical || `${baseUrl}/shop/offer`;
  const ogImage = seo?.ogImage || "/all-product-banner.webp";
  const siteName = seo?.siteName;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "content-signal": "search=yes,ai-train=no",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function Offer({ searchParams }) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { offers, seoData, pagination } = await getOffers({
    page: currentPage,
  });

  return (
    <div>
      <Banner
        image={seoData?.banner || "/all-product-banner.webp"}
        title={seoData?.title || "Offers"}
      />
      <div>
        <Breadcrumbs />
        <OfferCard offers={offers} />
        <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
      </div>
      <PageDescription
        title="Learn More About Offers & Deals"
        description={seoData?.page_description}
      />
    </div>
  );
}
