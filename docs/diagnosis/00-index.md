# Module: Diagnosis Index & Cross-Cutting Summary
**Path:** `docs/diagnosis/` (covers all of `src/` plus the root config)

> Analysis date: 2026-11-19, from commit `6f88ab4` on `main`. Analysis only: no application code was changed.
> **Method:** I read the repository directly, because the Gitingest files were not attached. I also used `git log`, the local `.next` build and fetch cache (for real API response shapes), the committed `search-iph.txt` capture, and live HTTP probes.
> **Environment note:** at analysis time, `web-api.tekzo.com.bd` **and** `www.tekzo.com.bd` both returned **Cloudflare 522** (origin unreachable).

| # | File | Scope |
|---|------|-------|
| 01 | `01-auth-middleware.md` | `proxy.js`, login/register/reset, sessions |
| 02 | `02-search-bug.md` | **Priority: search root-cause analysis** |
| 03 | `03-state-context.md` | Context, hooks, `localStorage`, event bus → Redux |
| 04 | `04-ui-reusable.md` | Cards, sliders, headings, forms, loaders |
| 05 | `05-home.md` | Home page sections |
| 06 | `06-layout-navigation.md` | Root and main layouts, navbar, footer, GTM, popups, error boundaries |
| 07 | `07-shop-catalog.md` | Shop, categories, brands, tags, offers, listings, filters |
| 08 | `08-product-details-compare.md` | Product page, compare, JSON-LD, trackers |
| 09 | `09-checkout-cart-orders.md` | Cart modal, checkout, orders, BFF `client-fetch` |
| 10 | `10-dashboard.md` | Customer dashboard |
| 11 | `11-used-preowned-refurbished.md` | Used, pre-owned, refurbished, sell-your-device |
| 12 | `12-content-marketing-pages.md` | About, blog, news, careers, FAQ, policy, outlets, partners, claims |
| 13 | `13-api-utils-data-layer.md` | `lib/api`, fetch wrappers, route handlers, sitemaps |
| 14 | `14-config-build-repo.md` | `next.config`, env, deps, `.gitignore`, assets |

## 1. Critical Bugs & Security Risks (top 12, all modules)
1. **Search is broken at three layers.** (a) The origin is currently down (522). (b) The browser calls the API cross-origin (`SearchBar.jsx:79`), so CORS or WAF problems break only search while SSR pages work. (c) The `/search-products` contract has no prices and S3 image URLs, so every result shows a placeholder image and `৳ ` with no number. "View All" uses a different, unverified `/search` endpoint. See `02`.
2. **`utils/fetchAPI.js` (`"use server"`) is a public Server Action** that proxies any endpoint, method and headers with the caller's token. See `02` §1.6 and `13`.
3. **`proxy.js` deletes auth cookies on any network error**, so every outage logs out every dashboard user. See `01`.
4. **Open redirect after login:** `redirect` values like `//evil.com` pass `startsWith("/")`. See `01`.
5. **There are no `error.jsx` or `global-error.jsx` files.** Any client render error white-screens the whole site. The search modal has at least four unguarded crash points. See `02` and `06`.
6. **XSS sinks:** unsanitized `short_description` in both `DynamicPills.jsx`, and unescaped `JSON.stringify` inside `<script>` for JSON-LD and `window.__COMPANY_SETTING__`. See `08` and `09`.
7. **Guest coupons always return 401:** `/customer/gust-check-coupon` is missing from the BFF guest allow-list. See `09`.
8. **The `api/client-fetch` BFF is an unrestricted pass-through** (any path, any verb, no Origin check, crashes on non-JSON). See `09`.
9. **`.env` is fully commented out,** so the next build inlines `undefined` for the API URL and the revalidation secret. See `14`.
10. **No upstream timeouts.** During the outage each SSR fetch waits about 20 s, which can exhaust workers. Fallbacks render fake "No products" states. See `13`.
11. **CSP is report-only with no report endpoint,** plus `unsafe-inline`/`unsafe-eval` and wildcard script hosts. See `14`.
12. **`.gitignore` leading-space bug:** `.idea/` and `.kiro/` are tracked. A 425 KB API dump and two `.bak` files are committed. See `14`.

## 2. Architecture Violations (vs. Master Rules): totals
- **Client/Server Boundaries:** 211 of 404 JS/JSX files are `"use client"`. There are 21 `"use client"` **page** files, including `checkout/page.jsx` (1,376 lines) and every dashboard page. Nine client files call `NEXT_PUBLIC_API_URL` directly, and five client files import server fetchers (`lib/api`, `utils/fetchAPI`, `library/*`).
- **State Management:** 0 Redux. 3 React Contexts, 6 `window` custom events, 14 files touching `localStorage` directly. Search, filter and pagination state is held locally instead of in the URL.
- **File Size:** **157 JS/JSX files exceed 100 lines.** The largest are `checkout/page.jsx` (1,376), `SellYourDevice.jsx` (1,096), `ProductDetails.jsx` (937), `lib/api.js` (904), `BusinessForm.jsx` (817), `EditProfile.jsx` (749), `UsedDevice ProductDetails.jsx` (745), `Shop/Filter.jsx` (710), `PreOwnedDeviceClient.jsx` (704) and `reset-password/page.jsx` (704).
- **TypeScript:** none. No `tsconfig`, no Zod, no runtime validation of any API response. `axios` is installed but unused (master rule: Axios BFF).

