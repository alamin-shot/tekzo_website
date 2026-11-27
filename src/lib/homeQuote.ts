import type { HomeCustomerQuote } from "@/types/content";
import type { JsonRecord } from "@/types/json";
import { getFeaturedProducts, getFlashSaleData, getProductReviews } from "@/lib/api";
import { isList, orList, rec } from "@/lib/json";

const REVIEW_SAMPLE = 16;

// Best real customer review among products shown on the homepage (featured +
// flash sale): a written comment with a named customer, highest rating
// first, then longest. Returns plain data for the client FAQ, or null — never
// a made-up quote.
export async function getHomeCustomerQuote(): Promise<HomeCustomerQuote | null> {
  try {
    const [{ products: flash }, featured] = await Promise.all([getFlashSaleData({ limit: 12 }), getFeaturedProducts()]);
    // featured-products may be a flat list or groups of { products: [] }
    const featuredFlat = (isList(featured) ? featured : []).flatMap((x: unknown) => {
      const products = rec(x)?.products;
      return isList(products) ? products : [x];
    });
    const seen = new Set<unknown>();
    // JS `[...(flash || [])]`: arrays spread, other truthy JSON values throw
    // (→ catch → null). A string would spread into slug-less characters that
    // the filter below drops, i.e. contributes nothing.
    const flashList: unknown[] = typeof flash === "string" ? [] : orList(flash);
    const sample = [...featuredFlat, ...flashList]
      .filter((p) => {
        const slug = rec(p)?.slug;
        return slug && !seen.has(slug) && seen.add(slug);
      })
      .slice(0, REVIEW_SAMPLE);

    const results = await Promise.all(
      sample.map(async (p) => {
        const data = await getProductReviews(rec(p)?.slug);
        // `{ ...r, product: p }` — Object.assign({}, r) copies what spread copies.
        return orList(rec(rec(data)?.reviews)?.data).map((r): JsonRecord => ({ ...Object.assign({}, r), product: p }));
      }),
    );

    const best = results
      .flat()
      .filter((r: JsonRecord) => rec(r?.customer)?.name && String(r?.comment || "").trim().length >= 30)
      .sort(
        (a: JsonRecord, b: JsonRecord) =>
          Number(b.rating || 0) - Number(a.rating || 0) || String(b.comment).length - String(a.comment).length,
      )[0];

    return best
      ? {
          text: String(best.comment).replace(/\s+/g, " ").trim().slice(0, 280),
          author: rec(best.customer)?.name,
          rating: best.rating,
          productName: rec(best.product)?.product_name,
          productSlug: rec(best.product)?.slug,
        }
      : null;
  } catch {
    return null;
  }
}
