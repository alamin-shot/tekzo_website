# Fix Plan: tekzo.com.bd mobile performance

- **Status:** plan only. Nothing is implemented.
- **Baseline:** deployed commit `169994f`. The code is identical to `main`/`alamin` HEAD `e86c110` for every file below.
- **Evidence:** `docs/perf-audit/PERF_AUDIT_FINDINGS.md`. Finding IDs (P1–P20) are referenced per PR.

**Ordering note (updated Phase 3, measured; see FINDINGS §9):**
1. **PR 9 (Marketing / GTM) starts now, in parallel with PR 1.** It is the only lever on most of TBT and INP.
   - Blocking `gtm.js` gave TBT 1,634 → 396 ms (−76 %), Perf 46 → 64, and worst tap 432–640 → 240 ms.
   - It does not wait for the dev PRs.
2. **PR 1 (fonts) stays first among the dev PRs.** Blocking Bornomala gave throttled LCP −0.45 s, with the CSS arriving 0.4 s earlier.
3. **New PR 11 (`experimental.inlineCss`) goes right after PR 1.** The throttled trace shows FCP = LCP is gated by the 42 KB render-blocking stylesheet arriving at 2.9 s, while the hero image was ready at 1.7 s.
4. PRs 2–8 and 10 keep their order. PR 8 (DOM and hydration) also addresses the 164 + 272 ms first-layout tasks before LCP, and the ~140–180 ms first-party floor per tap.

**Original note (Phase 2):**
- The order below is the one requested.
- The data that could justify a re-order has **not been provided yet**: PSI LCP breakdown, GTM/Bornomala blocking experiment, Clarity INP. The Phase 2 brief still contained `<x>` placeholders.
- If the blocking experiment shows that blocking `gtm.js` removes most of the TBT, PR 9 (marketing) should be started **in parallel with PR 1**, because it is the only lever on most of the INP. Nothing in the data seen so far contradicts the order.
- One extra PR found by the bundle analyzer is appended as **PR 10**.

**Per-PR process:**
1. Branch off `main`.
2. Run PSI or Lighthouse mobile 3× before and 3× after, on the same preview URL.
3. Merge only if no metric regresses beyond noise (±5 Perf points, ±150 ms TBT).

---

## PR 1: Bornomala: WOFF2 subset, no preload, real weights (P2)

**Files / lines**
- `src/lib/fonts.js:15-57`: the `bornomala` declaration.
  - Replace the 7 `src` entries (weights 300–900 mapped onto 2 files) with **2 entries**: `400` → Regular and `700` → Bold.
  - Add `preload: false`.
  - Add `declarations: [{ prop: "unicode-range", value: "U+0964-0965, U+0980-09FF, U+200C-200D, U+25CC" }]`. The `declarations` option is supported by `next/font/local` per `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md`.
- `src/fonts/Bornomala/Bornomala-{Regular,Bold}.ttf` (204 KB / 225 KB): add `Bornomala-{Regular,Bold}.subset.woff2`, generated **outside the app build** with fonttools `pyftsubset` on the developer machine.
  - Use the same unicode range plus `--layout-features='*'`. Bengali needs its GSUB/GPOS shaping tables, so a plain glyph subset would break conjuncts.
  - Commit the woff2 files. The TTFs can stay in the repo, unreferenced, or be deleted.
- No change to `globals.css:28-38` or `theme.css:9-12`. The font stacks stay as they are.

**Why the full Bengali block, not just ৳:** Bengali text exists in `checkout/page.jsx`, `AddAddressPopup.jsx`, `HowToClaimClient.jsx`, `OrderReassurance.jsx` and `api/revalidate/route.js`. A ৳-only subset would break those pages. With `unicode-range`, the browser fetches the face **only on pages that render a Bengali code point**. The homepage renders "৳" in prices, so it will still fetch the small subset.

**Metric:** LCP, FCP, payload.
- Today 429 KB of TTF is preloaded at high priority on every page. Expected after: a ~15–40 KB woff2, not preloaded, fetched after first render.
- **Expected gain:** −390 KB high-priority bytes; lab LCP −1 to −2 s (UNVERIFIED).
  - Basis: on Lantern's 1.6 Mbps link, 429 KB ≈ 2.1 s of shared bandwidth contending with the 12 KB hero image.
  - The "Bornomala blocked" experiment result will replace this estimate.

**Blast radius:**
- Every page (root `layout.jsx:6,10`).
- Risk: Bengali glyphs rendering as tofu, or conjuncts breaking, if the subset drops shaping tables.
- Brief fallback flash of "৳" on first view (`display: swap`, already the case today).
- No effect on cart, checkout or login logic, tracking or SEO.

**Test checklist**
- [ ] Homepage, product page, shop: "৳" renders in the Bornomala glyph, not a fallback box.
- [ ] Checkout (guest and logged-in), address popup, warranty claim, product page `OrderReassurance`: all Bengali strings render, and conjuncts (e.g. "ক্ষ", "ন্ত") are shaped correctly.
- [ ] iOS Safari + Android Chrome.
- [ ] Network panel: no `Bornomala*.ttf`; no font `<link rel=preload>` for Bornomala; the woff2 is fetched once.
- [ ] PSI: "Network dependency tree" and total payload drop ~400 KB; compare LCP and FCP.

