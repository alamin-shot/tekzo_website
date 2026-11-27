import type { Metadata } from "next";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import CategoryList from "@/Components/Categories/CategoryList";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import CategorySearchFilter from "@/Components/Categories/CategorySearchFilter";
import { getCategoryProducts } from "@/lib/api";
import type { SearchPageProps } from "@/types/route";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";

const revalidate = 3600;
// ─── Metadata Generation ───────────────────────────────────────
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;

  const result = await getCategoryProducts();
  const seoData = rec(rec(rec(result)?.data)?.seoData);

  return {
    title: str(seoData?.title) || "Categories | Shop by Category",

    description: str(seoData?.description) || "Browse all product categories",

    keywords: str(seoData?.meta_keywords) || "categories, products, shop",

    openGraph: {
      title: str(seoData?.meta_title) || "Categories",
      description: str(seoData?.meta_description) || "Browse all product categories",

      images: [
        {
          // A missing logo leaves url empty; Next skips images without one, as before.
          url: str(seoData?.logo) ?? "",
          width: 1200,
          height: 630,
          alt: str(seoData?.meta_title) || "Categories",
        },
      ],
    },
  };
}

// ─── Page Component ───────────────────────────────────────
const Categories = async ({ searchParams }: SearchPageProps) => {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  const currentCategory = params?.category || "";
  const searchQuery = params?.search || "";

  // Fetch data on the server
  const result = await getCategoryProducts();
  const data = rec(rec(result)?.data);
  const categories = data?.categories || [];
  const seoData = rec(data?.seoData);

  return (
    <div>
      <Banner image={seoData?.banner || "/all-product-banner.webp"} title={seoData?.title || "categories"} h1={undefined} hideImageOnMobile={undefined} />
      <main className="">
        <Breadcrumbs />

        {/* Search Filter - Client Component */}
        <CategorySearchFilter />

        {/* Category List - Server Component */}
        <CategoryList categoryFilter={currentCategory} searchQuery={searchQuery} />
      </main>
      <PageDescription title="Learn More About Our Categories" description={seoData?.page_description} />
    </div>
  );
};

export default Categories;
