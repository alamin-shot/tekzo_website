/**
 * Client/server helper to filter and sort products based on standard filter parameters
 * (min_price, max_price, sort_by, brand, category, stock).
 */
export function filterAndSortProducts(products = [], filters = {}) {
  if (!Array.isArray(products)) return [];
  let result = [...products];

  // 1. Min Price filter
  if (filters.min_price) {
    const min = parseFloat(filters.min_price);
    if (!isNaN(min)) {
      result = result.filter(
        (p) => (parseFloat(p?.final_price ?? p?.regular_price) || 0) >= min
      );
    }
  }

  // 2. Max Price filter
  if (filters.max_price) {
    const max = parseFloat(filters.max_price);
    if (!isNaN(max)) {
      result = result.filter(
        (p) => (parseFloat(p?.final_price ?? p?.regular_price) || 0) <= max
      );
    }
  }

  // 3. Stock Availability filter
  if (filters.stock === "in_stock") {
    result = result.filter(
      (p) =>
        p?.is_stock === true ||
        p?.is_stock === 1 ||
        p?.is_stock === "1" ||
        p?.is_stock === "true"
    );
  } else if (filters.stock === "out_of_stock") {
    result = result.filter(
      (p) =>
        !p?.is_stock ||
        p?.is_stock === false ||
        p?.is_stock === 0 ||
        p?.is_stock === "0" ||
        p?.is_stock === "false"
    );
  }

  // 4. Category filter
  if (filters.category) {
    const target = filters.category.toLowerCase().replace(/[-_]/g, "");
    result = result.filter((p) => {
      const slug = (
        p?.category?.slug ||
        p?.category_slug ||
        (typeof p?.category === "string" ? p?.category : "")
      )
        .toLowerCase()
        .replace(/[-_]/g, "");
      const name = (p?.category?.name || "").toLowerCase().replace(/[-_]/g, "");
      return slug === target || name === target || slug.includes(target);
    });
  }

  // 5. Brand filter
  if (filters.brand) {
    const target = filters.brand.toLowerCase().trim();
    result = result.filter((p) => {
      const bSlug = (p?.brand?.slug || p?.brand_slug || "").toLowerCase();
      const bName = (p?.brand?.name || "").toLowerCase();
      const pName = (p?.product_name || "").toLowerCase();

      if (bSlug && (bSlug === target || bName === target)) return true;

      if (
        target === "samsung" &&
        (pName.includes("samsung") || pName.includes("galaxy"))
      ) {
        return true;
      }
      if (
        target === "xiaomi" &&
        (pName.includes("xiaomi") ||
          pName.includes("redmi") ||
          pName.includes("poco") ||
          pName.includes("mi "))
      ) {
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
      if (
        target === "nothing" &&
        (pName.includes("nothing") || pName.includes("cmf"))
      ) {
        return true;
      }
      if (
        target === "oneplus" &&
        (pName.includes("oneplus") ||
          pName.includes("one plus") ||
          pName.includes("nord"))
      ) {
        return true;
      }
      if (
        target === "realme" &&
        (pName.includes("realme") || pName.includes("narzo"))
      ) {
        return true;
      }
      if (
        target === "google" &&
        (pName.includes("google") || pName.includes("pixel"))
      ) {
        return true;
      }
      if (
        target === "motorola" &&
        (pName.includes("motorola") || pName.includes("moto"))
      ) {
        return true;
      }

      return pName.includes(target);
    });
  }

  // 6. Sort By
  if (filters.sort_by === "price_asc") {
    result.sort(
      (a, b) =>
        (parseFloat(a?.final_price ?? a?.regular_price) || 0) -
        (parseFloat(b?.final_price ?? b?.regular_price) || 0)
    );
  } else if (filters.sort_by === "price_desc") {
    result.sort(
      (a, b) =>
        (parseFloat(b?.final_price ?? b?.regular_price) || 0) -
        (parseFloat(a?.final_price ?? a?.regular_price) || 0)
    );
  }

  return result;
}
