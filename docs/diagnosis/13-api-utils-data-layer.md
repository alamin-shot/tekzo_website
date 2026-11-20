# Module: API Layer, Utils, Route Handlers & SEO Routes
**Path:** `src/lib/api.js`, `src/lib/formatHtml.js`, `src/utils/*` (`fetchAPI`, `fetchPublicAPI`, `clientFetchAPI`, `buildMetadata`, `filterProducts`, `getAuthUser`, `hasAuthCookie`, `scrollLock`), `src/library/*`, `src/fetch-API/*`, `src/app/api/{client-fetch, logout, revalidate}/route.js`, `src/app/{sitemap.xml, static-pages-sitemap.xml, llms.txt}/route.js`, `src/app/robots.js`, `src/app/(main)/{shop,brands,categories}/sitemap.xml/route.js`

## 1. Critical Bugs & Security Risks
- **`utils/fetchAPI.js` is a public Server Action (CONFIRMED).** The file starts with `"use server"`, so every export becomes a remotely callable action once any client component imports it. `SearchModal/ModalContent.jsx` (via `library/*`) and `Shop/Filter.jsx` do. The action accepts arbitrary `endpoint` and `options` (method, body, headers; `options` is spread **after** the auth header, so callers can also override headers) and runs server-side with the caller's cookie token. Replace the directive with `import "server-only"`. Details are in `02` §1.6.
- **Other `"use server"` modules expose read functions as actions:** `fetch-API/getAuthUser.js`, `fetch-API/getRecentOrder.js` and `library/getCart.jsx`. Server Actions are for mutations. Reads should be server-only functions.
- **`api/client-fetch` is an unrestricted proxy** (see `09` §1): arbitrary endpoint and method, a guest allow-list that is missing `gust-check-coupon`, no `Origin` check, and an unguarded `response.json()` that turns upstream HTML or empty bodies into 500s.
- **`api/revalidate/route.js`** compares the secret with `!==` (a timing side-channel; low risk, but use `crypto.timingSafeEqual`). It reads the secret from the JSON body, which is fine. It has **no `careers`/`career` case** (the `careers` endpoint is cached via `getCareers`), so careers stay stale until the `all` case runs. Lines 15-16 hold commented-out lowercase logic with a Bangla comment saying slug case mismatches are "fixed here". That fix is **disabled**, so `revalidateTag(\`brand-${slug}\`)` will miss when the CMS sends `Earbuds` but the tag was created with `earbuds`.
- **`fetchPublicAPI` and `fetchAPI` call `response.json()` before checking `ok`.** A Cloudflare 522 (HTML) throws a JSON `SyntaxError` instead of a typed HTTP error, so logs show "Unexpected token <" instead of "HTTP 522". Every `lib/api` function then returns a fallback (`[]`, `null` or `{ products: [] }`), and pages silently render empty states instead of an error page. During the current outage the site therefore renders **"No Products Found" everywhere** rather than a maintenance message.
- **Inconsistent fallbacks:** `getSettings()` returns `[]` on error but an object on success (consumers then read `[].company_logo`). `getHomeCategories()` returns the whole response, while `getCategories()` returns `result.data`. `getShopProducts()` returns `{ products: [], seoData: null }`. Callers cannot distinguish "empty" from "failed".
- **Sitemaps:** `sitemap.xml/route.js` indexes static, shop, category and brand sitemaps only. There are **no blog, news, used-device or outlet sitemaps**, although those pages exist. `shop/sitemap.xml` fetches `/products` (the full catalog) at `revalidate: 3600`, which is heavy but cached.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:** there is no clear server-only vs client boundary in the data layer.
  - `lib/api.js` (server fetchers using `fetchPublicAPI`) is imported by **client** components: `checkout/page.jsx`, `OrderReassurance.jsx` and `UsedDevice/.../ProductReview.jsx`. In the browser these run cross-origin, the `next: { tags }` options are ignored, and `cache()` does nothing.
  - `fetchPublicAPI` is also used client-side directly (`WelcomePopup`, `SidebarFunction`).
  - Add `import "server-only"` to `lib/api.js` and create a separate `lib/http/client.ts` (Axios → BFF) for the browser.
- **Axios BFF rule:** `axios` is listed in `package.json` but **imported nowhere**. All calls use raw `fetch` through four different wrappers (`fetchAPI`, `fetchPublicAPI`, `clientFetchAPI`, ad-hoc `fetch(\`${NEXT_PUBLIC_API_URL}…\`)` in nine client files). Standardize on:
  - a server Axios (or fetch) instance for server → API, with base URL, auth header from cookies, timeout, retry and error normalization;
  - a browser Axios instance for browser → `/api/*` BFF only.
