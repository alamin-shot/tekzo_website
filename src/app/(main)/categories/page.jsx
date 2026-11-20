import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import CategoryList from "@/Components/Categories/CategoryList";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import CategorySearchFilter from "@/Components/Categories/CategorySearchFilter";
import { getCategoryProducts } from "@/lib/api";

const revalidate = 3600;
// ─── Metadata Generation ───────────────────────────────────────
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;

  const result = await getCategoryProducts();
  const seoData = result?.data?.seoData;

  return {
    title: seoData?.title || "Categories | Shop by Category",

    description: seoData?.description || "Browse all product categories",

    keywords: seoData?.meta_keywords || "categories, products, shop",

    openGraph: {
      title: seoData?.meta_title || "Categories",
      description: seoData?.meta_description || "Browse all product categories",

      images: [
        {
          url: seoData?.logo,
          width: 1200,
          height: 630,
          alt: seoData?.meta_title || "Categories",
        },
      ],
    },
  };
}

// ─── Page Component ───────────────────────────────────────
const Categories = async ({ searchParams }) => {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  const currentCategory = params?.category || "";
  const searchQuery = params?.search || "";

  // Fetch data on the server
  const result = await getCategoryProducts();
  const categories = result?.data?.categories || [];
  const seoData = result?.data?.seoData;

  return (
    <div>
      <Banner image={seoData?.banner || "/all-product-banner.webp"} title={seoData?.title || "categories"} />
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
