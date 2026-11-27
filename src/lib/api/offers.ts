import { cache } from "react";
import type { FilterParams } from "@/types/json";
import type { FlashSaleResult, FlashSaleSeo } from "@/types/catalog";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { rec } from "@/lib/json";
import { dataOf, logFetchError, setIf } from "./shared";

// ---------- Flash sale / offers ----------

export const DEFAULT_FLASH_SALE_SEO: FlashSaleSeo = {
  title: "Flash Sale Gadgets in Bangladesh",
  description:
    "Shop the latest Flash Sale deals at TEKZO Bangladesh. Save big on smartphones, chargers, power banks, cables, and audio devices. Limited-time offers available online.",
  page_description:
    "<h1>Flash Sale Deals in Bangladesh – Exclusive Gadget Offers at TEKZO</h1><p>Looking for the best flash sale offers on smartphones, gadgets, and premium tech accessories in Bangladesh? TEKZO brings you exclusive limited-time discounts on authentic products from globally trusted brands. Whether you're searching for fast chargers, power banks, USB cables, wireless audio devices, flagship smartphones, or innovative smart gadgets, the TEKZO Flash Sale section is designed to help you save more while enjoying genuine technology products. </p><h2>Discover Unbeatable Flash Sale Discounts</h2><p>The TEKZO Flash Sale page features regularly updated deals across multiple technology categories. Customers can find exciting discounts on charging solutions, mobile accessories, premium audio products, power stations, and flagship smartphones from leading international brands. These offers are available for a limited time, making it the perfect opportunity to upgrade your tech setup at a lower price. </p><h2>Featured Categories in Flash Sale</h2><h3>Smartphones &amp; Flagship Devices</h3><p>Explore attractive offers on premium smartphones from top global brands. From the latest iPhone and Samsung Galaxy devices to high-performance Android smartphones, TEKZO Flash Sale helps customers access cutting-edge mobile technology at competitive prices. </p><h3>Chargers &amp; Fast Charging Solutions</h3><p>Stay powered with discounts on GaN chargers, USB-C wall adapters, smart charging hubs, and multi-port charging stations. Find reliable charging products from trusted brands designed for faster, safer, and more efficient charging. </p><h3>Power Banks &amp; Portable Power</h3><p>Keep your devices running anywhere with discounted power banks and portable power solutions. Whether for travel, work, or everyday use, TEKZO offers power accessories that combine portability, safety, and performance. </p><h3>Audio &amp; Entertainment Gadgets</h3><p>Enjoy premium sound with special offers on wireless earbuds, headphones, Bluetooth speakers, and entertainment accessories. Flash Sale products are selected to deliver both performance and value. </p><h3>Mobile Accessories</h3><p>Browse discounted USB cables, wireless chargers, screen protection products, adapters, hubs, docks, and other essential accessories that improve your digital lifestyle. </p><h2>Why Shop Flash Sale at TEKZO?</h2><ul><li>Authentic and verified technology products</li><li>Competitive pricing with limited-time discounts</li><li>Multi-brand gadget and smartphone collection</li><li>Secure online shopping experience</li><li>Nationwide delivery across Bangladesh</li><li>Regularly updated promotional campaigns</li><li>Trusted customer support and warranty assistance </li></ul><h2>Trusted Brands Available</h2><p>TEKZO collaborates with globally recognized brands across smartphones, charging technology, audio products, and smart accessories. Customers can discover products from Apple, Samsung, JBL, VOLTME, UGREEN, QCY, Google, DJI, Xiaomi, Honor, OnePlus, Huawei, and many more through ongoing promotional campaigns and flash sales. </p><h2>Shop Flash Sale Gadgets Online in Bangladesh</h2><p>Whether you're upgrading your smartphone, purchasing a fast charger, investing in a reliable power bank, or looking for premium tech accessories, the TEKZO Flash Sale collection offers excellent value for money. Visit the Flash Sale page regularly to discover new deals, exclusive discounts, and limited-stock offers on the latest gadgets and electronics in Bangladesh.&nbsp;</p>",
  tags: "Flash Sale Bangladesh, Gadget Flash Sale, Smartphone Deals Bangladesh, Tech Accessories Sale, Power Bank Sale, USB Cable Offer, Fast Charger Sale, Mobile Accessories Discount, TEKZO Flash Sale, Electronics Offer Bangladesh, Online Gadget Store Bangladesh",
  canonical: "https://www.tekzo.com.bd/flash-sale",
  logo: "https://d2c2zgda4zwbg9.cloudfront.net/6700/Flash-Sale.webp",
  banner: "https://d2c2zgda4zwbg9.cloudfront.net/6699/flash-sale-banner.webp",
  info_banner: "https://d2c2zgda4zwbg9.cloudfront.net/6699/flash-sale-banner.webp",
  siteName: "TEKZO",
};

