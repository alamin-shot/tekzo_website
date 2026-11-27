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
