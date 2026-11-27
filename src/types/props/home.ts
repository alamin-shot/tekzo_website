// Props for homepage sections and Swiper wrappers (P5b). API payloads
// (sliders, products, brands, categories, news, FAQs) stay `unknown` and are
// read through src/lib/json.ts / src/lib/render.ts guards.
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import type { SwiperProps } from "swiper/react";
import type { HomeCustomerQuote } from "@/types/content";

/** Swiper wrapper components that only take slides as children. */
export type SliderProps = {
  children?: ReactNode;
};

/** LazySwiper: every <Swiper> prop, plus the IntersectionObserver margin. */
export type LazySwiperProps = SwiperProps & {
  rootMargin?: string;
};

/**
 * Homepage section props. Every field is a raw API payload (or slice of one)
 * passed down from the home route: `slidersData` (/sliders), `categoriesData`
 * (/categories), `brands` (/brands), `products` (section lists), `reels`,
 * `endAt` (flash-sale end), `companySetting` (/settings).
 */
export type HomeSectionProps = {
  slidersData?: unknown;
  categoriesData?: unknown;
  brands?: unknown;
  products?: unknown;
  reels?: unknown;
  endAt?: unknown;
  companySetting?: unknown;
  customerQuote?: unknown;
  title?: string;
};

/** A slider item (brand or category tile) rendered by Home/Brands/Brand or Home/Categories/Category. */
export type HomeItemProps = {
  item?: unknown;
};

/** Homepage FAQ accordion: the single open card (null = all closed). */
export type FaqOpenState = {
  openIndex: number | null;
  setOpenIndex: Dispatch<SetStateAction<number | null>>;
};

export type FaqCardProps = {
  index: number;
  question: ReactNode;
  children?: ReactNode;
};

/** One static FAQ entry rendered by HomeFAQ. */
export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

export type HomeFAQProps = {
  customerQuote?: HomeCustomerQuote | null;
};

/** Outbound manufacturer link inside FAQ answers. */
export type OfficialLinkProps = {
  href: string;
  children?: ReactNode;
};

/** HomePageNews slider (raw /news list). */
export type HomePageNewsProps = {
  newsData?: unknown;
};

/** News detail modal (raw news item; null = closed). */
export type NewsModalProps = {
  news: unknown;
  onClose: () => void;
};

/** News slider card. */
export type NewsCardProps = {
  news: unknown;
  onClick: (news: unknown) => void;
};

/** A reel mapped for the live-section grid (values copied from the raw reel). */
export type ReelCardItem = {
  id: unknown;
  name: unknown;
  brand: unknown;
  price: string;
  currentPrice: unknown;
  originalPrice: unknown;
  discount: unknown;
  image: unknown;
  videoLink: unknown;
};

export type ReelCardProps = {
  product: ReelCardItem;
  onClick: () => void;
};

export type LiveProductsProps = {
  reels?: unknown;
};

/** LiveProductModal: the raw reels, opened at `initialIndex`. */
export type LiveProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  products?: unknown;
  initialIndex?: number;
};

/** Video-or-image player inside the reels modal. */
export type MediaPlayerProps = {
  src: unknown;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: string;
  className?: string;
  onMuteToggle?: () => void;
  showMuteBtn?: boolean;
  isMuted?: boolean;
};

/** Product panel next to a reel (raw reel item). */
export type ReelProductDetailProps = {
  product: unknown;
  onClose: () => void;
  isMobile: boolean;
};

/** Mobile / desktop reel tracks. */
export type ReelTrackProps = {
  products: unknown;
  index: number;
  muted: boolean;
  onNavigate: (dir: number) => void;
  onMuteToggle: () => void;
  onClose: () => void;
};

/** FeaturedProductsList (/featured-products grid). */
export type FeaturedProductsListProps = {
  products?: unknown;
  searchQuery?: string;
};

/** Home/Brands/Brand slider. */
export type BrandSliderProps = {
  brandsData?: unknown;
};

/** Home/Categories/Category slider. */
export type CategorySliderProps = {
  categoriesData?: unknown;
};

/** A style object that also sets CSS custom properties (e.g. `--swiper-wrapper-display`). */
export type CssVarStyle = CSSProperties & Record<`--${string}`, string>;
