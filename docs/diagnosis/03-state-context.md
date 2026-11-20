# Module: State Management, Context & Hooks
**Path:** `src/context/*`, `src/hooks/*`, `src/utils/scrollLock.js`, plus the `window` event bus and `localStorage` usage spread across components

## 1. Critical Bugs & Security Risks
- **Guest cart lives in `localStorage` with no schema (CONFIRMED).** `CartModal.jsx:214-253` and `checkout/page.jsx` read and write a free-form `cart` array. `checkout/page.jsx:57-75` then has a 9-branch fallback (`item.price → item.final_price → item.variant.final_price → … → item.product.price`) to guess the unit price. Corrupt or stale entries silently produce wrong subtotals in the UI. The backend recomputes totals, so this is not exploitable, but customers see different numbers at checkout than in the cart. There is no versioning or migration for old cart shapes.
- **Counter badges can go wrong (CONFIRMED).** `CounterContext.jsx:69-77` increments and decrements counts from fire-and-forget `window` events (`cart:added`, `cart:removed`, …) without reconciling with the server. Adding the same product twice (where the backend increments quantity) still bumps the badge to +2, and failed API calls that already fired the event leave the badge wrong until reload. `refreshWishlist` guesses the payload key from five possibilities (lines 39-44), which signals an undocumented API contract.
- **Global scroll-lock counter leaks (CONFIRMED).** `utils/scrollLock.js` keeps a module-level `lockCount`. `useModalScrollbar.js:6-11` calls `unlockScroll()` both in the `else` branch **and** in cleanup, so one open/close cycle can decrement twice. That is masked by `Math.max(0, …)`, but if two modals are open, closing one can unlock the page under the other. `useEnsureScrolling()` force-unlocks on mount and can fight an open modal. When a component unmounts mid-animation without cleanup, the page stays `overflow:hidden`. Users report this kind of thing as "the page is frozen".
- **Hydration flicker by design.** `CompareContext.jsx:15-29` and `DashboardThemeContext.jsx:21-47` start with defaults and then load from `localStorage` in `useEffect`. Compare slots and the dashboard theme flash on every page load, and `DashboardThemeContext` toggles `document.documentElement` classes after paint, which gives a flash of the light theme.
- **The root layout wraps the whole app in client providers.** `app/layout.jsx:15-21` wraps **every route** in `CounterProvider` and `CompareProvider`. `CounterProvider` fires two authenticated BFF calls (`/customer/carts`, `/customer/wishlists`) on **every full page load** for logged-in users, even on pages with no cart UI. Its context value object is recreated on every render (line 89), so every consumer re-renders whenever any count changes.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `CounterProvider`, `CompareProvider` and `WelcomePopup` sit at the root, which forces a client boundary high in the tree. Keep providers as thin leaf-wrappers. Initial counts should come from the server (the `initialCartCount`/`initialWishlistCount` props exist but are **never passed**).
- **State Management (Redux Toolkit only rule):**
  - `CounterContext` should become a `cart` slice plus a `wishlist` slice, ideally RTK Query endpoints with tags, so add/remove mutations invalidate and refetch the counts automatically.
  - `CompareContext` should become a `compare` slice, using `redux-persist` or a small listener-middleware for `localStorage`.
  - `DashboardThemeContext` (202 lines) should become a `ui/preferences` slice. Theme should come from a cookie so SSR renders the right class with no flash.
  - The `window` event bus (`fireCartAdded`, `fireWishlistAdded`, `fireCompareAdded`, `userProfileUpdated`) should be replaced by Redux dispatches. `compare:added` is fired but **never listened to**: dead code.
  - Search query, shop filters, sort and pagination should be URL search params, not component state. See `02-search-bug.md` and `07-shop-catalog.md`.
- **File Size:**
  - `DashboardThemeContext.jsx` (202 lines): split the theme, sidebar-collapsed and show-points preferences into a slice plus a `useThemeClassSync` hook.
  - `CounterContext.jsx` (125 lines): it becomes about 40 lines of slice code once Redux is used.
  - `src/hooks/README.md` (189 lines) documents hooks that partly duplicate each other. Fold it into the code via JSDoc/TS.
- **TypeScript:** there is no typing of context values, so consumers destructure fields that may not exist. Define `CartState`, `CompareState` and `UiPreferences` types, and add Zod schemas for every `localStorage` read (`cart`, `compareProducts`, `dash_*`, `cachedNavUser`, `guestCouponCode`).

## 3. Duplication & Technical Debt
- **Two scroll-lock hooks** (`useBodyScrollLock.js`, `useModalScrollbar.js`) plus `usePreventBodyScroll` (deprecated alias) plus direct `lockScroll()` calls in `SearchModalOverlay` and `ProductComparisonHero`. Keep one `useScrollLock(isOpen)` hook. `useModalScrollbar` is never imported (dead).
- **`localStorage` is accessed directly in 14 files** (checkout, CartModal, ProductDetails ×2 plus `.bak` ×2, DeviceCard, DeviceSidebar, ProductSidebar, ProductComparisonHero, NavAuthClient, WelcomePopup, CompareContext, DashboardThemeContext). Centralize it in one `storage.ts` with try/catch, schema validation and namespacing, or in Redux persistence.
- Cart counting logic is duplicated: `CounterContext.refreshCart` counts `cartItems.length` (line 27), while the dashboard `my-bag` page and the checkout compute their own totals.

## 4. Data Fetching & Performance
- `CounterProvider` makes 2 CSR calls per hard navigation (logged-in only, gated by `has_auth`). Seed the counts from the server layout instead.
- Context value objects are not memoized (`CounterContext.jsx:89`, `CompareContext.jsx:74`), so every badge update re-renders all `useCounter()`/`useCompare()` consumers (22 files).
- `DashboardThemeContext` reads three `localStorage` keys and writes `document.documentElement` classes on every theme change. That part is fine, but the initial-paint mismatch is the cost.

## 5. Actionable Refactor Checklist
- [ ] 1. Add `@reduxjs/toolkit` and `react-redux`, and create `src/store/` with `cartSlice`, `wishlistSlice`, `compareSlice`, `authSlice`, `uiSlice`. Add one `StoreProvider` client component.
- [ ] 2. Model cart and wishlist with RTK Query (`baseQuery` pointing to the BFF `/api/*`, with tags `Cart` and `Wishlist`). Remove the `fire*` window events and the `CounterContext` increment/decrement guessing.
- [ ] 3. Seed initial cart and wishlist counts from the server (the `(main)` layout reads the cookie and fetches the counts once, cached per request), and pass them to the store's preloaded state.
- [ ] 4. Define a versioned Zod `GuestCartItemSchema`. Migrate or discard invalid `localStorage.cart` entries on load, and delete the 9-branch unit-price guessing in checkout.
- [ ] 5. Move the dashboard theme to a cookie, read it in `dashboard/layout.jsx`, and render the correct `<html>` class server-side (no flash). Store the sidebar and points preferences in the same `ui` slice.
- [ ] 6. Replace `scrollLock.js` and its three hooks with one `useScrollLock(isOpen)` that is idempotent per caller, using a `Set` of owner IDs instead of a counter.
- [ ] 7. Create `lib/storage.ts` (safe get/set with schema) and replace all direct `localStorage` calls.
- [ ] 8. Delete `useModalScrollbar.js`, `usePreventBodyScroll` and the unused `fireCompareAdded`.
- [ ] 9. Remove `CounterProvider` and `CompareProvider` from `app/layout.jsx` once the Redux `StoreProvider` replaces them. Keep the root layout a Server Component with one thin provider.
