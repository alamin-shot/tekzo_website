import React, { Suspense } from "react";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Filter from "@/Components/Shop/Filter";
import ShopProducts from "@/Components/Shop/ShopProducts";
import Pagination from "@/Components/Shop/Pagination";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import Loader from "@/Components/Loader/Loader";

async function getSearchProducts(params) {
  try {
    const query = new URLSearchParams();

    if (params.query) query.set("query", params.query);
    if (params.page) query.set("page", params.page);
    if (params.min_price) query.set("min_price", params.min_price);
    if (params.max_price) query.set("max_price", params.max_price);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.brand) query.set("brand", params.brand);
    if (params.stock) query.set("stock", params.stock);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/search?${query.toString()}`,
      { cache: "no-store" },
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    // Normalise: API may return { data: { products: {...}, seoData: {...} } }
    // or { data: { data: [...], pagination: {...} } } — handle both shapes
    const inner = data?.data;
    if (inner?.products) {
      return { products: inner.products, seoData: inner.seoData || null };
    }
    // Flat shape: data itself is the paginated products object
    return { products: inner || data, seoData: null };
  } catch (err) {
    console.error("Search fetch error:", err);
    return { products: null, seoData: null };
  }
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.query || "";
  return {
    title: query ? `Search results for "${query}"` : "Search Products",
    description: `Browse search results for ${query}`,
    robots: { index: true, follow: true },
    other: {
      "content-signal": "search=yes,ai-train=no",
    },
  };
}

const SearchPage = async ({ searchParams }) => {
  const params = await searchParams;
  const searchQuery = params?.query || "";
  const currentPage = Number(params?.page) || 1;

  const { products } = await getSearchProducts({
    query: searchQuery,
    page: currentPage,
    min_price: params?.min_price || null,
    max_price: params?.max_price || null,
    sort_by: params?.sort_by || null,
    brand: params?.brand || null,
    stock: params?.stock || null,
  });

  const hasProducts =
    products?.data?.length > 0 || products?.products?.data?.length > 0;

  // Normalise products to the shape ShopProducts / Pagination expect
  const normalisedProducts = products?.products || products;

  return (
    <div>
      <div className="overflow-visible">
        <Banner h1="Search Results" image={"/all-product-banner.webp"} title={"Search Results"} />
      </div>
      <main>
        {/* Search heading */}
        <div className="my-container mt-6 mb-2">
          {searchQuery ? (
            <p className="text-gray-500 text-sm mt-10 mb-5">
              Showing results for{" "}
              <span className="font-semibold text-gray-900">
                &ldquo;{searchQuery}&rdquo;
              </span>
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Enter a search term to find products.
            </p>
          )}
        </div>

        <Suspense key={`${searchQuery}-${currentPage}`} fallback={<Loader />}>
          {/* <Filter
            currentFilters={{
              min_price: params?.min_price || "",
              max_price: params?.max_price || "",
              sort_by: params?.sort_by || "",
              brand: params?.brand || "",
              stock: params?.stock || "",
            }}
          /> */}

          {hasProducts ? (
            <ShopProducts shopProducts={normalisedProducts} />
          ) : (
            <>
              <title>No Products Found - Tekzo</title>

              <NoProductFound />
            </>
          )}

          <Pagination
            shopProducts={normalisedProducts}
            currentPage={currentPage}
          />
        </Suspense>
      </main>
    </div>
  );
};

export default SearchPage;
