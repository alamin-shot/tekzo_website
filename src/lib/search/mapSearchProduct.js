import { resolveProductImage } from "./resolveProductImage";

// Adapter between the backend's raw product rows and the search UI.
// /search-products currently returns raw DB rows (no prices, S3 images, heavy
// HTML fields); /featured-products returns priced rows. Both map to:
//   { id, slug, name, image, price, regularPrice, discount, badges, inStock }
// Prices are a finite number or null, never undefined/NaN/strings.

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const firstVariant = (row) =>
  Array.isArray(row?.variants) && row.variants.length ? row.variants[0] : null;

export function mapSearchProduct(row) {
  const variant = firstVariant(row);
  const regularPrice =
    toNumber(row?.regular_price) ?? toNumber(variant?.regular_price);
  const price =
    toNumber(row?.final_price) ?? toNumber(variant?.final_price) ?? regularPrice;

  return {
    id: row?.id ?? null,
    slug: typeof row?.slug === "string" ? row.slug : "",
    name: typeof row?.product_name === "string" ? row.product_name : "",
    image: resolveProductImage(row?.product_image),
    price,
    regularPrice,
    discount: toNumber(row?.discount_amount) ?? toNumber(variant?.discount_amount),
    badges: {
      official: Boolean(row?.official_warranty),
      unofficial: Boolean(row?.is_unofficial),
      chinese: Boolean(row?.is_chinese),
      refurbished: Boolean(row?.is_refurbished),
    },
    // Only trust an explicit flag; the raw `stock` column is not reliable.
    inStock: typeof row?.is_stock === "boolean" ? row.is_stock : null,
  };
}

// A real discount: positive and smaller than the regular price.
export const hasRealDiscount = (product) =>
  product?.discount > 0 &&
  product?.regularPrice !== null &&
  product.discount < product.regularPrice;

// Accepts every envelope the API has been seen to use and always returns an
// array of mapped products ({ data: [...] }, { data: { data: [...] } },
// { products: [...] } or a bare array). Anything else becomes [].
export function normalizeSearchResponse(body) {
  const list = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.data?.data)
        ? body.data.data
        : Array.isArray(body?.products)
          ? body.products
          : [];

  return list
    .filter((row) => row && typeof row === "object" && row.slug)
    .map(mapSearchProduct);
}
