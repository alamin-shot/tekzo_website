import { cache } from "react";
import type { RefurbishedResult } from "@/types/device";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { isList, rec } from "@/lib/json";
import { dataOf, logFetchError, setIf } from "./shared";

// ---------- Pre-owned / used devices ----------

export const getHomePreOwnedProducts = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/home-pre-owned-products", {
      tags: ["used-devices"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Home Pre-owned Products Fetch Error:", err);
    return [];
  }
});

export const getGroupedPreOwnedProducts = cache(async (page?: unknown, perPage?: unknown, limit?: unknown, brandSlugs?: unknown): Promise<unknown> => {
  try {
    const query = new URLSearchParams();
    setIf(query, "page", page);
    setIf(query, "per_page", perPage);
    setIf(query, "limit", limit);
    // JS: `if (brandSlugs?.length) query.set("brand", brandSlugs.join(","))` —
    // a non-array with a length (e.g. a string) threw on .join; kept.
    const slugsLength = typeof brandSlugs === "string" ? brandSlugs.length : rec(brandSlugs)?.length;
    if (slugsLength) {
      if (!isList(brandSlugs)) throw new TypeError("brandSlugs.join is not a function");
      query.set("brand", brandSlugs.join(","));
    }
    const qs = query.toString();
    const endpoint = qs ? `/pre-owneds/grouped?${qs}` : "/pre-owneds/grouped";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["used-devices"],
      revalidate: false,
    });
    return dataOf(result) ?? { groups: [], pagination: null, seoData: null };
  } catch (err) {
    logFetchError("Grouped Pre-owned Products Fetch Error:", err);
    return { groups: [], pagination: null, seoData: null };
  }
});

// Brands with at least one available pre-owned unit — for the marketplace
// filter sidebar (narrower than the site-wide brand list).
export const getPreOwnedBrands = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/pre-owneds/brands", {
      tags: ["used-devices"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Pre-owned Brands Fetch Error:", err);
    return [];
  }
});

export const getUsedDevices = cache(async (query: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/pre-owneds?${query}`, {
      tags: ["used-devices"],
      revalidate: false,
    });
    return dataOf(result) ?? { pre_owneds: [], seoData: null, pagination: null };
  } catch (err) {
    logFetchError("Used Devices Fetch Error:", err);
    return { pre_owneds: [], seoData: null, pagination: null };
  }
});

export const getPreOwnedProducts = cache(async (slug: unknown, page?: unknown): Promise<unknown> => {
  try {
    const endpoint = page ? `/pre-owneds/${slug}/products?page=${page}` : `/pre-owneds/${slug}/products`;
    return await fetchPublicAPI(endpoint, {
      tags: ["used-devices", `used-device-${slug}`],
      revalidate: false,
    });
  } catch (err) {
    logFetchError("Pre-owned Products Fetch Error:", err);
    return null;
  }
});

// pre-owned product variant — same endpoint prefix, supports preOwnedId, no tags
export const getUsedDeviceProduct = cache(async (slug: unknown, preOwnedId?: unknown): Promise<unknown> => {
  try {
    const endpoint = preOwnedId ? `/product/${slug}?preOwnedId=${preOwnedId}` : `/product/${slug}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["used-devices", `used-device-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Used Device Product Fetch Error:", err);
    return null;
  }
});

export const getPreOwnedRelatedProducts = cache(async (slug: unknown, preOwnedId?: unknown): Promise<unknown> => {
  try {
    const endpoint = `/pre-owned-related/${slug}/products?preOwnedId=${preOwnedId}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["used-devices", `used-device-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Pre-owned Related Products Fetch Error:", err);
    return [];
  }
});

export const getConditions = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/conditions");
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Conditions Fetch Error:", err);
    return [];
  }
});

export const getStorages = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/storages");
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Storages Fetch Error:", err);
    return [];
  }
});

// ---------- Refurbished ----------

const refurbishedResult = (result: unknown): RefurbishedResult => {
  const data = rec(dataOf(result));
  return {
    products: data?.data ?? [],
    data: data?.data ?? [],
    pagination: data?.pagination ?? null,
  };
};

// Accepts (params object) | (query string "a=b" / "?a=b") | positional (brand, page, sortBy, stock, minPrice, maxPrice).
export const getRefurbishedProducts = cache(
  async (
    brandOrParams: unknown = {},
    pageArg?: unknown,
    sortByArg?: unknown,
    stockArg?: unknown,
    minPriceArg?: unknown,
    maxPriceArg?: unknown,
  ): Promise<RefurbishedResult> => {
    try {
      let brand: unknown, page: unknown, sortBy: unknown, stock: unknown, minPrice: unknown, maxPrice: unknown, perPage: unknown, search: unknown;

      const params = rec(brandOrParams);
      if (params) {
        brand = params.brand;
        page = params.page;
        sortBy = params.sort_by || params.sortBy;
        stock = params.stock;
        minPrice = params.min_price || params.minPrice;
        maxPrice = params.max_price || params.maxPrice;
        perPage = params.per_page || params.perPage;
        search = params.search || params.query;
      } else if (typeof brandOrParams === "string" && (brandOrParams.includes("=") || brandOrParams.startsWith("?"))) {
        const qs = brandOrParams.startsWith("?") ? brandOrParams.slice(1) : brandOrParams;
        const endpoint = qs ? `/refurbisheds?${qs}` : "/refurbisheds";
        const result = await fetchPublicAPI(endpoint, {
          tags: ["refurbisheds"],
          revalidate: false,
        });
        return refurbishedResult(result);
      } else {
        brand = brandOrParams;
        page = pageArg;
        sortBy = sortByArg;
        stock = stockArg;
        minPrice = minPriceArg;
        maxPrice = maxPriceArg;
      }

      const query = new URLSearchParams();
      setIf(query, "brand", brand);
      setIf(query, "page", page);
      setIf(query, "sort_by", sortBy);
      setIf(query, "stock", stock);
      setIf(query, "min_price", minPrice);
      setIf(query, "max_price", maxPrice);
      setIf(query, "per_page", perPage);
      setIf(query, "search", search);
      const qs = query.toString();
      const endpoint = qs ? `/refurbisheds?${qs}` : "/refurbisheds";
      const result = await fetchPublicAPI(endpoint, {
        tags: ["refurbisheds"],
        revalidate: false,
      });
      return refurbishedResult(result);
    } catch (err) {
      logFetchError("Refurbished Products Fetch Error:", err);
      return { products: [], data: [], pagination: null };
    }
  },
);

export const getRefurbisheds = getRefurbishedProducts;

export const getRefurbishedBrands = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/refurbished-brands", {
      tags: ["refurbished-brands"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Refurbished Brands Fetch Error:", err);
    return [];
  }
});
