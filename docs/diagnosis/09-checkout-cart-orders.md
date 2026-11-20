# Module: Cart, Checkout & Orders (public)
**Path:** `src/app/(main)/checkout/*`, `src/Components/ReuseableComponent/CartModal.jsx`, `src/app/(main)/order/*`, `src/app/(main)/order-tracking`, `src/Components/OrderSuccess/*`, `src/Components/OrderTracking/*`, `src/Components/Tracker/*`, `src/app/api/client-fetch/route.js`, `src/utils/clientFetchAPI.js`

## 1. Critical Bugs & Security Risks
- **Guest coupons always fail (CONFIRMED).** `checkout/page.jsx:367` and `:581` call `clientFetchAPI("/customer/gust-check-coupon", …)`. That endpoint is **not** in the BFF's `GUEST_ENDPOINTS` allow-list (`api/client-fetch/route.js:7-12`). With no `auth_token`, the BFF returns `401 Unauthorized` before reaching the backend, so guests can never apply a coupon. Fix by adding the endpoint to the allow-list, ideally through a typed endpoint registry (see §5).
- **The BFF is an open pass-through (CONFIRMED).** `api/client-fetch/route.js:41-55` accepts an arbitrary `endpoint` and `method` from the browser and forwards them with the user's bearer token. Its "guest" check only covers the unauthenticated case: **authenticated users can call any backend path with any verb** through the frontend server. That bypasses any IP-based rate limiting or WAF the API applies to browsers. Path traversal (`/../admin/...`) is normalized by `fetch` onto the API host.
  - There is no `Origin` check.
  - `response.json()` is unguarded (lines 37 and 57), so any non-JSON backend response (HTML error page, 204, Cloudflare 522 page) throws and returns an opaque **500**.
- **Open redirect from the payment response.** `checkout/page.jsx:846` does `window.location.href = response?.url` for online or bKash payments. If the backend or gateway response is ever tampered with or misconfigured, users are sent anywhere. Validate the URL against an allow-list of gateway hosts (SSLCommerz, bKash).
- **Direct browser→API calls inside checkout:** `checkout/page.jsx:251` (`/districts`), `:266` (`/areas/:district`) and `:491` (`/pre-owneds/:slug/products`). These are cross-origin, so CORS/WAF failures break address selection, which blocks checkout entirely for guests.
- **Price display trusts `localStorage`.** `checkout/page.jsx:57-75` guesses a unit price from nine possible fields, and `:858` computes the subtotal from `item.variant?.final_price`. The **payload sent to the server contains no prices** (`buildCheckoutPayload`, lines 747-795), which is correct, so the server recomputes. But the UI total can disagree with what the customer is actually charged. Show server-computed totals (a quote endpoint) before submit.
- **Checkout layout leaks data into globals.** `checkout/layout.jsx:60-70` injects `window.__COMPANY_SETTING__` and `window.__CHECKOUT_BANNER__` via unescaped `JSON.stringify` in inline scripts. That is an XSS risk (see `08` §1) and an anti-pattern: pass props or context instead. The settings object currently contains only public company info (verified).
- **Guest PII in `localStorage`:** coupons (`guestCouponCode`, `guestCouponDiscount`) and the cart are stored there. Discount amounts stored client-side are display-only, but they are tamperable and confusing.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `checkout/page.jsx` is a **1,376-line `"use client"` page**. The page file should be a Server Component that loads settings, districts, the authenticated user, addresses and the server cart, then renders client islands (address form, payment selector, OTP widget, coupon box).
  - It imports `getSettings` from `lib/api` into client code (line 13), which runs a server fetcher in the browser.
  - `AuthorizeUserAddress.jsx` (240) is client-only address management that should use the dashboard address services.
- **State Management:** 37 `useState` hooks and 9 `useEffect` hooks in one component (form, OTP, countdown, coupon, districts, areas, cart, payment). Cart → Redux `cart` slice/RTK Query. Form → a form library (react-hook-form + Zod resolver). OTP → a `useOtp` hook. The selected district and area could live in the URL for shareable quotes, but they are fine as form state.
- **File Size (over 100 lines):** `checkout/page.jsx` (1376), `OrderTracking/OrderTracking.jsx` (586), `CartModal.jsx` (538), `checkout/AuthorizeUserAddress.jsx` (240), `OrderSuccess/OrderSuccessClient.jsx` (155).
  - **Checkout split:** `CheckoutPage` (server) → `CheckoutForm` (client shell) → `ContactSection`, `AddressSection` (`GuestAddress` | `SavedAddressPicker`), `OtpVerification`, `CouponBox`, `PaymentMethodSelector`, `OrderSummary`, plus services `checkout.service.ts` (payload builder, submit) and `cart.mapper.ts` (lines 20-135 normalization).
  - **`OrderTracking` (586):** split into `TrackingForm`, `TrackingTimeline` and `TrackingOrderCard`.
  - **`CartModal` (538):** split into `VariantPicker`, `ColorPicker`, `QuantityStepper`, `AddToCartAction` and a `useAddToCart` hook shared with ProductDetails.
