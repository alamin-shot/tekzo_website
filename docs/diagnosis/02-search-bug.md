# Module: Search Functionality (PRIORITY — user-reported bug)
**Path:** `src/Components/ReuseableComponent/SearchBar.jsx`, `src/Components/ReuseableComponent/SearchModalOverlay.jsx`, `src/Components/SearchModal/*`, `src/app/(main)/search/page.jsx`, `src/Components/Shop/ShopSearchBar.jsx`, `src/Components/Shop/ShopHeaderWithFilter.jsx`, `src/Components/Comparison/ProductComparisonHero.jsx` (search part), `src/library/getFeatureProduct.jsx`, `src/library/getHomeCategories.jsx`

> **How this was checked (2026-11-19):** I read the code directly, because the Gitingest files were not attached. I also used `git log`, the local `.next` build output and fetch cache, the committed API capture `search-iph.txt`, and live HTTP probes. The probes returned **Cloudflare 522** for both `https://web-api.tekzo.com.bd/api/v1/*` and `https://www.tekzo.com.bd/`, on 3 retries of about 20 s each. Because of that, I could not test the live search API's response shape or its CORS headers. Each finding below is labelled **CONFIRMED** (verified from code or artifacts) or **LIKELY** (strong evidence, still needs a live check).

---

## 1. Critical Bugs & Security Risks

### 1.0 Why search fails: summary
Search fails at three layers:

1. **The backend is down right now (CONFIRMED, infra).** The API origin and the storefront both return Cloudflare 522 ("origin unreachable"). Every search request fails while this lasts. This is an infrastructure problem, not a code problem, but it is the immediate trigger as of this analysis.
2. **The architecture makes search the fragile path (LIKELY root cause for "broken on all pages while the rest of the site works").** Almost all catalog data is fetched **server→API**. The live search modal is the main feature that fetches **browser→API directly** (`SearchBar.jsx:79-82`, `fetch(\`${NEXT_PUBLIC_API_URL}/search-products?query=…\`)`). That request crosses origins (`www.tekzo.com.bd` → `web-api.tekzo.com.bd`), so it is exposed to:
   - CORS allow-list gaps. The allow-list must include **both** `https://www.tekzo.com.bd` **and** the bare `https://tekzo.com.bd`, which `next.config.mjs` comments confirm is a live entry point.
   - Cloudflare Bot-Fight, WAF or "Under Attack" challenges. These return HTML or 403 to a browser `fetch()` but never to the Next server.
   - Ad-blockers and privacy extensions that block `*api*` sub-domains.
   - Mobile carriers that mangle cross-origin requests.

   When any of these happen, the search modal fails on **every page**, because `SearchBar` is mounted inside every `Banner`. Server-rendered pages keep working. That matches the reported symptom.
3. **The response contract is broken, so search looks broken even when the request succeeds (CONFIRMED from the committed capture).** `search-iph.txt` is the raw `/search-products?query=iph` response, committed in `978efab` ("implement search action"). Each of its 20 items is a raw DB `products` row of about 21 KB:
   - **No `final_price`, `regular_price` or `discount_amount` fields.** `ModalContent.jsx:221` therefore renders `৳ ` with no number for every result, and the discount block never shows.
   - **`product_image` is on `https://salamat-innovation.s3.ap-south-1.amazonaws.com/…`, not CloudFront.** `ModalContent.jsx:191` keeps only URLs containing `https://d2c2zgda4zwbg9.cloudfront.net/` and otherwise uses `/placeholder.jpg`. So **every result card shows a placeholder image**. The S3 host is also missing from `images.remotePatterns` in `next.config.mjs`.
   - No `official_warranty`, `is_unofficial`, `is_chinese` or `is_refurbished` flags, so no badges appear. `stock: 0` items and accessories (for example "iPhone 17 Pro Max Ultra-Slim Case") are returned unfiltered. Heavy HTML fields (`specifications`, `warranty_text`, `short_description`) are shipped to the browser on every keystroke debounce.
   - Caveat: the capture is from 2026-04-06. The backend may have changed since then, which is why there is a verification protocol in §1.9.

The detailed findings follow.