**Rollback:** revert the commit. Fonts are static assets with hashed names, so there is no cache poisoning.

**Size:** S

### PR 1: implemented and verified (Phase 3, uncommitted on `perf/pr1-bornomala-fonts`)

**Changes**
- `src/lib/fonts.js`: Bornomala now uses 2 faces (weight ranges `300 500` → Regular, `600 900` → Bold, so the mapping is identical to the old 7 faces), with `preload: false` and `unicode-range: U+0964-0965, U+0980-09FF, U+200C-200D, U+25CC`.
- New `src/fonts/Bornomala/Bornomala-{Regular,Bold}.subset.woff2`, made with fonttools 4.68 `pyftsubset` from the TTFs:
  - same unicode range, `--layout-features='*' --layout-scripts='*'`
  - **57,356 B + 65,700 B** (was 204,276 B + 225,072 B TTF)
  - 462 glyphs kept; `beng`/`bng2` GSUB + GPOS intact
- The TTFs are left in the repo, unreferenced. Delete them in this PR or a follow-up.

**How it was verified**
- Two production builds (`main` vs PR 1, same commit `e86c110`), built in temporary worktrees with `NEXT_PUBLIC_API_URL` = production API and **no GTM ID** (no fake analytics, and no tag noise in the A/B).
- Both homepages render identical data (289 images, 40 "৳").
- Note: the first cold PR 1 build was rate-limited by the production API ("Too Many Attempts", ~570 requests over both builds). The final builds were seeded from a shared fetch cache, with 0 rate-limited calls.

**Results**

| Check | main | PR 1 |
|---|---|---|
| Font `<link rel=preload>` on `/` | 2× Bornomala TTF + 2× Switzer | **Switzer only** |
| Bornomala bytes on Bengali pages (`/`, product, `/faq`, `/how-to-claim`) | 199 KB + 220 KB TTF | **56 KB + 64 KB woff2** |
| Bornomala on pages without Bengali (`/checkout` empty cart, `/about-us`, `/blog`) | 419 KB TTF downloaded | **none** |
| Platform font for Bengali text (CDP `getPlatformFontsForNode`) | Bornomala (web): 14 / 16 / 30 glyphs; ৳ 1 | **identical** |
| Computed weight (product `font-semibold`, prices) | 600 | 600 |
| Screenshot pixel diff (412 px @2×) | — | how-to-claim (Bengali), checkout, about-us, blog: **0 px**; product 112 px (0.01 %); faq 0.19 % and home 4.5 %, both = flash-sale countdown + WhatsApp pulse animation only |
| Lighthouse mobile avg ×3 (local `next start`, no GTM) | Perf 67 · LCP 6.86 s · TBT 342 ms · SI 3.46 s | **Perf 75 · LCP 5.44 s · TBT 228 ms · SI 2.92 s** |
| Throttled real trace (4× CPU, 1.6 Mbps): LCP | 2.17 s (hero image done 1.89 s) | **1.82 s** (hero done 1.11 s; Bornomala subset fetched after first paint, at ~2.1 s) |

**Not verifiable here:**
- The **address form** (`AddAddressPopup`) needs login. Its only Bengali is in code comments, so no rendered change is expected.
- The checkout Bengali notices (`checkout/page.jsx:915, 931`) only render with items in the cart. Adding to cart was out of bounds for this test. Same font path as the other verified Bengali text.

---

## PR 2: Images: real dimensions and `sizes` (P5)

**Files / lines**

| File:line | Today | Change |
|---|---|---|
| `src/Components/ReuseableComponent/CardMain.jsx:140, 151, 158, 164` | warranty, unofficial, chinese and refurbished badges `width={4000} height={3000}`, no `sizes` → `w=3840` requested | set intrinsic size ≈ display size (e.g. `width={200} height={150}`) plus `sizes="(min-width:1536px) 100px, (min-width:1024px) 80px, 44px"` matching the `w-11 lg:w-[80px] 2xl:w-[100px]` classes |
| `CardMain.jsx:179` | `pointCardLogo.svg` 4000×3000 | SVG: `unoptimized` plus real `width`/`height` (`dangerouslyAllowSVG` is false, so the optimizer already passes SVG through) |
| `CardMain.jsx:208, 221` | `tekzo-care.webp` and `Offer.svg` 4000×3000 | real size plus `sizes` matching `w-14 lg:w-[95px] 2xl:w-[120px]` and `w-8 … 2xl:w-[80px]` |
| `src/Components/Home/Categories/Category.jsx:13-19` | `width={140} height={140}`, no `sizes` → 384 px for ~78 px | add `sizes="(min-width:768px) 10vw, 20vw"` (4-col mobile / 8-col desktop grid × 66% inner box) |
| `src/Components/Home/Brands/Brand.jsx:13-16` | same as Category | same as Category |
| `src/Components/Navbar/Navbar2.jsx:93-101` | logo `width={300} height={250}` shown at `w-10`/`w-9`, preloaded at high priority | `width={80} height={67}` (2× of 40 px); **drop `priority`/`fetchPriority="high"`** so it stops competing with the hero |
| `Navbar2.jsx:82-91` | `navbar-middle.svg` with `priority` | keep it visible but drop `fetchPriority="high"` (715 B, but it occupies a high-priority slot) |
| `src/Components/Footer/FooterPage.jsx:85` | payment icons 4000×3000 | real size (`unoptimized` if SVG) |
| `src/Components/Footer/FooterBottom.jsx:65` | social icons 4000×3000 | real size |

