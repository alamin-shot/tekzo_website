// window.dataLayer payloads pushed by the app (not by GTM itself).
// Each shape mirrors an existing push site exactly — see
// docs/context/baseline/README.md §3. Fields copied from API data are
// `unknown` on purpose: the trackers pass them through untouched, and
// narrowing them would change what is pushed for unusual payloads.

/** Ids arrive as numbers from the API but some paths stringify them. */
export type TrackingId = string | number;

/** A value copied from API data into the payload as-is. */
export type TrackingValue = unknown;

/** Any entry in window.dataLayer, including GTM's own (`gtm.js`, `gtm.dom`, …). */
export type DataLayerEntry = Record<string, unknown>;

export type GtmIdleEvent = {
  event: "gtm_idle";
};

export type WebVitalsInpDetails = {
  inp_target?: string;
  inp_event?: string;
  inp_input_delay?: number;
  inp_processing?: number;
  inp_presentation?: number;
};

export type WebVitalsEvent = WebVitalsInpDetails & {
  event: "web_vitals";
  metric_name: string;
  metric_value: number;
  metric_rating: string;
  metric_id: string;
  metric_navigation_type: string;
  page_path: string;
};

/** ProductViewTracker */
export type ViewItemItem = {
  item_id: TrackingValue;
  item_name: TrackingValue;
  item_brand: TrackingValue;
  item_category: TrackingValue;
  price: TrackingValue;
  quantity: 1;
};

export type ViewItemEvent = {
  event: "view_item";
  ecommerce: {
    value: TrackingValue;
    currency: "BDT";
    items: ViewItemItem[];
  };
};

/** ProductDetails (item_variant = sku) and CartModal (adds item_sku; item_variant = attributes joined by "/"). */
export type AddToCartItem = {
  item_id?: TrackingValue;
  item_name?: TrackingValue;
  item_brand?: TrackingValue;
  item_category?: TrackingValue;
  item_sku?: TrackingValue;
  item_variant?: TrackingValue;
  quantity: TrackingValue;
  price: TrackingValue;
};

export type AddToCartEvent = {
  event: "add_to_cart";
  ecommerce: {
    currency: "BDT";
    value: TrackingValue;
    items: AddToCartItem[];
  };
};

/** ProductDetails, DynamicPills, ShareDetails */
export type AddToWishlistItem = {
  item_id?: TrackingValue;
  item_name?: TrackingValue;
  item_brand?: TrackingValue;
  item_category?: TrackingValue;
  quantity: TrackingValue;
  price: TrackingValue;
};

export type AddToWishlistEvent = {
  event: "add_to_wishlist";
  ecommerce: {
    currency: "BDT";
    value: TrackingValue;
    items: AddToWishlistItem[];
  };
};

/** CheckoutTracker */
export type BeginCheckoutItem = {
  item_id: TrackingValue;
  item_name: TrackingValue;
  item_brand: TrackingValue;
  item_category: TrackingValue;
  quantity: TrackingValue;
  price: TrackingValue;
  item_variant: TrackingValue;
  item_sku: TrackingValue;
};

export type BeginCheckoutEvent = {
  event: "begin_checkout";
  ecommerce: {
    currency: "BDT";
    value: number;
    items: BeginCheckoutItem[];
  };
};

/** PurchaseTracker — money fields are 2-decimal strings ("875.00"). */
export type PurchaseItem = {
  item_name: TrackingValue;
  item_brand: TrackingValue;
  item_id: string;
  item_sku: TrackingValue;
  price: string;
  imageUrl: TrackingValue;
  item_variant: TrackingValue;
  item_category: TrackingValue;
  item_category2: TrackingValue;
  discount: string;
  quantity: TrackingValue;
  index: number;
};

export type PurchaseUserData = {
  billing_first_name: TrackingValue;
  billing_address: TrackingValue;
  billing_country: "BD";
  billing_state: TrackingValue;
  billing_city: TrackingValue;
  billing_phone: TrackingValue;
  new_customer: "true" | "false";
};

export type PurchaseEvent = {
  event: "purchase";
  ecommerce: {
    transaction_id: TrackingValue;
    value: string;
    tax: 0;
    shipping: string;
    currency: "BDT";
    coupon: TrackingValue;
    discount_amount: string;
    items: PurchaseItem[];
  };
  user_data: PurchaseUserData;
};

/** Every event the app pushes. */
export type DataLayerEvent =
  | GtmIdleEvent
  | WebVitalsEvent
  | ViewItemEvent
  | AddToCartEvent
  | AddToWishlistEvent
  | BeginCheckoutEvent
  | PurchaseEvent;

export type DataLayerEventName = DataLayerEvent["event"];
