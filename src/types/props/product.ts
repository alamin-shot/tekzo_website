// Props for the product detail page (PDP) and its components (P6). The
// product payload stays `unknown` and is read through src/lib/json.ts /
// src/lib/render.ts.
import type { ReactNode } from "react";

/** Components that receive the raw product payload (`slug` is passed to KeyFeatures but unused). */
export type ProductDetailsProp = {
  productDetails?: unknown;
  slug?: unknown;
};

/** PricingSelector's option card. */
export type PricingCardProps = {
  children?: ReactNode;
  active: boolean;
  disabled: boolean;
  className?: string;
};

/** PricingSelector: prices are raw variant values; `setQuantity` is a state setter. */
export type PricingSelectorProps = {
  selectedVariant?: unknown;
  quantity: number;
  setQuantity: (update: (prev: number) => number) => void;
  careAmount?: unknown;
  hasCare?: boolean;
  isPreOrder?: boolean;
  bookingAmount?: unknown;
};

/** DynamicPills: tab state can be controlled by the parent. */
export type DynamicPillsProps = {
  productDetails?: unknown;
  reviewsData?: unknown;
  supportPhone?: unknown;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
};

export type WarrantyInfoProps = {
  productDetails?: unknown;
  /** Accepted but unused. */
  supportPhone?: unknown;
};

/** ProductBreadcrumbs */
export type ProductBreadcrumbsProps = {
  product?: unknown;
  from?: string;
};

/** One ProductBreadcrumbs entry (label is a raw API value). */
export type ProductCrumb = {
  label: unknown;
  href: string | null;
};

export type RelatedProductsProps = {
  relatedProductsData?: unknown;
};

/** ShareDetails: the selected variant (raw) drives wishlist + tracking. */
export type ShareDetailsProps = {
  selectedVariant?: unknown;
  quantity?: unknown;
  supportPhone?: unknown;
};

export type OrderReassuranceProps = {
  supportPhone?: unknown;
};

/** ProductSpecs: the raw specification groups. */
export type ProductSpecsProps = {
  productSpecs?: unknown;
};

/** ProductVideo's per-video card (raw entry). */
export type ProductVideoCardProps = {
  product: unknown;
};

/** Section name → open flag. */
export type OpenSectionMap = Record<string, boolean>;

/** Gift/GiftForUser: `onGiftSelect` receives the raw `gift_id`. */
export type GiftForUserProps = {
  productDetails?: unknown;
  onGiftSelect?: (giftId: unknown) => void;
};

/** Gift/GiftPopup: `productDetails` here is the raw `gift_products` list. */
export type GiftPopupProps = {
  productDetails?: unknown;
  onSelectGift?: (giftId: unknown) => void;
};

export type ProductSelectorPopupProps = {
  isOpen: boolean;
  products: unknown;
  selectedId: unknown;
  onSelectProduct: (giftItem: unknown) => void;
};

/** ProductBenefits / ProductBenefitsFooter: `product` is the selected variant (raw). */
export type ProductBenefitsProps = {
  product?: unknown;
  productDetails?: unknown;
  from?: string;
};

/** ProductBenefitsFooter tile. */
export type BenefitTile = {
  id: string;
  label: string;
  value: unknown;
  altText: string | number;
  iconSrc: string;
};

/** EMI/EMI tile + modal trigger. `product` is the selected variant (raw). */
export type EmiProps = {
  product?: unknown;
  productDetails?: unknown;
  from?: string;
  className?: string;
  disabled?: boolean;
};

export type EmiModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export type EmiModalContentProps = {
  product?: unknown;
};

/** EmiModalContent: one plan recalculated for the entered amount. */
export type EmiPlanCalc = {
  months: number;
  charge_percent: number;
  monthly_emi: number;
  effective_cost: number;
};

/** A raw /emi-list bank with its plans recalculated. */
export type EmiBankCalc = Record<string, unknown> & {
  installments: EmiPlanCalc[];
};

/** EmiModalContent table row. */
export type EmiPlanRow = {
  month: number;
  emi: string;
  rate: string;
  cost: string;
};