**Metric:** payload; LCP bandwidth; origin CPU (sharp encodes).
- **Expected gain:** PSI's own estimate of **−199 KiB**.
- Fewer distinct `w=` variants, so fewer sharp encodes and less origin CPU.
- The live HTML has 79 `width="4000"` images and 127 `w=3840` srcset entries.

**Blast radius:**
- Every `CardMain` listing (18 importers: home, shop, categories, brands, flash sale, offers, used, refurbished, related products, 404), the navbar on every page, and the footer.
- Risk: a badge rendering blurry if `sizes` is too small, or layout shift if the aspect ratio changes. Keep the same width/height ratio as the asset.

**Test checklist**
- [ ] Product card badges sharp on a 3× DPR phone and at 1536 px desktop.
- [ ] No visible size or position change: screenshot-diff cards on home, shop and category at 390/768/1280/1536 px.
- [ ] Logo sharp; navbar unchanged.
- [ ] PSI: "Improve image delivery" item gone or reduced; CLS not increased.

**Rollback:** revert the commit (props only).

**Size:** S–M

---

## PR 3: Cloudflare cache rules for `/_next/image` and first-party SVGs (P6)

Infra only; no repo change.

**Rules** (Cloudflare dashboard → Caching → Cache Rules):
1. **`/_next/image*`**
   - Eligible for cache.
   - Edge TTL: respect origin. Next already sends `Cache-Control: public, max-age=2678400, must-revalidate` (`next.config.mjs:90`, `minimumCacheTTL`).
   - **Cache key must include the full query string (`url`, `w`, `q`).** The origin only emits WebP (`next.config.mjs:83`), so the `Accept` header does not need to vary today. If AVIF is ever re-enabled, add `Accept` to the cache key first.
2. **`/*.svg` and the other `public/` assets** (`/Offer.svg`, `/pointCardLogo.svg`, `/whatsapp-svgrepo-com.svg`, `/navbar/navbar-middle.svg`, `*.webp` badges): Edge TTL 30 d, Browser TTL 7 d.
   - Not `immutable`: these filenames are not content-hashed, so a re-upload under the same name must still refresh.
   - **Purge by URL** when an asset is replaced.

**Explicitly NOT in this PR: HTML caching.**
- The HTML itself is user-agnostic: logged-in state is fetched client-side by `CounterContext` and `NavAuthClient`, and the proxy sets only `has_auth`.
- But the proxy (`src/proxy.js`) **writes or deletes the `has_auth` cookie on HTML responses** (`syncAuthMarker`). A cached HTML response would replay or strip that `Set-Cookie` for other visitors, desyncing cart/wishlist/profile fetching (`CounterContext` gates on `has_auth`).
- Prices change via `/api/revalidate`, and there is no edge purge hook yet.
- HTML caching needs: (a) the cookie sync moved off cacheable responses, (b) a purge-on-revalidate integration, and (c) the pm2 cluster question answered (FINDINGS Q7).

**Metric:** image TTFB, origin CPU, repeat-view LCP. Today `/_next/image` returns `cf-cache-status: DYNAMIC` on every request.

**Blast radius:**
- All optimized images site-wide.
- Risk: a wrong cache key serving one width to all requests. Mitigated by including the query string; verify before broad rollout.
- No checkout, login or tracking impact.

**Test checklist**
- [ ] `curl -I "https://www.tekzo.com.bd/_next/image?url=…&w=750&q=75"` twice: the second shows `cf-cache-status: HIT`.
- [ ] Two different `w=` values return different `content-length`.
- [ ] `/Offer.svg` shows the new TTL.
- [ ] Origin CPU (pm2 monit) before/after during peak.
- [ ] Product images still update after a CMS image change (new URL, so unaffected).

**Rollback:** disable the rule in the dashboard, then purge everything (instant).

**Size:** S

---

## PR 4: Parallelize homepage data (P12)

**Files / lines**
- `src/app/(main)/page.jsx:6-8`: replace the three sequential `await`s with one `Promise.all([getSliders(), getCategories(), getBrands()])`.
  - The same `lib/api` functions keep the same tags and `revalidate` settings, so nothing changes in caching.
- Same pattern in `src/Components/Navbar/Navbar2.jsx:12-13` (`getCategories`, `getBrands`). Both are React-`cache()` deduped with `page.jsx` in one request.

**Metric:** TTFB on a cold ISR render or after a revalidation (warm cache: no change).
- **Expected gain:** cold render saves about 2 × API latency.
- The proxy profile shows the API latency (TTFB 0.8 s field). Small effect on the lab score, which mostly measures cached HTML.

**Blast radius:**
- Homepage and every `(main)` page (navbar).
- Risk: none functionally. Each fetcher already swallows errors and returns fallbacks, so one rejection cannot reject the whole `Promise.all`. **Verify this per function** before relying on it.

