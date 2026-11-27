import { getUsedDevices } from "@/lib/api";
import UsedDeviceClient from "@/Components/UsedDevice/UsedDeviceClient";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import WhyChooseSection from "@/Components/UsedDevice/WhyChooseSection/WhyChooseSection";
import type { Metadata } from "next";
import type { SearchPageProps } from "@/types/route";
import type { UsedDeviceQueryInput } from "@/types/props/product";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

// Fetch products - API only supports brand, category, search pagination
// Filtering (price, stock, sort) will be done client-side
function buildUsedDeviceQuery(params: UsedDeviceQueryInput) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.brand) query.set("brand", String(params.brand));
  if (params.category) query.set("category", String(params.category));
  if (params.search) query.set("search", String(params.search));
  return query.toString();
}

// Dynamic SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  const result = rec(await getUsedDevices(buildUsedDeviceQuery({ page: 1 })));
  const seo = rec(result?.seoData);

  const title = str(seo?.title) || "Used Devices";
  const description = seo?.description ? str(seo.description) : "";
  const keywords = tagsOr(seo?.tags, []);
  const canonical = str(seo?.canonical) || "/used-device";
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

// ✅ SSR — fetch on server with all filter parameters, pass to client
export default async function Page({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const selectedBrand = params?.brand || null;
  const selectedCategory = params?.category || null;
  const searchTerm = params?.search || "";
  const minPrice = params?.min_price || null;
  const maxPrice = params?.max_price || null;
  const sortBy = params?.sort_by || null;
  const stock = params?.stock || null;

  // Fetch from API with only supported filters (brand, category, search)
  const result = rec(await getUsedDevices(
    buildUsedDeviceQuery({
      page: currentPage,
      brand: selectedBrand,
      category: selectedCategory,
      search: searchTerm,
    }),
  ));

  const products = result?.pre_owneds ?? [];
  const filterData = result?.brands ?? [];
  const categories = result?.categoryes ?? []; // Backend typo: "categoryes"
  const seo = rec(result?.seoData);
  const pagination = result?.pagination;

  return (
    <>
      <UsedDeviceClient
        initialProducts={products}
        seoData={seo}
        pagination={pagination}
        currentPage={currentPage}
        filterData={filterData}
        categories={categories}
        selectedBrand={selectedBrand}
        selectedCategory={selectedCategory}
        searchTerm={searchTerm}
        currentFilters={{
          min_price: minPrice || "",
          max_price: maxPrice || "",
          sort_by: sortBy || "",
          brand: selectedBrand || "",
          category: selectedCategory || "",
          stock: stock || "",
        }}
      />

      <WhyChooseSection brandName={seo?.siteName || "Tekzo"} />

      <PageDescription
        title="Learn More About Pre-Owned Devices"
        description={seo?.long_description}
      />
    </>
  );
}
