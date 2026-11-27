import { cache } from "react";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { dataOf, logFetchError, setIf } from "./shared";

// ---------- Sliders ----------

export const getSliders = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/sliders", {
      tags: ["sliders"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Sliders Fetch Error:", err);
    return [];
  }
});

// ---------- Brands ----------

// full brands listing page payload (banner/seo + brand cards) — distinct from getBrands()
export const getAllBrands = cache(async (): Promise<unknown> => {
  try {
    return await fetchPublicAPI("/all-brands", {
      tags: ["brands"],
      revalidate: 3600,
    });
  } catch (err) {
    logFetchError("All Brands Fetch Error:", err);
    return null;
  }
});

// lightweight brand list used by navbar/home/shop
export const getBrands = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/brands", {
      tags: ["brands"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Brands Fetch Error:", err);
    return [];
  }
});

export const getBrandProducts = cache(
  async (
    slug: unknown,
    category?: unknown,
    page?: unknown,
    sortBy?: unknown,
    stock?: unknown,
    minPrice?: unknown,
    maxPrice?: unknown,
    search?: unknown,
  ): Promise<unknown> => {
    try {
      const query = new URLSearchParams();
      setIf(query, "category", category);
      setIf(query, "page", page);
      setIf(query, "sort_by", sortBy);
      setIf(query, "stock", stock);
      setIf(query, "min_price", minPrice);
      setIf(query, "max_price", maxPrice);
      setIf(query, "search", search);
      const qs = query.toString();
      const endpoint = qs ? `/brand/${slug}/products?${qs}` : `/brand/${slug}/products`;
      const result = await fetchPublicAPI(endpoint, {
        tags: ["brands", `brand-${slug}`],
        revalidate: false,
      });
      return dataOf(result) ?? null;
    } catch (err) {
      logFetchError("Brand Products Fetch Error:", err);
      return null;
    }
  },
);

// ---------- Category tree (nested, for Sell Your Device category select) ----------

export const getCategoryTree = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/category-tree", {
      tags: ["categories"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Category Tree Fetch Error:", err);
    return [];
  }
});

// ---------- Categories ----------

export const getCategories = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/categories", {
      tags: ["categories"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Categories Fetch Error:", err);
    return [];
  }
});

export const getHomeCategories = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/home-categories", {
      tags: ["categories"],
      revalidate: false,
    });
    return result ?? [];
  } catch (err) {
    logFetchError("Home Categories Fetch Error:", err);
    return [];
  }
});

export const getCategoryProducts = cache(async (): Promise<unknown> => {
  try {
    return await fetchPublicAPI("/category-products", {
      tags: ["categories"],
      revalidate: false,
    });
  } catch (err) {
    logFetchError("Category Products Fetch Error:", err);
    return null;
  }
});

// Lightweight — name/banner only, no product list — so the category page's
// hero banner can render before the full paginated product fetch resolves.
export const getCategoryInfo = cache(async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/category/${slug}`, {
      tags: ["categories", `category-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Category Info Fetch Error:", err);
    return null;
  }
});

export const getCategoryProductsBySlug = cache(
  async (
    slug: unknown,
    brand?: unknown,
    page?: unknown,
    sortBy?: unknown,
    stock?: unknown,
    minPrice?: unknown,
    maxPrice?: unknown,
    search?: unknown,
  ): Promise<unknown> => {
    try {
      const query = new URLSearchParams();
      setIf(query, "brand", brand);
      setIf(query, "page", page);
      setIf(query, "sort_by", sortBy);
      setIf(query, "stock", stock);
      setIf(query, "min_price", minPrice);
      setIf(query, "max_price", maxPrice);
      setIf(query, "search", search);
      // Smaller pages mean fewer product cards to hydrate client-side per
      // request — each card mounts several client components (PreFetchLink
      // links, cart modal trigger), so this directly cuts TBT on category pages.
      query.set("per_page", String(8));
      const qs = query.toString();
      const endpoint = `/category/${slug}/products?${qs}`;
      const result = await fetchPublicAPI(endpoint, {
        tags: ["categories", `category-${slug}`],
        revalidate: false,
      });
      return dataOf(result) ?? null;
    } catch (err) {
      logFetchError("Category Products By Slug Fetch Error:", err);
      return null;
    }
  },
);
