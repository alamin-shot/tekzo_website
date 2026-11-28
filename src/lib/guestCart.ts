// Guest cart in localStorage["cart"] (AUDIT_NOTES bug #1).
//
// Every reader and writer of the guest cart goes through this module. It keeps
// the exact JSON each entry point wrote before unification: the same keys, key
// order, merge rule and error behaviour. The item shape is documented as
// `GuestCartItem` in src/types/cart.ts.
//
// Merge rules (unchanged, one per kind of entry point):
// - replaceGuestItem: product page (new devices) replaces the matching entry.
// - mergeGuestItem: CartModal spreads the new fields over the matching entry
//   and adds the quantities.
// - incrementOrAddGuestItem: used-device entry points add to the matching
//   entry's quantity or append the new item.
// Every rule caps quantities (F1, 28 Nov 2026): 10 per item, 1 for pre-owned.
import type { GuestCartItem, GuestCartMatch } from "@/types/cart";
import type { JsonRecord } from "@/types/json";
import { fieldsOf, isList, isRecord, itemOpt, rec } from "@/lib/json";

const STORAGE_KEY = "cart";

/** Same limits as the signed-in cart and checkout: 10 per item, 1 for a pre-owned device. */
export const GUEST_CART_MAX_QUANTITY = 10;

/** A stored quantity clamped to the cart rules (1–10, or exactly 1 for a pre-owned device). */
export function capGuestQuantity(quantity: unknown, preOwnedId: unknown): number {
  if (preOwnedId) return 1;
  return Math.min(GUEST_CART_MAX_QUANTITY, Math.max(1, Number(quantity) || 1));
}

/** Number of entries in the guest cart (the badge count); 0 for a missing or unreadable cart. */
export function guestCartCount(): number {
  try {
    const cart = readGuestCart();
    return isList(cart) ? cart.length : 0;
  } catch {
    return 0;
  }
}

/** `JSON.parse(localStorage.getItem("cart") || "[]")` — whatever is stored. */
export function readGuestCart(): unknown {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

/**
 * The stored cart as a list. A non-array cart threw on the writer's first array
 * call (`cart.<op>`); the same TypeError is thrown here.
 */
export function readGuestCartList(op: string): unknown[] {
  const cart = readGuestCart();
  if (!isList(cart)) throw new TypeError(`cart.${op} is not a function`);
  return cart;
}

/** `localStorage.setItem("cart", JSON.stringify(list))`. */
export function writeGuestCart(list: unknown[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** `localStorage.removeItem("cart")` (after a guest order is placed). */
export function clearGuestCart(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** `cart.some((item) => item.pre_owned_id === preOwnedId)` (a null entry throws, as before). */
export function hasPreOwnedItem(list: unknown[], preOwnedId: unknown): boolean {
  return list.some((entry) => fieldsOf(entry).pre_owned_id === preOwnedId);
}

/** Product page: replace the matching entry, else append. */
export function replaceGuestItem(list: unknown[], match: GuestCartMatch, item: GuestCartItem): void {
  item.quantity = capGuestQuantity(item.quantity, item.pre_owned_id);
  const index = list.findIndex(match);
  if (index !== -1) {
    list[index] = item;
  } else {
    list.push(item);
  }
}

/** CartModal: `{ ...old, ...item, quantity: old.quantity + quantity }` (capped), else append. */
export function mergeGuestItem(list: unknown[], match: GuestCartMatch, item: GuestCartItem, quantity: number): void {
  const index = list.findIndex(match);
  if (index !== -1) {
    const merged = { ...Object.assign({}, list[index]), ...item };
    list[index] = { ...merged, quantity: capGuestQuantity(Number(fieldsOf(list[index]).quantity) + quantity, merged.pre_owned_id) };
  } else {
    list.push({ ...item, quantity: capGuestQuantity(item.quantity, item.pre_owned_id) });
  }
}

/**
 * Used-device entry points: `cart[i].quantity += quantity`, else append the new item.
 * `build` runs only when nothing matches, as the item literal did.
 */
export function incrementOrAddGuestItem(list: unknown[], match: GuestCartMatch, quantity: number, build: () => GuestCartItem): void {
  const index = list.findIndex(match);
  if (index !== -1) {
    // assigning on a non-object entry threw in strict mode
    const entry = list[index];
    if (!isRecord(entry)) throw new TypeError("Cannot create property 'quantity' on a primitive cart entry");
    entry.quantity = capGuestQuantity(Number(entry.quantity) + quantity, entry.pre_owned_id);
  } else {
    const item = build();
    list.push({ ...item, quantity: capGuestQuantity(item.quantity, item.pre_owned_id) });
  }
}

/** Serialize a checkout cart line back to the stored shape (checkout qty change / delete). */
export function toStorageItem(i: JsonRecord): JsonRecord {
  return {
    slug: i.slug,
    productId: i.productId || i.product_id || 0,
    variantId: i.variantId,
    productVariantId: i.productVariantId || i.product_variant_id || 0,
    quantity: i.quantity,
    ...(i.pre_owned_id ? { pre_owned_id: i.pre_owned_id } : {}),
    productName: i.productName || rec(i.product)?.product_name || "",
    productImage: i.productImage || rec(i.product)?.product_image || rec(itemOpt(rec(i.product)?.images, 0))?.image_path || "",
    variantPrice: i.variantPrice ?? rec(i.variant)?.final_price ?? 0,
    regularPrice: i.regularPrice ?? rec(i.variant)?.final_price ?? 0,
    variantAttr: i.variantAttr || rec(i.variant)?.attribute_value || "",
    bookingAmount: i.bookingAmount ?? rec(i.product)?.booking_amount ?? 0,
    ...(i.maxRetailPrice ? { maxRetailPrice: i.maxRetailPrice } : {}),
    ...(i.giftId
      ? {
          giftId: i.giftId,
          giftProductName: i.giftProductName || "",
          giftProductImage: i.giftProductImage || "",
        }
      : {}),
    ...(i.tekzoCareId
      ? {
          tekzoCareId: i.tekzoCareId,
          tekzoCareAmount: i.tekzoCareAmount,
          tekzoCarePlanName: i.tekzoCarePlanName,
        }
      : {}),
  };
}
