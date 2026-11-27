// app/brands/page.jsx

import type { Metadata } from "next";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import BrandsWithFilter from "@/Components/Brands/BrandsWithFilter";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getAllBrands } from "@/lib/api";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const result = await getAllBrands();
  const seo = rec(rec(rec(result)?.data)?.seoData);

  const title = str(seo?.title) || "Brands";
  const description = seo?.description ? str(seo.description) : "";
  const keywords = tagsOr(seo?.tags, []);
  const canonical = str(seo?.canonical) || "/brands";
  const ogImage = str(seo?.logo) || "/all-product-banner.webp";
  const siteName = str(seo?.siteName) || "Tekzo";

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
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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

const BrandsCategory = async () => {
  const result = await getAllBrands();
  const data = rec(rec(result)?.data);
  const seo = data?.seoData;
  const brands = data?.brands || [];

  return (
    <div>
      <Banner image={rec(seo)?.banner || "/all-product-banner.webp"} title={rec(seo)?.title || "Brands"} h1={undefined} hideImageOnMobile={undefined} />
      <main className="">
        <Breadcrumbs />

        <BrandsWithFilter initialBrands={brands} seoData={seo} />

        <PageDescription title="Learn More About Our Brands" description={rec(seo)?.page_description} />
      </main>
    </div>
  );
};

export default BrandsCategory;
