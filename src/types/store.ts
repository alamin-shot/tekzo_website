// Zustand store shapes (src/stores/*). State, actions and the values the
// legacy context hooks (useCounter, useCompare, useCompareActions,
// useDashboardTheme) return. Keep these in step with docs/context/SYSTEM_MAP.md §6.

// ─── Counter (cart / wishlist badge counts) ─────────────────────────────

/**
 * A badge count. `undefined` is kept on purpose: the legacy provider stored
 * `cartItems.length` as-is, so a malformed payload produced an empty badge.
 */
export type BadgeCount = number | undefined;

/** React-style setter argument (value or updater), as `useState` setters accepted. */
export type CountUpdate = BadgeCount | ((prev: BadgeCount) => BadgeCount);

export type CounterState = {
  cartCount: BadgeCount;
  wishlistCount: BadgeCount;
};

export type CounterActions = {
  setCartCount: (update: CountUpdate) => void;
  setWishlistCount: (update: CountUpdate) => void;
  /** `cart:added` → +1 (KNOWN BUG #2: optimistic, re-synced only on route change / focus). */
  incrementCart: () => void;
  /** `cart:removed` → −1, floored at 0. */
  decrementCart: () => void;
  incrementWishlist: () => void;
  decrementWishlist: () => void;
  /** GET /customer/carts (only when the has_auth cookie is present; else 0). */
  refreshCart: () => Promise<void>;
  /** GET /customer/wishlists (only when the has_auth cookie is present; else 0). */
  refreshWishlist: () => Promise<void>;
};

export type CounterStore = CounterState & CounterActions;

/** What useCounter() returns (unchanged from the context version). */
export type CounterContextValue = Pick<CounterStore, "cartCount" | "wishlistCount" | "refreshCart" | "refreshWishlist" | "setCartCount" | "setWishlistCount">;

// ─── Compare (two product slots) ────────────────────────────────────────

/**
 * Compare slots as stored in localStorage["compareProducts"]: normally
 * `[product | null, product | null]`, but whatever array was stored is used
 * as-is (products are raw API objects, unvalidated).
 */
export type CompareSlots = unknown[];

export type CompareState = {
  compareProducts: CompareSlots;
  /** True once localStorage has been read on the client (never on the server). */
  isHydrated: boolean;
};

export type CompareActionsValue = {
  addToCompare: (product: unknown) => void;
  removeFromCompare: (index: number) => void;
  clearCompare: () => void;
};

export type CompareStore = CompareState &
  CompareActionsValue & {
    /** Reads localStorage once after mount (CompareProvider). */
    hydrate: () => void;
  };

/** What useCompare() returns. */
export type CompareContextValue = CompareState & CompareActionsValue;

// ─── Dashboard UI preferences ───────────────────────────────────────────

export type DashboardTheme = "light" | "dark";

export type DashboardUiState = {
  theme: DashboardTheme;
  isSidebarCollapsed: boolean;
  showPoints: boolean;
};

/** Event-like object toggleTheme reads the ripple origin from (click event, or anything with clientX/clientY). */
export type ThemeToggleOrigin = {
  currentTarget?: unknown;
  target?: unknown;
  clientX?: unknown;
  clientY?: unknown;
};

export type DashboardUiActions = {
  setTheme: (theme: unknown) => void;
  toggleTheme: (event?: ThemeToggleOrigin | null) => void;
  toggleSidebar: () => void;
  toggleShowPoints: () => void;
  /** Reads the three dash_* localStorage keys once after mount. */
  hydrate: () => void;
};

export type DashboardUiStore = DashboardUiState & DashboardUiActions;

/** What useDashboardTheme() returns (adds the derived `isLight`). */
export type DashboardThemeContextValue = DashboardUiState &
  Omit<DashboardUiActions, "hydrate"> & {
    isLight: boolean;
  };