**Test checklist**
- [ ] Homepage renders hero, categories and brands with the API up.
- [ ] With the API returning 500 for one endpoint (staging), the page still renders with that section empty.
- [ ] After `POST /api/revalidate` for the sliders tag, the first request regenerates correctly.

**Rollback:** revert the commit.

**Size:** S

---

## PR 5: Memoize provider values (P11)

**Files / lines**
- `src/context/CounterContext.jsx:109-118`:
  - Wrap the `value={{…}}` object in `useMemo` keyed on `cartCount`, `wishlistCount` and the (already `useCallback`ed) functions at `:26, :40, :60-70`.
  - Make sure every exposed function is a `useCallback`.
- `src/context/CompareContext.jsx:74-80`: `useMemo` the value (`compareProducts`, `isHydrated`, and the three callbacks, which are already `useCallback`).
- Optional, larger: split each into a state context and an actions context, so components that only call `addToCompare` (e.g. `CardMain`) don't re-render when slots change.

**Consumers affected** (complete list, `grep useCounter\(|useCompare\(`):
- `useCounter`: `src/Components/Navbar/NavCountBadges.jsx` (`NavCountBadgesLg`, `NavCartBadgeSm`), rendered by `NavAuthClient`.
- `useCompare`:
  - `src/Components/ReuseableComponent/CardMain.jsx:63` (every product card, 18 importers)
  - `src/Components/ReuseableComponent/ProductDetails/ProductDetails.jsx`
- **Not** consumers: the `/compare` page (`ProductComparisonHero` reads `localStorage` directly) and the `fire*` event emitters (window events, not context).

**Metric:** INP (re-render cascades).
- Today every provider render creates a new value. That re-renders every `CardMain` on the page (dozens on listings), which matters for compare actions and the `CompareProvider` hydration `setIsHydrated`.
- **Expected gain:** small to medium INP on listing pages. Not measurable in lab TBT.

**Blast radius:**
- Cart and wishlist badges, the compare button on every card, the product details compare.
- Risk: a stale closure if a dependency is missed, e.g. the badge not updating.

**Test checklist**
- [ ] Logged in: add to cart from the CartModal and from product details: the badge goes +1. Remove in checkout: −1.
- [ ] Wishlist add/remove updates the badge.
- [ ] Compare from a card and from product details → `/compare` shows the product.
- [ ] React Profiler: adding to compare no longer re-renders all `CardMain`s (with the state/actions split), or at least the badges don't re-render on unrelated parent renders.

**Rollback:** revert the commit.

**Size:** S (M with the context split)

---

## PR 6: DOMPurify off the client (P9)

**Files / lines**
- `src/Components/ReuseableComponent/PageDescription.jsx:1-5, 31-47, 87`:
  - It is `"use client"` only for the accordion (`isOpen`, `scrollHeight` measurement, resize listener), but it calls `formatHtml` (DOMPurify) in the client bundle.
  - Split it into:
    - **`PageDescription` (server)**: calls `formatHtml(description)` and renders the title.
    - **`PageDescriptionAccordion` (client)**: receives the already-sanitized `html` string and handles open/close and height.
- Keep the 29 importers' API unchanged: same props, same `className`, same markup and Tailwind classes.
- **Caveat:** check every importer is itself a Server Component, or passes plain props. A client importer would pull `formatHtml` back into the bundle. List them with `grep -rl "PageDescription" src`.

**Metric:** JS payload and hydration CPU.
- **Expected gain:** −30.7 KB raw / −11.7 KB gzip (analyzer chunk `34h6r3c3lmn9f.js`, prod `28slmjp3zeals.js`).
- Also removes the client-side DOMPurify parse of `long_description` during hydration.

**Blast radius:**
- The 29 pages using `PageDescription` (home, categories, brands, shop, blog, …).
- Risk: XSS-defence regression if any path renders the unsanitized string, so sanitization must remain on the server path. The accordion's layout must stay identical.

**Test checklist**
- [ ] Homepage "More About Tekzo", category, brand and blog pages: the accordion opens and closes; links get `target="_blank" rel="noopener noreferrer"` (formatHtml behaviour); `<h1>` in the content is downgraded to `<h2>`.
- [ ] Paste a `<script>`/`onerror` payload into a staging CMS description: it is stripped in the HTML.
- [ ] Re-run `next analyze`: `dompurify` absent from route `/` client chunks.

**Rollback:** revert the commit.

**Size:** M

---

## PR 7: RouterStaleRecovery: no reloads on slow or query-only navigation (P7)

**Files / lines**
- `src/Components/ReuseableComponent/CustomUIComponent/RouterStaleRecovery.jsx:27-53`:
  1. Compare the target `pathname + search` (resolved via `new URL(href, location.href)`) with the current `location.pathname + location.search`.
     - If they are already equal at click time, do nothing: same-page links and re-clicks.
     - When the timer fires, reload only if the URL has not changed **and** no navigation is in progress.
  2. Raise the timeout from 2 s to ≥8 s.
  3. Optionally reload only when `document.visibilityState` showed the tab was backgrounded before the click (the stale-router scenario the file comments describe).
- `PreFetchLink.jsx:25` (`data-nav-recovery`): no change.

