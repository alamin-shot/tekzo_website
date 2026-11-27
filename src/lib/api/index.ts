// Barrel for the domain fetchers, so every existing `@/lib/api` import keeps
// working unchanged after lib/api.js was split by domain (P2).
//
// Note (AUDIT_NOTES 8c): three Client Components import from here
// (checkout page, OrderReassurance, used-device ProductReview), so nothing in
// lib/api may import "server-only" until the bug-fix pass.

export { getSettings, getSeoPage, getPopupDialog } from "./settings";
export { getDistricts } from "./location";
export {
  getSliders,
  getAllBrands,
  getBrands,
  getBrandProducts,
  getCategoryTree,
  getCategories,
  getHomeCategories,
  getCategoryProducts,
  getCategoryInfo,
  getCategoryProductsBySlug,
} from "./catalog";
export {
  getFeaturedProducts,
  getProduct,
  getProductReviews,
  getRelatedProducts,
  getHomeNewArrivalProducts,
  getNewArrivalProducts,
} from "./product";
export { DEFAULT_FLASH_SALE_SEO, getFlashSaleData, getOffers, getOfferWithProducts, getShopProducts } from "./offers";
export {
  getHomePreOwnedProducts,
  getGroupedPreOwnedProducts,
  getPreOwnedBrands,
  getUsedDevices,
  getPreOwnedProducts,
  getUsedDeviceProduct,
  getPreOwnedRelatedProducts,
  getConditions,
  getStorages,
  getRefurbishedProducts,
  getRefurbisheds,
  getRefurbishedBrands,
} from "./devices";
export {
  getNews,
  getBlogs,
  getFeaturedBlog,
  getRecentBlogs,
  getPopularBlogs,
  getTrendingBlogs,
  getBlogBySlug,
  getBlogsByTag,
  getReels,
  getPolicies,
  getPolicyBySlug,
  getFaqs,
  getOutlets,
  getCareers,
  getTeamMembers,
  getJobDetails,
} from "./content";
