// Listing-page result shapes assembled by lib/api from loosely shaped
// backend payloads. Item and SEO payloads stay `unknown` until the pages
// that consume them are converted.

/** getNewArrivalProducts() */
export type NewArrivalResult = {
  products: unknown[];
  pagination: unknown;
  seoData: unknown;
  description: unknown;
};

/** getFlashSaleData() — `seoData` is DEFAULT_FLASH_SALE_SEO merged with the CMS seoData. */
export type FlashSaleResult = {
  products: unknown;
  endAt: unknown;
  seoData: Record<string, unknown>;
  description: unknown;
};

/** DEFAULT_FLASH_SALE_SEO */
export type FlashSaleSeo = {
  title: string;
  description: string;
  page_description: string;
  tags: string;
  canonical: string;
  logo: string;
  banner: string;
  info_banner: string;
  siteName: string;
};