export const getFlashSaleData = cache(async (filterParams: FilterParams = {}): Promise<FlashSaleResult> => {
  try {
    const query = new URLSearchParams();
    setIf(query, "page", filterParams.page);
    setIf(query, "min_price", filterParams.min_price);
    setIf(query, "max_price", filterParams.max_price);
    setIf(query, "sort_by", filterParams.sort_by);
    setIf(query, "brand", filterParams.brand);
    setIf(query, "category", filterParams.category);
    setIf(query, "stock", filterParams.stock);
    setIf(query, "limit", filterParams.limit);
    const qs = query.toString();
    const endpoint = qs ? `/flash-sales?${qs}` : "/flash-sales";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["offer"],
      revalidate: false,
    });
    const data = rec(dataOf(result));
    // `{ ...DEFAULT, ...cmsSeo }` — Object.assign({}, x) copies exactly what
    // object spread copies for any JSON value.
    const seoData: Record<string, unknown> = data?.seoData ? { ...DEFAULT_FLASH_SALE_SEO, ...Object.assign({}, data.seoData) } : DEFAULT_FLASH_SALE_SEO;
    return {
      products: data?.products ?? [],
      endAt: rec(data?.offer)?.end_at ?? null,
      seoData,
      description: rec(data?.offer)?.description || data?.description || seoData?.page_description || null,
    };
  } catch (err) {
    logFetchError("Flash Sale Fetch Error:", err);
    return {
      products: [],
      endAt: null,
      seoData: DEFAULT_FLASH_SALE_SEO,
      description: DEFAULT_FLASH_SALE_SEO.page_description,
    };
  }
});

export const getOffers = cache(async (params: FilterParams = {}): Promise<unknown> => {
  try {
    const query = new URLSearchParams();
    setIf(query, "page", params.page);

    const result = await fetchPublicAPI(`/offers?${query.toString()}`, {
      tags: ["offers"],
      revalidate: false,
    });
    return dataOf(result) ?? { offers: [], seoData: null, pagination: null };
  } catch (err) {
    logFetchError("Offers Fetch Error:", err);
    return { offers: [], seoData: null, pagination: null };
  }
});

export const getOfferWithProducts = cache(async (slug: unknown, page: unknown = 1, filterParams: FilterParams = {}): Promise<unknown> => {
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
    const endpoint = qs ? `/offer/${slug}/products?${qs}` : `/offer/${slug}/products`;
    const data = await fetchPublicAPI(endpoint, {
      tags: ["offers", `offer-${slug}`],
      revalidate: false,
    });
    return data ?? null;
  } catch (err) {
    logFetchError("Offer Fetch Error:", err);
    return null;
  }
});

// ---------- Shop ----------

export const getShopProducts = cache(async (query: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/shops?${query}`, {
      tags: ["shops"],
      revalidate: false,
    });
    return dataOf(result) ?? { products: [], seoData: null };
  } catch (err) {
    logFetchError("Shop Products Fetch Error:", err);
    return { products: [], seoData: null };
  }
});
