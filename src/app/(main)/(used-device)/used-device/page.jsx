import { getUsedDevices } from "@/lib/api";
import UsedDeviceClient from "@/Components/UsedDevice/UsedDeviceClient";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import WhyChooseSection from "@/Components/UsedDevice/WhyChooseSection/WhyChooseSection";

// Fetch products - API only supports brand, category, search pagination
// Filtering (price, stock, sort) will be done client-side
function buildUsedDeviceQuery(params) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  return query.toString();
}

// Dynamic SEO Metadata
export async function generateMetadata() {
  const result = await getUsedDevices(buildUsedDeviceQuery({ page: 1 }));
  const seo = result?.seoData;

  const title = seo?.title || "Used Devices";
  const description = seo?.description ? seo.description : "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const canonical = seo?.canonical || "/used-device";
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
export default async function Page({ searchParams }) {
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
  const result = await getUsedDevices(
    buildUsedDeviceQuery({
      page: currentPage,
      brand: selectedBrand,
      category: selectedCategory,
      search: searchTerm,
    }),
  );

  const products = result?.pre_owneds ?? [];
  const filterData = result?.brands ?? [];
  const categories = result?.categoryes ?? []; // Backend typo: "categoryes"
  const seo = result?.seoData;
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
