import { create } from "zustand";
import type { BadgeCount, CountUpdate, CounterStore } from "@/types/store";
import clientFetchAPI from "@/utils/clientFetchAPI";
import hasAuthCookie from "@/utils/hasAuthCookie";
import { isList, rec } from "@/lib/json";

// Cart / wishlist badge counts (was React state inside CounterProvider).
//
// KNOWN BUG #2 (preserved): counts move ±1 on window events between
// re-syncs (route change, window focus), with no server reconciliation in
// between. The event wiring stays in CounterProvider; this store only holds
// the numbers and the fetch logic, ported line for line.
//
// SSR: the store is a module singleton, but nothing writes to it on the
// server — every action runs from client effects/handlers — so server
// renders always see the initial 0/0, exactly like the old useState(0).

const apply = (update: CountUpdate, prev: BadgeCount): BadgeCount => (typeof update === "function" ? update(prev) : update);

// `items.length` as the old code read it (strings and arrays have one; other
// values give undefined → empty badge, as before).
const lengthOf = (items: unknown): BadgeCount => {
  if (typeof items === "string" || isList(items)) return items.length;
  const length = rec(items)?.length;
  return typeof length === "number" ? length : undefined;
};

// `c + 1` / `c - 1` with c possibly undefined → NaN, same as before.
const plus = (c: BadgeCount, n: number): number => (c ?? NaN) + n;

export const useCounterStore = create<CounterStore>()((set) => ({
  cartCount: 0,
  wishlistCount: 0,

  setCartCount: (update) => set((s) => ({ cartCount: apply(update, s.cartCount) })),
  setWishlistCount: (update) => set((s) => ({ wishlistCount: apply(update, s.wishlistCount) })),

  incrementCart: () => set((s) => ({ cartCount: plus(s.cartCount, 1) })),
  decrementCart: () => set((s) => ({ cartCount: Math.max(0, plus(s.cartCount, -1)) })),
  incrementWishlist: () => set((s) => ({ wishlistCount: plus(s.wishlistCount, 1) })),
  decrementWishlist: () => set((s) => ({ wishlistCount: Math.max(0, plus(s.wishlistCount, -1)) })),

  refreshCart: async () => {
    if (!hasAuthCookie()) {
      set({ cartCount: 0 });
      return;
    }
    try {
      const res = await clientFetchAPI("/customer/carts", "GET");
      const items = rec(rec(res)?.data)?.cartItems ?? [];
      set({ cartCount: lengthOf(items) });
    } catch {
      // silently fail — user may not be logged in
    }
  },

  refreshWishlist: async () => {
    if (!hasAuthCookie()) {
      set({ wishlistCount: 0 });
      return;
    }
    try {
      const res = await clientFetchAPI("/customer/wishlists", "GET");
      const payload = rec(res)?.data ?? res ?? {};
      const p = rec(payload);
      const items = p?.wishlists ?? p?.wishlistItems ?? p?.cartItems ?? p?.items ?? (isList(payload) ? payload : []);
      set({ wishlistCount: isList(items) ? items.length : 0 });
    } catch {
      // silently fail
    }
  },
}));

// Selectors
export const selectCartCount = (s: CounterStore): BadgeCount => s.cartCount;
export const selectWishlistCount = (s: CounterStore): BadgeCount => s.wishlistCount;