- **State Management:** not applicable here, except that RTK Query's `baseQuery` should wrap the browser Axios instance (see `03`).
- **File Size:** `lib/api.js` is **904 lines** with about 55 exported fetchers. Split it by domain into `lib/api/{settings, catalog, products, preowned, refurbished, content, seo, popup}.ts`, each ≤100 lines, plus a shared `createFetcher({ path, tags, revalidate, schema, fallback })` factory, since most fetchers are 12-line copies of one pattern. `api/revalidate/route.js` (241 lines) should become a declarative map `{ type → { tags: [], paths: [] } }` plus a 30-line handler. `utils/filterProducts.js` (154 lines) should be deleted once the API filters (see `07`).
- **TypeScript:** this is where Zod pays off most. Every fetcher should `schema.safeParse(json)` and either return typed data or throw a typed `ApiError`. Normalize the API's two envelope styles (`{ data }` vs a raw array such as `/our-teams`) in one place.

## 3. Duplication & Technical Debt
- **Duplicate fetchers:**
  - `library/getBrands.js` (unused) vs `lib/api.getBrands`
  - `library/getFeatureProduct.jsx` vs `lib/api.getFeaturedProducts`
  - `library/getHomeCategories.jsx` vs `lib/api.getHomeCategories`
  - `fetch-API/getCategories.jsx` (unused) vs `lib/api.getCategories`
  - `library/getCart.jsx` (unused) vs `CounterContext.refreshCart` vs checkout
  - `fetch-API/getAuthUser.js` vs `utils/getAuthUser.js`

  Delete `src/library/` and `src/fetch-API/` and keep `lib/api/*` plus `lib/auth/*`.
- **Three wrappers** with near-identical error handling (`fetchAPI`, `fetchPublicAPI`, `clientFetchAPI`). Use one HTTP core.
- `.jsx` extensions on non-JSX modules (`getCart.jsx`, `getCategories.jsx`, `getFeatureProduct.jsx`, `getHomeCategories.jsx`). Rename to `.ts`.
- `src/lib`, `src/library`, `src/utils` and `src/fetch-API` are four folders for the same concern. Consolidate into `src/lib/{api,http,auth,seo,format}` and `src/utils` (pure helpers only).
- `getRefurbisheds = getRefurbishedProducts` alias (`lib/api.js:642`): remove it.

## 4. Data Fetching & Performance
- **Caching strategy:** settings, sliders, brands, categories, featured and others use `revalidate: false` plus tags (cache forever, purge via webhook), and some use `3600`. That is a good design, **as long as the webhook is reliable**. Add a safety-net `revalidate` (for example 86400) so a missed webhook cannot freeze prices or stock for ever.
- **Uncached paths:** everything through `fetchAPI` (no `next` options; Next 16 does not cache `fetch` by default), the search page (`no-store`), and every client-side call.
- **No timeouts:** none of the wrappers set `AbortSignal.timeout(...)`. During the 522 outage each server render waits about 20 s per upstream call (measured), so a page with five sequential fetches can hang for over a minute and exhaust server workers. Add a timeout of about 5-8 s per call plus circuit-breaking.
- `logging.fetches.fullUrl: true` in `next.config.mjs` logs every upstream URL (including query strings) in production logs. Restrict it to development.

## 5. Actionable Refactor Checklist
- [ ] 1. Replace `"use server"` with `import "server-only"` in `utils/fetchAPI.js`, `fetch-API/*` and `library/getCart.jsx`. Fix the client call sites to use BFF routes or props.
- [ ] 2. Build `lib/http/server.ts`: one server HTTP core with base URL validation (fail fast if `NEXT_PUBLIC_API_URL` is unset), timeout, cookie auth, `ok`-check **before** JSON parse, typed `ApiError` and optional retry.
- [ ] 3. Build `lib/http/client.ts`: a browser Axios instance that talks only to `/api/*`, with interceptors (401 → logout flow, error normalization).
- [ ] 4. Split `lib/api.js` into domain modules using a `createFetcher` factory with a Zod schema per endpoint. Mark it `server-only`.
- [ ] 5. Return `null` or throw on failure instead of `[]` look-alikes. Let pages render `error.jsx` or a maintenance state instead of fake empty states.
- [ ] 6. Replace `api/client-fetch` with an endpoint registry or explicit routes (see `09`).
- [ ] 7. Refactor `api/revalidate` into a declarative map. Add `careers`. Re-enable slug lowercasing consistently on **both** the tag creation and revalidation sides. Use `timingSafeEqual`.
- [ ] 8. Add a safety-net `revalidate` to all forever-cached fetchers.
- [ ] 9. Add sitemaps for blog, news, used devices and outlets, and register them in `sitemap.xml/route.js`.
- [ ] 10. Delete `src/library/`, `src/fetch-API/`, the `getRefurbisheds` alias and `utils/filterProducts.js` (after the API filters).
- [ ] 11. Restrict `logging.fetches.fullUrl` to development.