**Problem today:**
- Any internal click whose *pathname* hasn't changed after 2 s forces `window.location.href`.
- That includes every slow mobile soft navigation (TTFB 0.8 s plus RSC payload on 4G) and every query-only link (`?page=2`, filter and sort), whose pathname never changes. So **pagination always hard-reloads after 2 s**.

**Metric:** user-perceived navigation time and wasted bandwidth. Not a lab metric.
- The click listener itself costs <1 ms, so this is **not** an INP fix.

**Blast radius:**
- Every `PreFetchLink` site-wide (373 on the homepage).
- Risk: if the original stale-router bug is real and frequent, longer timeouts make recovery slower. Keep the mechanism, only tighten it.

**Test checklist**
- [ ] DevTools Slow 4G: click a product card from home: soft navigation completes with no full reload (Network: no second document request).
- [ ] Shop pagination `?page=2` and category filters: no full reload.
- [ ] Background the tab for >10 min, return, click a link: navigation still succeeds (recovery still works).
- [ ] Cmd/Ctrl-click opens a new tab (unchanged).

**Rollback:** revert the commit.

**Size:** S

---

## PR 8: Carousels: lighter hydration (P3, P4, P8)

**SEO precondition (done, VERIFIED on live):**
- All **84** category links in the homepage category carousel are on `/categories`, and all **92** brand links are on `/brands`.
- Both index pages are linked from the homepage outside the carousels (`/categories` ×5, `/brands` ×2, including the navbar).
- The sitemap has 82/84 categories and 92/92 brands. **Missing from the sitemap: `/categories/hair-dryer`, `/categories/mobile-mount`.**
- **No link is discoverable only through the carousels.** Trimming server-rendered slides is SEO-safe **once the 2 sitemap gaps are fixed** (a backend or sitemap-generator data issue; include it in this PR or ship it first).

**Files / lines**
1. **Autoplay only when visible:** all wrappers.
   - `HomeSlider.jsx:29-35` (2 s)
   - `Category.jsx:51` and `Brand.jsx:44-51` (4 s)
   - `SwiperSlider4.jsx:31`, `SwiperSlider44.jsx`, `SwiperSlider22.jsx`, `SwiperSlider3.jsx` (2 s)
   - `SwiperSliderAll.jsx:12-21` (`delay:0`, `speed:6000`, `loop`, `freeMode`: a continuous marquee)
   - Add an `IntersectionObserver` that calls `swiper.autoplay.stop()`/`start()`.
   - Respect `prefers-reduced-motion`.
   - Remove the dead `onAutoplayTimeLeft` callbacks (`SwiperSlider4.jsx:10-17`, `HomeSlider.jsx:16-19`, etc.): their refs are never attached.
2. **Server-render only the first slide** in `Category.jsx:61-69` and `Brand.jsx` (chunks of 8). Mount the remaining slides after the section intersects or on the first swipe.
   - This removes ~76 category and ~84 brand tiles, links and images from the initial HTML and hydration (~200 KB of raw HTML).
3. **Lazy-init below-the-fold carousels** (flash sale, features, new arrival, used devices) behind one shared `LazyMount` IntersectionObserver wrapper. This replaces the 4 ad-hoc copies (`UsedDeviceSectionHomePageLazy.jsx`, `FeatureProductsCategory2Lazy.jsx`, `LiveSectionClient.jsx`, `Footer.jsx:11-34`).
   - Keep the server-rendered content visible for crawlers (render static markup, hydrate Swiper later). Do **not** hide it.
4. **Optional:** replace the marquee in `SwiperSliderAll.jsx` with a CSS `@keyframes` translate (zero JS per frame).

