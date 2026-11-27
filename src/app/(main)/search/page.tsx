import React, { Suspense } from "react";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Filter from "@/Components/Shop/Filter";
import ShopProducts from "@/Components/Shop/ShopProducts";
import Pagination from "@/Components/Shop/Pagination";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import Loader from "@/Components/Loader/Loader";
import type { SearchPageProps, SearchParamsRecord } from "@/types/route";
import { lengthOpt, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";
import { setIf } from "@/lib/api/shared";

async function getSearchProducts(params: SearchParamsRecord) {
  try {
    const query = new URLSearchParams();

    setIf(query, "query", params.query);
    setIf(query, "page", params.page);
    setIf(query, "min_price", params.min_price);
    setIf(query, "max_price", params.max_price);
    setIf(query, "sort_by", params.sort_by);
    setIf(query, "brand", params.brand);
    setIf(query, "stock", params.stock);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/search?${query.toString()}`,
      {
        headers: {
          Accept: "application/json",
          ...(process.env.INTERNAL_API_TOKEN && { "X-Internal-Token": process.env.INTERNAL_API_TOKEN }),
        },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();

    // Normalise: API may return { data: { products: {...}, seoData: {...} } }
    // or { data: { data: [...], pagination: {...} } } — handle both shapes
    const inner = rec(data)?.data;
    const innerRec = rec(inner);
    if (innerRec?.products) {
      return { products: innerRec.products, seoData: innerRec.seoData || null };
    }
    // Flat shape: data itself is the paginated products object
    return { products: inner || data, seoData: null };
  } catch (err) {
    console.error("Search fetch error:", err);
    return { products: null, seoData: null };
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
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

const SearchPage = async ({ searchParams }: SearchPageProps) => {
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
    Number(lengthOpt(rec(products)?.data)) > 0 || Number(lengthOpt(rec(rec(products)?.products)?.data)) > 0;

  // Normalise products to the shape ShopProducts / Pagination expect
  const normalisedProducts = rec(products)?.products || products;

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
                &ldquo;{nodeOf(searchQuery)}&rdquo;
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
