"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import hasAuthCookie from "@/utils/hasAuthCookie";

const CounterContext = createContext(null);

export function CounterProvider({
  children,
  initialCartCount = 0,
  initialWishlistCount = 0,
}) {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [wishlistCount, setWishlistCount] = useState(initialWishlistCount);

  const pathname = usePathname();

  const refreshCart = useCallback(async () => {
    if (!hasAuthCookie()) {
      setCartCount(0);
      return;
    }
    try {
      const res = await clientFetchAPI("/customer/carts", "GET");
      const items = res?.data?.cartItems ?? [];
      setCartCount(items.length);
    } catch {
      // silently fail — user may not be logged in
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!hasAuthCookie()) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await clientFetchAPI("/customer/wishlists", "GET");
      const payload = res?.data ?? res ?? {};
      const items =
        payload.wishlists ??
        payload.wishlistItems ??
        payload.cartItems ??
        payload.items ??
        (Array.isArray(payload) ? payload : []);
      setWishlistCount(Array.isArray(items) ? items.length : 0);
    } catch {
      // silently fail
    }
  }, []);

  const incrementCart = useCallback(() => setCartCount((c) => c + 1), []);
  const incrementWishlist = useCallback(
    () => setWishlistCount((c) => c + 1),
    [],
  );
  const decrementWishlist = useCallback(
    () => setWishlistCount((c) => Math.max(0, c - 1)),
    [],
  );

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

  // Listen for custom events fired from anywhere in the app
  useEffect(() => {
    const onCartAdd = () => incrementCart();
    const onCartRemove = () => setCartCount((c) => Math.max(0, c - 1));
    const onWishlistAdd = () => incrementWishlist();
    const onWishlistRemove = () => decrementWishlist();

    window.addEventListener("cart:added", onCartAdd);
    window.addEventListener("cart:removed", onCartRemove);
    window.addEventListener("wishlist:added", onWishlistAdd);
    window.addEventListener("wishlist:removed", onWishlistRemove);

    return () => {
      window.removeEventListener("cart:added", onCartAdd);
      window.removeEventListener("cart:removed", onCartRemove);
      window.removeEventListener("wishlist:added", onWishlistAdd);
      window.removeEventListener("wishlist:removed", onWishlistRemove);
    };
  }, [incrementCart, incrementWishlist, decrementWishlist]);

  const value = useMemo(
    () => ({
      cartCount,
      wishlistCount,
      refreshCart,
      refreshWishlist,
      setCartCount,
      setWishlistCount,
    }),
    [cartCount, wishlistCount, refreshCart, refreshWishlist],
  );

  return (
    <CounterContext.Provider value={value}>{children}</CounterContext.Provider>
  );
}

export function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error("useCounter must be used inside CounterProvider");
  return ctx;
}

// Helper to fire events from anywhere (no import of context needed)
export function fireCartAdded() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("cart:added"));
}
export function fireCartRemoved() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("cart:removed"));
}
export function fireWishlistAdded() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("wishlist:added"));
}
export function fireWishlistRemoved() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("wishlist:removed"));
}
