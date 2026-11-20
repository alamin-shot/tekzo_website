// app/brands/page.jsx

import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import BrandsWithFilter from "@/Components/Brands/BrandsWithFilter";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getAllBrands } from "@/lib/api";

export const revalidate = 3600;

export async function generateMetadata() {
  const result = await getAllBrands();
  const seo = result?.data?.seoData;

  const title = seo?.title || "Brands";
  const description = seo?.description ? seo.description : "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const canonical = seo?.canonical || "/brands";
  const ogImage = seo?.logo || "/all-product-banner.webp";
  const siteName = seo?.siteName || "Tekzo";

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
  const seo = result?.data?.seoData;
  const brands = result?.data?.brands || [];

  return (
    <div>
      <Banner image={seo?.banner || "/all-product-banner.webp"} title={seo?.title || "Brands"} />
      <main className="">
        <Breadcrumbs />

        <BrandsWithFilter initialBrands={brands} seoData={seo} />

        <PageDescription title="Learn More About Our Brands" description={seo?.page_description} />
      </main>
    </div>
  );
};

export default BrandsCategory;
