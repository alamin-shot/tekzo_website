// Props for shared catalog / listing primitives (P5a): banners, headings,
// breadcrumbs, pagination, product cards, descriptions. CMS / API values
// stay `unknown` and are read through src/lib/json.ts / src/lib/render.ts.
import type { ElementType, ReactNode } from "react";

export type ChildrenOnlyProps = {
  children?: ReactNode;
  /** Some callers pass a className; Title / TitleHeading / Title2 / Button ignore it (unchanged). */
  className?: string;
};

export type SectionProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Banner (non-home hero). `h1`: `true` renders `title` as a visually hidden
 * <h1>, a string renders that text, falsy renders nothing.
 */
export type BannerProps = {
  image?: unknown;
  title?: unknown;
  hideImageOnMobile?: boolean;
  h1?: unknown;
  /** Passed by ProductDetails; Banner does not render it. */
  logo?: unknown;
};

/** HomeBanner: the /sliders payload ({ sliders: [...] }). */
export type HomeBannerProps = {
  slidersData?: unknown;
};

export type SectionHeadingProps = {
  logo?: unknown;
  link?: unknown;
  title?: unknown;
  banner?: unknown;
};

export type MyImageSquireProps = {
  src?: unknown;
  alt?: unknown;
};

/** Numbered pager. Pages are 1-based; "..." marks a gap. */
export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export type PageItem = number | "...";

/**
 * Legacy product card (Card.jsx). Values come from listing payloads, so they
 * stay unknown; `btnClick`, `status` and `productData` are accepted but unused.
 */
export type CardProps = {
  name?: unknown;
  category?: unknown;
  categoryLink?: unknown;
  badge?: unknown;
  currentPrice?: unknown;
  originalPrice?: unknown;
  discountPercentage?: unknown;
  rating?: unknown;
  image?: unknown;
  isStock?: unknown;
  status?: unknown;
  btnClick?: unknown;
  productData?: unknown;
  link?: unknown;
  from?: unknown;
  quantity?: unknown;
};

/**
 * Main product card (CardMain). Listing payload values stay unknown.
 * `titleAs` picks the product-name heading level (default h3).
 * `status`, `btnClick` and `preOwned` are accepted but unused.
 */
export type CardMainProps = {
  name?: unknown;
  category?: unknown;
  badge?: unknown;
  currentPrice?: unknown;
  originalPrice?: unknown;
  discountPercentage?: unknown;
  preOrderPrice?: unknown;
  isPreOrder?: unknown;
  rating?: unknown;
  image?: unknown;
  isStock?: unknown;
  status?: unknown;
  btnClick?: unknown;
  productData?: unknown;
  link?: unknown;
  from?: unknown;
  quantity?: unknown;
  preOwned?: unknown;
  brandName?: unknown;
  brandLink?: unknown;
  categoryLink?: unknown;
  fromCategory?: unknown;
  categoryName?: unknown;
  offerLink?: unknown;
  offerName?: unknown;
  categoryPageLink?: unknown;
  categoryPageName?: unknown;
  product?: unknown;
  priceRange?: unknown;
  titleAs?: ElementType;
  /** Passed by the flash-sale / new-arrival sliders; not read by CardMain. */
  discountAmount?: unknown;
  /** Passed by the shop grids (ShopProducts, Products); not read by CardMain. */
  discount?: unknown;
  discountPrice?: unknown;
};

/** PageDescription: one of description / pageDescription / content / companySetting.seoData supplies the HTML. */
export type PageDescriptionProps = {
  title?: string;
  description?: unknown;
  pageDescription?: unknown;
  content?: unknown;
  companySetting?: unknown;
  className?: string;
  defaultOpen?: boolean;
};

export type PageDescriptionViewProps = {
  title?: string;
  html?: string;
  className?: string;
  defaultOpen?: boolean;
};
