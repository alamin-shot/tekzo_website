# Module: Layout, Navigation, Footer & Global Widgets
**Path:** `src/app/layout.jsx`, `src/app/(main)/layout.jsx`, `src/app/not-found.jsx`, `src/app/(main)/not-found.jsx`, `src/app/ClientNotFoundContent.jsx`, `src/Components/Navbar/**`, `src/Components/Footer/**`, `src/Components/GTM/*`, `src/Components/WelcomePopup.jsx`, `src/Components/WhatsAppPopUp/*`, `src/Components/ReuseableComponent/CustomUIComponent/*`, `src/lib/fonts.js`, `src/app/globals.css`, `src/app/styles/theme.css`

## 1. Critical Bugs & Security Risks
- **No error boundaries anywhere (CONFIRMED).** There is no `error.jsx` in `src/app`, `src/app/(main)` or `src/app/dashboard`, and no `global-error.jsx`. Any render-time exception in a client component (search modal, cart modal, product details) white-screens the entire app, navbar included. This is the single cheapest resilience fix in the codebase.
- **The navbar disappears on product pages.** `NavbarVisibilityWrapper.jsx:7` returns `null` for `/product/*`. Combined with `SearchBar` living only inside `Banner`, product pages have **no navigation and no search**. If that is intentional (for the sticky buy bar), provide an alternative back/search entry.
- **`WelcomePopup` runs on every route.** It sits in the root layout and calls `fetchPublicAPI("/popup-dialogs")` **from the browser** on mount (`WelcomePopup.jsx:45`). That is a cross-origin, uncached call on every hard navigation, with the same CORS/WAF exposure as search. It uses `sessionStorage` for "last pathname" tracking.
- **Mobile sidebar fallback fetching.** `SidebarFunction.jsx:19-33` re-fetches `/categories` and `/brands` from the **browser** if the props are empty. The props come from `Navbar2` (server), so this fallback only fires when the server fetch failed. It then hits the same failing API from the client.
- **`Navbar2.jsx:94`** passes `companySetting?.company_logo` to `next/image` with no fallback. When `getSettings()` fails it returns `[]` (an array), so `company_logo` is `undefined`, and `next/image` throws "missing required src". The navbar render crashes, and so does the whole layout, because there is no error boundary.
- **GTM** (`GTM.jsx`) injects inline scripts with `strategy="beforeInteractive"`. The CSP is **report-only, with no `report-uri`/`report-to`** (`next.config.mjs`), so nothing is collected despite the comment saying reports are being gathered. See `14-config-build-repo.md`.
- `DashboardLayout` injects a global `<style>` that hides **all** scrollbars (`* { scrollbar-width:none }`) for dashboard routes (`dashboard/layout.jsx:23-46`). That is an accessibility problem: users cannot see that content scrolls.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `NavbarVisibilityWrapper` (client) wraps the server `Navbar2` just to read `usePathname()`. Use route-group layouts instead: put `/product/*` in a group without the navbar.
  - `NavAuthClient` fetches the user client-side on every navigation (see `01`).
  - `Footer.jsx` is a client component only for the Lottie `IntersectionObserver` gate. Keep the footer server-side and make the animation a leaf island (it already is `FooterAnimations`, but `Footer` itself does not need to be client).
  - `PreFetchLink`, `RouterStaleRecovery`, `WelcomePopup`, `CounterProvider` and `CompareProvider` at the root: too much client surface on every route.
- **State Management:** popup "seen" state is in `sessionStorage`; nav user is in `localStorage`; hover-menu state is in `NavHoverEffect`; mobile sidebar state is in `SidebarFunction`. The menus are fine as local state. The popup and user state belong in Redux (`ui`/`auth` slices).
- **File Size (over 100 lines):** `SidebarFunction.jsx` (170), `NavItemsData/ModalBox.jsx` (166), `NavFunction/SidebarItems.jsx` (138), `NavItemsData/SidebarItems.jsx` (132), `NavAuthClient.jsx` (135), `Navbar2.jsx` (121), `Navbar.jsx` (110, dead), `WelcomePopup.jsx` (152), `GTM.jsx` (125), `(main)/layout.jsx` (136, of which 100 lines are metadata; move them to `utils/buildMetadata.js`, which exists), `globals.css` (506), `styles/theme.css` (334).
- **TypeScript:** `companySetting` is passed through layout → Navbar → Sidebar → Footer → WhatsApp untyped, and `getSettings()` returns `[]` on error but an object on success. Type it as `CompanySettings | null`.

