"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import type { CounterContextValue } from "@/types/store";
import type { CounterProviderProps } from "@/types/props/context";
import { useCounterStore } from "@/stores/counter.store";

// Compatibility layer over src/stores/counter.store.ts (P3). The public API
// (CounterProvider, useCounter, fire* helpers) is unchanged; state now lives
// in the Zustand store and this provider only wires the side effects.

// Marks "inside CounterProvider" so useCounter keeps its old error outside it.
const CounterProviderMarker = createContext(false);

export function CounterProvider({ children }: CounterProviderProps) {
  // (initialCartCount / initialWishlistCount were never passed anywhere; the
  // store starts at 0/0, which is what they defaulted to.)
  const pathname = usePathname();
  const refreshCart = useCounterStore((s) => s.refreshCart);
  const refreshWishlist = useCounterStore((s) => s.refreshWishlist);
  const incrementCart = useCounterStore((s) => s.incrementCart);
  const decrementCart = useCounterStore((s) => s.decrementCart);
  const incrementWishlist = useCounterStore((s) => s.incrementWishlist);
  const decrementWishlist = useCounterStore((s) => s.decrementWishlist);

  // This provider lives in the root layout and never remounts, so a
  // mount-only fetch leaves stale counts after login/logout (client-side
  // redirects) or after a failed first request. Re-sync on every route
  // change and when the tab regains focus.
  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, [pathname, refreshCart, refreshWishlist]);

  useEffect(() => {
    const onFocus = () => {
      refreshCart();
      refreshWishlist();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshCart, refreshWishlist]);

  // Cart / wishlist events fired from anywhere in the app (bug #2 fixed):
  // apply the optimistic ±1 right away, then re-sync from the source of truth
  // (server for signed-in users, localStorage for guests) so the badge never
  // drifts. `storage` covers the guest cart changing in another tab.
  useEffect(() => {
    const onCartAdded = () => { incrementCart(); refreshCart(); };
    const onCartRemoved = () => { decrementCart(); refreshCart(); };
    const onWishlistAdded = () => { incrementWishlist(); refreshWishlist(); };
    const onWishlistRemoved = () => { decrementWishlist(); refreshWishlist(); };
    const onStorage = (e: StorageEvent) => { if (e.key === "cart") refreshCart(); };
    window.addEventListener("cart:added", onCartAdded);
    window.addEventListener("cart:removed", onCartRemoved);
    window.addEventListener("wishlist:added", onWishlistAdded);
    window.addEventListener("wishlist:removed", onWishlistRemoved);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cart:added", onCartAdded);
      window.removeEventListener("cart:removed", onCartRemoved);
      window.removeEventListener("wishlist:added", onWishlistAdded);
      window.removeEventListener("wishlist:removed", onWishlistRemoved);
      window.removeEventListener("storage", onStorage);
    };
  }, [incrementCart, decrementCart, incrementWishlist, decrementWishlist, refreshCart, refreshWishlist]);

  return <CounterProviderMarker.Provider value={true}>{children}</CounterProviderMarker.Provider>;
}

export function useCounter(): CounterContextValue {
  const inside = useContext(CounterProviderMarker);
  const value = useCounterStore(
    useShallow((s) => ({
      cartCount: s.cartCount,
      wishlistCount: s.wishlistCount,
      refreshCart: s.refreshCart,
      refreshWishlist: s.refreshWishlist,
      setCartCount: s.setCartCount,
      setWishlistCount: s.setWishlistCount,
    })),
  );
  if (!inside) throw new Error("useCounter must be used inside CounterProvider");
  return value;
}

// Helper to fire events from anywhere (no import of context needed)
export function fireCartAdded(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:added"));
}
export function fireCartRemoved(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:removed"));
}
export function fireWishlistAdded(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("wishlist:added"));
}
export function fireWishlistRemoved(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("wishlist:removed"));
}
