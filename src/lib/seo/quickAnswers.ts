// Builders for <QuickAnswers>. Every sentence is derived from API data for
// the page — nothing here is invented. When a fact is missing, the question
// is skipped rather than answered vaguely.
import type { JsonRecord } from "@/types/json";
import type { ListedBrandSignals, ListingAnswersInput, QuickAnswerItem, QuickAnswerQuote, QuickAnswers, QuickAnswerSource } from "@/types/seo";
import { isList, orList, rec } from "@/lib/json";
import { brandOfficialSite } from "./brandSites";

const taka = (n: unknown): string => `৳${Math.trunc(Number(n) || 0).toLocaleString("en-US")}`;
const isTrue = (v: unknown): boolean => v === true || v === 1 || v === "1" || v === "true";
// JS `(b.rating || 0) - (a.rating || 0)`: subtraction applies ToNumber.
const num = (v: unknown): number => Number(v);

function brandSources(brand: unknown): QuickAnswerSource[] {
  const url = brandOfficialSite(brand);
  const name = rec(brand)?.name;
  return url && name ? [{ label: `${name} official website`, url }] : [];
}

// ─── Product page ─────────────────────────────────────────────────────
// Brand tagline as an attributed quote — used when a product/brand has no
// written customer review. Real CMS data, attributed to the brand itself.
function taglineQuote(brand: unknown, tagline: unknown): QuickAnswerQuote | null {
  const text = typeof tagline === "string" ? tagline.trim() : "";
  const name = rec(brand)?.name;
  return text && name ? { text, author: name, context: "brand motto" } : null;
}

// Best written review: comment + named customer, highest rating first.
function bestReview(reviewsData: unknown, minLength: number): JsonRecord | undefined {
  const reviews = orList(rec(rec(reviewsData)?.reviews)?.data);
  return reviews
    .map(rec)
    .filter((r): r is JsonRecord => Boolean(r?.comment && rec(r?.customer)?.name && String(r?.comment).trim().length >= minLength))
    .sort((a, b) => num(b.rating || 0) - num(a.rating || 0))[0];
}

// brandTagline: the product's brand tagline from getBrands() (optional).
export function buildProductAnswers(product: unknown, reviewsData: unknown, brandTagline?: unknown): QuickAnswers | null {
  const p = rec(product);
  if (!p?.product_name) return null;
  const name = p.product_name;
  const variants = orList(p.variants)
    .map(rec)
    .filter((v): v is JsonRecord => Number(v?.final_price) > 0);
  const items: QuickAnswerItem[] = [];

  // Price
  if (variants.length) {
    const prices = variants.map((v) => Math.trunc(Number(v.final_price)));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const discounted = variants.find((v) => Number(v.regular_price) > Number(v.final_price));
    let a =
      min === max
        ? `The ${name} price in Bangladesh is ${taka(min)} at TEKZO.`
        : `The ${name} price in Bangladesh starts at ${taka(min)} and goes up to ${taka(max)} at TEKZO, depending on the variant.`;
    if (discounted) a += ` That includes a discount from the regular price of ${taka(discounted.regular_price)}.`;
    if (Number(p.purchase_point) > 0) a += ` Buying it earns you ${p.purchase_point} TEKZO points.`;
    items.push({ q: `What is the price of ${name} in Bangladesh?`, a });
  }

  // Availability
  if (variants.length) {
    const inStock = variants.some((v) => isTrue(v.stock));
    const prebook = variants.some((v) => isTrue(v.is_prebook));
    const booking = Number(p.booking_amount) > 0 ? ` with a booking amount of ${taka(p.booking_amount)}` : "";
    const a = inStock
      ? `Yes. The ${name} is in stock at TEKZO and can be ordered online with home delivery or bought at a TEKZO outlet.`
      : prebook
        ? `The ${name} is available for pre-order at TEKZO${booking}.`
        : `The ${name} is currently out of stock at TEKZO. Contact TEKZO support to be notified when it is back.`;
    items.push({ q: `Is ${name} in stock at TEKZO?`, a });
  }

  // Warranty
  const term = p.warranty_day ? String(p.warranty_day).trim() : "";
  if (term) {
    const kind = isTrue(p.official_warranty)
      ? "official brand warranty"
      : p.service_warranty
        ? "service warranty"
        : isTrue(p.is_unofficial)
          ? "unofficial (TEKZO-provided) warranty"
          : "warranty";
    items.push({
      q: `Does ${name} come with a warranty?`,
      a: `Yes. The ${name} comes with ${term} ${kind} when you buy it from TEKZO.`,
    });
  }

  // Brand / category
  const brandName = rec(p.brand)?.name;
  const categoryName = rec(p.category)?.name;
  if (brandName && categoryName) {
    items.push({
      q: `Who makes ${name}?`,
      a: `The ${name} is made by ${brandName} and is listed under ${categoryName} at TEKZO.`,
    });
  }

  // Real customer review as the attributed quote
  const best = bestReview(reviewsData, 20);
  const quote = best
    ? {
        text: String(best.comment).replace(/\s+/g, " ").trim().slice(0, 280),
        author: rec(best.customer)?.name,
        context: `${best.rating}/5 customer review on TEKZO`,
      }
    : taglineQuote(p.brand, brandTagline);

  return {
    title: `${name}: quick answers`,
    items,
    quote,
    sources: brandSources(p.brand),
    path: `/product/${p.slug}`,
  };
}

