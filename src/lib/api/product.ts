import { cache } from "react";
import type { FilterParams } from "@/types/json";
import type { NewArrivalResult } from "@/types/catalog";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { isList, rec } from "@/lib/json";
import { dataOf, logFetchError, setIf } from "./shared";

// ---------- Products ----------

export const getFeaturedProducts = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/featured-products", {
      tags: ["featured-products"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Featured Products Fetch Error:", err);
    return [];
  }
});

// regular product page — carries revalidation tags
export const getProduct = cache(async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/product/${slug}`, {
      tags: ["products", `product-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Product Fetch Error:", err);
    return null;
  }
});

// Called from a client component (ProductReview.jsx), so not wrapped in
// cache() — that's a Server Component render-pass dedup, meaningless here.
export const getProductReviews = async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/product/${slug}/reviews`, {
      tags: [`reviews-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Product Reviews Fetch Error:", err);
    return null;
  }
};

export const getRelatedProducts = cache(async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/related/${slug}/products`, {
      tags: ["products", `product-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Related Products Fetch Error:", err);
    return [];
  }
});

// ---------- New arrivals ----------

export const getHomeNewArrivalProducts = cache(async (): Promise<unknown[]> => {
  try {
    const result = await fetchPublicAPI("/home-new-arrival-products", {
      tags: ["new-arrival-products"],
      revalidate: false,
    });
    const data = dataOf(result);
    if (isList(data)) {
      return data;
    }
    const nested = rec(data)?.data;
    if (isList(nested)) {
      return nested;
    }
    const products = rec(data)?.products;
    if (isList(products)) {
      return products;
    }
    return [];
  } catch (err) {
    logFetchError("Home New Arrival Products Fetch Error:", err);
    return [];
  }
});

export const getNewArrivalProducts = cache(async (page: unknown = 1, filterParams: FilterParams = {}): Promise<NewArrivalResult> => {
  try {
    const query = new URLSearchParams();
    setIf(query, "page", page);
    setIf(query, "min_price", filterParams.min_price);
    setIf(query, "max_price", filterParams.max_price);
    setIf(query, "sort_by", filterParams.sort_by);
    setIf(query, "brand", filterParams.brand);
    setIf(query, "category", filterParams.category);
    setIf(query, "stock", filterParams.stock);
    const qs = query.toString();
    const endpoint = qs ? `/new-arrival-products?${qs}` : "/new-arrival-products";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["new-arrival-products"],
      revalidate: false,
    });

    const dataObj = dataOf(result);
    const d = rec(dataObj);
    const products: unknown[] = isList(d?.data) ? d.data : isList(dataObj) ? dataObj : isList(d?.products) ? d.products : [];
    const pagination = d?.pagination ?? null;
    const seoData = d?.seoData ?? null;
    const description = d?.description || rec(d?.seoData)?.page_description || null;
    return {
      products,
      pagination,
      seoData,
      description,
    };
  } catch (err) {
    logFetchError("New Arrival Products Fetch Error:", err);
    return { products: [], pagination: null, seoData: null, description: null };
  }
});