### 1.1 "View All" goes to a different, unverified endpoint — CONFIRMED (code)
- The modal uses `/search-products` (`SearchBar.jsx:80`). The full results page uses **`/search`** (`search/page.jsx:23`). It is the only call to `/search` in the whole repo, and its response shape is guessed in comments ("API may return { data: { products … } } or { data: { data: [...] } } — handle both shapes", lines 30-37).
- If `/search` is not implemented in the backend, or returns another shape, then `hasProducts` (line 72) is always false. Every query on `/search?query=…` then shows **"No Products Found"**, including the Google Sitelinks SearchAction target declared in `Components/SEO/CompanyJsonLd.jsx:21`.
- Even when `/search` returns data, `ShopProducts` → `CardMain` passes `product?.product_image` straight to `next/image`. With S3 image URLs (see 1.0-3), production's image optimizer rejects the host (HTTP 400), so images break. In `next dev` it throws an unhandled "hostname is not configured" error.

### 1.2 The modal fires Server Actions on mount — CONFIRMED (code)
- `ModalContent.jsx` is `"use client"`. It imports `library/getFeatureProduct.jsx` and `library/getHomeCategories.jsx`, which import `utils/fetchAPI.js`, which is marked `"use server"`. So the first time the modal opens, it fires **two Server Action POSTs** to the current route (`ModalContent.jsx:27-56`). Consequences:
  - **After every deploy**, open tabs still running the old JS get "Failed to find Server Action". The calls are caught, so the sidebar and featured grid silently end up empty.
  - Server Actions go through the App Router action queue. A product link clicked while those POSTs are pending can stall. `RouterStaleRecovery` then forces a hard `window.location` reload after 2 s, so search feels broken or slow.
  - They are **uncached**: every open of the modal on every page re-hits `/featured-products` and `/home-categories` uncached via the server.
  - Security: see 1.6.

### 1.3 Latent white-screen crash on modal open — LIKELY
- `library/getHomeCategories.jsx:6` returns the **whole response object** (`result || []`), and `ModalContent.jsx:87` calls `homeCat?.map(...)`.
- Every comparable endpoint in the local fetch cache (`/categories`, `/brands`, `/featured-products`, …: 45 of 46 endpoints) is wrapped as `{ data: … }`. If `/home-categories` follows that convention, `homeCat.map` is **not a function**, which throws during render.
- There is **no `error.jsx` / `global-error.jsx` anywhere in `src/app`**. One render error in the modal therefore takes down the whole page ("Application error: a client-side exception has occurred"). This happens the moment a user focuses the search input, on every page.
- `/home-categories` was not in the local cache, so this could not be confirmed. Verify with step 4 of §1.9.

### 1.4 More crash points in `ModalContent.jsx` — CONFIRMED (code)
- Lines 292, 295 and 297 call `product?.final_price.toLocaleString()`, `product?.regular_price.toLocaleString()` and `product?.discount_amount.toLocaleString()` **without optional chaining on the number**. A single featured product with a `null` price throws, and there is no error boundary to catch it.
- Line 265: the featured image `src={product?.product_image}` has no host guard and no fallback. A null or S3 URL breaks `next/image`.
- Line 177: `key={index}` on a list that changes on every keystroke causes wrong DOM reuse and image flicker.

### 1.5 Broken "Trending" links — CONFIRMED (code)
- `ModalContent.jsx:81` builds `href={\`/categories/${item?.href}\`}` from `quickLinks`, whose `href` values already start with `/` (for example `/used-device`). The result is **`/categories//used-device`**, `/categories//marketplace`, and so on. All five "NEW" quick links in the default, empty-query state of the modal lead to 404 or the wrong category.

### 1.6 Security: `fetchAPI` is a public Server Action that proxies any request — CONFIRMED (code)
- Because a client component imports `utils/fetchAPI.js` (`"use server"`), Next registers `fetchAPI(endpoint, options)` as a **publicly callable Server Action**. Shop `Filter.jsx` also triggers this.
- Anyone can POST to it with an arbitrary `endpoint` and arbitrary `options` (`method`, `body`, `headers`). The request goes out from the **Next server's IP** with the caller's cookie token attached.
- That is an unauthenticated RPC into the backend that bypasses any rate limit or WAF rule that trusts the frontend server's IP. It is not a host-level SSRF, because the base URL prefix is fixed, but it is a confused-deputy proxy to every API path and verb.