// Brands present in a product list, most common first (listing APIs embed
// the brand object, including its CMS tagline).
function listedBrandSignals(list: unknown[]): ListedBrandSignals {
  const counts = new Map<unknown, { brand: JsonRecord; n: number }>();
  for (const item of list) {
    const b = rec(rec(item)?.brand);
    if (!b?.name) continue;
    const key = b.slug || b.name;
    const entry = counts.get(key) || { brand: b, n: 0 };
    entry.n += 1;
    counts.set(key, entry);
  }
  const ranked = [...counts.values()].sort((a, b) => b.n - a.n).map((e) => e.brand);
  const sources = ranked.flatMap(brandSources).slice(0, 4);
  const top = ranked.find((b) => typeof b.tagline === "string" && b.tagline.trim());
  return { quote: top ? taglineQuote(top, top.tagline) : null, sources };
}

// ─── Brand / category listing page ────────────────────────────────────
// `kind` is "brand" or "category"; `entity` is { name, slug } for that page.
export function buildListingAnswers({ kind, entity, products, total, brand, tagline, path }: ListingAnswersInput): QuickAnswers | null {
  const label = rec(entity)?.name;
  const list = (isList(products) ? products : []).filter((item) => rec(item)?.product_name);
  if (!label || !list.length) return null;

  const n = list.length;
  const count = Number(total) > 0 ? Number(total) : n;
  const items: QuickAnswerItem[] = [];

  const prices = list.map((item) => Math.trunc(Number(rec(item)?.final_price) || 0)).filter((x) => x > 0);
  if (prices.length) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const scope = count > n ? `the ${n} ${label} products shown on this page` : `${label} products at TEKZO`;
    items.push({
      q: `How much do ${label} products cost in Bangladesh?`,
      a: min === max ? `Prices for ${scope} are ${taka(min)}.` : `Prices for ${scope} range from ${taka(min)} to ${taka(max)}.`,
    });
  }

  items.push({
    q: `How many ${label} products does TEKZO sell?`,
    a: `TEKZO currently lists ${count} ${label} product${count === 1 ? "" : "s"}${kind === "brand" ? "" : " across all brands"}.`,
  });

  const inStock = list.filter((item) => isTrue(rec(item)?.is_stock)).length;
  items.push({
    q: `Are ${label} products in stock?`,
    a:
      inStock === 0
        ? `None of the ${label} products shown here are in stock right now. Contact TEKZO support to be notified when they are back.`
        : `Yes. ${inStock === n ? `All ${n}` : `${inStock} of the ${n}`} ${label} products shown here ${inStock === 1 ? "is" : "are"} in stock and can be ordered online for home delivery.`,
  });

  const official = list.filter((item) => isTrue(rec(item)?.official_warranty)).length;
  if (official > 0) {
    items.push({
      q: `Do ${label} products at TEKZO have an official warranty?`,
      a:
        official === n
          ? `Yes. ${n === 1 ? "The" : `All ${n}`} ${label} product${n === 1 ? "" : "s"} shown here come${n === 1 ? "s" : ""} with an official brand warranty.`
          : `Yes. ${official} of the ${n} ${label} products shown here come with an official brand warranty.`,
    });
  }

  return {
    title: `${label} at TEKZO: quick answers`,
    items,
    // Brand page: that brand. Category page: derived from the brands actually
    // listed — official sites of each (max 4), motto of the most common one.
    ...(brand ? { quote: taglineQuote(brand, tagline), sources: brandSources(brand) } : listedBrandSignals(list)),
    path,
  };
}

