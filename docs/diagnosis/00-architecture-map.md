# Module: Architecture & Data-Flow Map (pre-upgrade baseline)
**Path:** `src/proxy.js`, `src/app/**`, `src/lib/api.js`, `src/utils/{fetchAPI,fetchPublicAPI,clientFetchAPI}.js`, `src/app/api/**`, `src/context/**`, `src/library/**`, `src/fetch-API/**`

> Baseline: commit `6f88ab4`, `next@16.1.4`, `react@19.2.3`. Mapped by import and call-site analysis (grep/AST), not by bulk reading. Every count below comes from the code.

---

## 1. Data Flow

### 1.1 The four data paths

```
                         ┌──────────────────────── Browser ───────────────────────────┐
                         │                                                            │
 (A) RSC / ISR           │  (B) BFF proxy              (C) Direct CSR       (D) Server │
 Server Components       │  clientFetchAPI()           fetch(NEXT_PUBLIC_   Actions    │
 lib/api.js              │     │ POST /api/client-fetch  API_URL/...)       (accident) │
 → fetchPublicAPI()      │     ▼                          │                  library/*  │
   (tags, revalidate)    │  app/api/client-fetch          │                  → fetchAPI │
 utils/fetchAPI()        │  (reads auth_token cookie,     │                  "use server"│
   ("use server",        │   forwards endpoint+method)    │                     │       │
    cookies → Bearer)    │     │                          │                     ▼       │
        │                └─────┼──────────────────────────┼──────── POST to current page┘
        ▼                      ▼                          ▼              │
   ┌─────────────────────────── web-api.tekzo.com.bd/api/v1 ◄────────────┘
   │  (Laravel API behind Cloudflare; envelope usually { data: … })
   └──────────────────────────────────────────────────────────────────────
 Also: src/proxy.js (middleware) → GET /customer/profile on every /dashboard/* request
```

| Path | Mechanism | Used by | Caching | Auth |
|---|---|---|---|---|
| **A: RSC/ISR** | `lib/api.js` (~55 fetchers) → `fetchPublicAPI` (server) | Every public page: home, shop, categories, brands, product, blog, news, policies, outlets, flash sale, offers, used and refurbished listings, layout (settings), navbar (categories, brands), sitemaps | **Yes.** `next: { tags, revalidate }`, mostly `revalidate:false` + tags (cache forever, purged by `POST /api/revalidate`), some `3600`. React `cache()` dedupes per request. Pages use `revalidate = 3600` ISR, and the product page uses on-demand ISR (`generateStaticParams → []`). | None |
| **A′: RSC (authenticated)** | `utils/fetchAPI.js` (`"use server"`, reads the `auth_token` cookie) | `dashboard/layout.jsx` (via `fetch-API/getAuthUser`), `dashboard/elite-status`, `Login/actions.js` (`/auth/login`, `/auth/register`), `Contact/actions.js` (`/contacts`) | **None** (no `next` options; Next 16 does not cache by default) | Bearer from cookie |
| **B: BFF proxy** | `utils/clientFetchAPI.js` → `POST /api/client-fetch` → `app/api/client-fetch/route.js` → API | All cart, wishlist, address, profile, order, review, coupon, OTP and sell-request calls (§3.2). **This is the only path that carries user auth from the browser.** | None | httpOnly `auth_token` added server-side; guest allow-list of 4 endpoints |
| **C: Direct CSR** | `fetch(\`${process.env.NEXT_PUBLIC_API_URL}…\`)` or `fetchPublicAPI` called in a client component | `SearchBar` (`/search-products`), `ProductComparisonHero` (`/product/:slug`, `/search-products`), `checkout/page` (`/districts`, `/areas/:id`, `/pre-owneds/:slug/products`), `CartModal` (`/product/:slug`), `EmiModalContent` (EMI banks), `RefurbishedProductGrid` (products, brands), `OrderSuccessClient`/`all-orders` (invoice URLs), `reset-password` (OTP flow), `WelcomePopup` (`/popup-dialogs`), `SidebarFunction` (fallback `/categories`, `/brands`), `ProductDetails` (fallback `/settings`, `/policies`), `OrderReassurance`/`ProductReview` (`lib/api` imported into client code) | None (browser) | None. Cross-origin, so it depends on CORS and the Cloudflare WAF. |
| **D: Accidental Server Actions** | A client component imports a module whose dependency is `"use server"` (`utils/fetchAPI.js`) | `SearchModal/ModalContent.jsx` (`library/getFeatureProduct` → `/featured-products`, `library/getHomeCategories` → `/home-categories`), `Shop/Filter.jsx` (`/brands`, `/categories`) | None | Bearer from cookie (any caller) |

