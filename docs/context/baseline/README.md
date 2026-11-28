# P0 parity baseline

Reference artifacts that every conversion batch is compared against. Commit `622a1f9`, captured 25 Nov 2026.

## Signed-in / test-account checklist (P7 + P8)

Run on a P0 build and the converted build side by side with the same test account (and a guest session where marked). Not covered by the automated runs, which have no session.

**Auth & login (P4/P8)**
- [ ] Login (email + password), OTP login/register, logout; `has_auth` / `auth_token` cookies set and cleared the same way
- [ ] `/login/reset-password`: send code, wrong code, resend timer, paste a 6-digit code, new password mismatch / < 8 chars, success

**Cart & checkout (P8)**
- [ ] Guest: add from PDP (cached item) and an old-format cart item (API fallback); quantity +/−, pre-owned stays at 1, delete; `localStorage.cart` contents identical after each step (bug #1 kept)
- [ ] Guest: OTP send / verify, district → area search, thana / postcode autofill, shipping charge, note
- [ ] Guest coupon apply / remove / re-validate after delete; reload keeps `guestCouponCode` / `guestCouponDiscount`
- [ ] Signed-in: saved-address tabs, Add New (AddAddressPopup), coupon apply/remove (server), quantity debounce PATCH, delete
- [ ] Booking-amount product: COD disabled, "Pay Booking Amount Only" preselected
- [ ] F1 guest: Add to Bag / CartModal Add To Cart without login, badge count, qty cap 10 (pre-owned 1); guest COD order → `/order/successful?invoice=…`; SSL COMMERZ / bKash return to `/order/successful` / `/order/failed?…&cancel` / `/order/canceled`; summary shows no PII; "Initiated" lag message
- [ ] Place order: COD → `/order/successful?invoice=…` (`purchase` push once, N9); SSL COMMERZ and bKash → gateway URL; double-click does not double-order
- [ ] Gateway return pages `/order/failed`, `/order/canceled`; invoice preview / download on the success page
- [ ] `begin_checkout` / `purchase` payloads (items, value, `purchase_point`) identical to P0

**Dashboard (P7)**
- [ ] Profile / edit profile (avatar upload, name / DOB / gender, OTP email & phone, password); sidebar / navbar / drawer update via `userProfileUpdated`
- [ ] Orders list, search, pager, Pay Now (partial + full) redirect, invoice download, order detail timeline (N23)
- [ ] Bag: select toggle, quantity debounce, remove, summary with gift / care; wishlist add-to-cart / remove
- [ ] Address book add / edit (PUT) / defaults; to-review → write review with photo → review history
- [ ] Elite status tabs, coupons claim, sell-device new / edit (photo upload, N22) and my listings (delete)
- [ ] Theme, points visibility and sidebar collapse toggles persist (`dash_*` keys)

## 1. Lint baseline: `lint-baseline.json` (in this folder)

- Totals: **93 errors and 12 warnings in 48 files**.
- Counts are per file and per rule, with repo-relative paths.
- Errors by rule:

| Rule | Errors |
|---|---|
| `react-hooks/set-state-in-effect` | 49 |
| `react/no-unescaped-entities` | 29 |
| `react-hooks/immutability` | 5 |
| `react-hooks/static-components` | 5 |
| `react-hooks/preserve-manual-memoization` | 2 |
| `react-hooks/rules-of-hooks` | 1 |
| `react/jsx-no-duplicate-props` | 1 |
| `@next/next/no-html-link-for-pages` | 1 |

**Batch gate (Q6):**
- For every file a batch converts, its rule counts may not exceed the baseline counts of the `.js`/`.jsx` file it replaces.
- A new file must have zero errors.

To regenerate:

```
npx eslint -f json . > lint.json
node D:/tekzo-baseline/tools/lintbase.cjs lint.json new.json
```

Then check it against the baseline:

```
node D:/tekzo-baseline/tools/lintdiff.cjs docs/context/baseline/lint-baseline.json new.json
```

It exits 1 if any file's error count for a rule rises above the baseline. A converted file (`foo.jsx` → `foo.tsx`) is compared against its old path.

## 2. Visual, HTML and dataLayer capture (outside the repo)

The PNGs total about 91 MB, so they are kept out of git, in `D:\tekzo-baseline\`:

| Path | Contents |
|---|---|
| `D:\tekzo-baseline\app\` | First copy of the repo at `622a1f9` (its build served the broken product page, see AUDIT_NOTES N1/N11) |
| `D:\tekzo-baseline\p0-app2\` | **Fresh build of the same `622a1f9` source.** Rebuild from here if the baseline ever has to be recaptured |
| `D:\tekzo-baseline\tools\capture.mjs` | Captures each route in `routes.json` at **412 px (mobile, touch)** and **1440 px**: full-page PNG, normalized SSR HTML, and the `dataLayer` pushes. Each page gets its own browser context, third-party requests are blocked, and it is read-only (no logins, submits or cart POSTs) |
| `D:\tekzo-baseline\tools\compare.mjs` | Diffs two runs: status, HTML hash (ignoring inline-`<script>` count and Server Action ids, which change with every build), `<title>` changes, dataLayer, and the percentage of pixels that differ, with diff PNGs |
| `D:\tekzo-baseline\tools\htmldiff.mjs` | Tag-level diff of one route's HTML between two runs, used to explain a `DIFF` |
| `D:\tekzo-baseline\tools\lintbase.cjs`, `lintdiff.cjs` | Lint summary and the baseline gate (§1) |
| `D:\tekzo-baseline\tools\routes.json` | 49 routes |
| `D:\tekzo-baseline\p0b\` | **The baseline from P1 on**: `manifest.json`, `png/` (98 shots), `html/`. Captured from `p0-app2` |
| `D:\tekzo-baseline\p0\`, `p0-rerun\` | First P0 capture and its noise rerun. **Superseded**: the product page there is the error fallback |
| `D:\tekzo-baseline\p1\` | P1 capture (see §4) |
| `D:\tekzo-baseline\tools\routes-parity.mjs` | Request-level diff of two servers for the proxy and route handlers (44 side-effect-free cases). Run it after any batch that touches `proxy.ts` or `app/api` |
| `D:\tekzo-baseline\p2-app\`, `p2\` | P2 build and capture. The capture is invalid (backend outage) |

**Routes (49):** every static `(main)` route and one real slug for each dynamic route:
- the product `galaxy-s26-ultra`, the category `iphone`, the brand `samsung`, the used device `iphone-12`, the blog post `why-tekzo-…`, the policy `care-policy`, the outlet `jamuna-future-park-branch-1`;
- `/search?query=iphone`, `/shop?page=2`;
- the redirects `/home`, `/brand/samsung` and `/dashboard`, plus a 404;
- `/checkout` empty, and `/checkout` with a seeded one-item guest cart.

**Noise (p0 vs. p0-rerun):**
- Normalized HTML, HTTP status and dataLayer were **identical on all 49 routes**.
- Pixel difference was ≤ 0.13 % on every route, except `/` on mobile at 1.03 % (hero carousel).

**Batch gate:**
- Status, HTML hash and dataLayer must be `same`.
- Pixel difference must be ≤ 0.2 %. Exception: `/` on mobile has autoplaying carousels (category and brand sliders, flash sale) in its top ~1,200 px, and the screenshot catches them at a random slide. It has measured 1.03 % (P0 rerun) and 3.07 % (P1) with identical HTML. It passes when the HTML is `same` and the diff PNG shows changes only inside those carousels.
- Anything else is explained with `htmldiff.mjs` and the diff PNG before the batch is accepted.
- **Known data noise** (AUDIT_NOTES N10/N11): it is accepted only when `htmldiff` shows nothing but these:
  - the random "N peoples are viewing" count on product pages;
  - the rotating related products and related blog posts;
  - Suspense boundaries still pending in the snapshot (`<!--$?-->`/`<template id="B:…">`);
  - fallback SEO or banner from a failed or rate-limited backend call. In that case, recapture that route.
- Expected structural HTML differences, for example from a server/client split adding a component boundary, are written down per batch before they are accepted.

**Running a batch check:**
1. Copy the tree to a folder under `D:\tekzo-baseline\` (excluding `node_modules`, `.next` and `.git`), run `npm ci`, then `next build`.
2. Start it on a **free** port. As of P1, ports 3000–3500 are all taken (3000 by you; 3100–3500 by `next start` processes left behind by earlier sessions, because stopping the shell task doesn't stop its child). Use 3600 or higher, or free those ports first.
3. Before capturing, confirm the port serves your build: `curl -s localhost:<port>/ | grep -c "$(cat <tree>/.next/BUILD_ID)"` should print 1.
4. Run `node capture.mjs http://localhost:<port> D:/tekzo-baseline/pN`.
5. Run `node compare.mjs D:/tekzo-baseline/p0b D:/tekzo-baseline/pN D:/tekzo-baseline/pN-diffs`.

**Local environment caveats** (details in [../AUDIT_NOTES.md](../AUDIT_NOTES.md) N3–N5, N11):
- placeholder GTM ID, so no tags fire;
- the LAN backend rate-limits during builds and bursts, and can leave fallback renders cached;
- `/popup-dialogs` is blocked by CORS.

## 3. dataLayer event inventory (static)

Every app-side push, with its payload keys. Conversion must keep the keys, value expressions, and the moment each push fires (synchronous, or after which `await`) **exactly**.

| Event | File:line | Fires when | Payload |
|---|---|---|---|
| `gtm_idle` | `GTM/GTM.jsx:38` | when GTM loads (load + 6 s + idle, or the 15 s fallback) | `{ event }` |
| `web_vitals` | `GTM/WebVitalsReporter.jsx:46` | `useReportWebVitals` for INP, LCP, FCP, CLS, TTFB | `metric_name`, `metric_value` (CLS ×1000, rounded), `metric_rating`, `metric_id`, `metric_navigation_type`, `page_path`, and for INP also `inp_target`, `inp_event`, `inp_input_delay`, `inp_processing`, `inp_presentation` |
| `view_item` | `Tracker/ProductViewTracker.jsx:18` | `useEffect([product])` on `/product/[productDetails]` and `/used-device/product/[slug]` | `ecommerce: { value, currency:"BDT", items:[{ item_id, item_name, item_brand, item_category, price, quantity:1 }] }`. The price comes from the first in-stock variant, otherwise `variants[0]`, using `regular_price` |
| `add_to_cart` | `ProductDetails/ProductDetails.jsx:415` | after `await POST /customer/carts` | `ecommerce: { currency, value, items:[{ item_id: productDetails.id, item_name, item_brand, item_category, item_variant: sku, quantity, price }] }`. Pre-book items use `booking_amount` for value and price |
| `add_to_cart` | `ReuseableComponent/CartModal.jsx:173-193` | logged in, after `await POST /customer/carts` | `ecommerce: { currency, value: regular_price, items:[{ item_id, item_name, item_brand, item_category, item_sku, item_variant (attribute_value with "," replaced by "/"), quantity, price }] }` |
| `add_to_wishlist` | `ProductDetails.jsx:476`, `ProductDetails/DynamicPills.jsx:75`, `ProductDetails/ShareDetails.jsx:63` | after `await POST /customer/wishlists` | `ecommerce: { currency, value: regular_price, items:[{ item_id: variant id, item_name, item_brand, item_category, quantity, price }] }`. `ShareDetails` reads the name, brand and category from `selectedVariant` |
| `begin_checkout` | `Tracker/CheckoutTracker.jsx:29` | `useEffect([cartItems])` when `cartItems` is not empty | `ecommerce: { currency, value: Σ final_price×qty, items:[{ item_id, item_name, item_brand, item_category, quantity, price: variant.final_price, item_variant, item_sku }] }` |
| `purchase` | `Tracker/PurchaseTracker.jsx:38` | `useEffect([order])`, once per window (`window.__purchase_fired`) | `ecommerce: { transaction_id, value, tax:0, shipping, currency, coupon, discount_amount, items:[{ item_name, item_brand, item_id, item_sku, price, imageUrl, item_variant, item_category, item_category2, discount, quantity, index }] }` (money values as 2-decimal strings), plus `user_data: { billing_first_name, billing_address, billing_country:"BD", billing_state, billing_city, billing_phone, new_customer }` |

**Observed at runtime in the baseline (`p0b`):**
- `view_item` on `/product/galaxy-s26-ultra`: `{"value":118500,"currency":"BDT","items":[{"item_id":799,"item_name":"Galaxy S26 Ultra","item_brand":"SAMSUNG","item_category":"Galaxy","price":118500,"quantity":1}]}`.
- `begin_checkout` on `/checkout` with the seeded cart: `{"currency":"BDT","value":114500,"items":[{"item_id":799,"item_name":"Galaxy S26 Ultra","quantity":1,"price":114500,"item_variant":"Cobalt Violet/12GB/256GB","item_sku":""}]}`.
- No app events on any other captured route.
- Both captured payloads type-check against `DataLayerEvent` in `src/types/tracking.ts` (P1).
- `add_to_cart`, `add_to_wishlist` and `purchase` need a logged-in session or an order, so they were **not run**. They are checked statically against the table above.

## 4. Batch results

| Batch | Build | Lint gate | Capture vs `p0b` |
|---|---|---|---|
| Step 2 (F1 + Batch A) | Clean relay builds (`s1-app` re-synced, `p0-app2` fresh), exit 0, 0 fetch errors, 0 rate-limited; relay now echoes the page origin for CORS (37xx ports are not on the backend allow-list) | **88** errors (baseline 93), 0 new; typecheck 0 | `tools/f1-flow.mjs` **23/23** (OTP and `gust-buy-now` intercepted in the browser — no order placed). vs P0 on 3701: requests 42/44 (bug #3: guest coupon / tracking 401 → 422, intended); `guestcart-parity.mjs` 10/10; P8 capture dataLayer 17/17; HTML differs by one script chunk (guest cart in the navbar store) and the guest bag link (`/login` → `/checkout`); pixels change only on checkout with a cart (+36 px login line) and failed / canceled without invoice (fallback links) |
| Step 1 (bug #1) | Clean `next build` of `s1-app` and `p0-app2` (`.next` removed first) through the relay: both exit 0, **0** fetch errors, 0 rate-limited, 0 502 | **88** errors (baseline 93), 0 new; typecheck 0 | Served P0 on **3701**, Step 1 on **3702** (each serving its own BUILD_ID). Differential test **123/123**. `tools/guestcart-parity.mjs` **10/10 byte-identical `localStorage.cart`** (scenario note: the used product page runs on in-stock `preOwnedId=225`; with 101 the main item is out of stock and the click lands on a randomly ordered related card, N10). Requests **44/44**. P8 route capture: dataLayer **17/17** (incl. `begin_checkout` ×2), HTML 16/17 (404: font-hash classes only). CartModal Buy Now unreachable on both builds (N25) |
| P8 | `next build` exit 0 (copy `D:\tekzo-baseline\p8-app`, through the relay, 0 rate-limited fetches); `npm run typecheck` exit 0 | **88** errors (baseline 93), 0 new | Served on **3702** vs fresh P0 on **3701**. **Requests:** 44/44 identical. **Dashboard guard:** 81/81 identical. **Pages:** 17 captures × 2 breakpoints: `/checkout` empty, with a seeded guest cart (cached item with gift + Tekzo Care), with an old-format cart item (API fallback) and with a saved guest coupon; `/login`, `/login/reset-password`, `/order/successful` (with and without `invoice_number`), `/order/failed`, `/order/canceled`, `/compare` (empty and with a stored product), `/order-tracking`, `/product-specs`, `/test`, the 404 page, `/`. **dataLayer 17/17 identical, including both `begin_checkout` payloads.** HTML 16/17 identical after normalization (the other is the late RSC chunk on `/`). Pixels ≤ 0.5 % except `/` mobile 1.6 % (carousels). Order placement, payment gateways and signed-in pages are not exercised: see the checklist below |
| P7 | `next build` exit 0 (copy `D:\tekzo-baseline\p7-app`, through the relay, 0 rate-limited fetches; all 25 `/dashboard` routes built); `npm run typecheck` exit 0 | **88** errors (baseline 93), 0 new | Served on **3702** vs fresh P0 on **3701**. **Requests:** 44/44 identical. **Dashboard guard** (`tools/dashboard-guard.mjs`): all 27 dashboard paths (25 routes, dynamic ids, one unknown path) × {no cookie, fake `auth_token`, `has_auth` only} = 81/81 identical status, `Location` and `Set-Cookie` (307 → `/login`, cookies cleared). **Pages:** `/login`, `/faq`, `/shop` × 2 breakpoints: dataLayer identical, HTML identical after normalization. **Signed-in dashboard pages were not rendered**: the proxy checks the token with the backend and no test account was used, so profile, orders, order detail, bag, wishlist, addresses, reviews, elite status, coupons and sell-request pages still need a manual pass with a real session (forms, Pay Now redirect, address add/edit, review upload, profile/password/OTP flows, theme/points/sidebar toggles) |
| P6 | `next build` exit 0 (copy `D:\tekzo-baseline\p6-app`, through the relay, 0 rate-limited fetches); `npm run typecheck` exit 0 | **89** errors (baseline 93), 0 new | Served on **3702** vs fresh P0 on **3701** (rebuilt through the relay the same hour). **Requests:** 44/44 identical. **Pages:** 18 routes × 2 breakpoints: 3 PDPs (`/product/{galaxy-s26-ultra,awei-ka66,awei-ka8}`), `/used-device` (+ `?page=2`, `?brand=apple`), `/used-device/iphone-12` (+ `?page=2`), `/used-device/product/iphone-12` (no id, `?preOwnedId=101`, `?preOwnedId=126`), `/marketplace` (+ `?page=2`), `/refurbished` (+ `?brand=apple`), `/sell-your-device`, `/`, `/shop`. **dataLayer 18/18 identical, including `view_item` on all 6 product pages.** HTML 12/18 identical after normalization; the other 6 are known: related products on the 4 product pages (both `/related/{slug}/products` and `/pre-owned-related/...` return a different set on every call, checked 3× against the relay), viewer count (N10), and the late RSC chunk on `/` and `/shop`. **No regression.** Manual still to do (needs a session): add to cart / buy now / compare / wishlist on a PDP, EMI modal, Tekzo Care + gift popups, sell-device post and edit (`/dashboard/sell-your-device/[id]`), photo upload |
| P5d | `next build` exit 0 (copy `D:\tekzo-baseline\p5d-app`, through the relay, 0 rate-limited fetches); `npm run typecheck` exit 0 | **90** errors (baseline 93), 0 new; no P5d file changed its baseline findings | Served on **3702** vs fresh P0 on **3701**. **Requests:** 44/44 identical. **Pages:** all 49 baseline routes plus `/partners/{b2b-register,retailer,franchise,become-a-dealer}`, `/policy/{privacy,warranty}-policy`, `/blog?page=2` (56 × 2 breakpoints). dataLayer 56/56 identical. HTML 47/56 identical after normalization; the other 9 are known: `/careers` 404 (N12), blog post related posts and product viewer count (N10), `/contact-us` Server Action id, the late RSC chunk on `/`, and streamed-metadata position on cold renders (N18) for `/refurbished`, `/shop/offer`, `/used-device/iphone-12` and the 404 page (same tags). Pixels ≤ 0.1 % except `/` mobile 3.1 % (carousels), product 1.5 % (viewer count), blog post 18 % (related posts) and `/blog?page=2` mobile 10.8 % with identical HTML (image load timing). **No regression. P5 complete.** Manual still to do: contact form submit, warranty-claim submit, partner forms validation/success popup, news modal, FAQ, how-to-claim language toggle |
| P5c-2 | `next build` exit 0 (copy `D:\tekzo-baseline\p5c2-app`, through the relay, 0 rate-limited fetches); `npm run typecheck` exit 0 | **90** errors (baseline 93), 0 new; the 37 files carry no baseline errors any more (`ShopProducts`' `preserve-manual-memoization` error went away because the `useMemo` dependency is now a plain local holding the same value) | Served on **3702**, captured against the fresh P0 (3701) at the same moment, 18 routes × 2 breakpoints: `/`, `/shop`, `/shop?page=2`, `/shop?brand=samsung&sort_by=price_asc`, `/shop/offer`, `/shop/offer/1111-offer`, `/categories`, `/categories?search=watch`, `/categories/iphone`, `/brands`, `/brands/samsung`, `/flash-sale`, `/flash-sale?sort_by=price_desc`, `/new-arrival`, `/new-arrival-products`, `/featured-products`, `/featured-products?search=a`, `/search?query=iphone`. dataLayer 18/18 identical; pixels ≤ 0.03 % (`/` 3.56 % mobile, carousel timing). HTML 11/18 identical after normalization; on 6 pages the same `<title>`/meta/canonical set came out later in the document on the cold first render (Next 16 streamed metadata, timing); a warm request puts `<title>` first on both servers. `/`: the late RSC chunk again. **No regression.** Manual still to do: filter dropdowns/comboboxes, brand chips and brand search, category search debounce, offer countdowns |
| Live run | **Live verification run, 26 Nov 2026 (backend back up).** Builds: fresh copies of the current tree (`D:\tekzo-baseline\p5-app`, P2–P5c-1) and of `622a1f9` (`p0-app2`, "fresh P0"), both built through `tools/relay.mjs`, a verification-only local relay (port 3799) that sends API calls one at a time and retries 429s. Without it the LAN API rate-limited 56–86 build-time fetches per build ("Too Many Attempts", N5), even with static generation throttled. Through the relay: **0** rate-limited fetches, `next build` exit 0 for both, Next's TypeScript step included. N12 confirmed: `/careers` builds and serves **404**. Servers: P5 on **3700**, fresh P0 on **3701** (3000/3001 untouched). **Request parity:** `routes-parity.mjs` 3701 vs 3700, **44/44 identical**. **Pages, 49 routes × 2 breakpoints:** dataLayer **49/49 identical**. HTML: after normalizing next/font class hashes (N17) with `tools/htmlnorm-compare.mjs`, **44/49 identical vs fresh P0**; the 5 others are `/careers` (intended 404, N12), the product viewer count and blog related posts (N10), the per-build Server Action id on `/contact-us`, and a late RSC chunk in the P0 snapshot of `/`. Pixels ≤ 0.04 % except `/` (3.88 % mobile: carousels, reel video frames, countdown), product (1.4 %, viewer count) and the blog post (rotating related posts). **vs `p0b` (25 Nov):** 14 routes differ, and fresh P0 vs `p0b` differs on the same 14 routes by the same amounts (CMS titles for FAQ/contact/compare/checkout/tekzo-care, the FAQ page grew, `/outlets/jamuna-future-park-branch-1` now 200, homepage content), so that is backend drift since 25 Nov, not code. **No regression found in P2–P5c-1.** Results: `D:\tekzo-baseline\p5-vs-p0c.txt`, `p5-vs-p0c-norm.txt`, `p5-vs-p0b.txt`, `p0c-vs-p0b.txt`, `p5-routes.txt`. | | |
| P5c-1 | Covered by the live run above. `npm run typecheck` exit 0 | 91 errors (baseline 93), 0 new; search files only carry their 2 baseline errors (SearchBar, useProductSearch) | **Queued.** P5c-1-specific: `/search?query=iphone` HTML-`same`; the search bar on every page `same`. Manual: typing in the modal (debounce, results, error message on a 101-char query), voice button, quick links / trending categories, closing on outside click, page videos pausing while open |
| P5b | **Pending** (same reason). `npm run typecheck` exit 0 | 91 errors (baseline 93), 0 new; the only errors in P5b files are the 4 the baseline records for them (FeatureProducts 1, FlashSaleCountdown 1, LiveProductModal 2) | **Queued with P2–P5a.** P5b-specific: `/` must be HTML-`same` (hero, categories/brands first slide, flash sale, features, new arrivals, FAQ, description) with the carousel-timing pixel allowance; `/featured-products` (+ `?search=`) `same`. Manual: carousels autoplay/pagination, brand/category idle mount, live reels modal (mobile + desktop, arrows/keys/mute), FAQ accordion, flash-sale countdown, news modal |
| P5a | **Pending** (same reason). `npm run typecheck` exit 0 | 91 errors (baseline 93), 0 new violations; P5a files have 0 messages | **Queued with P2–P4.** P5a-specific checks: product cards on `/`, `/shop`, `/categories/iphone`, `/brands/samsung`, `/flash-sale`, `/new-arrival-products`, `/featured-products`, `/search?query=iphone` and `/product/galaxy-s26-ultra` (related) must be HTML-`same` (watch for the N16 "0", which must still be there if it was); banners on every content route; breadcrumbs; pagination on `/shop?page=2`. Manual: Compare → `/compare`, Buy → CartModal, Stock Out disabled state |
| P4 | **Pending** (same reason). `npm run typecheck` exit 0 | 91 errors (baseline 93), 0 new violations; 120 `.ts`/`.tsx` files: the only errors are the 5 pre-existing `set-state-in-effect` ones the baseline records for these same files (NavAuthClient 1, SidebarFunction 2, NavbarAuthSection 1, WelcomePopup 1), plus the baseline GTM warning | **Queued with P2/P3** (same steps). P4-specific checks: every route's SSR HTML for the navbar/footer/JSON-LD must be `same`; the `begin_checkout` and `view_item` payloads must be byte-identical to `p0b`; `/careers*` now 404 (N12); hover menus, mobile sidebar, Login form errors and the welcome popup are client-only and need a manual check once the API is back (the popup only renders when `/popup-dialogs` is reachable without CORS) |
| P3 | **Pending** (API server down since 25 Nov; with it unreachable, even a fresh build hangs prerendering, see AUDIT_NOTES N12). `npm run typecheck` exit 0 | 93 → **91** errors (the 2 `set-state-in-effect` errors in the old context files are gone), 0 new violations; 69 `.ts`/`.tsx` files, 0 messages | **Queued, run when `192.168.68.63:8000` answers:** (1) fresh copy, `npm ci`, `next build` (also confirms the N12 careers fix); (2) `next start` on port 3700; (3) `capture.mjs` → `D:/tekzo-baseline/p3`, then `compare.mjs` against `p0b` (this covers P2 and P3 together; expect `/careers*` to be 404 now because of N12); (4) `routes-parity.mjs` against a fresh `p0b` server; (5) by hand: compare add → `/compare`, dashboard theme/sidebar/points toggles, and the cart badge after a `cart:added` event |
| P2 | `next build` passed (Next's TypeScript step included) in `D:\tekzo-baseline\p2-app`, with the three careers pages restored to `HEAD` **in that copy only** (AUDIT_NOTES N12); `npm run typecheck` exit 0 | 93 → 93 errors, 0 new violations; 61 `.ts` files, 0 messages | **Request level:** `routes-parity.mjs`, 44/44 identical vs `p0b` (15 legacy 301s, dashboard/login guards, `has_auth` sync, robots, llms.txt, 5 sitemaps incl. 1,770-entry product sitemap, `/api/search`, `client-fetch` guest 401s (bug #3), revalidate 401/400, logout). **Server Actions:** same 8 actions, identical page sets (bug #4 kept, now `lib/http/fetchAPI.ts`). **Page capture: NOT VALID YET.** The LAN backend went down during the run (every API call fails: HTTP 000), so P2 rendered fallbacks while the long-running `p0b` server served pages it had cached earlier. **Rerun `capture.mjs` against P2 once the backend is reachable** (restart the P2 server first, so it doesn't serve cached fallbacks) |
| P1 | `next build` passed (includes Next's TypeScript step); `npm run typecheck` exit 0 | 93 → 93 errors, 0 new violations; 10 new `.ts` files, 0 messages | 45/49 routes identical in status, HTML and dataLayer. Pixels ≤ 0.08 %, except `/` on mobile at 3.07 % (carousel slide timing only, confirmed in the diff PNG). 4 explained as data noise: product (viewer count and related products), `used-device/iphone-12` (pending Suspense boundary), blog post (rotating related posts), tekzo-care (`p0b` got the fallback SEO from a failed backend call). No route changed because of code |
