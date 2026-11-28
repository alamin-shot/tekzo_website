// Guest cart persisted in localStorage["cart"] (JSON array).
// AUDIT_NOTES bug #1: writers disagree on the shape. This file records the
// shape produced by checkout's toStorageItem(); the other writers' shapes are
// added as a union when their batches (P6/P7) are converted. Do not normalize.

/** checkout/page.jsx toStorageItem() output. */
export type GuestCartStorageItem = {
  slug?: string;
  productId: number | string;
  variantId?: number | string;
  productVariantId: number | string;
  quantity?: number;
  pre_owned_id?: number | string;
  productName: string;
  productImage: string;
  variantPrice: number;
  regularPrice: number;
  variantAttr: string;
  bookingAmount: number;
  maxRetailPrice?: number;
  giftId?: number | string;
  giftProductName?: string;
  giftProductImage?: string;
  tekzoCareId?: number | string;
  tekzoCareAmount?: number;
  tekzoCarePlanName?: string;
};

/** localStorage keys owned by the cart/checkout flow (values unchanged). */
export type CartStorageKey = "cart" | "guestCouponCode" | "guestCouponDiscount";

/**
 * Canonical guest cart item (bug #1): every key any writer stores in
 * localStorage["cart"], in the order the writers emit them. Writers keep their
 * own subsets and key order (DeviceSidebar / ProductSidebar store only slug,
 * variantId, quantity[, pre_owned_id]); checkout reads all of them. Values stay
 * `unknown` because they are copied from API payloads as given.
 * Not stored here: purchase_point / care_id / gift_id (they go only in the
 * signed-in /customer/carts request bodies; checkout maps giftId → gift_id and
 * tekzoCareId → care_id when it builds the order).
 */
export type GuestCartItem = {
  slug?: unknown;
  productId?: unknown;
  variantId?: unknown;
  productVariantId?: unknown;
  quantity?: unknown;
  pre_owned_id?: unknown;
  productName?: unknown;
  productImage?: unknown;
  variantPrice?: unknown;
  regularPrice?: unknown;
  maxRetailPrice?: unknown;
  variantAttr?: unknown;
  variantSku?: unknown;
  productBrand?: unknown;
  productCategory?: unknown;
  bookingAmount?: unknown;
  is_prebook?: boolean;
  giftId?: unknown;
  giftProductName?: unknown;
  giftProductImage?: unknown;
  tekzoCareId?: unknown;
  tekzoCareAmount?: unknown;
  tekzoCarePlanName?: unknown;
};

/** Which existing entry a new item updates (checked against the raw stored entry). */
export type GuestCartMatch = (entry: unknown) => boolean;