### 1.7 State and loading bugs in `SearchBar.jsx` — CONFIRMED (code)
- Line 90: the `AbortError` branch `return`s **without `setIsLoading(false)`**. If the query is cleared while a request is in flight, `isLoading` stays `true`, so the next search shows the skeleton until it resolves. Commit `17afbfa` introduced this when it removed the `finally`.
- Line 86: `setSearchResults(data?.data || data?.products || …)`. If the API ever returns `{ data: {} }` or `{ data: { data: [...] } }` (a paginated shape), `searchResults` becomes an object. `ModalContent.jsx:175` then evaluates `searchResults.length > 0` as `undefined > 0`, which shows "No products found" while the header counter shows `()`. There is no schema validation.
- Line 135: `MicButton` is a **component declared inside render**, so React unmounts and remounts both mic buttons on **every keystroke**. That reassigns `micRef`, breaks the outside-click exclusion in `SearchModalOverlay.jsx:26`, and can cancel taps on mobile.
- Lines 15-44: `MicIcon` injects a `<style>` tag on every render, twice per bar.
- Voice search hard-codes `lang = "en-US"` (line 119). Bangla speakers get poor transcripts. There is no feedback when `SpeechRecognition` is unsupported (line 114 returns silently), which affects Firefox and iOS in-app browsers.

### 1.8 Coverage gaps make search look "broken on some pages" — CONFIRMED (code)
- `SearchBar` exists **only** inside `Banner.jsx` and `HomeBanner.jsx`. Pages that do not render a Banner have **no search at all**. That includes `/product/[slug]`, where `NavbarVisibilityWrapper` also hides the navbar, the dashboard, policy and blog detail pages, and others.
- **Shop page:** `ShopSearchBar.jsx` is **dead code**, because its only consumer `ShopClientWrapper.jsx` is never imported. The input on `/shop` actually comes from `ShopHeaderWithFilter.jsx`, and it **filters brand chips by name only** (lines 28-65). Typing a product name such as "iPhone 16" matches no brand, so it **clears** the brand filter and nothing visible happens. Users read that as "search doesn't work on the shop page". Its placeholder text is "Search brands…".
- **Compare page:** `ProductComparisonHero.jsx:134` duplicates the whole search fetch and has the same contract problems. Line 361 passes raw S3 URLs to `next/image`.

### 1.9 Verification protocol (once the 522 outage is resolved)
1. Open DevTools → Network on `https://www.tekzo.com.bd/` **and** on `https://tekzo.com.bd/`. Type "iphone" in the search bar and inspect the `search-products` request:
   - Status `(failed)` / CORS error in the Console → CORS allow-list problem (backend `config/cors.php` `allowed_origins`).
   - Status 403 or 503 with an HTML body, or a `cf-mitigated: challenge` header → Cloudflare WAF or bot challenge on the API zone.
   - Status 200 → inspect the JSON. Missing `final_price` or S3 image URLs → contract problem (1.0-3).
2. Open `/search?query=iphone`. If it shows "No Products Found" while the modal shows results, the `/search` endpoint is wrong (1.1).
3. Open the modal with an empty query. If you see a white screen or "Application error", that is 1.3 or 1.4.
4. Hit `GET /api/v1/home-categories` server-side (curl). If the body is `{ "data": [...] }`, 1.3 is confirmed.
5. Check the Console for `Failed to find Server Action` after a deploy (1.2).

### 1.10 Local build blocker (CONFIRMED, not the production cause)
- Every line of `.env` is currently commented out (`# NEXT_PUBLIC_API_URL=…`). The current `.next` build (BUILD_ID `0mAy2txQcnbht-uORCP0d`, built 10:57) correctly inlined `https://web-api.tekzo.com.bd/api/v1`.
- The **next** `next build` or `next dev` will inline `undefined`. Search will then request `undefined/search-products?…`, a relative URL, and 404 on every page. The server-side fetches will fail too.
- Restore `.env` before any rebuild or deploy.

---

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - The browser calls the backend directly (`SearchBar.jsx`, `ProductComparisonHero.jsx`). This violates the Axios BFF pattern: there is no `/api/search` route handler, no server-side caching, and no response shaping.
  - A `"use server"` module (`utils/fetchAPI.js`) is imported into client code (`ModalContent.jsx`), which turns data reads into Server Actions. Server Actions are for mutations, not reads.
  - `ModalContent.jsx` is entirely `"use client"`, although its static parts (quick links, featured-products markup) could be rendered on the server and passed in as children.
  - `search/page.jsx` imports `Filter` (a heavy client component) and never uses it: the JSX is commented out at lines 101-109. Delete the import.
