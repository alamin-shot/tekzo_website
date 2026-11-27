import type { SearchProduct } from "@/types/product";
import { isList, rec } from "@/lib/json";
import { resolveProductImage } from "./resolveProductImage";

// Adapter between the backend's raw product rows and the search UI.
// /search-products currently returns raw DB rows (no prices, S3 images, heavy
// HTML fields); /featured-products returns priced rows. Both map to:
//   { id, slug, name, image, price, regularPrice, discount, badges, inStock }
// Prices are a finite number or null, never undefined/NaN/strings.

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const firstVariant = (row: unknown): unknown => {
  const variants = rec(row)?.variants;
  return isList(variants) && variants.length ? variants[0] : null;
};

export function mapSearchProduct(row: unknown): SearchProduct {
  const r = rec(row);
  const variant = rec(firstVariant(row));
  const regularPrice = toNumber(r?.regular_price) ?? toNumber(variant?.regular_price);
  const price = toNumber(r?.final_price) ?? toNumber(variant?.final_price) ?? regularPrice;

  return {
    id: r?.id ?? null,
    slug: typeof r?.slug === "string" ? r.slug : "",
    name: typeof r?.product_name === "string" ? r.product_name : "",
    image: resolveProductImage(r?.product_image),
    price,
    regularPrice,
    discount: toNumber(r?.discount_amount) ?? toNumber(variant?.discount_amount),
    badges: {
      official: Boolean(r?.official_warranty),
      unofficial: Boolean(r?.is_unofficial),
      chinese: Boolean(r?.is_chinese),
      refurbished: Boolean(r?.is_refurbished),
    },
    // Only trust an explicit flag; the raw `stock` column is not reliable.
    inStock: typeof r?.is_stock === "boolean" ? r.is_stock : null,
  };
}

const isNumOrNull = (v: unknown): v is number | null => v === null || typeof v === "number";

/**
 * Structural check for a mapped search product (the exact shape
 * mapSearchProduct produces). Used where SearchProducts come back as JSON
 * from /api/search.
 */
export function isSearchProduct(value: unknown): value is SearchProduct {
  const r = rec(value);
  const b = rec(r?.badges);
  return (
    !!r &&
    typeof r.slug === "string" &&
    typeof r.name === "string" &&
    typeof r.image === "string" &&
    isNumOrNull(r.price) &&
    isNumOrNull(r.regularPrice) &&
    isNumOrNull(r.discount) &&
    (r.inStock === null || typeof r.inStock === "boolean") &&
    !!b &&
    typeof b.official === "boolean" &&
    typeof b.unofficial === "boolean" &&
    typeof b.chinese === "boolean" &&
    typeof b.refurbished === "boolean"
  );
}

// A real discount: positive and smaller than the regular price.
// (`null > 0` and `undefined > 0` are false in JS, matching the checks below.)
export const hasRealDiscount = (product: SearchProduct | null | undefined): boolean => {
  const discount = product?.discount;
  const regularPrice = product?.regularPrice;
  return discount != null && discount > 0 && regularPrice !== null && regularPrice !== undefined && discount < regularPrice;
};

// Accepts every envelope the API has been seen to use and always returns an
// array of mapped products ({ data: [...] }, { data: { data: [...] } },
// { products: [...] } or a bare array). Anything else becomes [].
export function normalizeSearchResponse(body: unknown): SearchProduct[] {
  const b = rec(body);
  const data = rec(b?.data);
  const list: unknown[] = isList(body)
    ? body
    : isList(b?.data)
      ? b.data
      : isList(data?.data)
        ? data.data
        : isList(b?.products)
          ? b.products
          : [];

  return list.filter((row) => rec(row)?.slug).map(mapSearchProduct);
}