/** ProductReview: the raw reviews payload (`slug` is passed but unused). */
export type ProductReviewProps = {
  slug?: unknown;
  initialData?: unknown;
};

/** ProductReview star row; `rating` is a raw API value. */
export type StarRatingProps = {
  rating: unknown;
  size?: string;
};

/** Tekzo Care plan chosen on the PDP (values are raw API fields); null = none. */
export type CareSelection = {
  planId: unknown;
  planName: unknown;
  amount: unknown;
  care_id: unknown;
} | null;

/** getAmountData() result in the Tekzo Care components. */
export type CareAmountData = {
  amount: unknown;
  variant_id: unknown;
  care_id: unknown;
};

export type TekzoCareCardProps = {
  careData?: unknown;
  selectedVariant?: unknown;
  selectedCare?: unknown;
  onCareSelect?: (care: CareSelection) => void;
};

/** UsedDevice TekzoCareCard (dropdown card; `productDetail` is accepted but unused). */
export type UsedTekzoCareCardProps = TekzoCareCardProps & {
  productDetail?: unknown;
};

/** TekzoCarePopup (no importers). */
export type TekzoCarePopupProps = {
  isOpen?: boolean;
  careData?: unknown;
  selectedVariant?: unknown;
  onSelectCare?: (care: CareSelection) => void;
};

/** StickyBottomBar (mobile/desktop buy bar on the PDP). */
export type StickyBottomBarProps = {
  productDetails?: unknown;
  companySetting?: unknown;
  selectedVariant?: unknown;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  addingToCart?: boolean;
  isAdded?: boolean;
  buyingNow?: boolean;
  selectedTekzoCare?: unknown;
  selectedGiftId?: unknown;
  onGiftSelect?: (giftId: unknown) => void;
};

/** ProductDetails (the PDP body). All API inputs are raw. */
export type ProductDetailsProps = {
  productDetails?: unknown;
  relatedProductsData?: unknown;
  reviewsData?: unknown;
  supportPhone?: unknown;
  companySetting?: unknown;
  policies?: unknown;
  /** Server-rendered slot shown above Related Products. */
  afterDetails?: ReactNode;
};

/** ProductDetails' mobile top bar. */
export type ProductTopNavProps = {
  companySetting?: unknown;
  policies?: unknown;
};

/** DEFAULT_POLICIES entry. */
export type PolicyLink = {
  name: string;
  type: string;
};

/** hooks/useAutoSlide options and result. */
export type AutoSlideOptions = {
  delay?: number;
  resetKey?: unknown;
};

export type AutoSlideState = {
  index: number;
  next: () => void;
  prev: () => void;
  pause: () => void;
  resume: () => void;
};

/** CartModal (quick add from product cards). Card values are raw. */
export type CartModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  name?: unknown;
  currentPrice?: unknown;
  image?: unknown;
  slug?: unknown;
};

/** CartModal colour chip, built from the product's images. */
export type CartColorOption = {
  id: unknown;
  color: unknown;
  image: unknown;
};

// ─── Used devices (P6) ──────────────────────────────────────────────

/** UsedDevice breadcrumbs: the raw used-device payload. */
export type UsedBreadcrumbsProps = {
  product?: unknown;
};

/** UsedRelatedProducts: raw related listings. */
export type UsedRelatedProductsProps = {
  relatedProducts?: unknown;
};

/** UsedDevice ProductDetails (the used-device detail body). */
export type UsedProductDetailsProps = {
  productDetails?: unknown;
  supportPhone?: unknown;
  relatedProducts?: unknown;
  afterDetails?: ReactNode;
};

/** PreownedDevice/ImageModal: `images` is a raw list of `{ image }` objects or URL strings. */
export type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  images: unknown;
  initialIndex?: number;
  /** Called on thumbnail click; missing on the used-device detail page (AUDIT_NOTES N20). */
  setIsSidebarOpen?: (open: boolean) => void;
  productTitle?: unknown;
};