- **TypeScript:** the checkout payload, cart item (guest and server shapes), address, district, area and coupon response are all untyped. This is the highest-value place for Zod: validate the form and the outgoing payload before submit.

## 3. Duplication & Technical Debt
- **Cart normalization in at least four places:** `checkout/page.jsx:20-135`, `CartModal.jsx:214-253`, `dashboard/(orders)/my-bag/page.jsx` (533) and `CounterContext.refreshCart`. Use one `cartMapper` and one RTK Query `cart` API.
- **Add-to-cart logic** is duplicated in `CartModal`, `ProductDetails`, `StickyBottomBar` and the used-device `ProductDetails`.
- `order/canceled/page.jsx` and `order/failed/page.jsx` are 51 lines each and identical in shape. Use one `OrderResultPage status=…`.
- `OrderSuccessClient.jsx:11` and `dashboard/all-orders/page.jsx:220` both build PDF invoice URLs from `NEXT_PUBLIC_API_URL` client-side. Use one invoice-download BFF route (it also keeps the token server-side).
- `clientFetchAPI.js` has duplicated FormData and JSON branches with identical error handling. Collapse them, or replace with a shared Axios instance with interceptors (the master rule says Axios BFF, and `axios` is in `package.json` but **never imported**).

## 4. Data Fetching & Performance
- **Rendering:** fully CSR. The checkout HTML is an empty shell until JS loads and 3-6 client requests complete (districts, cart, profile, addresses, settings, coupons). That is poor on slow mobile networks and makes conversion fragile.
- No caching for `/districts` (static data, refetched every visit). Fetch it server-side with `revalidate: 86400`.
- `CartModal` refetches the full product (`/product/:slug`, which is heavy) every time it opens, although the card already has the slug and the product page has the data cached server-side.
- `Tracker/*` components should fire purchase events once per invoice. Guard against duplicate `PurchaseTracker` fires on refresh by keying on `invoice_number`, for analytics accuracy.

## 5. Actionable Refactor Checklist
- [ ] 1. **Hotfix:** add `/customer/gust-check-coupon` to the guest allow-list (and audit every `clientFetchAPI` call site against the allow-list).
- [ ] 2. Replace the generic `api/client-fetch` pass-through with **explicit BFF routes**, or one route with a typed registry `{ name → { method, path, guestAllowed, schema } }`. Reject unknown endpoints and methods. Add an `Origin` check. Handle non-JSON upstream responses gracefully.
- [ ] 3. Introduce a shared Axios instance (`lib/http/client.ts` for the browser → BFF, and `lib/http/server.ts` for the server → API) with interceptors for auth, errors and 401 handling. Remove `clientFetchAPI` and all direct `NEXT_PUBLIC_API_URL` usage in client code.
- [ ] 4. Validate the payment redirect `response.url` against an allow-list of gateway origins before `window.location.href`.
- [ ] 5. Make `checkout/page.jsx` a Server Component. Preload settings, districts, user, addresses and the server cart, then split the client form into sections of ≤100 lines.
- [ ] 6. Use react-hook-form + Zod for the checkout form. Validate the outgoing payload with the same schema.
- [ ] 7. Add a server "quote" step (or use the backend's) so displayed totals equal charged totals. Remove the nine-way unit-price guessing.
- [ ] 8. Remove the `window.__COMPANY_SETTING__`/`__CHECKOUT_BANNER__` inline scripts and pass props instead.
- [ ] 9. Consolidate cart mapping and add-to-cart into `cart.mapper` plus `useAddToCart` plus RTK Query.
- [ ] 10. Merge `order/canceled` and `order/failed` into one component. Create one invoice-download BFF route.
- [ ] 11. Split `OrderTracking.jsx` and `CartModal.jsx` into components of ≤100 lines.