### 1.2 Rendering mode per route group

| Route group | Mode | Notes |
|---|---|---|
| `/` (home) | **RSC + ISR** (tag cache) | Sequential `getSliders → getCategories → getBrands` (waterfall on a cold cache). Sections are server-fetched; carousels are client islands. |
| `/shop`, `/categories/[slug]`, `/brands/[slug]`, `/tags/[slug]`, `/flash-sale`, `/new-arrival-products`, `/featured-products`, `/shop/offer/**`, `/marketplace`, `/used-device/**`, `/refurbished` | **RSC + ISR**, dynamic per `searchParams` | Filters are client components that push URL params. `brands/[slug]` and `policy/[slug]`/`outlets/[id]` pre-render via `generateStaticParams`. `refurbished` re-fetches client-side (path C). |
| `/product/[productDetails]`, `/used-device/product/[slug]` | **RSC + on-demand ISR**, then one huge client component (`ProductDetails.jsx`, 937 lines) | The server fetches product, related, reviews, settings and policies once. The client re-fetches settings and policies as a fallback, and the CartModal re-fetches the product. |
| `/search` | **SSR, `no-store`** | Different endpoint (`/search`) from the modal (`/search-products`). |
| `/checkout` | **CSR** (1,376-line `"use client"` page) | Paths B and C only. |
| `/dashboard/**` | `force-dynamic` layout (RSC user fetch) plus **CSR pages** (all 12 pages are `"use client"` and fetch in `useEffect` via path B) | `proxy.js` adds a blocking profile fetch first. |
| `/login`, `/login/reset-password` | Server Actions (login and register via `useActionState`), reset is CSR (path C) | |
| Content (`/about-us`, `/blog/**`, `/news`, `/careers/**`, `/faq`, `/policy/**`, `/outlets/**`, `/contact-us`, `/tekzo-care`, `/discovery`) | **RSC + ISR** | `partners/*` are client pages. |
| `/api/client-fetch`, `/api/logout`, `/api/revalidate`, sitemaps, `robots`, `llms.txt` | Route handlers | Sitemaps fetch the full catalog with `revalidate: 3600`. |

### 1.3 Bottlenecks (ranked)

1. **There are no upstream timeouts in any wrapper.** When the API is slow or down (as with the current 522), each server fetch blocks for about 20 s (measured), and pages with several sequential fetches hang for a minute or more, holding Node workers.
2. **Path C cross-origin calls** (search, checkout address lookups, compare, EMI, popup) fail independently of SSR, whenever CORS or the Cloudflare WAF interferes.
3. **Auth triple-fetch per dashboard navigation:** `proxy.js` → `dashboard/layout` → `NavAuthClient` (on every pathname change site-wide).
4. **CSR dashboard and checkout:** shell, then hydrate, then 3-6 BFF round-trips (browser → Next → API) before content appears.
5. **Uncached `fetchAPI` reads** (path A′/D) on every call. The search modal re-fetches featured products and home categories on every first open, per page.
6. **Request-amplifying effects:** `ProductDetails` `policies = []` default (a new array every render) re-fires `/policies` while it is failing. `RouterStaleRecovery` forces a hard reload 2 s after slow navigations.
7. **Cache coherence:** if pm2 runs in cluster mode, `revalidateTag` from the webhook purges only one process's data cache.

---

## 2. State Management

### 2.1 Provider tree

```
app/layout.jsx (Server)
└─ <CounterProvider>                (client; root of EVERY route)
   └─ <CompareProvider>             (client; root of EVERY route)
      ├─ <WelcomePopup/>            (client; fetches /popup-dialogs from the browser)
      ├─ <RouterStaleRecovery/>     (client; global click listener → hard reload fallback)
      └─ {children}
          ├─ app/(main)/layout.jsx  (Server: getSettings → Navbar2, Footer, WhatsApp, GTM, JSON-LD)
          └─ app/dashboard/layout.jsx (Server, force-dynamic: getAuthUser)
              └─ <DashboardThemeProvider> (client) → <DashboardLayoutClient user>
```

### 2.2 `CounterContext` (`src/context/CounterContext.jsx`)