/** PreownedDevice/CommonModal (Tailwind colour names are interpolated into classes). */
export type CommonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  icon?: string;
  gradientFrom?: string;
  gradientTo?: string;
  borderColor?: string;
  children?: ReactNode;
  maxWidth?: string;
};

/** DeviceConditionContent grade card data. */
export type ConditionInfo = {
  color: string;
  howItLooks: { screen: string; body: string };
  technicalCondition: string;
  features: { icon: string; text: string }[];
};

/** DeviceConditionContent Tailwind classes per colour. */
export type ConditionClassSet = {
  activeBg: string;
  activeBorder: string;
  activeText: string;
  inactiveBorder: string;
  inactiveText: string;
  inactiveBg: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
};

/** TechnicalSpecsContent: the raw used-device payload. */
export type TechnicalSpecsContentProps = {
  product?: unknown;
};

/** PreownedDevice/DeviceCard: a raw used-device listing. */
export type DeviceCardProps = {
  listing?: unknown;
  from?: string;
  className?: string;
};

/** PreownedDevice/DeviceSidebar (quick view of a listing). */
export type DeviceSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  listing?: unknown;
  setIsSidebarOpen?: (open: boolean) => void;
};

/** Used-device filter values kept in the URL (`condition`, `storage`, ...). */
export type UsedFilterValues = Record<string, string>;

/** PreownedDevice/FilterSidebar (no importers): mobile sidebar + desktop bar. */
export type UsedFilterSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  filters: UsedFilterValues;
  onFilterChange: (key: string, value: string) => void;
  activeFilterCount: number;
  onResetFilters: () => void;
  conditions?: unknown;
  storages?: unknown;
  storageSearchTerm?: string;
  onStorageSearchChange?: (value: string) => void;
};

/** The mobile variant always receives isOpen / onClose. */
export type UsedMobileFilterSidebarProps = UsedFilterSidebarProps & {
  isOpen: boolean;
  onClose: () => void;
};

/** PreOwnedFilter / UsedDeviceFilter values (raw; pages may pass any search-param value). */
export type UsedFilterOverrides = {
  min_price?: unknown;
  max_price?: unknown;
  sort_by?: unknown;
  battery_health?: unknown;
  storage?: unknown;
  condition?: unknown;
  stock?: unknown;
  brand?: unknown;
  category?: unknown;
  search?: unknown;
};

export type UsedFilterProps = {
  currentFilters?: UsedFilterOverrides;
};

/** PreOwnedFilter storage dropdown (fixed options). */
export type StorageComboboxProps = {
  value: unknown;
  onChange: (value: string) => void;
};

/** Marketplace brand filters: the raw brand list. */
export type MarketplaceBrandsProps = {
  brands?: unknown;
};

export type MarketplaceMobileFilterProps = {
  isOpen: boolean;
  onClose: () => void;
  brands?: unknown;
};

/** Marketplace/ProductSection: a titled row of raw listings. */
export type MarketplaceProductSectionProps = {
  title?: unknown;
  products?: unknown;
  slug?: unknown;
};

/** UsedDevice/UsedDeviceClient (the /used-device listing). */
export type UsedDeviceClientProps = {
  initialProducts?: unknown;
  seoData?: unknown;
  pagination?: unknown;
  currentPage: number;
  filterData?: unknown;
  categories?: unknown;
  /** Accepted but unused (the URL is read instead). */
  selectedBrand?: unknown;
  selectedCategory?: unknown;
  searchTerm?: unknown;
  currentFilters: UsedFilterOverrides;
};

/** PreownedDevice/PreOwnedDeviceClient (/used-device/[slug] listings for one model). */
export type PreOwnedDeviceClientProps = {
  listings?: unknown;
  conditions?: unknown;
  storages?: unknown;
  brand?: unknown;
  pagination?: unknown;
  currentPage: number;
};

/** PreownedDevice/ProductSidebar (no importers, AUDIT_NOTES N7). */
export type ProductSidebarProps = {
  products?: unknown;
};

