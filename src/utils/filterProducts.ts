import type { FilterParams } from "@/types/json";
import { isList, rec, requireString } from "@/lib/json";

// Product price used for filtering/sorting: final_price, else regular_price.
// parseFloat(String(x)) is exactly parseFloat(x) (parseFloat applies ToString).
const priceOf = (p: unknown): number => parseFloat(String(rec(p)?.final_price ?? rec(p)?.regular_price)) || 0;

/**
 * Client/server helper to filter and sort products based on standard filter parameters
 * (min_price, max_price, sort_by, brand, category, stock).
 */
export function filterAndSortProducts(products: unknown = [], filters: FilterParams = {}): unknown[] {
  if (!isList(products)) return [];
  let result: unknown[] = [...products];

  // 1. Min Price filter
  if (filters.min_price) {
    const min = parseFloat(String(filters.min_price));
    if (!isNaN(min)) {
      result = result.filter((p) => priceOf(p) >= min);
    }
  }

  // 2. Max Price filter
  if (filters.max_price) {
    const max = parseFloat(String(filters.max_price));
    if (!isNaN(max)) {
      result = result.filter((p) => priceOf(p) <= max);
    }
  }

  // 3. Stock Availability filter
  if (filters.stock === "in_stock") {
    result = result.filter((p) => {
      const s = rec(p)?.is_stock;
      return s === true || s === 1 || s === "1" || s === "true";
    });
  } else if (filters.stock === "out_of_stock") {
    result = result.filter((p) => {
      const s = rec(p)?.is_stock;
      return !s || s === false || s === 0 || s === "0" || s === "false";
    });
  }

  // 4. Category filter
  if (filters.category) {
    const target = requireString(filters.category).toLowerCase().replace(/[-_]/g, "");
    result = result.filter((p) => {
      const item = rec(p);
      const category = item?.category;
      const slug = requireString(rec(category)?.slug || item?.category_slug || (typeof category === "string" ? category : ""))
        .toLowerCase()
        .replace(/[-_]/g, "");
      const name = requireString(rec(category)?.name || "")
        .toLowerCase()
        .replace(/[-_]/g, "");
      return slug === target || name === target || slug.includes(target);
    });
  }

  // 5. Brand filter
  if (filters.brand) {
    const target = requireString(filters.brand).toLowerCase().trim();
    result = result.filter((p) => {
      const item = rec(p);
      const bSlug = requireString(rec(item?.brand)?.slug || item?.brand_slug || "").toLowerCase();
      const bName = requireString(rec(item?.brand)?.name || "").toLowerCase();
      const pName = requireString(item?.product_name || "").toLowerCase();

      if (bSlug && (bSlug === target || bName === target)) return true;

      if (target === "samsung" && (pName.includes("samsung") || pName.includes("galaxy"))) {
        return true;
      }
      if (target === "xiaomi" && (pName.includes("xiaomi") || pName.includes("redmi") || pName.includes("poco") || pName.includes("mi "))) {
        return true;
      }
      if (
        target === "apple" &&
        (pName.includes("apple") ||
          pName.includes("iphone") ||
          pName.includes("ipad") ||
          pName.includes("macbook") ||
          pName.includes("airpods") ||
          pName.includes("watch"))
      ) {
        return true;
      }
      if (target === "nothing" && (pName.includes("nothing") || pName.includes("cmf"))) {
        return true;
      }
      if (target === "oneplus" && (pName.includes("oneplus") || pName.includes("one plus") || pName.includes("nord"))) {
        return true;
      }
      if (target === "realme" && (pName.includes("realme") || pName.includes("narzo"))) {
        return true;
      }
      if (target === "google" && (pName.includes("google") || pName.includes("pixel"))) {
        return true;
      }
      if (target === "motorola" && (pName.includes("motorola") || pName.includes("moto"))) {
        return true;
      }

      return pName.includes(target);
    });
  }

  // 6. Sort By
  if (filters.sort_by === "price_asc") {
    result.sort((a, b) => priceOf(a) - priceOf(b));
  } else if (filters.sort_by === "price_desc") {
    result.sort((a, b) => priceOf(b) - priceOf(a));
  }

  return result;
}