- **State:** `cartCount`, `wishlistCount`. The `initialCartCount`/`initialWishlistCount` props exist but are **never passed**, so both start at 0.
- **Initial load:** on mount, `refreshCart()` → `clientFetchAPI("/customer/carts","GET")` counts `cartItems.length`, and `refreshWishlist()` → `clientFetchAPI("/customer/wishlists","GET")` counts items, guessing among 5 possible payload keys. Both are skipped when the readable `has_auth` cookie is absent.
- **Updates:** **not** through context methods. Components dispatch `window` events through the exported helpers, and the provider listens:

| Event | Helper | Emitted from (file:line) |
|---|---|---|
| `cart:added` → `+1` | `fireCartAdded()` | `ReuseableComponent/CartModal.jsx:190`, `ProductDetails/ProductDetails.jsx:408`, `UsedDevice/.../ProductDetails.jsx:213`, `PreownedDevice/DeviceSidebar.jsx:159,166`, `PreownedDevice/ProductSidebar.jsx:106` (dead file), `dashboard/(orders)/wishlist/page.jsx:248`, `dashboard/(orders)/my-bag/page.jsx:397` |
| `cart:removed` → `−1` | `fireCartRemoved()` | `checkout/page.jsx:567,608`, `dashboard/(orders)/my-bag/page.jsx:392` |
| `wishlist:added` → `+1` | `fireWishlistAdded()` | `ProductDetails/ProductDetails.jsx:467`, `ProductDetails/ShareDetails.jsx:82`, `ProductDetails/DynamicPills.jsx:93`, `dashboard/(orders)/wishlist/page.jsx:234` |
| `wishlist:removed` → `−1` | `fireWishlistRemoved()` | `dashboard/(orders)/wishlist/page.jsx:229` |

- **Readers (`useCounter()`):** only **2** — `Navbar/NavCountBadges.jsx:12` (`NavCountBadgesLg`: cart and wishlist badges) and `:63` (`NavCartBadgeSm`: cart badge). These are rendered by `NavAuthClient.jsx`, which is rendered by the server `Navbar2.jsx`.
- **Implication:** the counters are optimistic ±1 without server reconciliation, so they drift whenever the backend merges quantities or a call fails after the event fired.

### 2.3 `CompareContext` (`src/context/CompareContext.jsx`)

- **State:** `compareProducts` (`[slot0, slot1]`), persisted to `localStorage["compareProducts"]` after hydration.
- **Readers (`useCompare()`):** only **1** live consumer — `ReuseableComponent/ProductDetails/ProductDetails.jsx:206`, which uses only `addToCompare`. (`ProductDetails.jsx.bak:134` is dead.)
- **The compare page does NOT use the context.** `Comparison/ProductComparisonHero.jsx:30-110,249` reads and writes `localStorage["compareProducts"]` **directly**. The context and the compare page are coupled only through the storage key, so the two can disagree within a session. A product added on a product page is visible to the compare page only because it re-reads storage on mount.
- `fireCompareAdded()` / the `compare:added` event: emitted nowhere, listened nowhere. Dead.

### 2.4 Other client state

- `DashboardThemeContext`: consumed by 6 dashboard nav components (`DashboardBottomNav`, `DashboardLayoutClient`, `DashboardMobileDrawer`, `DashboardMobileHeader`, `DashboardTopNavbar`, `Sidebar`). It persists `dash_theme`, `dash_sidebar_collapsed` and `dash_show_points` in `localStorage`.
- `window` `userProfileUpdated` `CustomEvent`: emitted by `dashboard/edit-profile/EditProfile.jsx`, consumed by `Navbar/NavAuthClient.jsx`.
- Other `localStorage` keys: `cart` (guest cart: `CartModal`, `ProductDetails` ×2, `DeviceCard`, `DeviceSidebar`, `checkout`), `guestCouponCode` and `guestCouponDiscount` (checkout), `cachedNavUser` (`NavAuthClient`). `sessionStorage`: last pathname (`WelcomePopup`).

---

## 3. The API Layer

### 3.1 Wrappers

