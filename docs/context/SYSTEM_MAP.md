# System Map: Tekzo storefront

How the storefront is wired today. This is the reference for the JS → strict TS / Zustand conversion. Each conversion batch updates the "Conversion status" section at the end.

- **Baseline:** commit `622a1f9` (branch `alamin`), 25 Nov 2026.
- **Stack:** Next.js `16.4.6` (App Router, Turbopack, `output: "standalone"`), React `19.2.3`, Tailwind 4 (`@tailwindcss/postcss`).
- **Code:** JavaScript only, 397 `.jsx` and 43 `.js` files under `src/`, about 55.6k lines.
- **Related docs:**
  - [MODULES_INDEX.md](MODULES_INDEX.md): where each module lives and its size.
  - [AUDIT_NOTES.md](AUDIT_NOTES.md): the bug register, kept unchanged during conversion.
  - [baseline/README.md](baseline/README.md): the P0 parity artifacts.
  - The older [docs/diagnosis/00-architecture-map.md](../diagnosis/00-architecture-map.md) was written at commit `6f88ab4` on Next 16.1.4. Parts of it are stale. Where it disagrees with this file, this file wins.

---

## 1. Runtime topology

```
Browser ──► Next.js (src/proxy.ts, then App Router) ──► Backend REST API (NEXT_PUBLIC_API_URL, Laravel, envelope { data })
   │                 │                                     ▲
   │                 ├─ Server Components: lib/api/ ──────┤  path A  (cached by tag / revalidate)
   │                 ├─ "use server" lib/http/fetchAPI.ts ┤  path A′ (cookie → Bearer, no cache)
   │                 └─ /api/client-fetch route ───────────┤  path B  (browser → Next → API, adds auth_token)
   └─ direct fetch(NEXT_PUBLIC_API_URL…) ──────────────────┘  path C  (cross-origin, needs CORS)
```

- **POS:** the frontend has **no direct POS integration**. Everything POS-related goes through the backend API. The only POS or loyalty field the frontend handles is `purchase_point`:
  - shown on product cards (`CardMain.jsx:182`), in `ProductBenefits*` and in `lib/seo/quickAnswers.js:40`;
  - sent on cart and buy-now payloads (`ProductDetails.jsx:369,406`, used `ProductDetails.jsx:169,205`, `DeviceCard.jsx:105`).
- **Third-party scripts** are injected by GTM ([GTM.jsx](../../src/Components/GTM/GTM.jsx)) after window `load` + 6 s + idle, with a 15 s fallback. The container (live ID `GTM-P2…`) loads Meta Pixel, TikTok Pixel, Google Ads (AW), server-side GTM (`server.tekzo.com.bd`), Clarity and Bing. The local `.env.local` uses a **placeholder** GTM ID, so no tags fire locally.

## 2. Environment variables

| Variable | Scope | Read in |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | public, inlined at build time | `lib/http` wrappers, `proxy.ts`, `api/*` routes, client components (path C) |
| `NEXT_PUBLIC_URL` | public | canonical URLs, sitemaps, robots, JSON-LD, metadata fallbacks |
| `NEXT_PUBLIC_GTM_ID` | public | `GTM.jsx` |
| `NEXT_PUBLIC_ECOMMERCE_TYPE` | public | storefront variant flag (`salamat` shows the Partners menu and footer links) |
| `REVALIDATION_SECRET` | server only | `app/api/revalidate/route.ts` |
| `INTERNAL_API_TOKEN` | server only | sent as `X-Internal-Token` by `proxy.ts`, `api/client-fetch`, and the server fetch wrappers |

The template is [.env.example](../../.env.example), which is committable through `!.env.example`. The local backend is a LAN host, `192.168.68.63:8000`, and it rate-limits bursts: "Too Many Attempts" appears during `next build` static generation.

## 3. Request pipeline: `src/proxy.ts`