// ─── Used-device (pre-owned) product page ─────────────────────────────
// `variants` here is the listing's attribute list: [{ name: "Condition", value: "Good" }, …]
export function buildUsedDeviceAnswers(device: unknown, brandTagline: unknown, path: unknown): QuickAnswers | null {
  const d = rec(device);
  if (!d?.product_name) return null;
  const name = d.product_name;
  const attr: Record<string, string> = Object.fromEntries(
    orList(d.variants)
      .map(rec)
      .filter((v): v is JsonRecord => Boolean(v?.name && v?.value))
      .map((v) => [String(v.name).toLowerCase(), String(v.value)]),
  );
  const specs = [attr.storage, attr.color].filter(Boolean).join(", ");
  const label = `used ${name}${specs ? ` (${specs})` : ""}`;
  const items: QuickAnswerItem[] = [];

  const price = Math.trunc(Number(d.final_price) || 0);
  if (price > 0) {
    let a = `This ${label} costs ${taka(price)} at TEKZO.`;
    if (Number(d.regular_price) > price) a += ` That is down from ${taka(d.regular_price)}.`;
    items.push({ q: `What is the price of this used ${name}?`, a });
  }

  const battery = Number(d.battery_health);
  if (attr.condition || battery > 0) {
    const parts: string[] = [];
    if (attr.condition) parts.push(`is in ${attr.condition} condition`);
    if (battery > 0) parts.push(`has ${battery}% battery health`);
    let a = `This ${name} ${parts.join(" and ")}.`;
    if (attr.region) a += ` It is a ${attr.region} region unit.`;
    items.push({ q: `What condition is this used ${name} in?`, a });
  }

  items.push({
    q: `Is this used ${name} available?`,
    a: isTrue(d.is_stock)
      ? `Yes. This ${name} is available at TEKZO and can be ordered online with home delivery.`
      : `No. This ${name} listing has been sold. Browse other certified used devices at TEKZO.`,
  });

  if (d.is_box !== undefined && d.is_box !== null) {
    items.push({
      q: `Does this used ${name} come with the original box?`,
      a: isTrue(d.is_box) ? `Yes. This ${name} comes with its original box.` : `No. This ${name} is sold without its original box.`,
    });
  }

  const warranty = [d.official_service_warranty, d.warranty_text].find((w) => typeof w === "string" && w.trim());
  if (warranty) items.push({ q: `Does this used ${name} have a warranty?`, a: `Yes. ${String(warranty).trim()}` });

  return {
    title: `Used ${name}: quick answers`,
    items,
    quote: taglineQuote(d.brand, brandTagline),
    sources: brandSources(d.brand),
    path,
  };
}
