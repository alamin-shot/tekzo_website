import type { Metadata } from "next";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Pagination from "@/Components/Shop/Pagination";
import OfferCard from "./OfferCard";
import { getOffers } from "@/lib/api";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { SearchPageProps } from "@/types/route";
import { fieldsOf, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { page } = fieldsOf(await searchParams);
  const currentPage = Number(page) || 1;

  const data = await getOffers({ page: currentPage });
  const seo = rec(rec(data)?.seoData);

  const title = str(seo?.title) ?? "Offers";
  const description = str(seo?.description) ?? "";
  const keywords = tagsOr(seo?.tags, []);
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = str(seo?.canonical) || `${baseUrl}/shop/offer`;
  const ogImage = str(seo?.ogImage) || "/all-product-banner.webp";
  const siteName = str(seo?.siteName);

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

export default async function Offer({ searchParams }: SearchPageProps) {
  const { page } = fieldsOf(await searchParams);
  const currentPage = Number(page) || 1;

  const { offers, seoData, pagination } = fieldsOf(await getOffers({
    page: currentPage,
  }));
  const seo = rec(seoData);

  return (
    <div>
      <Banner h1="Offers"
        image={seo?.banner || "/all-product-banner.webp"}
        title={seo?.title || "Offers"}
        hideImageOnMobile={undefined}
      />
      <div>
        <Breadcrumbs />
        <OfferCard offers={offers} />
        <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
      </div>
      <PageDescription
        title="Learn More About Offers & Deals"
        description={seo?.page_description}
      />
    </div>
  );
}