The matcher covers every page route. It skips `api`, `_next/static`, `_next/image`, `favicon.ico` and static file extensions. For each request:

1. **Legacy 301 redirects:**
   - `/brand/details/:slug` and `/brand/:slug` → `/brands/:slug` (slug lowercased).
   - `/categories/details/:slug` and `/category/:slug` → `/categories/:slug`.
   - `/career/apply/:slug` and `/career/:slug` → `/careers/apply/:slug`.
   - Static redirects: `/home → /`, `/all-brands`, `/all-categories`, `/all-products → /shop`, `/offers → /shop/offer`, `/faqs → /faq`, `/preowned-device → /marketplace`.
2. **Login pages:** `/login` or `/register` **with** `auth_token` → `/dashboard/manage-account`.
3. **Dashboard:** `/dashboard*` **without** a token → `/login`. With a token, the proxy blocks on `GET /customer/profile`. A 401 or a network error sends the user to `/login` and deletes `auth_token` and `has_auth`.
4. **`syncAuthMarker`:** keeps the client-readable `has_auth=1` cookie (7 days, `sameSite: lax`) in step with the httpOnly `auth_token`.

Observed in the baseline: `/dashboard` → 307, `/home` and `/brand/samsung` → 301.

## 4. Layout and provider tree

```
app/layout.jsx (server)
└─ CounterProvider (client)          context/CounterContext.tsx  → stores/counter.store.ts
   └─ CompareProvider (client)       context/CompareContext.tsx  → stores/compare.store.ts
      ├─ WelcomePopup (client)       fetches /popup-dialogs from the browser; sessionStorage last-pathname
      ├─ RouterStaleRecovery (client) global click listener → hard reload 2 s after a link click if the path hasn't changed
      └─ children
         ├─ app/(main)/layout.jsx (server)  getSettings() ×2 (lines 13, 130) → GTM, WebVitalsReporter, CompanyJsonLd,
         │                                    NavbarVisibilityWrapper › Navbar2 (server) › NavAuthClient (client), FooterPage, WhatsAppPopUp (dynamic)
         │     sub-layouts: checkout/, login/, order/, product-specs/, test/
         └─ app/dashboard/layout.jsx (server, force-dynamic) getAuthUser → DashboardThemeProvider › DashboardLayoutClient
```

## 5. Data paths

| Path | Wrapper | Used for | Cache | Auth |
|---|---|---|---|---|
| A | [lib/api/](../../src/lib/api/index.ts) (53 exports, split by domain since P2) → `lib/http/fetchPublicAPI.ts` | All public catalog and content data | `next: { tags, revalidate }`, purged by `POST /api/revalidate` (`revalidateTag(tag, "max")`). Most routes also set `revalidate = 3600` | none |
| A′ | [lib/http/fetchAPI.ts](../../src/lib/http/fetchAPI.ts) (`"use server"`; `utils/fetchAPI.ts` re-exports it) | dashboard layout and `elite-status`, `Login/actions.js`, `Contact/actions.js`, `fetch-API/*`, `library/*` | none | `auth_token` cookie → Bearer |
| B | `lib/http/clientFetchAPI.ts` → [app/api/client-fetch/route.ts](../../src/app/api/client-fetch/route.ts) | Cart, wishlist, address, profile, orders, coupons, OTP, reviews, sell requests, checkout submit | none | adds the httpOnly cookie server-side. Guests are allowed only on `gust-phone-verify-request`, `gust-phone-verify`, `gust-buy-now` and `warranty-claims` |
| C | `fetch(process.env.NEXT_PUBLIC_API_URL + …)` in client components | search, districts and areas, guest-cart product re-fetch, compare, EMI, refurbished, invoices, reset-password OTP, popup dialogs | none (browser) | none. Cross-origin, so it depends on CORS. Locally, `/popup-dialogs` is **blocked by CORS** from `localhost` |