- **State Management:**
  - The search query lives in local `useState` and never reaches the URL. Refresh, back/forward and shared links all lose it, and the modal and `/search` page do not share state. Rule: the query belongs in URL params (`?q=`). Open/closed state for a global modal belongs in a Redux `ui` slice (or URL state), not prop-drilled through `SearchBar → SearchModalOverlay → ModalContent` as eight props.
  - Featured products and home categories are fetched into local state on every modal mount. They should come from the server (RSC props) or an RTK Query cache.
- **File Size:**
  - `ModalContent.jsx` (322 lines): split into `SearchSidebar` (trending/quick links), `SearchResultsGrid`, `FeaturedGrid`, and one shared `SearchProductCard`. The card markup is duplicated twice in the file (lines 181-233 vs 255-302).
  - `SearchBar.jsx` (234 lines): extract `useDebouncedSearch(query)` (fetch + abort + loading), `useVoiceSearch()` (SpeechRecognition), `MicButton` as a top-level component, and the mobile offer/close button.
  - `search/page.jsx` (131 lines): move `getSearchProducts` into `lib/api.js` (or `lib/api/search.js`) and keep the page as composition only.
- **TypeScript:**
  - There are no types on the most contract-sensitive feature in the app. Urgently add a Zod `SearchProductSchema` (id, slug, product_name, product_image as URL, final_price, regular_price, discount_amount, flags). Parse it in the BFF route and **map** the raw DB row to a `SearchProductDTO`.
  - Type the props of `SearchModalOverlay` and `ModalContent`. Eight untyped props are passed through two levels today.

## 3. Duplication & Technical Debt
- **Search fetch logic exists twice**: `SearchBar.jsx:67-100` and `ProductComparisonHero.jsx:118-148`. They have diverging behavior: one has `AbortController`, the other does not, and their error handling differs. Consolidate into one `useProductSearch` hook that talks to one BFF endpoint.
- **Outside-click, scroll-lock and video-pause logic** is duplicated between `SearchModalOverlay.jsx:23-58` and `ProductComparisonHero.jsx:151-170`. The code comment even says "mirrors Banner.jsx pattern". Extract a `useModalDismiss(ref, excludeRefs)` hook.
- **Three search inputs with three behaviors**: `SearchBar` (products, live), `ShopHeaderWithFilter` (brand-name filter that rewrites `?brand=`), and `ShopSearchBar` (dead; it debounces into brand chips). Delete `ShopSearchBar.jsx` and `ShopClientWrapper.jsx`. Rename the shop input "Filter brands" so it is not confused with search.
- **Two product-card implementations inside `ModalContent.jsx`**, plus `CardMain.jsx` elsewhere. The search card should reuse a slim variant of the shared card.
- `library/getFeatureProduct.jsx` and `library/getHomeCategories.jsx` duplicate `lib/api.js` `getFeaturedProducts` and `getHomeCategories`, which are cached and tagged. The `library/` versions are uncached and go through the Server Action path. Also, the error log in `getFeature` says "Brands fetch error".
- `search-iph.txt` (425 KB API dump) is committed at the repo root. Move it to a test fixture (`__fixtures__/search-products.json`) or delete it.
- An unused `<style jsx>` `shimmer` keyframe sits in `ModalContent.jsx:310-319`.

## 4. Data Fetching & Performance
- **Modal results:** CSR, uncached, cross-origin, one request per 400 ms debounce. Each response is about 420 KB for 20 items, because full HTML specs and warranty text are included. That is wasted bandwidth and memory on mobile, and it adds to the iOS tab-kill problem the team has been patching (commits `d5b841b`, `7f0b863`).
- **`/search` page:** SSR with `cache: "no-store"`. Every page view and every pagination click hits the backend uncached. Consider `revalidate: 60` keyed by the query string, or a `"use cache"` function with `cacheLife('minutes')`.
- **SEO:** `search/page.jsx:50` sets `robots: { index: true }` on infinite user-generated query URLs. That is a crawl trap and creates thin-content duplicates. It should be `noindex, follow`. Line 115 renders a `<title>` inside the body on empty results, which fights `generateMetadata`.
- **Images:** results use `fill` plus `sizes` (good), but all four warranty badges are separate `next/image` requests per card. Featured images are not guarded.
- **Bundle:** `framer-motion` is lazy-loaded via `dynamic(..., { ssr:false })` (good). But `AnimatePresence` plus two `motion.div`s only do opacity fades, which CSS transitions could handle, so the dependency could be removed from this path.
- `SearchModalOverlay.jsx:69` calls `e.preventDefault()` in a React `onTouchMove`. React registers `touchmove` as passive, so the call is a no-op that produces console warnings. `touch-none` already covers it.
- `SearchModalOverlay.jsx:42` runs `document.querySelectorAll("video")` and pauses videos on every open. It works, but it is imperative DOM manipulation from a leaf component. A global media-pause event or store flag would be cleaner.

