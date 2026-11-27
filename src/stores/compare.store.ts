import { create } from "zustand";
import type { CompareSlots, CompareStore } from "@/types/store";
import { isList } from "@/lib/json";

// Two compare slots (was React state inside CompareProvider).
//
// Storage parity: localStorage["compareProducts"] keeps its plain JSON array
// shape (`[product|null, product|null]`). Zustand's `persist` middleware is
// deliberately NOT used — it would wrap the value as {"state":…,"version":0}
// and break the compare page, which reads the key directly.
// KNOWN BUG #5 (preserved): ProductComparisonHero reads/writes the key
// itself, bypassing this store.
//
// Hydration: initial state is `[null, null]` / isHydrated=false on server and
// client alike; CompareProvider calls hydrate() after mount, then writes
// every change back (see persistCompareProducts) — same order as before.

const STORAGE_KEY = "compareProducts";
const EMPTY: CompareSlots = [null, null];

export const useCompareStore = create<CompareStore>()((set) => ({
  compareProducts: EMPTY,
  isHydrated: false,

  // One update, like the old batched setCompareProducts + setIsHydrated.
  hydrate: () => {
    let loaded: CompareSlots | undefined;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        loaded = isList(parsed) ? parsed : [null, null];
      }
    } catch (err) {
      console.error("Failed to load compare products from localStorage:", err);
    }
    set(loaded ? { compareProducts: loaded, isHydrated: true } : { isHydrated: true });
  },

  addToCompare: (product) =>
    set((s) => {
      const next = [...s.compareProducts];
      // Find first empty slot
      const emptyIndex = next.findIndex((p) => p === null);
      if (emptyIndex !== -1) {
        next[emptyIndex] = product;
      } else {
        // Replace the second product if both slots are full
        next[1] = product;
      }
      return { compareProducts: next };
    }),

  removeFromCompare: (index) =>
    set((s) => {
      const next = [...s.compareProducts];
      next[index] = null;
      return { compareProducts: next };
    }),

  clearCompare: () => set({ compareProducts: [null, null] }),
}));

/** Writes the slots back to localStorage (after hydration only), as the old save effect did. */
export function persistCompareProducts(compareProducts: CompareSlots): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareProducts));
  } catch (err) {
    console.error("Failed to save compare products to localStorage:", err);
  }
}

// Selectors
export const selectCompareProducts = (s: CompareStore): CompareSlots => s.compareProducts;
export const selectIsCompareHydrated = (s: CompareStore): boolean => s.isHydrated;
