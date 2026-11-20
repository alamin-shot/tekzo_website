# Module: Customer Dashboard
**Path:** `src/app/dashboard/**`, `src/Components/Dashboard/**`, `src/context/DashboardThemeContext.jsx`, `src/fetch-API/getRecentOrder.js`, `src/app/dashboard/dashboard.css`, `src/app/styles/theme.css`

## 1. Critical Bugs & Security Risks
- **Sessions are destroyed on API hiccups.** Every dashboard route passes through `proxy.js`, which deletes the auth cookies on *any* fetch failure (see `01` §1). During the current 522 outage, every dashboard visit logs the user out.
- **Triple authentication per navigation:** proxy `/customer/profile`, then `dashboard/layout.jsx` `getAuthUser()` (`force-dynamic`), then `NavAuthClient` (not rendered in the dashboard, but `DashboardLayoutClient` receives `user` and child pages refetch their own data). Sign-out and auth-expiry handling is inconsistent across these layers.
- **The layout has no error boundary.** Since `dashboard/layout.jsx` is `force-dynamic` and awaits `getAuthUser()`, which catches its own errors, a failing profile fetch renders the dashboard with `user = null` instead of redirecting. Child pages then make client calls that 401. Add `dashboard/error.jsx`, and `redirect('/login')` when `user` is null.
- **Raw `<img>` tags** in `my-bag/page.jsx`, `wishlist/page.jsx` and `edit-profile/EditProfile.jsx` bypass `next/image`. That means no optimization, and user-uploaded avatar URLs load directly. For avatars, validate the host or proxy them.
- **`EditProfile.jsx` (749 lines)**: profile and avatar upload go through the generic BFF multipart pass-through (see `09` §1). Confirm the file type and size limits client-side and server-side (inferred from size: hand-written validation, no schema).
- **Global scrollbar hiding** via the inline `<style>` in `dashboard/layout.jsx:23-46` (`* { scrollbar-width: none !important }`) is an accessibility regression for keyboard and trackpad users.
- `all-orders/page.jsx:220` builds invoice download URLs from `NEXT_PUBLIC_API_URL` in the browser. If the invoice endpoint requires auth, it either fails cross-origin or leaks the token via query string. Inspect it and move it to a BFF route.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:** **every dashboard page is `"use client"`**: `address-book` (223), `default-billing-address` (194), `default-shipping-address` (194), `all-orders` (652), `my-bag` (533), `order-status/[id]` (454), `wishlist` (325), `coupons` (189), `my-sell-requests` (366), `review-history` (245), `to-reviews` (165) and `to-reviews/[id]` (273). Each fetches with `clientFetchAPI` inside `useEffect` (CSR waterfall: layout → hydrate → fetch → render).
  - These should be Server Components that fetch with the cookie token (server-only `fetchAPI`), with small client islands for mutations (Server Actions with `revalidatePath`).
- `profile/page.jsx` → `ProfileView.jsx` (658, client), `edit-profile/page.jsx` → `EditProfile.jsx` (749, client) and `elite-status/page.jsx` → `EliteContent.jsx` (334, client) are good server wrappers, but the client parts are oversized.
- **State Management:** orders pagination and search in `all-orders/page.jsx:525-528` (`search`, `page`, `lastPage`) and the status-tab state are local state. They must be URL params (`?status=&page=&q=`). The six status routes (`cancelled`, `confirmed-order`, `delivered`, `pending-order`, `processing-order`, `ready-to-ship`, `return`; 5 lines each) suggest the list is already filtered by route. Unify them as `/dashboard/orders?status=…` or as one dynamic `[status]` segment. `DashboardThemeContext` should become a Redux `ui` slice with cookie persistence (see `03`).
- **File Size (over 100 lines):** `EditProfile.jsx` (749), `ProfileView.jsx` (658), `all-orders` (652), `Sidebar.jsx` (604), `my-bag` (533), `order-status/[id]` (454), `AddAddressPopup.jsx` (378), `my-sell-requests` (366), `EliteContent.jsx` (334), `DashboardMobileDrawer.jsx` (332), `wishlist` (325), `manage-account` (299), `DashboardTopNavbar.jsx` (282), `to-reviews/[id]` (273), `OrderStatusList.jsx` (251), `review-history` (245), `address-book` (223), `DashboardThemeContext` (202), `DashboardBottomNav.jsx` (197), `default-*-address` (194 ×2), `coupons` (189), `DashboardTable.jsx` (175, dead), `to-reviews` (165), `DashboardMobileHeader.jsx` (128).
  - **Navigation:** `Sidebar.jsx` (604), `DashboardMobileDrawer.jsx` (332), `DashboardTopNavbar.jsx` (282) and `DashboardBottomNav.jsx` (197) almost certainly duplicate the same menu definition. Extract one `dashboardNav.config.ts` and render it through small `NavItem` components.
  - **Orders:** split `all-orders` into `OrdersTable`, `OrderRow`, `PayDueModal` (lines 45-48 show an embedded payment modal) and `InvoiceButton`.
