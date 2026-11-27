// POS / loyalty fields that pass through the frontend. The frontend has no
// direct POS integration; these come from and go back to the backend API.

/** `purchase_point`: loyalty points earned by buying the product (shown on cards, sent on cart/buy-now). */
export type PurchasePoint = number;

/** Optional spread used on cart / buy-now payloads: `...(purchase_point ? { purchase_point } : {})`. */
export type PurchasePointPayload = {
  purchase_point?: PurchasePoint;
};
