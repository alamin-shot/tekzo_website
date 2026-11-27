import Banner from "@/Components/ReuseableComponent/Banner";
import ProductListJsonLd from "@/Components/SEO/ProductListJsonLd";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import RefurbishedProductGrid from "@/Components/Refurbished/RefurbishedProductGrid";
import { getRefurbishedBrands, getRefurbishedProducts } from "@/lib/api";
import type { Metadata } from "next";
import type { SearchPageProps } from "@/types/route";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";

export const revalidate = 3600;

// ─── Metadata Generation ───────────────────────────────────────
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const result = await getRefurbishedProducts();
  const seoData = rec(rec(result?.data)?.seoData);
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

  const title = str(seoData?.title) || "Certified Refurbished Smartphones | Best Prices & Warranty | Tekzo";
  const description = str(seoData?.description) || "Browse top certified refurbished smartphones at Tekzo. Best prices, authentic quality, and official warranty in Bangladesh.";
  // Was /refurbished-smartphones, which 404s.
  const canonical = `${baseUrl}/refurbished`;
  const ogImage = str(seoData?.banner) || "/all-product-banner.webp";

  return {
    title,
    description,
    keywords: str(seoData?.meta_keywords) || "refurbished smartphones, used iphones, galaxy refurbished, pixel phones, tekzo, bangladesh",
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: str(seoData?.siteName) || "Tekzo",
      type: "website",
      images: [
        {
          url: "/sidebar-icons/used-device.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: "/sidebar-icons/used-device.png",
    },
  };
}

// ─── Page Component ───────────────────────────────────────
export default async function RefurbishedPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const currentBrand = params?.brand || "";
  const searchQuery = params?.search || "";

  // Fetch refurbished brands, category SEO, and refurbished smartphone products in parallel
  const [brands, refurbishedResult] = await Promise.all([
    getRefurbishedBrands(),
    getRefurbishedProducts({
      per_page: 100,
    }),
  ]);

  // Bug kept (N21): this read `.data` off the fetcher function itself, so seoData is always undefined
  // and the banner / title / description fallbacks always render.
  const seoData = rec(undefined);
  const allProducts = refurbishedResult?.products || refurbishedResult?.data || [];

  return (
    <div>
      <div className="overflow-visible">
        <ProductListJsonLd products={allProducts} path="/refurbished" name={seoData?.title || "Refurbished Smartphones"} />
        <Banner image={seoData?.banner || "/all-product-banner.webp"} title={seoData?.title || "Refurbished Smartphones"} />
      </div>
      <main>
        <Breadcrumbs />
        <RefurbishedProductGrid initialProducts={allProducts} brands={brands} initialBrand={currentBrand} initialSearch={searchQuery} />
      </main>
      <PageDescription
        title="Learn More About Our Refurbished Smartphones"
        description={
          seoData?.page_description ||
          "Explore our selection of certified refurbished smartphones. Each device undergoes rigorous testing, multi-point quality inspection, and official certification to guarantee reliable performance, battery health, and original hardware integrity at an accessible price."
        }
      />
    </div>
  );
}