| Wrapper | Runtime | Auth | Caching | Error behavior | Notes |
|---|---|---|---|---|---|
| `utils/fetchPublicAPI.js` | Server (also misused in client: `WelcomePopup`, `SidebarFunction`, `ProductDetails`) | none | maps `tags`/`revalidate` → `next` | parses JSON **before** checking `ok`; throws. Callers in `lib/api` swallow and return fallbacks (`[]`/`null`). | Backbone of path A |
| `utils/fetchAPI.js` | **`"use server"`**: becomes a public Server Action when reached from client code | `cookies().get("auth_token")` → Bearer | none | same JSON-before-ok issue; rethrows. `options` spread after the headers, so callers can override anything. | Path A′/D |
| `utils/clientFetchAPI.js` | Browser | none (the BFF adds it) | none | throws `Error` with `.status`/`.errors` | Path B; JSON and multipart variants |
| `app/api/client-fetch/route.js` | Server route | cookie → Bearer; guest allow-list: `/customer/gust-phone-verify-request`, `/customer/gust-phone-verify`, `/customer/gust-buy-now`, `/customer/warranty-claims` | none | `response.json()` unguarded (non-JSON upstream → 500) | Forwards **any** endpoint and method |
| `lib/api.js` | Server (imported by 3 client files by mistake) | none | per-fetcher tags/revalidate | each returns a fallback value | 904 lines, ~55 fetchers |
| `library/*`, `fetch-API/*` | `"use server"` or plain modules built on `fetchAPI` | cookie | none | swallow | Duplicates of `lib/api` |

### 3.2 Endpoints via `clientFetchAPI` (path B), with call counts

| Method | Endpoint | Calls | Guest-allowed? |
|---|---|---|---|
| POST | `/customer/carts` | 16 | ❌ (login required by design) |
| GET | `/customer/carts` | 3 | ❌ |
| PATCH / DELETE | `/customer/carts/:id` | 2 / 2 | ❌ |
| PATCH | `/customer/carts/item/select-toggle` | 1 | ❌ |
| GET / POST | `/customer/addresses` | 5 / 1 | ❌ |
| PATCH | `/customer/default-address/:id` | 2 | ❌ |
| GET / POST / DELETE | `/customer/wishlists`, `/customer/wishlists/:id` | 2 / 4 / 1 | ❌ |
| GET / POST | `/customer/profile` | 2 / 1 | ❌ |
| POST | `/customer/change-password`, `/customer/phone-verify-request`, `/customer/phone-verify`, `/customer/email-verify-request`, `/customer/email-verify` | 2,1,1,1,1 | ❌ |
| POST / DELETE | `/customer/apply-coupon` / `/customer/remove-coupon` | 1 / 2 | ❌ |
| GET | `/customer/orders/:id/detail`, `/customer/delivered-products`, `/customer/reviews?page=` | 1,1,1 | ❌ |
| POST | `/customer/reviews` | 1 | ❌ |
| DELETE | `/customer/sell-device-requests/:id` | 1 | ❌ |
| POST | `/customer/gust-phone-verify-request`, `/customer/gust-phone-verify` | 1,1 | ✅ |
| POST | `/customer/gust-buy-now` (checkout submit, guest) | (dynamic) | ✅ |
| POST | **`/customer/gust-check-coupon`** (guest checkout) | 2 | **❌ BUG: guests always get 401** |
| POST | **`/order-tracking`** (public `/order-tracking` page, `OrderTracking.jsx:195`) | 1 | **❌ BUG: guests always get 401** |
| GET | `/districts`, `/areas/:id` (`AddAddressPopup`, logged-in only) | 1,1 | ❌ (OK: logged-in use) |

### 3.3 Endpoints via `fetchAPI` (paths A′/D)

`/auth/login`, `/auth/register` (Login actions) · `/contacts` (Contact action) · `/customer/profile` (`fetch-API/getAuthUser`) · `/customer/carts` (`library/getCart`, dead) · `/customer/recent-orders`, `/customer/statistics`, `/customer/default-address` (`fetch-API/getRecentOrder`) · `/elite` (dashboard elite page) · **from client components:** `/featured-products`, `/home-categories` (search modal), `/brands`, `/categories` (Shop Filter and `library`/`fetch-API` duplicates).

### 3.4 Endpoints via `fetchPublicAPI` / `lib/api` (path A)

