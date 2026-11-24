"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const CompareContext = createContext(null);
// Actions only (stable references). Components that just add to compare —
// every product card — subscribe to this one, so they don't all re-render
// when the compare list changes or when isHydrated flips after mount.
const CompareActionsContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareProducts, setCompareProducts] = useState([null, null]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("compareProducts");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompareProducts(Array.isArray(parsed) ? parsed : [null, null]);
      }
    } catch (err) {
      console.error("Failed to load compare products from localStorage:", err);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever compareProducts changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(
          "compareProducts",
          JSON.stringify(compareProducts),
        );
      } catch (err) {
        console.error("Failed to save compare products to localStorage:", err);
      }
    }
  }, [compareProducts, isHydrated]);

  const addToCompare = useCallback((product) => {
    setCompareProducts((prev) => {
      const next = [...prev];
      // Find first empty slot
      const emptyIndex = next.findIndex((p) => p === null);
      if (emptyIndex !== -1) {
        next[emptyIndex] = product;
      } else {
        // Replace the second product if both slots are full
        next[1] = product;
      }
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((index) => {
    setCompareProducts((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareProducts([null, null]);
  }, []);

  const actions = useMemo(
    () => ({ addToCompare, removeFromCompare, clearCompare }),
    [addToCompare, removeFromCompare, clearCompare],
  );

  const value = useMemo(
    () => ({ compareProducts, isHydrated, ...actions }),
    [compareProducts, isHydrated, actions],
  );

  return (
    <CompareActionsContext.Provider value={actions}>
      <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
    </CompareActionsContext.Provider>
  );
}

export function useCompareActions() {
  const ctx = useContext(CompareActionsContext);
  if (!ctx) throw new Error("useCompareActions must be used inside CompareProvider");
  return ctx;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}

// Helper to fire event from anywhere
export function fireCompareAdded() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("compare:added"));
}