## 3. Duplication & Technical Debt
- `Navbar.jsx` (110) vs `Navbar2.jsx` (121): `Navbar.jsx` is **unused**. Delete it, and rename `Navbar2` to `Navbar`.
- `NavFunction/SidebarItems.jsx` (138) vs `NavItemsData/SidebarItems.jsx` (132): two files with the same name and similar size. Keep one.
- `NavFunction/NavHoverServer.jsx` and `NavItemsData/FetchItemsData.jsx` (1 line) are **unused**.
- `app/not-found.jsx` vs `app/(main)/not-found.jsx`, plus `ClientNotFoundContent.jsx` (client, Lottie `not-found.json` at 646 KB). Keep one not-found experience. A 646 KB animation on a 404 page is excessive.
- `RouterStaleRecovery` re-implements the router's own error recovery (see `04`).
- `lib/fonts.js` loads Switzer (20 woff2 weights under `src/fonts/Switzer/...`) and Bornomala. Verify that only the used weights are declared; shipping all 20 is wasteful.

## 4. Data Fetching & Performance
- The `(main)` layout fetches `getSettings()` (cached forever and tagged). `Navbar2` fetches `getCategories()` and `getBrands()` (cached). Good: they are server-side and deduped.
- **Client-side fetches on every page load:** `WelcomePopup` (`/popup-dialogs`), `CounterProvider` (`/customer/carts` and `/customer/wishlists` for logged-in users), and `NavAuthClient` (`/customer/profile` on every pathname change). That is 2-4 extra requests per navigation before the user does anything.
- **Lottie:** the footer gates `lottie-react` (about 240 KB of runtime plus JSON) behind `IntersectionObserver` (good), but it still loads on every page as soon as the user scrolls to the footer. Prefer a looping WebM, an AVIF sequence or CSS. The 404 page loads a 646 KB JSON.
- **CSS:** `globals.css` (506 lines) plus `theme.css` (334) plus `navbar.css`, `dashboard.css`, `Swiper/styles*.css` and `shop/page.module.css`, which is imported as a **global** stylesheet (`shop/page.jsx:2` uses `import "./page.module.css"` with no binding, so the module scoping is lost).

## 5. Actionable Refactor Checklist
- [ ] 1. Add `src/app/global-error.jsx`, `src/app/(main)/error.jsx` and `src/app/dashboard/error.jsx` with a retry button. Add `loading.jsx` where routes stream.
- [ ] 2. Make `getSettings()` return `null` on failure, not `[]`, and give `Navbar2` and `Footer` safe fallbacks for the logo and text.
- [ ] 3. Replace `NavbarVisibilityWrapper` with route-group layouts (`(main)/(with-nav)/…` vs `(main)/(product)/product/[slug]`).
- [ ] 4. Mount one global search trigger in the navbar so every page has search (see `02`).
- [ ] 5. Move `WelcomePopup` data to the server: fetch `/popup-dialogs` in the layout (cached and tagged) and pass it as props. Track "seen" state in a cookie.
- [ ] 6. Remove the client fallback fetching from `SidebarFunction`, and render an error state instead.
- [ ] 7. Delete `Navbar.jsx`, `NavHoverServer.jsx`, `FetchItemsData.jsx` and one of the two `SidebarItems.jsx`.
- [ ] 8. Move the `(main)/layout.jsx` metadata into `utils/buildMetadata.js`.
- [ ] 9. Replace the Lottie footer and 404 animations with lightweight assets, then drop `lottie-react` entirely if possible.
- [ ] 10. Remove the global scrollbar-hiding `<style>` from the dashboard layout. Use a scoped utility class on specific scroll containers.
- [ ] 11. Fix the `shop/page.module.css` import: either bind it (`import styles from …`) or rename it to a plain `.css` file.
- [ ] 12. Audit `lib/fonts.js` and ship only the used Switzer weights (ideally the variable font only).