/** Active-filter chip; `label` may be a raw API name. */
export type FilterChipProps = {
  label: unknown;
  onRemove: () => void;
};

/** Used-device PricingSelector (quantity props accepted; prices are raw). */
export type UsedPricingSelectorProps = {
  productDetails?: unknown;
  selectedVariant?: unknown;
  quantity?: number;
  setQuantity?: (update: (prev: number) => number) => void;
  selectedCare?: unknown;
};

export type ChildrenOnly = {
  children?: ReactNode;
};

/** UsedDevice/WhyChooseSection (API siteName, rendered as given). */
export type WhyChooseSectionProps = {
  brandName?: unknown;
};

/** /used-device query builder input (searchParams values pass through). */
export type UsedDeviceQueryInput = {
  page?: unknown;
  brand?: unknown;
  category?: unknown;
  search?: unknown;
};

/** Refurbished/RefurbishedProductGrid (/refurbished; searchParams values pass through). */
export type RefurbishedProductGridProps = {
  initialProducts?: unknown;
  brands?: unknown;
  initialBrand?: unknown;
  initialSearch?: unknown;
};

/** RefurbishedProductGrid applyFilters overrides (select / input values). */
export type RefurbishedFilterOverrides = {
  sort_by?: string;
  stock?: string;
  min_price?: string;
  max_price?: string;
};

/** SellYourDevice/SellYourDeviceContent (/sell-your-device). */
export type SellYourDeviceContentProps = {
  isLoggedIn: boolean;
};

/** SellYourDevice form (sell / edit request). Values loaded from the API pass through as given. */
export type SellDeviceForm = {
  ad_title: unknown;
  category_id: unknown;
  new_district_id: unknown;
  brand_id: unknown;
  model: unknown;
  condition: unknown;
  ram: unknown;
  storage: unknown;
  color: unknown;
  is_exchange_possible: boolean;
  description: unknown;
  phone_number: unknown;
  video_url: unknown;
  asking_price: unknown;
  is_negotiable: boolean;
};

export type SellDeviceField = keyof SellDeviceForm;

export type SellDeviceFeature = {
  key: unknown;
  value: unknown;
};

/** A photo picked in SellYourDevice, uploaded in chunks. */
export type SellDeviceImage = {
  localId: string;
  file: File;
  url: string;
  path: string | null;
  progress: unknown;
  uploading: boolean;
  error: unknown;
};

/** The RAM / Storage / Color selects. */
export type SellSpecSelect = {
  label: string;
  field: "ram" | "storage" | "color";
  options: string[];
};

export type FlatCategory = {
  id: unknown;
  label: string;
};

/** Body for POST / PATCH /customer/sell-device-requests (key order as sent). */
export type SellDevicePayload = {
  ad_title: string;
  category_id: number;
  brand_id: number | null;
  new_district_id: number | null;
  model: string;
  condition: unknown;
  ram: unknown;
  storage: unknown;
  color: unknown;
  is_exchange_possible: boolean;
  asking_price: number;
  is_negotiable: boolean;
  description: string;
  phone_number: string;
  video_url: string | null;
  images: { path: string | null; is_primary: boolean }[];
  features: { feature_name: string; feature_value: string }[];
  remove_image_ids?: unknown[];
};

export type SellYourDeviceProps = {
  categories?: unknown;
  brands?: unknown;
  districts?: unknown;
  requestId?: unknown;
};

export type SellLabelProps = {
  children: ReactNode;
  required?: boolean;
};

export type SellErrorProps = {
  msg?: unknown;
};

export type SellSectionCardProps = {
  title: ReactNode;
  icon: ReactNode;
  children: ReactNode;
};

/** Refurbished/RefurbishedSlugDetail (no importers; kept for parity). */
export type RefurbishedSlugDetailProps = {
  slug?: unknown;
  title?: unknown;
  logo?: unknown;
  tagline?: unknown;
  products?: unknown;
  pagination?: unknown;
  currentPage?: number;
  subCategories?: unknown;
  brands?: unknown;
  activeBrand?: unknown;
};
