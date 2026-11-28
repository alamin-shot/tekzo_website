// Props and local state for checkout, order result pages, login/reset and
// the remaining public routes converted in P8 (compare, order tracking, 404
// feature products). API payloads stay `unknown`.
import type { ReactNode } from "react";

export type LayoutChildrenProps = {
  children: ReactNode;
};

/** Components/OrderSuccess/OrderSuccessClient (invoice from ?invoice_number=, passed through). */
export type OrderSuccessClientProps = {
  invoiceNumber: unknown;
};

/** Components/FeatureProductFor404Page (featured products for the 404 page). */
export type FeatureProductFor404Props = {
  products?: unknown;
};

/** setTimeout handle (browser or Node typings). */
export type TimerHandle = ReturnType<typeof setTimeout>;

/** Debounce timers keyed by cart variant id. */
export type TimerMap = Record<string, TimerHandle>;

/** Guest checkout contact / delivery form. `thana` / `postcode` come from the selected area as given. */
export type CheckoutForm = {
  email: string;
  phone: string;
  fullName: string;
  street: string;
  secondaryPhone: string;
  newsletter: boolean;
  thana: unknown;
  postcode: unknown;
};

/** normalizePhoneNumber() result. */
export type PhoneNormalizeResult = {
  normalized?: string;
  error?: string;
};

/** One `carts[]` entry for /customer/gust-check-coupon (key order as sent). */
export type GuestCouponCartEntry = {
  product_id: unknown;
  product_variant_id: unknown;
  quantity: number;
  pre_owned_id?: unknown;
};

/** One `carts[]` entry for /customer/checkouts and /customer/gust-buy-now (key order as sent). */
export type CheckoutCartLine = {
  product_id: unknown;
  product_variant_id: unknown;
  quantity: number;
  pre_owned_id?: unknown;
  gift_id?: unknown;
  care_id?: unknown;
};

/** Order placement body (key order as sent; optional keys are appended in this order). */
export type CheckoutPayload = {
  payment_method: string;
  district_id: unknown;
  area_id: unknown;
  email: string;
  phone: string;
  full_name: string;
  address: string;
  is_agree: number;
  coupon_code?: string;
  note?: string;
  booking_amount_only?: number;
  carts?: CheckoutCartLine[];
  shipping_address_id?: unknown;
};

/** checkout/AuthorizeUserAddress: hands the chosen saved address up (API object as given). */
export type AuthorizeUserAddressProps = {
  onAddressSelect?: (address: unknown) => void;
};

/** setInterval handle (browser or Node typings). */
export type IntervalHandle = ReturnType<typeof setInterval>;

/** Components/OrderTracking/OrderTracking (seo from getSeoPage("order-tracking")). */
export type OrderTrackingProps = {
  seoData?: unknown;
};

/** One status step of the order-tracking timeline. */
export type TrackingStep = {
  key: string;
  label: string;
  icon: ReactNode;
  message: string;
};

/** Components/Comparison/ProductComparisonHero (/compare). */
export type ProductComparisonHeroProps = {
  seoData?: unknown;
};

/** Components/Compare/CompareResult: the two compare slots (null = empty). */
export type CompareResultProps = {
  products?: unknown[];
  onRemove?: (index: number) => void;
};

export type CompareProductCardProps = {
  product: unknown;
  index: number;
  onRemove: (index: number) => void;
};

export type CompareRowProps = {
  label: unknown;
  left: unknown;
  right: unknown;
};

export type CompareSectionBlockProps = {
  title: unknown;
  p1Name: unknown;
  p2Name: unknown;
  children: ReactNode;
};

/** One spec row merged from both products' specifications. */
export type CompareSpecRow = {
  id: unknown;
  name: unknown;
  left: unknown;
  right: unknown;
};

export type CompareSpecSide = "left" | "right";

/** A spec section while merging (rows keyed by spec name). */
export type CompareSpecSection = {
  id: unknown;
  name: unknown;
  specMap: Map<unknown, CompareSpecRow>;
};

export type CompareGroupedSpec = {
  id: unknown;
  name: unknown;
  rows: CompareSpecRow[];
};

/** An Overview row: label plus a reader over the product payload. */
export type CompareOverviewField = {
  label: string;
  get: (product: unknown) => unknown;
};

/** One line of the order-success summary (safe fields only). */
export type OrderSummaryLine = {
  name: unknown;
  variant: string;
  quantity: unknown;
  price: unknown;
};

/**
 * What /order/successful shows from GET /customer/recent-order: invoice,
 * totals, payment method/status and items. Customer PII (phone, email,
 * address, transaction_id, paymentId) is never read.
 */
export type OrderSummaryView = {
  invoiceNumber: unknown;
  subTotal: unknown;
  shippingCharge: unknown;
  discountAmount: unknown;
  grandTotal: unknown;
  paymentMethod: unknown;
  paymentStatus: unknown;
  /** Payment still "Initiated" (gateway confirmation can lag a few seconds). */
  paymentPending: boolean;
  lines: OrderSummaryLine[];
};

/** Invoice download / preview button on the order result pages. */
export type InvoiceButtonsProps = {
  invoiceNumber: string;
};
