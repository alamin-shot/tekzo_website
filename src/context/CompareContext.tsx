"use client";

import { createContext, useContext, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type { CompareActionsValue, CompareContextValue } from "@/types/store";
import type { ChildrenProps } from "@/types/props/context";
import { persistCompareProducts, useCompareStore } from "@/stores/compare.store";

// Compatibility layer over src/stores/compare.store.ts (P3). Public API
// (CompareProvider, useCompare, useCompareActions, fireCompareAdded) is
// unchanged.

// Marks "inside CompareProvider" so the hooks keep their old errors outside it.
const CompareProviderMarker = createContext(false);

export function CompareProvider({ children }: ChildrenProps) {
  const hydrate = useCompareStore((s) => s.hydrate);
  const compareProducts = useCompareStore((s) => s.compareProducts);
  const isHydrated = useCompareStore((s) => s.isHydrated);

  // Load from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Save to localStorage whenever compareProducts changes (after hydration),
  // in an effect after commit — the same timing as before.
  useEffect(() => {
    if (isHydrated) persistCompareProducts(compareProducts);
  }, [compareProducts, isHydrated]);

  return <CompareProviderMarker.Provider value={true}>{children}</CompareProviderMarker.Provider>;
}

// Actions only (stable references). Product cards subscribe to this, so they
// don't re-render when the compare list changes or isHydrated flips.
export function useCompareActions(): CompareActionsValue {
  const inside = useContext(CompareProviderMarker);
  const actions = useCompareStore(
    useShallow((s) => ({
      addToCompare: s.addToCompare,
      removeFromCompare: s.removeFromCompare,
      clearCompare: s.clearCompare,
    })),
  );
  if (!inside) throw new Error("useCompareActions must be used inside CompareProvider");
  return actions;
}

export function useCompare(): CompareContextValue {
  const inside = useContext(CompareProviderMarker);
  const value = useCompareStore(
    useShallow((s) => ({
      compareProducts: s.compareProducts,
      isHydrated: s.isHydrated,
      addToCompare: s.addToCompare,
      removeFromCompare: s.removeFromCompare,
      clearCompare: s.clearCompare,
    })),
  );
  if (!inside) throw new Error("useCompare must be used inside CompareProvider");
  return value;
}

// Helper to fire event from anywhere (KNOWN BUG #5: nothing listens — kept).
export function fireCompareAdded(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("compare:added"));
}