- **TypeScript:** order, address, review, coupon, sell-request and statistics payloads are untyped. Add Zod schemas per endpoint.

## 3. Duplication & Technical Debt
- `default-billing-address/page.jsx` and `default-shipping-address/page.jsx` are both **194 lines**, almost certainly copy-paste. Use one `DefaultAddressPage type="billing" | "shipping"`.
- The seven order-status pages (5 lines each) re-export the same list with a status prop. Use one dynamic route.
- The dashboard menu is defined four times (see above).
- `Dashboard/DashboardTable.jsx` (175) and `Dashboard/ManageAccount/ManageAccount.jsx` (7) are **unused**.
- `dashboard/sell-your-device/*` vs `(main)/(used-device)/sell-your-device` vs `Components/SellYourDevice/*` (1,096 + 375 lines): three entry points for one feature (see `11`).
- `fetch-API/getRecentOrder.js` is a `"use server"` module (a public Server Action; see `01`).

## 4. Data Fetching & Performance
- **CSR everywhere:** the dashboard shell renders, then each page shows a spinner while `clientFetchAPI` round-trips browser → BFF → API. Server rendering removes one hop and the spinner.
- There is no caching or dedupe between pages (orders refetched per tab). RTK Query (or server components with `cache()`) would dedupe.
- `force-dynamic` on the layout is correct for authenticated content, but combined with the proxy check it means two blocking profile fetches before first byte.
- **Images:** raw `<img>` for avatars and cart thumbnails (see §1).

## 5. Actionable Refactor Checklist
- [ ] 1. Fix proxy cookie deletion (see `01` item 1). Add `dashboard/error.jsx` and redirect when `user` is null in the layout.
- [ ] 2. Convert dashboard pages to Server Components fetching via server-only helpers. Move mutations to Server Actions with Zod validation and `revalidatePath('/dashboard/...')`.
- [ ] 3. Put the orders filter, status, page and search into URL params, and collapse the seven status routes into one `orders/[status]` (or `?status=`) route.
- [ ] 4. Extract `dashboardNav.config` and make `Sidebar`, `MobileDrawer`, `TopNavbar` and `BottomNav` render from it (each ≤100 lines).
- [ ] 5. Merge the billing and shipping default-address pages into one component.
- [ ] 6. Split `EditProfile`, `ProfileView`, `all-orders`, `my-bag`, `order-status/[id]` and `AddAddressPopup` into components of ≤100 lines.
- [ ] 7. Replace raw `<img>` with `next/image`, and add the avatar host to `remotePatterns`.
- [ ] 8. Move invoice downloads behind a BFF route that streams the PDF with the server-held token.
- [ ] 9. Remove the global scrollbar-hiding style.
- [ ] 10. Delete `DashboardTable.jsx` and `ManageAccount/ManageAccount.jsx`. Migrate `DashboardThemeContext` to Redux and a cookie.
- [ ] 11. Add Zod and TS types for every dashboard payload.