`/settings`, `/sliders`, `/brands`, `/all-brands`, `/brand/:slug/products`, `/categories`, `/category-tree`, `/home-categories`, `/category-products`, `/category/:slug…`, `/featured-products`, `/product/:slug`, `/product/:slug/reviews`, `/related/:slug/products`, `/home-new-arrival-products`, new-arrival and flash-sale listings, `/offers`, offer detail, `/shops?…`, `/home-pre-owned-products`, `/pre-owneds…`, `/pre-owneds/brands`, `/pre-owned-related/…`, `/conditions`, `/storages`, refurbished products and `/refurbished-brands`, `/news`, `/blogs/…`, `/featured-blogs`, `/recent-blogs`, `/popular-blogs`, `/trending-blogs`, `/reels-videos`, `/policies`, `/policies/:slug`, `/faqs`, `/outlets`, outlet detail, `/careers`, `/careers/:slug`, `/our-teams`, `/seos/:page`, `/popup-dialogs`, `/districts`. Sitemaps hit `/products`.

### 3.5 Direct CSR (path C)

`/search-products?query=` (SearchBar, ProductComparisonHero) · `/search?…` (search page, SSR) · `/product/:slug` (CartModal, ProductComparisonHero) · `/districts`, `/areas/:id`, `/pre-owneds/:slug/products` (checkout) · EMI banks (`EmiModalContent`) · refurbished endpoints (`RefurbishedProductGrid`) · invoice PDF URLs (`OrderSuccessClient`, `all-orders`) · password-reset OTP endpoints (`reset-password/page.jsx`).

---

## 4. Vulnerability Surface

### 4.1 Packages with known CVEs and where they are imported

| Package (installed → fixed) | Severity | Imported directly in `src/` | Runtime exposure |
|---|---|---|---|
| **`next` 16.1.4 → 16.4.6** | CRITICAL (RCE ×4, SSRF, proxy bypass, DoS…) | `next/image` **122 files**, `next/link` 72, `next/navigation` 50, `next/dynamic` 24, `next/headers` 7, `next/server` 4, `next/script` 1 (`GTM.jsx`), `next/og` 1 (`categories/[slug]/opengraph-image.jsx`), `next/font/local` 1 (`lib/fonts.js`), `next/cache` 1 (`api/revalidate/route.js`) | The whole app. The **image optimizer (`/_next/image`)** is the RCE entry point (AVIF/SVG decoding via sharp). The Server Actions issues affect `Login/actions.js`, `Contact/actions.js` and the accidental actions in `utils/fetchAPI.js`. The proxy-bypass issues affect `src/proxy.js` (dashboard auth gate). |
| `sharp` 0.34.5 → ≥0.35.5 | HIGH | not imported (transitive via next) | `/_next/image` decoding |
| `postcss` (via next) | HIGH | not imported | build time only |
| `undici`, `form-data`, `nanoid`, `source-map-js`, `follow-redirects`, `baseline-browser-mapping` | HIGH or MODERATE | not imported (transitive) | Mostly build and dev tooling. undici affects server `fetch` internals. |
| `axios` 1.13.2 | HIGH (~30 advisories) | **0 files**, never imported | None at runtime. Remove it. |
| `dompurify` (via `isomorphic-dompurify` ^3.8.0) | MODERATE (sanitizer bypasses) | `lib/formatHtml.js` (1 file), used by about 20 components that render CMS HTML | XSS defense layer |
| `@tailwindcss/typography` → `postcss-selector-parser` | MODERATE | `tailwind.config.js` | build time only |

### 4.2 Files that would break on `next@16.1.4 → 16.4.6` (React stays 19.2.3)

**Verified empirically:** a clean copy of `HEAD` was installed with `next@16.4.6`, `eslint-config-next@16.4.6` and `react`/`react-dom` pinned to `19.2.3`, then compiled with `next build --experimental-build-mode=compile`. The results are recorded in `00-cleanup-plan.md` §4 ("Sandbox upgrade results").

Static review of upgrade-sensitive APIs (all already on Next 16 conventions):
- `revalidateTag(tag, "max")`: all 39 calls already use the Next 16 two-argument signature (`api/revalidate/route.js`).
- `params`, `searchParams`, `cookies()` and `headers()` are already awaited (7 `cookies()` files, 1 `headers()`).
- `src/proxy.js` uses the Next 16 `proxy` convention, not `middleware.js`.
- No `unstable_*`, `next/legacy/image`, `useFormState`, `"use cache"`, `draftMode` or `after()` usage.
- `quality={90}` in one file: Next 16 defaults `images.qualities` to `[75]`, so this is already being coerced on 16.1.4. There is no new break.
- `priority` on `next/image` (38 files): still supported. It may emit deprecation warnings in favor of `preload`, which is cosmetic.
- `"dev": "next dev --turbo"`: Turbopack is already the default in 16. The flag is redundant and may warn.