## 3. Duplication & Technical Debt: dead files (never imported; verify before deleting)
`AboutUs/DynamicPill/AboutBrands/AboutBrands.jsx`, `Brands/{BrandDescription,BrandsCategory,SingleBrand}.jsx`, `Categories/CategoriesClientWrapper.jsx`, `Categories/SingleCategoryPage/SingleCategoryPage.jsx`, `Dashboard/DashboardTable.jsx`, `Dashboard/ManageAccount/ManageAccount.jsx`, `Description/{Brands,Category,Offer,Shop,UsedPhone}PageDesc.jsx`, `Home/FlashSale/FlashSaleCategory/FlashSaleCategory.jsx`, `Home/FlashSale/FlashSaleProduct.jsx`, `Home/NewsCoverage/NewsCoverage.jsx`, `HomePageDescription/{DescText,HomePageDescription}.jsx`, `Navbar/Navbar.jsx`, `Navbar/NavFunction/NavHoverServer.jsx`, `Navbar/NavItemsData/FetchItemsData.jsx`, `news/NewsHomePage.jsx`, `PreownedDevice/ProductSidebar.jsx`, `Refurbished/RefurbishedSlugDetail.jsx`, `ReuseableComponent/{Card2,DropdownModal,MyButton,PreOwnedCard,PreOwnedCard2,SectionTitle,Text}.jsx`, `ReuseableComponent/ProductDetails/ViewersCount.jsx`, `ReuseableComponent/Swiper/SwiperSlider.jsx`, `Swiper/styles22.css`, `SEO/MetadataDebugger.jsx`, `Shop/{Products,ShopClientWrapper,ShopSearchBar}.jsx`, `Skeleton/{BrandSkeleton,CategorySkeleton}.jsx`, `hooks/useModalScrollbar.js`, `library/getBrands.js`, `library/getCart.jsx`, `fetch-API/getCategories.jsx`, both `*.jsx.bak`, and the public route `app/(main)/test/page.jsx`.

The largest duplications are:
- the ProductDetails tree (new vs used, about 2,500 lines);
- 9 Swiper wrappers;
- 5+ card components;
- 5 filter sidebars;
- 4 dashboard nav menus;
- 3 news renderers;
- 2 FAQ, 2 Pagination and 2 `getAuthUser` implementations;
- 4 fetch wrappers.

## 4. Data Fetching & Performance: overall picture
- **Good:** public catalog data is fetched server-side through `lib/api.js`, with React `cache()`, tags and an on-demand revalidation webhook. Product pages use on-demand ISR. Swiper, framer-motion and Lottie are partially code-split.
- **Bad:**
  - Search, compare, refurbished, checkout address lookups, EMI, popup, cart counts and nav user are all browser→API or CSR.
  - No timeouts, no error boundaries, no Suspense streaming on the home page, and sequential awaits.
  - Oversized `next/image` intrinsic sizes feed the AVIF CPU problem.
  - Lottie (up to 646 KB JSON) is used for decoration.
  - If pm2 runs clustered, the per-process data cache makes `revalidateTag` unreliable.

## 5. Actionable Refactor Checklist (program-level order)
- [ ] 1. **Today:** resolve the 522 outage, restore `.env`, hotfix the guest-coupon allow-list, stop `proxy.js` from deleting cookies on network errors, fix the login open redirect, and add `global-error.jsx` plus `(main)/error.jsx`.
- [ ] 2. **This week (search):** follow `02` §5. Run the verification protocol, add the `/api/search` BFF with Zod mapping, unify the modal and `/search` page on one endpoint, remove the Server Action reads, and fix the quick-link and crash bugs.
- [ ] 3. **Security sprint:** remove `"use server"` from read helpers, lock down `api/client-fetch`, sanitize `DynamicPills`, add a safe JSON-LD serializer, validate the payment redirect, and make the CSP report and then enforce.
- [ ] 4. **Foundation:** add TypeScript (`allowJs`), Zod, an env schema, server and client HTTP cores (Axios BFF), the Redux Toolkit store (cart, wishlist, compare, auth, ui) with RTK Query, and ESLint `max-lines: 100`.
- [ ] 5. **Consolidation:** delete the dead files above. Unify the cards, carousel, filters, pagination, ProductDetails (new and used), dashboard nav and listing pages.
- [ ] 6. **Server-first refactor:** checkout, dashboard pages, ProductDetails and the shop filters move to server components plus small client islands, with URL-driven state.
- [ ] 7. **Performance:** add timeouts, Suspense streaming, `Promise.all`, image sizing, a Lottie replacement, a font trim and a shared cache handler for pm2.