## 5. Actionable Refactor Checklist
- [ ] 1. **Ops first:** resolve the Cloudflare 522 on `web-api.tekzo.com.bd` and `www.tekzo.com.bd` (origin server or firewall). Then run the §1.9 verification protocol and record which layer fails.
- [ ] 2. **Restore `.env`** (uncomment `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_GTM_ID`, `REVALIDATION_SECRET`) before any rebuild. Add a build-time check that fails `next build` when `NEXT_PUBLIC_API_URL` is missing.
- [ ] 3. **Create a BFF route handler** `src/app/api/search/route.(ts|js)` (GET, `?q=&page=`). It calls `/search-products` server-side, validates with Zod, maps each row to a lean DTO (id, slug, name, normalized CloudFront image, prices, badges, in-stock), and returns it with `Cache-Control: s-maxage=60, stale-while-revalidate=300`. This removes CORS, the Cloudflare browser challenge and ad-blockers from the equation.
- [ ] 4. Switch `SearchBar` (and the compare page) to call `/api/search` through the shared Axios client. Never call `NEXT_PUBLIC_API_URL` from the browser for search.
- [ ] 5. **Agree the contract with the backend:** `/search-products` must return `final_price`, `regular_price`, `discount_amount`, the badge flags and CloudFront image URLs. It must exclude inactive items (and optionally out-of-stock items) and drop the HTML fields. Until then, compute or normalize these in the BFF mapper.
- [ ] 6. Make `/search` page use the **same** BFF/service function as the modal (one endpoint, one DTO). Delete the guessed `/search` endpoint call, or confirm it exists and document its shape.
- [ ] 7. Remove the Server Action reads from `ModalContent`. Pass `featuredProducts` and `homeCategories` from a Server Component (for example the `(main)` layout, already cached via `lib/api.js`) into the search shell as props, or serve them from a cached BFF GET. Delete `library/getFeatureProduct.jsx` and `library/getHomeCategories.jsx`.
- [ ] 8. Remove `"use server"` from `utils/fetchAPI.js` and mark it `import "server-only"` instead, so it can never become a public RPC (security fix for 1.6).
- [ ] 9. Add `src/app/(main)/error.jsx` and `src/app/global-error.jsx`. Wrap the search modal in its own error boundary so a bad payload can never white-screen the site.
- [ ] 10. Fix the `ModalContent.jsx:81` quick-link URL bug (use `item.href` directly).
- [ ] 11. Guard every price render with null-safe formatting through one shared `formatBDT(value)` helper. Use `product.id`/`slug` as keys, not the index.
- [ ] 12. Fix the loading state: reset `isLoading` on abort, or derive it from request status (RTK Query `isFetching`).
- [ ] 13. Hoist `MicButton`/`MicIcon` to module scope and move the keyframes to `globals.css`. Add a visible "voice search not supported" state. Make the recognition language configurable (`bn-BD` / `en-US`).
- [ ] 14. Put the query in the URL (`?q=`) and move modal open state to a Redux `ui` slice. Mount **one** global search entry point in the layout or navbar so every page, including `/product/*`, has search.
- [ ] 15. Shop page: rename the brand filter input ("Filter brands") or make it a real product search that sets `?search=` (the `getBrandProducts`/`getCategoryProductsBySlug` signatures already accept a `search` argument). Delete `ShopSearchBar.jsx` and `ShopClientWrapper.jsx`.
- [ ] 16. `/search` page: set `robots: noindex, follow`, remove the inline `<title>`, remove the unused `Filter` import, and cache results briefly.
- [ ] 17. Add the S3 host to `images.remotePatterns` **or** normalize all image URLs to CloudFront in the BFF. Do not leave a host guard in a leaf component.
- [ ] 18. Split the files per §2 (each ≤100 lines), add Zod schemas and TS types, and write a contract test that runs `search-iph.txt` (moved to fixtures) through the mapper.
- [ ] 19. Add a Playwright smoke test: focus search → type "iphone" → expect ≥1 card with a non-placeholder image and a price → click "View All" → expect the same results on `/search`.
