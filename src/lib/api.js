import { cache } from "react";
import fetchPublicAPI from "@/utils/fetchPublicAPI";

// ---------- Settings ----------

export const getSettings = cache(async () => {
  try {
    const result = await fetchPublicAPI("/settings", {
      tags: ["settings"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Settings Fetch Error:", err.message);
    return [];
  }
});

// ---------- Sliders ----------

export const getSliders = cache(async () => {
  try {
    const result = await fetchPublicAPI("/sliders", {
      tags: ["sliders"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Sliders Fetch Error:", err.message);
    return [];
  }
});

// ---------- Brands ----------

// full brands listing page payload (banner/seo + brand cards) — distinct from getBrands()
export const getAllBrands = cache(async () => {
  try {
    return await fetchPublicAPI("/all-brands", {
      tags: ["brands"],
      revalidate: 3600,
    });
  } catch (err) {
    console.error("All Brands Fetch Error:", err.message);
    return null;
  }
});

// lightweight brand list used by navbar/home/shop
export const getBrands = cache(async () => {
  try {
    const result = await fetchPublicAPI("/brands", {
      tags: ["brands"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Brands Fetch Error:", err.message);
    return [];
  }
});

// ---------- Category tree (nested, for Sell Your Device category select) ----------

export const getCategoryTree = cache(async () => {
  try {
    const result = await fetchPublicAPI("/category-tree", {
      tags: ["categories"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Category Tree Fetch Error:", err.message);
    return [];
  }
});

// ---------- Districts (for Sell Your Device location select) ----------

export const getDistricts = cache(async () => {
  try {
    const result = await fetchPublicAPI("/districts", {
      tags: ["districts"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Districts Fetch Error:", err.message);
    return [];
  }
});

export const getBrandProducts = cache(async (slug, category, page, sortBy, stock, minPrice, maxPrice, search) => {
  try {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (page) query.set("page", page);
    if (sortBy) query.set("sort_by", sortBy);
    if (stock) query.set("stock", stock);
    if (minPrice) query.set("min_price", minPrice);
    if (maxPrice) query.set("max_price", maxPrice);
    if (search) query.set("search", search);
    const qs = query.toString();
    const endpoint = qs
      ? `/brand/${slug}/products?${qs}`
      : `/brand/${slug}/products`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["brands", `brand-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Brand Products Fetch Error:", err.message);
    return null;
  }
});

// ---------- Categories ----------

export const getCategories = cache(async () => {
  try {
    const result = await fetchPublicAPI("/categories", {
      tags: ["categories"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Categories Fetch Error:", err.message);
    return [];
  }
});

export const getHomeCategories = cache(async () => {
  try {
    const result = await fetchPublicAPI("/home-categories", {
      tags: ["categories"],
      revalidate: false,
    });
    return result ?? [];
  } catch (err) {
    console.error("Home Categories Fetch Error:", err.message);
    return [];
  }
});

export const getCategoryProducts = cache(async () => {
  try {
    return await fetchPublicAPI("/category-products", {
      tags: ["categories"],
      revalidate: false,
    });
  } catch (err) {
    console.error("Category Products Fetch Error:", err.message);
    return null;
  }
});

// Lightweight — name/banner only, no product list — so the category page's
// hero banner can render before the full paginated product fetch resolves.
export const getCategoryInfo = cache(async (slug) => {
  try {
    const result = await fetchPublicAPI(`/category/${slug}`, {
      tags: ["categories", `category-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Category Info Fetch Error:", err.message);
    return null;
  }
});

export const getCategoryProductsBySlug = cache(async (slug, brand, page, sortBy, stock, minPrice, maxPrice, search) => {
  try {
    const query = new URLSearchParams();
    if (brand) query.set("brand", brand);
    if (page) query.set("page", page);
    if (sortBy) query.set("sort_by", sortBy);
    if (stock) query.set("stock", stock);
    if (minPrice) query.set("min_price", minPrice);
    if (maxPrice) query.set("max_price", maxPrice);
    if (search) query.set("search", search);
    // Smaller pages mean fewer product cards to hydrate client-side per
    // request — each card mounts several client components (PreFetchLink
    // links, cart modal trigger), so this directly cuts TBT on category pages.
    query.set("per_page", 8);
    const qs = query.toString();
    const endpoint = `/category/${slug}/products?${qs}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["categories", `category-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Category Products By Slug Fetch Error:", err.message);
    return null;
  }
});

// ---------- Products ----------

export const getFeaturedProducts = cache(async () => {
  try {
    const result = await fetchPublicAPI("/featured-products", {
      tags: ["featured-products"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Featured Products Fetch Error:", err.message);
    return [];
  }
});

// regular product page — carries revalidation tags
export const getProduct = cache(async (slug) => {
  try {
    const result = await fetchPublicAPI(`/product/${slug}`, {
      tags: ["products", `product-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Product Fetch Error:", err.message);
    return null;
  }
});

// Called from a client component (ProductReview.jsx), so not wrapped in
// cache() — that's a Server Component render-pass dedup, meaningless here.
export const getProductReviews = async (slug) => {
  try {
    const result = await fetchPublicAPI(`/product/${slug}/reviews`, {
      tags: [`reviews-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Product Reviews Fetch Error:", err.message);
    return null;
  }
};

export const getRelatedProducts = cache(async (slug) => {
  try {
    const result = await fetchPublicAPI(`/related/${slug}/products`, {
      tags: ["products", `product-${slug}`],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Related Products Fetch Error:", err.message);
    return [];
  }
});

// ---------- New arrivals ----------

export const getHomeNewArrivalProducts = cache(async () => {
  try {
    const result = await fetchPublicAPI("/home-new-arrival-products", {
      tags: ["new-arrival-products"],
      revalidate: false,
    });
    if (Array.isArray(result?.data)) {
      return result.data;
    }
    if (Array.isArray(result?.data?.data)) {
      return result.data.data;
    }
    if (Array.isArray(result?.data?.products)) {
      return result.data.products;
    }
    return [];
  } catch (err) {
    console.error("Home New Arrival Products Fetch Error:", err.message);
    return [];
  }
});

export const getNewArrivalProducts = cache(async (page = 1, filterParams = {}) => {
  try {
    const query = new URLSearchParams();
    if (page) query.set("page", page);
    if (filterParams.min_price) query.set("min_price", filterParams.min_price);
    if (filterParams.max_price) query.set("max_price", filterParams.max_price);
    if (filterParams.sort_by) query.set("sort_by", filterParams.sort_by);
    if (filterParams.brand) query.set("brand", filterParams.brand);
    if (filterParams.category) query.set("category", filterParams.category);
    if (filterParams.stock) query.set("stock", filterParams.stock);
    const qs = query.toString();
    const endpoint = qs ? `/new-arrival-products?${qs}` : "/new-arrival-products";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["new-arrival-products"],
      revalidate: false,
    });
    const dataObj = result?.data;
    const products = Array.isArray(dataObj?.data)
      ? dataObj.data
      : Array.isArray(dataObj)
      ? dataObj
      : Array.isArray(dataObj?.products)
      ? dataObj.products
      : [];
    const pagination = dataObj?.pagination ?? null;
    const seoData = dataObj?.seoData ?? null;
    const description =
      dataObj?.description ||
      dataObj?.seoData?.page_description ||
      null;

    return {
      products,
      pagination,
      seoData,
      description,
    };
  } catch (err) {
    console.error("New Arrival Products Fetch Error:", err.message);
    return { products: [], pagination: null, seoData: null, description: null };
  }
});

// ---------- Flash sale / offers ----------

export const DEFAULT_FLASH_SALE_SEO = {
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

export const getFlashSaleData = cache(async (filterParams = {}) => {
  try {
    const query = new URLSearchParams();
    if (filterParams.page) query.set("page", filterParams.page);
    if (filterParams.min_price) query.set("min_price", filterParams.min_price);
    if (filterParams.max_price) query.set("max_price", filterParams.max_price);
    if (filterParams.sort_by) query.set("sort_by", filterParams.sort_by);
    if (filterParams.brand) query.set("brand", filterParams.brand);
    if (filterParams.category) query.set("category", filterParams.category);
    if (filterParams.stock) query.set("stock", filterParams.stock);
    if (filterParams.limit) query.set("limit", filterParams.limit);
    const qs = query.toString();
    const endpoint = qs ? `/flash-sales?${qs}` : "/flash-sales";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["offer"],
      revalidate: false,
    });
    const seoData = result?.data?.seoData
      ? { ...DEFAULT_FLASH_SALE_SEO, ...result.data.seoData }
      : DEFAULT_FLASH_SALE_SEO;

    return {
      products: result?.data?.products ?? [],
      endAt: result?.data?.offer?.end_at ?? null,
      seoData,
      description:
        result?.data?.offer?.description ||
        result?.data?.description ||
        seoData?.page_description ||
        null,
    };
  } catch (err) {
    console.error("Flash Sale Fetch Error:", err.message);
    return {
      products: [],
      endAt: null,
      seoData: DEFAULT_FLASH_SALE_SEO,
      description: DEFAULT_FLASH_SALE_SEO.page_description,
    };
  }
});

export const getOffers = cache(async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);

    const result = await fetchPublicAPI(`/offers?${query.toString()}`, {
      tags: ["offers"],
      revalidate: false,
    });
    return result?.data ?? { offers: [], seoData: null, pagination: null };
  } catch (err) {
    console.error("Offers Fetch Error:", err.message);
    return { offers: [], seoData: null, pagination: null };
  }
});

export const getOfferWithProducts = cache(async (slug, page = 1, filterParams = {}) => {
  try {
    const query = new URLSearchParams();
    if (page) query.set("page", page);
    if (filterParams.min_price) query.set("min_price", filterParams.min_price);
    if (filterParams.max_price) query.set("max_price", filterParams.max_price);
    if (filterParams.sort_by) query.set("sort_by", filterParams.sort_by);
    if (filterParams.brand) query.set("brand", filterParams.brand);
    if (filterParams.category) query.set("category", filterParams.category);
    if (filterParams.stock) query.set("stock", filterParams.stock);
    const qs = query.toString();
    const endpoint = qs ? `/offer/${slug}/products?${qs}` : `/offer/${slug}/products`;
    const data = await fetchPublicAPI(endpoint, {
      tags: ["offers", `offer-${slug}`],
      revalidate: false,
    });
    return data ?? null;
  } catch (err) {
    console.error("Offer Fetch Error:", err.message);
    return null;
  }
});

// ---------- Shop ----------

export const getShopProducts = cache(async (query) => {
  try {
    const result = await fetchPublicAPI(`/shops?${query}`, {
      tags: ["shops"],
      revalidate: false,
    });
    return result?.data ?? { products: [], seoData: null };
  } catch (err) {
    console.error("Shop Products Fetch Error:", err.message);
    return { products: [], seoData: null };
  }
});

// ---------- Pre-owned / used devices ----------

export const getHomePreOwnedProducts = cache(async () => {
  try {
    const result = await fetchPublicAPI("/home-pre-owned-products", {
      tags: ["used-devices"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Home Pre-owned Products Fetch Error:", err.message);
    return [];
  }
});

export const getGroupedPreOwnedProducts = cache(async (page, perPage, limit, brandSlugs) => {
  try {
    const query = new URLSearchParams();
    if (page) query.set("page", page);
    if (perPage) query.set("per_page", perPage);
    if (limit) query.set("limit", limit);
    if (brandSlugs?.length) query.set("brand", brandSlugs.join(","));
    const qs = query.toString();
    const endpoint = qs ? `/pre-owneds/grouped?${qs}` : "/pre-owneds/grouped";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["used-devices"],
      revalidate: false,
    });
    return result?.data ?? { groups: [], pagination: null, seoData: null };
  } catch (err) {
    console.error("Grouped Pre-owned Products Fetch Error:", err.message);
    return { groups: [], pagination: null, seoData: null };
  }
});

// Brands with at least one available pre-owned unit — for the marketplace
// filter sidebar (narrower than the site-wide brand list).
export const getPreOwnedBrands = cache(async () => {
  try {
    const result = await fetchPublicAPI("/pre-owneds/brands", {
      tags: ["used-devices"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Pre-owned Brands Fetch Error:", err.message);
    return [];
  }
});

export const getUsedDevices = cache(async (query) => {
  try {
    const result = await fetchPublicAPI(`/pre-owneds?${query}`, {
      tags: ["used-devices"],
      revalidate: false,
    });
    return result?.data ?? { pre_owneds: [], seoData: null, pagination: null };
  } catch (err) {
    console.error("Used Devices Fetch Error:", err.message);
    return { pre_owneds: [], seoData: null, pagination: null };
  }
});

export const getPreOwnedProducts = cache(async (slug, page) => {
  try {
    const endpoint = page
      ? `/pre-owneds/${slug}/products?page=${page}`
      : `/pre-owneds/${slug}/products`;
    return await fetchPublicAPI(endpoint, {
      tags: ["used-devices", `used-device-${slug}`],
      revalidate: false,
    });
  } catch (err) {
    console.error("Pre-owned Products Fetch Error:", err.message);
    return null;
  }
});

// pre-owned product variant — same endpoint prefix, supports preOwnedId, no tags
export const getUsedDeviceProduct = cache(async (slug, preOwnedId) => {
  try {
    const endpoint = preOwnedId
      ? `/product/${slug}?preOwnedId=${preOwnedId}`
      : `/product/${slug}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["used-devices", `used-device-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Used Device Product Fetch Error:", err.message);
    return null;
  }
});

export const getPreOwnedRelatedProducts = cache(async (slug, preOwnedId) => {
  try {
    const endpoint = `/pre-owned-related/${slug}/products?preOwnedId=${preOwnedId}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["used-devices", `used-device-${slug}`],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Pre-owned Related Products Fetch Error:", err.message);
    return [];
  }
});

export const getConditions = cache(async () => {
  try {
    const result = await fetchPublicAPI("/conditions");
    return result?.data ?? [];
  } catch (err) {
    console.error("Conditions Fetch Error:", err.message);
    return [];
  }
});

export const getStorages = cache(async () => {
  try {
    const result = await fetchPublicAPI("/storages");
    return result?.data ?? [];
  } catch (err) {
    console.error("Storages Fetch Error:", err.message);
    return [];
  }
});

// ---------- Refurbished ----------

export const getRefurbishedProducts = cache(
  async (
    brandOrParams = {},
    pageArg,
    sortByArg,
    stockArg,
    minPriceArg,
    maxPriceArg
  ) => {
    try {
      let brand, page, sortBy, stock, minPrice, maxPrice, perPage, search;

      if (typeof brandOrParams === "object" && brandOrParams !== null) {
        brand = brandOrParams.brand;
        page = brandOrParams.page;
        sortBy = brandOrParams.sort_by || brandOrParams.sortBy;
        stock = brandOrParams.stock;
        minPrice = brandOrParams.min_price || brandOrParams.minPrice;
        maxPrice = brandOrParams.max_price || brandOrParams.maxPrice;
        perPage = brandOrParams.per_page || brandOrParams.perPage;
        search = brandOrParams.search || brandOrParams.query;
      } else if (
        typeof brandOrParams === "string" &&
        (brandOrParams.includes("=") || brandOrParams.startsWith("?"))
      ) {
        const qs = brandOrParams.startsWith("?")
          ? brandOrParams.slice(1)
          : brandOrParams;
        const endpoint = qs ? `/refurbisheds?${qs}` : "/refurbisheds";
        const result = await fetchPublicAPI(endpoint, {
          tags: ["refurbisheds"],
          revalidate: false,
        });
        return {
          products: result?.data?.data ?? [],
          data: result?.data?.data ?? [],
          pagination: result?.data?.pagination ?? null,
        };
      } else {
        brand = brandOrParams;
        page = pageArg;
        sortBy = sortByArg;
        stock = stockArg;
        minPrice = minPriceArg;
        maxPrice = maxPriceArg;
      }

      const query = new URLSearchParams();
      if (brand) query.set("brand", brand);
      if (page) query.set("page", page);
      if (sortBy) query.set("sort_by", sortBy);
      if (stock) query.set("stock", stock);
      if (minPrice) query.set("min_price", minPrice);
      if (maxPrice) query.set("max_price", maxPrice);
      if (perPage) query.set("per_page", perPage);
      if (search) query.set("search", search);

      const qs = query.toString();
      const endpoint = qs ? `/refurbisheds?${qs}` : "/refurbisheds";
      const result = await fetchPublicAPI(endpoint, {
        tags: ["refurbisheds"],
        revalidate: false,
      });
      return {
        products: result?.data?.data ?? [],
        data: result?.data?.data ?? [],
        pagination: result?.data?.pagination ?? null,
      };
    } catch (err) {
      console.error("Refurbished Products Fetch Error:", err.message);
      return { products: [], data: [], pagination: null };
    }
  }
);

export const getRefurbisheds = getRefurbishedProducts;

export const getRefurbishedBrands = cache(async () => {
  try {
    const result = await fetchPublicAPI("/refurbished-brands", {
      tags: ["refurbished-brands"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Refurbished Brands Fetch Error:", err.message);
    return [];
  }
});

// ---------- News / blogs / reels ----------

export const getNews = cache(async () => {
  try {
    const result = await fetchPublicAPI("/news", {
      tags: ["news"],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("News Fetch Error:", err.message);
    return null;
  }
});

export const getBlogs = cache(async (page, perPage) => {
  try {
    const query = new URLSearchParams();
    if (page) query.set("page", page);
    if (perPage) query.set("per_page", perPage);
    const qs = query.toString();
    const endpoint = qs ? `/blogs?${qs}` : "/blogs";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["blogs"],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Blogs Fetch Error:", err.message);
    return null;
  }
});

export const getFeaturedBlog = cache(async () => {
  try {
    const result = await fetchPublicAPI("/featured-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Featured Blog Fetch Error:", err.message);
    return null;
  }
});

export const getRecentBlogs = cache(async () => {
  try {
    const result = await fetchPublicAPI("/recent-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Recent Blogs Fetch Error:", err.message);
    return [];
  }
});

export const getPopularBlogs = cache(async () => {
  try {
    const result = await fetchPublicAPI("/popular-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Popular Blogs Fetch Error:", err.message);
    return [];
  }
});

export const getTrendingBlogs = cache(async () => {
  try {
    const result = await fetchPublicAPI("/trending-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Trending Blogs Fetch Error:", err.message);
    return [];
  }
});

export const getBlogBySlug = cache(async (slug) => {
  try {
    const result = await fetchPublicAPI(`/blogs/${slug}`, {
      tags: ["blogs", `blog-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Blog By Slug Fetch Error:", err.message);
    return null;
  }
});

export const getBlogsByTag = cache(async (slug, page) => {
  try {
    const endpoint = page
      ? `/blog-tags/${slug}?page=${page}`
      : `/blog-tags/${slug}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["blogs", `blog-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Blogs By Tag Fetch Error:", err.message);
    return null;
  }
});

export const getReels = cache(async () => {
  try {
    const result = await fetchPublicAPI("/reels-videos", {
      tags: ["reels-video"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Reels Fetch Error:", err.message);
    return [];
  }
});

// ---------- Policies / FAQ / outlets / careers ----------

export const getPolicies = cache(async () => {
  try {
    const result = await fetchPublicAPI("/policies", {
      tags: ["policies"],
      revalidate: false,
    });
    return result?.data ?? [];
  } catch (err) {
    console.error("Policies Fetch Error:", err.message);
    return [];
  }
});

export const getPolicyBySlug = cache(async (slug) => {
  try {
    const result = await fetchPublicAPI(`/policies/${slug}`, {
      tags: [`policy-${slug}`],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Policy Fetch Error:", err.message);
    return null;
  }
});

export const getFaqs = cache(async () => {
  try {
    const result = await fetchPublicAPI("/faqs", {
      tags: ["faqs"],
      revalidate: false,
    });
    if (!result?.data) return { faqs: [], seoData: {} };
    return {
      faqs: (result.data.faqs || []).flat().filter(Boolean),
      seoData: result.data.seoData || {},
    };
  } catch (err) {
    console.error("FAQ Fetch Error:", err.message);
    return { faqs: [], seoData: {} };
  }
});

export const getOutlets = cache(async () => {
  try {
    const result = await fetchPublicAPI("/outlets", {
      tags: ["outlets"],
      revalidate: false,
    });
    return {
      outlets: result?.data?.outlets ?? [],
      seoData: result?.data?.seoData ?? null,
    };
  } catch (err) {
    console.error("Outlets Fetch Error:", err.message);
    return { outlets: [], seoData: null };
  }
});

export const getCareers = cache(async () => {
  try {
    const result = await fetchPublicAPI("/careers");
    if (result?.data) return result.data;
    if (Array.isArray(result)) return result;
    return [];
  } catch (err) {
    console.error("Careers Fetch Error:", err.message);
    return [];
  }
});

export const getTeamMembers = cache(async () => {
  try {
    const result = await fetchPublicAPI("/our-teams");
    return result?.data ?? result ?? [];
  } catch (err) {
    console.error("Team Members Fetch Error:", err.message);
    return [];
  }
});

export const getJobDetails = cache(async (slug) => {
  try {
    const result = await fetchPublicAPI(`/careers/${slug}`);
    return result?.data ?? null;
  } catch (err) {
    console.error("Job Details Fetch Error:", err.message);
    return null;
  }
});

// generic static SEO page — /seos/<page>, e.g. "about-us", "checkout"
export const getSeoPage = cache(async (page) => {
  try {
    const result = await fetchPublicAPI(`/seos/${page}`, {
      tags: ["page-seo"],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error(`SEO Page Fetch Error [${page}]:`, err.message);
    return null;
  }
});

// ---------- Popup Dialog ----------

export const getPopupDialog = cache(async () => {
  try {
    const result = await fetchPublicAPI("/popup-dialogs", {
      tags: ["popup-dialogs"],
      revalidate: false,
    });
    return result?.data ?? null;
  } catch (err) {
    console.error("Popup Dialog Fetch Error:", err.message);
    return null;
  }
});