**Metric:** TBT and INP (hydration plus Swiper init forced reflows, PSI #2), DOM size, HTML size.
- **Expected gain:** TBT −300 to −600 ms (UNVERIFIED).
  - Basis: `3lbm` (React DOM) 1.9 s and Swiper chunks ~1.3 s of lab CPU, and the 2,732-element DOM.
  - HTML −200 KB raw (≈ −20 KB compressed).

**Blast radius:**
- Homepage carousels, and every page using `SwiperSlider4`/`22`/`44` (shop, category and brand listings via `CardMain` sliders).
- Risk:
  - carousel UX changes (autoplay pauses off-screen; this is intended)
  - layout shift if lazily mounted slides change height, so reserve height
  - SEO, if markup is hidden instead of deferred (see the precondition)

**Test checklist**
- [ ] Homepage on mobile and desktop: every carousel shows its first slide immediately and swipes to the rest. Autoplay runs only while visible.
- [ ] Category and brand carousels: swiping reveals the later slides; links work.
- [ ] Google Rich Results / URL Inspection "View crawled page": category and brand links present (the first slide plus the index pages).
- [ ] PSI: TBT, DOM size ("Avoid an excessive DOM size"), "Forced reflow" insight, CLS.
- [ ] Low-end Android (or 6× CPU throttle): tap responsiveness while carousels are on screen.

**Rollback:** revert the commit. If only one part misbehaves, the three parts are independent commits.

**Size:** L (split into 8a autoplay/IO [S], 8b first-slide SSR [M], 8c LazyMount [M])

---

## PR 9: GTM / third parties (recommendations for Marketing, P1)

**Not code changes.** The only in-repo piece is `src/Components/GTM/GTM.jsx:34-57`, which loads the container on `load` → `requestIdleCallback` (2 s), **or** on the first `scroll`/`mousemove`/`touchstart`/`keydown`/`click`, **or** after 15 s.

**Why it matters:** lab third-party CPU is ~1.7 s (GTM 880 ms incl. gtag `AW-…` 563 ms, Facebook 384 ms, TikTok 280 ms, Clarity 144 ms) and 274 KB of unused third-party JS (PSI #8, #9). For real users this work begins **at their first scroll or tap**, exactly when they are about to interact, so it is the leading suspect for field INP 460 ms. The verdict is pending the blocking experiment and Clarity INP data.

**Recommendations**
1. **Firing rules:** fire the Meta and TikTok base pixels and Clarity on **Window Loaded + a short delay**, or on a custom `dataLayer` event the site pushes after idle. Not on "All Pages – Page View / DOM Ready".
2. **Server-side GTM is already provisioned** (`server.tekzo.com.bd`, seen in the PSI CSP report).
   - Move Meta CAPI and TikTok Events API to the server container.
   - Keep only the minimum browser tags needed for attribution (cookie IDs), or drop the browser pixels if the server-side match quality is acceptable.
3. **Deduplicate Google tags:** check whether gtag `AW-…` is loaded both as a Google Ads tag **and** via a Google tag / GA4 configuration. One Google tag should serve GA4 + Ads.
4. **jsdelivr `clientParamBuilder.bundle.js`** (18 KB, short cache): self-host it via the server container, or load it only on conversion pages.
5. **Clarity:** sample (e.g. 25 % of sessions) or restrict it to key pages.
6. **Consent / Content-Signal:** no change needed for performance.

**What to check in container `GTM-P2B3DNBX`**
- [ ] The full tag list, with trigger and tag-sequencing settings for every tag.
- [ ] Custom HTML tags: the content of each, and anything unknown (also a security item, see `docs/diagnosis/99-deep-forensic-audit.md`).
- [ ] Whether FB/TikTok fire both from the browser and from the server container (double-counting risk).
- [ ] How many Google tag / Ads / GA4 instances load.
- [ ] Whether any tag uses `document.write`, polling or `setInterval` (main-thread hogs).
- [ ] The server container's client config at `server.tekzo.com.bd`. Also add it to the CSP `frame-src` (`next.config.mjs:51`) before the CSP is ever enforced.

**Metric:** INP (field), TBT (lab).
- **Expected gain:** set by the blocking experiment (pending).
- Upper bound from PSI attribution: up to ~1.7 s of main-thread CPU moved out of the interaction window.

**Blast radius:**
- **High.** Attribution, conversion counting, ad optimisation and remarketing audiences.
- Marketing must validate in GTM Preview, Meta Events Manager (Test Events), TikTok Events Manager and Google Ads conversion diagnostics.

**Test checklist**
- [ ] GTM Preview: each tag fires once per page with the expected trigger.
- [ ] Purchase, add-to-cart and lead conversions still arrive in each platform, with dedup IDs.
- [ ] PSI before/after: third-party CPU and TBT. Clarity/RUM INP over 7 days.

**Rollback:** publish the previous container version (GTM → Versions → Publish). Instant.

**Size:** M (Marketing)

---

## PR 10 (new, from the bundle analyzer): light `(main)` 404 boundary (P13)

**Files / lines**
- `src/app/(main)/not-found.jsx:1-13` imports `ClientNotFoundContent` and `FeatureProductFor404Page`, which pull in `CardMain`, `SwiperSlider4` (`swiper/react`) and `SearchBar`.
- Because the segment's not-found boundary is a render-dependent group of the layout, its client chunk (`0lzgni6aoo4--.js`, prod `2n89dh8odx6i_.js`) loads on **every** `(main)` page and duplicates code the page already ships.
- **Fix:** load the 404's product section and search via `next/dynamic` from inside the 404 component, so they are fetched only when a 404 actually renders. Alternatively render the 404 product list with server markup, without `CardMain`.

**Metric:** JS payload and parse on every `(main)` page.
- **Expected gain:** −38.1 KB raw / −14.6 KB gzip (analyzer).

**Blast radius:**
- The 404 page only (visuals and suggested products).
- Risk: the 404 page renders the product section slightly later.

**Test checklist**
- [ ] Visit `/does-not-exist`: the 404 page shows its animation, search and featured products.
- [ ] Re-run `next analyze`: route `/` no longer includes the 404 chunk.
- [ ] HTTP status for unknown URLs is still 404 (SEO).

**Rollback:** revert the commit.

**Size:** S

---

## PR 11 (new, Phase 3 data): inline the critical CSS (P10)

**Files / lines**
- `next.config.mjs:68-75` (`experimental`): add `inlineCss: true`.
  - Documented in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/inlineCss.md`, which recommends it for Tailwind and first-visit performance.
  - This replaces the render-blocking `<link>` to `2t_3g0b4az1nl.css` (42 KB gzip) with an inline `<style>`.
- **Optional companion:** move the four Swiper CSS imports out of `globals.css:2-5` into the Swiper wrappers, so pages without carousels don't carry them (saves 2.7 KB gzip).

**Why it is promoted:**
- In the throttled trace, FCP = LCP = 3.2–3.4 s. The hero image was ready at 1.73 s, but the CSS took until 2.89 s; it is the last critical-path request.
- Inlining removes that request. The CSS then arrives with the HTML: 62 KB → ~105 KB zstd, still one request.

**Metric:** FCP and LCP (first visit).
- **Expected gain:** −0.5 to −1.2 s throttled LCP. That is bounded by the CSS arrival (2.89 s) minus HTML parse completion.
- Lab LCP improves more, because Lantern removes the CSS node from the chain. UNVERIFIED until built.

**Trade-offs** (from the doc):
- No separate CSS caching for returning visitors.
- CSS is duplicated in the RSC payload on first load.
- Client navigations to prerendered pages still use `<link>`.
- The flag is experimental.

**Blast radius:**
- Every page.
- Risk: HTML grows ~43 KB compressed, so TTFB rises slightly; the experimental flag could change between Next minors; any CSS-ordering bugs would show as styling differences.

**Test checklist**
- [ ] Visual diff of home, product, shop, checkout and dashboard (styling identical).
- [ ] View source: `<style>` present, no stylesheet `<link>` on first load.
- [ ] Throttled trace: FCP/LCP before vs after; PSI 3× before vs after.
- [ ] Client-side navigation between pages keeps styles (no FOUC).

**Rollback:** remove the flag and redeploy.

**Size:** S (config) + M (QA)

**Status (Phase 4): implemented, NOT measured.**
- **Implemented:** worktree `D:\tekzo-pr11`, branch `perf/pr11-inline-css` (from `main` `e86c110`, without PR 1). The only change is `next.config.mjs`: `experimental.inlineCss: true` plus a comment.
- **Not measured:** the comparison builds were blocked.
  - The shared fetch cache was lost with the old worktrees.
  - The LAN backend `192.168.68.63:8000` is unreachable (connection refused/timeout on `/settings`, `/sliders`, `/categories`).
  - Cold builds against the production API are not allowed.
  - So no HTML-size, FOUC or Lighthouse data exists for PR 11 yet.
- **Confirmed for Next 16.4.6** (docs + `config-schema.js`): the option is still `experimental` (boolean, default `false`).
  - Caveats from the docs: global only (no per-page control); styles are **duplicated in the RSC payload** on first load; CSS is not cached separately across hard loads; client navigations to prerendered pages use `<link>`; production builds only.
  - **Our specific risk:** the stylesheet is 296 KB raw. Inlined twice, the homepage HTML could go from ~700 KB raw to ~1.3 MB, i.e. +43 to +86 KB compressed depending on how well zstd/brotli dedupe it. HTML parse is already ~1.9 s CPU (PSI), so TBT could rise even if LCP improves. Every hard page view pays this, because Cloudflare does not cache HTML.

---

## PR 12 (candidate, Phase 4): shrink the global CSS

**Investigation (read-only; Tailwind's own `@tailwindcss/oxide` scanner and `@tailwindcss/node` compiler 4.1.18, run against the repo):**

**Setup**
- `src/app/globals.css:1-6`: `@import "tailwindcss"`, four Swiper CSS imports and `./styles/theme.css` (`@theme` + `@custom-variant dark`).
- **No `@source`, no `@config`, no `@plugin`.** v4 auto-detects sources from the project root: **559 files** (394 `.jsx`, 41 `.js`, 71 public `.svg`, 25 `.md` incl. `docs/`, 14 `.json` incl. 7 Lottie files, 8 `.css`, configs).
- `node_modules` is **not** scanned, and nor are the `.bak` files.

**`tailwind.config.js` is really ignored** (no `@config`):
- Its `important: true` is not applied.
- Its `content` globs are unused.
- Its `@tailwindcss/typography` plugin is **not loaded**, so the 8 components using `prose` classes render unstyled today. That is a pre-existing visual bug and out of scope here.
- Its `fontFamily` extensions are duplicated in `theme.css`.

**Breakdown of the production stylesheet** (`2t_3g0b4az1nl.css`, 295.7 KB raw / 41.6 KB gz):

| Part | Raw | Gzip | Share |
|---|---|---|---|
| Tailwind utilities, plain + hover/state | 160.7 KB | ~19.3 KB | 54 % |
| Tailwind utilities inside responsive `@media`/`@container` | 79.4 KB | ~10.6 KB | 27 % |
| Tailwind `dark:` variants (dashboard theme) | 6.3 KB | ~0.9 KB | 2 % |
| Swiper CSS (core + pagination + navigation + free-mode) | 15.5 KB | ~2.7 KB | 5 % |
| `@theme` variables | 12.2 KB | ~4.3 KB | 4 % |
| Custom rules (`globals.css`, `theme.css`) | 9.6 KB | ~2.5 KB | 3 % |
| Preflight, `@property`, keyframes | 11 KB | ~2.6 KB | 4 % |

**Attribution by source** (recompiled per source set; the production number is ≈ 291.6 KB raw / 39.3 KB gz in this local compile):

| Source set | CSS | Saving |
|---|---|---|
| Current (all 559 files) | 291.6 KB / 39.3 KB gz | — |
| Code only (no docs, public SVG/JSON, Lottie, config) | 290.3 / 39.1 | **−1.3 KB raw / −0.2 KB gz** (59 stray candidates, e.g. from Lottie JSON and these audit docs) |
| Storefront code only (dashboard excluded) | 235.4 / 33.9 | **−55 KB raw / −5.1 KB gz** (≈ 400 dashboard-only utilities, mostly emerald/sky `dark:`/hover variants) |

**Verdict:** the stylesheet is big because one global Tailwind entry carries every utility the whole app uses. It is **not** caused by scanning `node_modules` or the docs. Splitting per route isn't practical with a single global entry.

**Proposed change (needs approval; touches more than one file)**
1. **12a: dashboard split.**
   - In `globals.css`, add `@source not "./dashboard";` and `@source not "../Components/Dashboard";`.
   - **Keep** the one dashboard file imported by a public page in scope: `app/(main)/checkout/AuthorizeUserAddress.jsx` imports from the dashboard folder, so add an explicit `@source` for that imported component.
   - Give `app/dashboard/layout.jsx` (which already imports `theme.css` and `dashboard.css`) its own Tailwind entry: `@import "tailwindcss" source(none);` with `@source` for the dashboard folders **and** the shared components it renders.
   - **Saving:** −55 KB raw / **−5.1 KB gz (−13 %)** on every public page.
   - **Risk: Med.** Any dashboard class also used by a storefront component, or vice versa, must stay covered, or styles disappear. Needs a visual diff of the dashboard **and** checkout. Dashboard pages load two Tailwind outputs, with some duplication, which is fine for logged-in users.
2. **12b: source hygiene.** Add `@source not` for `docs/`, `public/`, `src/assets/lottie/` (or `@import "tailwindcss" source("../")` scoped to `src`).
   - **Saving:** −1.3 KB raw / −0.2 KB gz.
   - **Risk:** Low.
   - Mostly prevents future accidents, such as audit docs adding classes.
3. **12c: Swiper CSS.** `free-mode` is used by 2 components only. The `navigation` CSS is imported globally, while `navigation={true}` appears once.
   - Import those module CSS files only where used: −1 to −3 KB raw.
   - **Risk:** Low–Med (carousel arrows/bullets styling).

**Expected total:** about −57 to −60 KB raw / **−5.5 KB gz (≈ −13–14 %)**.
- At 1.6 Mbps that is ~30 ms less transfer for the render-blocking CSS.
- **It does not remove the render-blocking request**, so it is a hygiene/size PR, not an LCP fix.

**Rollback:** revert. **Size:** M (12a), S (12b, 12c).

---

## Realistic targets (re-based on Phase 3 measurements)

**Measured baseline** (Lighthouse 13.6 CLI on this machine, average of 3): Perf 46, LCP 8.06 s, TBT 1,634 ms.
- PSI reported 49 / 7.3 s / 1,160 ms.
- Field: LCP 2.4 s, INP 460 ms, CLS 0.07.
- Throttled real-trace: LCP 3.2–3.4 s, worst tap 432–640 ms.

**Measured levers:**
- `gtm.js` blocked: TBT −1,238 ms (−76 %), Perf +18, worst tap → 240 ms, LCP ±0.
- Bornomala blocked: real LCP −0.45 s; simulated LCP ≈ −1 s (noisy); TBT ±0.

| Metric (lab = this machine's Lighthouse) | Now | After PRs 1–8, 10, 11 (no third-party change) | Plus Marketing (PR 9) |
|---|---|---|---|
| Lab LCP | 8.1 s (PSI 7.3) | **~5–6 s**: PR 1 ≈ −1 s, PR 11 removes the CSS request from the chain, PR 8 shrinks first layout | same (GTM does not affect LCP) |
| Lab TBT | 1,634 ms (PSI 1,160) | **~1,350–1,450 ms (PSI ~950–1,050)**: dev PRs can only cut into the ~400 ms first-party share | **~250–350 ms**: the measured no-GTM floor is 396 ms, minus the dev PRs' first-party savings |
| Lab Perf | 46 (PSI 49) | **~52–58** | **~72–80** |
| Throttled worst tap (≈ INP) | 432–640 ms | ~400–600 ms (third-party bound) | **~160–200 ms** with PR 5 + PR 8 lowering the ~240 ms first-party floor |
| Field INP p75 | 460 ms | **~420–460 ms**: barely moves | **≤200 ms reachable** |
| Field LCP | 2.4 s | ~1.9–2.1 s | same |
| CLS | 0.005–0.07 | unchanged (PR 2 keeps ratios; PR 8 must reserve heights) | — |

**Honest summary:**
- The dev PRs mainly fix **LCP and payload**.
- **TBT, INP and the Perf score are dominated by GTM's tags.** Measured: −76 % TBT with `gtm.js` blocked; TikTok alone adds 75–308 ms to every tap.
- Passing INP and a Perf score of ~70+ are **only reachable with Marketing** changing the tag firing rules and moving the Meta/TikTok pixels server-side (PR 9).
- Phase 2 estimated "~650–850 ms TBT without marketing". The measurements show that was **too optimistic** and it has been corrected above.