Client components that import `@/lib/api` (checked file by file in P0):
- `checkout/page.jsx` (`getSettings`)
- `ProductDetails/OrderReassurance.jsx` (`getSettings`)
- `UsedDevice/.../ProductReview.jsx` (`getProductReviews`)

The marketplace and sell-your-device pages are server components.

## 6. Client state

| State | Where it lives | Writers | Readers |
|---|---|---|---|
| Cart and wishlist counts | **Zustand** `stores/counter.store.ts` (since P3; `CounterContext` is now a wrapper) | GET `/customer/carts` and `/customer/wishlists` on every route change and on window focus, only when the `has_auth` cookie is present. Between re-syncs, only the window events `cart:added`, `cart:removed`, `wishlist:added`, `wishlist:removed` (±1) | `Navbar/NavCountBadges.jsx` (via `useCounter`) |
| Compare slots | **Zustand** `stores/compare.store.ts` plus `localStorage.compareProducts` (plain JSON array, unchanged) | `ProductDetails`, `CardMain` (`addToCompare` via `useCompareActions`) | The compare page reads `localStorage` **directly** (`Comparison/ProductComparisonHero.jsx`, bug #5) |
| Dashboard UI | **Zustand** `stores/dashboardUi.store.ts` plus `localStorage` keys `dash_theme`, `dash_sidebar_collapsed`, `dash_show_points` (unchanged) | dashboard nav | 6 dashboard nav components (via `useDashboardTheme`) |
| Guest cart | `localStorage.cart` (JSON array) | `CartModal`, both `ProductDetails`, `DeviceCard`, `DeviceSidebar`, `checkout` (about 15 sites) | checkout, the same components |
| Guest coupon | `localStorage.guestCouponCode`, `guestCouponDiscount` | checkout | checkout |
| Auth | cookies `auth_token` (httpOnly) and `has_auth` (readable, `utils/hasAuthCookie.ts`) | `Login/actions.ts`, `proxy.ts`, `api/logout` | `proxy.ts`, `client-fetch`, counters, checkout, navbar |
| Profile refresh | window event `userProfileUpdated` | `dashboard/edit-profile/EditProfile.jsx` | `Navbar/NavAuthClient.jsx` |
| Other | `localStorage.userGiftData` (removed only) · `sessionStorage` last pathname (WelcomePopup) · `window.__purchase_fired` (PurchaseTracker dedupe) | | |

Zustand 5 holds the shared client state since P3 (no `persist` middleware: keys and JSON shapes are unchanged). No Redux, React Query or SWR.

## 7. Commerce flows

**Add to cart**
- Logged in: `POST /customer/carts` through path B, then `dataLayer.push(add_to_cart)` after the `await`, then `fireCartAdded()`.
- Guest: writes `localStorage.cart`. Login is required for some entry points; `CartModal` sends guests to `/login`.

**Checkout** ([checkout/page.jsx](../../src/app/(main)/checkout/page.jsx), a client page)
1. **Cart:**
   - Logged in: `GET /customer/carts`, then `normalizeApiCartItem`.
   - Guest: `localStorage.cart`, then a product re-fetch per item through path C (`/pre-owneds/:slug/products` or `/product/:slug`).
2. **Address:** `/districts`, then `/areas/:id` through path C.
3. **Coupon:**
   - Guest: `POST /customer/gust-check-coupon` (not on the guest allow-list, so a guest gets 401; bug #3), with `localStorage` persistence.
   - Logged in: `POST /customer/apply-coupon` and `DELETE /customer/remove-coupon`.
4. **Guest OTP:** `gust-phone-verify-request`, then `gust-phone-verify`.
5. **Submit:** `user ? "/customer/checkouts" : "/customer/gust-buy-now"`.
   - `payment_method` `online` or `bkash`: `window.location.href = response.url`.
   - Otherwise: clear `localStorage` `cart`, `guestCouponCode` and `guestCouponDiscount`, then `router.push("/order/successful?invoice_number=…")`.
6. **Result pages:** `/order/successful` (`OrderSuccessClient` → `PurchaseTracker`), `/order/failed`, `/order/canceled`.

**Order tracking:** `OrderTracking.jsx:195` → `POST /order-tracking` through path B (not guest-allowed; bug #3).

**Planned (F1): guest checkout without registration or login.** Scheduled for P8 or the post-conversion bug-fix & feature pass (AUDIT_NOTES "Planned features"). Until then the flows above stay exactly as they are, including the `/login` redirects for guests.

## 8. Tracking (`window.dataLayer`)

Every push uses `window.dataLayer = window.dataLayer || []; window.dataLayer.push({...})`. The payload inventory, which conversion must reproduce exactly, is in [baseline/README.md §3](baseline/README.md#3-datalayer-event-inventory-static).

## 9. Routes

- **`(main)`:**
  - **Home:** `/`
  - **Catalog:**
    - `/shop`, `/shop/offer`, `/shop/offer/[slug]`
    - `/categories`, `/categories/[slug]`, `/brands`, `/brands/[slug]`, `/tags/[slug]`
    - `/flash-sale`, `/new-arrival`, `/new-arrival-products`, `/featured-products`
    - `/search`, `/compare`, `/discovery`, `/refurbished`
  - **Product:** `/product/[productDetails]`, `/product-specs`
  - **Used devices** (route group `(used-device)`): `/used-device`, `/used-device/[slug]`, `/used-device/product/[slug]`, `/marketplace`, `/sell-your-device`
  - **Warranty** (route group `(claim)`): `/claim-your-warranty`, `/how-to-claim`, `/how-to-active`
  - **Content and info:**
    - `/tekzo-care`, `/faq`, `/policy/[slug]`, `/outlets`, `/outlets/[id]`
    - `/contact-us`, `/about-us`, `/blog`, `/blog/[slug]`, `/news`
    - `/careers`, `/careers/apply/[slug]`, `/careers/application-form`, `/partners` and 5 sub-pages
  - **Orders and auth:** `/checkout`, `/order/{successful,failed,canceled}`, `/order-tracking`, `/login`, `/login/reset-password`
  - **Other:** `/test` (a skeleton-loader preview page)
- **`/dashboard`:** 24 pages (orders and status filters, `my-bag`, `wishlist`, `order-status/[id]`, addresses ×3, profile, edit profile, manage account, coupons, review history, to-reviews, sell requests, sell-your-device, elite status).
- **Route handlers:**
  - `/api/client-fetch`, `/api/logout`, `/api/revalidate`, `/api/search`
  - `/sitemap.xml`, `/static-pages-sitemap.xml`, `/shop/sitemap.xml`, `/categories/sitemap.xml`, `/brands/sitemap.xml`
  - `/llms.txt`, `robots.js`

## 10. Styling

- `src/app/globals.css`:
  - imports Tailwind, the Swiper CSS and `./styles/theme.css` (the `@theme` font tokens);
  - excludes `./dashboard` with `@source not`.
- `src/app/dashboard/dashboard-tailwind.css` is the dashboard-only sheet.
- **These stay at their current paths** (locked decision Q2).
- `tailwind.config.js` (with `important: true` and font families) is **probably unused** under Tailwind 4, since there is no `@config`. Needs verification against the built CSS. Don't delete it.
- One file handles `prefers-reduced-motion`. Broader reduced-motion work is deferred (Q7).

---

## Conversion status

| Phase | Status |
|---|---|
| P0 Baseline | **Done** (25 Nov 2026): lint baseline, 49-route × 2-viewport screenshot, HTML and dataLayer capture, noise run, docs/context |
| P1 Setup | **Done** (25 Nov 2026). Installed: `typescript ~6.0.3`, `@types/react ~19.2`, `@types/react-dom ~19.2`, `@types/node ^24`, `zustand ^5.1`, `zod ^4.6`. `tsconfig.json` (`strict`, `allowJs`, `@/*`) replaces `jsconfig.json`. New, not yet imported by app code: `src/types/{tracking,env,api,cart,pos}.ts`, `global.d.ts`, `next.d.ts`, `src/config/env.ts`, `env.server.ts`, `src/tracking/dataLayer.ts`. Added the `npm run typecheck` script. Runtime behavior unchanged (see baseline/README §4) |
| P2 Core | **Done** (25 Nov 2026). Converted to TS: `utils/*` (11), `lib/*` (fonts, formatHtml, homeQuote, `seo/*`, `search/*`), `lib/api.js` → `lib/api/<domain>.ts` + barrel, fetch wrappers → `lib/http/*` (with `utils/` re-export shims), new `lib/json.ts` guards, `proxy.ts`, `app/api/*` (4), `robots.ts`, `llms.txt`, 5 sitemap routes. Type check, lint gate, build, Server Actions and the 44-case request parity all pass. **The page-capture check is still pending** because the backend went down during the run. See baseline/README §4 |
| P3 State | **Code done, statically verified** (26 Nov 2026): `stores/counter`, `stores/compare`, `stores/dashboardUi` + `.tsx` compatibility wrappers in `context/`. `npm run typecheck` passes; lint 91 errors (baseline 93), 0 new; 69 `.ts`/`.tsx` files, 0 messages. **`next build` and the `p0b` visual check for P2 + P3 are pending** until the API server `192.168.68.63:8000` is reachable again (down since 25 Nov; a full build also hangs without it, AUDIT_NOTES N12) |
| P4 Shared chrome | **Code done, statically verified** (26 Nov 2026): root + `(main)` layouts, error boundaries and 404 pages; Navbar (17 files); Footer (6); GTM + WebVitalsReporter; the 3 trackers (now via `pushDataLayer`); SEO JSON-LD + QuickAnswers; Login page + auth Server Actions; WelcomePopup, WhatsAppPopUp; PreFetchLink, RouterStaleRecovery. `npm run typecheck` passes; lint 91 errors (baseline 93), 0 new; 120 `.ts`/`.tsx` files. **`next build` + `p0b` visual check pending** (with P2/P3) until `192.168.68.63:8000` is back |
| P5 Catalog & content | **Complete** (26 Nov 2026). **Split into 4 sub-batches** (≈18,000 lines total). **P5a done, statically verified** (26 Nov 2026): shared product cards (`CardMain`, `Card`) and listing primitives (Banner, HomeBanner, Breadcrumbs, Pagination, PageDescription/View, SectionHeading, titles, NoProductFound). Typecheck passes; lint 91 errors (baseline 93), 0 new. **P5b done, statically verified** (26 Nov 2026): home route + all homepage sections, Swiper wrappers, HomePageNews, FeaturedProducts (48 files); typecheck passes, lint 91 (baseline 93), 0 new. **P5c-1 done** (26 Nov 2026): search bar, search modal, search route, search hooks (22 files). **P2–P5c-1 verified live** (26 Nov 2026): fresh builds, 44/44 request parity, 49 routes × 2 breakpoints with dataLayer 49/49 identical and no code-caused HTML or pixel change vs a same-moment P0 build (baseline/README §4). **P5c-2 done and verified live** (26 Nov 2026): Shop (incl. the 710-line `Filter`), Categories, Brands, `Home/Categories/CategoryDetails/*`, offer pages + `OfferCard`/`CountdownTimer`, routes `shop`, `shop/offer*`, `categories*`, `brands*`, `tags/[slug]`, `flash-sale`, `new-arrival*`, `featured-products` (37 files); typecheck passes, lint 90 (baseline 93), 0 new; 18 routes × 2 breakpoints match. **P5d done and verified live** (26 Nov 2026): content pages: blog (list, detail, cards, share), news, about us (all pills), Tekzo Care, claims, contact (form + Server Action), partners (+ `ReuseableComponent/Form/BusinessForm`), discovery, FAQ, policy, outlets, `Description/*` wrappers, `ReuseableComponent/{JobApplicationForm,LoginPage}` (59 files); typecheck passes, lint 90 (baseline 93), 0 new; 56 routes × 2 breakpoints match a same-moment P0. **P5 complete.** The three careers `notFound()` stubs stay JS and untouched. **P6 done and verified live** (27 Nov 2026): product detail page (gallery, variants, pricing/EMI/warranty/specs, Tekzo Care, gifts, coupon, `purchase_point`, cart/buy/compare/wishlist, related products, reviews, `view_item`), `CartModal`, and used devices: `/used-device` (list, `[slug]`, `product/[slug]`), `/marketplace`, `/refurbished`, `/sell-your-device`, `SellYourDevice` form (also used by `/dashboard/sell-your-device`), `PreownedDevice/*`, `Marketplace/*`, `Refurbished/*`; typecheck passes, lint 89 (baseline 93), 0 new; 18 routes × 2 breakpoints and every `view_item` push match a same-hour P0. **P7 done** (27 Nov 2026): the whole `/dashboard` area: layout, `DashboardLayoutClient`, Sidebar (desktop + collapsed tooltips), top navbar, mobile header / bottom nav / drawer, stat cards, `OrderStatusList` (7 status pages), all-orders (+ Pay Now, invoice download), order detail, bag, wishlist, address book (+ `AddAddressPopup`, default billing/shipping), profile / edit profile (OTP, password, avatar), elite status, coupons, reviews (pending, write, history), sell-your-device (new / edit) and my-sell-requests; plus `fetch-API/{getAuthUser,getRecentOrder}.ts` (40 files + 2). Typecheck passes, lint 88 (baseline 93), 0 new; guard behaviour on all dashboard routes and 44/44 requests match a same-hour P0. Signed-in rendering still needs a manual pass. **P8 done** (27 Nov 2026): checkout (page, layout, `AuthorizeUserAddress`), order result pages (`/order/{successful,failed,canceled}` + `OrderSuccessClient`), `/login` + `/login/reset-password`, and the remaining live JS: `/compare` (`ProductComparisonHero`, `CompareResult`), `/order-tracking` (`OrderTracking`), `/product-specs`, `/test`, `ErrorFallback`, the 404 feature products, `Loader`, `library/{getFeatureProduct,getHomeCategories}` (26 files). Typecheck passes, lint 88 (baseline 93), 0 new; 17 public routes incl. seeded guest carts and `begin_checkout` match a same-hour P0. **Conversion complete** apart from the documented careers stubs and 15 unused files (MODULES_INDEX). **Next:** signed-in verification (baseline/README checklist), then the bug-fix & feature pass (F1 guest checkout, bug #1 cart unification). Formerly next: P8 (Cart, Checkout & Login). Formerly next: P7 (Dashboard). Formerly next: P6. |
| P6–P7 | **Complete** (27 Nov 2026), see notes above |
| P8 | **Complete** (27 Nov 2026) |
| Post-conversion Step 1 (bug #1 guest cart) | **Done & verified** (28 Nov 2026): typecheck 0, lint 88 / 0 new, differential 123/123, browser `localStorage.cart` 10/10 byte-identical, requests 44/44, checkout dataLayer 17/17. New finding N25 (cart modal never offers Buy Now). **Next:** Step 2 (F1) once the 3 backend answers are in |
| Post-conversion Step 2 (F1 guest checkout + Batch A) | **Done & verified** (28 Nov 2026): F1 flow 23/23 (orders intercepted, none placed), requests 42/44 vs P0 (bug #3 intended), guest-cart Buy Now 10/10, dataLayer 17/17; #2, #3, N22, N23 fixed; N25 closed (CORS test artifact). Typecheck 0, lint 88 / 0 new. **Next:** real-account / real-payment checks, then Batch B |
| P9–P10 | Not started (bug-fix & feature pass) |
