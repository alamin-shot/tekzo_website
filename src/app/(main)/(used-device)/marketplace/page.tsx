import Banner from "@/Components/ReuseableComponent/Banner";
import { pageCanonical } from "@/lib/seo/jsonLd";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import FilterSidebar from "@/Components/Marketplace/FilterSidebar";
import ProductSection from "@/Components/Marketplace/ProductSection";
import MobileFilterButton from "@/Components/Marketplace/MobileFilterButton";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import Pagination from "@/Components/Shop/Pagination";
import { getGroupedPreOwnedProducts, getPreOwnedBrands } from "@/lib/api";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import MarketplaceHeader from "@/Components/Marketplace/MarketplaceHeader";
import type { Metadata } from "next";
import type { SearchPageProps } from "@/types/route";
import { fieldsOf, lengthStrict, mapList, rec, requireString } from "@/lib/json";
import { idKey, str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

// ─── Dynamic Metadata ─────────────────────────────────────
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { page, brand } = await searchParams;
  const currentPage = Number(page) || 1;
  const selectedBrandSlugs = brand
    ? requireString(brand).split(",").filter(Boolean)
    : undefined;

  // Same args as the page body's call below so React's cache() dedupes this
  // into a single request instead of firing two origin API calls.
  const { seoData: seoRaw } = fieldsOf(await getGroupedPreOwnedProducts(
    currentPage,
    undefined,
    undefined,
    selectedBrandSlugs,
  ));
  const seoData = rec(seoRaw);
  const title = str(seoData?.title);
  const description = str(seoData?.description) ?? "";
  const keywords = tagsOr(seoData?.tags, []);
  const canonical = pageCanonical(seoData?.canonicalUrl, "/marketplace");
  const ogImage = str(seoData?.ogImage) || "/all-product-banner.webp";
  const siteName = str(seoData?.siteName);

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

// Server Component - No "use client" directive
export default async function Marketplace({ searchParams }: SearchPageProps) {
  const { page, brand } = await searchParams;
  const currentPage = Number(page) || 1;
  const selectedBrandSlugs = brand
    ? requireString(brand).split(",").filter(Boolean)
    : undefined;

  const [brands, groupedRaw] = await Promise.all([
    getPreOwnedBrands(),
    getGroupedPreOwnedProducts(
      currentPage,
      undefined,
      undefined,
      selectedBrandSlugs,
    ),
  ]);
  const { groups, pagination, seoData: seoRaw } = fieldsOf(groupedRaw);
  const seoData = rec(seoRaw);

  return (
    <div>
      <Banner
        image={seoData?.banner || "/all-product-banner.webp"}
        title={seoData?.title || "TEKZO Marketplace"}
      />

      <div className="">
        <Breadcrumbs />

        <main className="">
          {/* Marketplace Header with Logo, Title & Links */}
          <MarketplaceHeader />

          {/* Mobile Filter Button - Client Component */}
          <MobileFilterButton brands={brands} />

          {/* Layout with Sidebar and Products */}
          <div className="flex gap-8 items-start">
            {/* Filter Sidebar - Client Component for interactivity */}
            <FilterSidebar brands={brands} />

            {/* Products Section - Server Component */}
            <div className="flex-1 min-w-0">
              {Number(lengthStrict(groups)) > 0 ? (
                mapList(groups, (group) => {
                  const { product, preOwneds } = fieldsOf(group);
                  return (
                  <ProductSection
                    key={idKey(product)}
                    title={fieldsOf(product).name}
                    products={preOwneds}
                    slug={fieldsOf(product).slug}
                  />
                );
                })
              ) : (
                <NoProductFound />
              )}

              <Pagination
                shopProducts={{ pagination }}
                currentPage={currentPage}
              />
            </div>
          </div>
        </main>
        <PageDescription
          title="Learn More About Tekzo Marketplace"
          description={seoData?.page_description}
        />
      </div>
    </div>
  );
}
