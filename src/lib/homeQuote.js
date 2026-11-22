import { getFeaturedProducts, getFlashSaleData, getProductReviews } from "@/lib/api";

const REVIEW_SAMPLE = 16;

// Best real customer review among products shown on the homepage (featured +
// flash sale): a written comment with a named customer, highest rating
// first, then longest. Returns plain data for the client FAQ, or null — never
// a made-up quote.
export async function getHomeCustomerQuote() {
  try {
    const [{ products: flash }, featured] = await Promise.all([getFlashSaleData({ limit: 12 }), getFeaturedProducts()]);
    // featured-products may be a flat list or groups of { products: [] }
    const featuredFlat = (Array.isArray(featured) ? featured : []).flatMap((x) => (Array.isArray(x?.products) ? x.products : [x]));
    const seen = new Set();
    const sample = [...featuredFlat, ...(flash || [])]
      .filter((p) => p?.slug && !seen.has(p.slug) && seen.add(p.slug))
      .slice(0, REVIEW_SAMPLE);

    const results = await Promise.all(
      sample.map(async (p) => {
        const data = await getProductReviews(p.slug);
        return (data?.reviews?.data || []).map((r) => ({ ...r, product: p }));
      }),
    );

    const best = results
      .flat()
      .filter((r) => r?.customer?.name && String(r?.comment || "").trim().length >= 30)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || String(b.comment).length - String(a.comment).length)[0];

    return best
      ? {
          text: String(best.comment).replace(/\s+/g, " ").trim().slice(0, 280),
          author: best.customer.name,
          rating: best.rating,
          productName: best.product.product_name,
          productSlug: best.product.slug,
        }
      : null;
  } catch {
    return null;
  }
}
