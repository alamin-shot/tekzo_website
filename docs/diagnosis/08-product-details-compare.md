# Module: Product Details, Compare & Product SEO/Tracking
**Path:** `src/app/(main)/product/[productDetails]/*`, `src/app/(main)/product-specs`, `src/app/(main)/compare`, `src/Components/ReuseableComponent/ProductDetails/**`, `src/Components/Compare/*`, `src/Components/Comparison/*`, `src/Components/SEO/*`, `src/Components/Tracker/*`

## 1. Critical Bugs & Security Risks
- **Unsanitized HTML injection (CONFIRMED).** `ProductDetails/DynamicPills.jsx:182-183` (and the copy in `UsedDevice/.../DynamicPills.jsx:109-110`) render `productDetails?.short_description` via `dangerouslySetInnerHTML` **without `formatHtml`/DOMPurify**. All other HTML fields go through `formatHtml`. CMS-authored HTML can carry `<img onerror>` or `<script>`-equivalent payloads, so this is an XSS sink if the admin panel or a CMS account is ever compromised.
- **JSON-LD injection (CONFIRMED).** `SEO/ProductJsonLd.jsx:49`, `SEO/CompanyJsonLd.jsx:75`, `flash-sale/page.jsx:127` and `checkout/layout.jsx:62,69` all do `dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}` inside `<script>`. `JSON.stringify` does **not** escape `</script>` or `<!--`. A product name or description containing `</script><script>…` breaks out of the tag and executes. Escape `<` as `<` (or use a safe serializer).
- **Compare page passes raw image URLs to `next/image` (CONFIRMED).** `ProductComparisonHero.jsx:361` passes `product.product_image` straight through. Its search results come from `/search-products`, which returns S3 URLs (see `02`), so images break. Line 204 falls back only on falsy values, not on bad hosts.
- **Compare page calls the API directly from the browser:** `ProductComparisonHero.jsx:74` (`/product/${slug}`) and `:134` (`/search-products`). That is the same CORS/WAF exposure as the main search, so compare breaks whenever search breaks.
- **`ProductDetails.jsx` (937 lines, client)** writes the guest cart to `localStorage` (shape not validated; see `03`). It also uses `isomorphic-dompurify` client-side, which pulls DOMPurify and the `isomorphic` shim into the product page bundle.
- **`.bak` files are committed:** `ProductDetails/ProductDetails.jsx.bak` (1048 lines) and `UsedDevice/.../ProductDetails.jsx.bak` (521). They are dead and confusing, and they show up in greps and audits.
- **`SEO/MetadataDebugger.jsx` (262 lines)** is unused. Make sure it is never shipped to production pages.
- **`ViewersCount.jsx`** is unused. If it ever displayed fabricated "N people viewing" counts, keep it deleted (consumer-protection risk).

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `ProductDetails.jsx` is one 937-line `"use client"` component that renders the **entire** page (gallery, pricing, pills, specs, reviews, shipping, warranty, Tekzo Care, EMI, share, related). Only the variant selector, quantity, add-to-cart, EMI modal, gallery zoom and review form need interactivity. Specs, description, warranty, shipping, breadcrumbs, key features and related products should be Server Components passed as children or slots.
  - `OrderReassurance.jsx` imports `getSettings` from `lib/api` inside a client tree. It should receive settings as props.
  - `ProductReview.jsx` (used device) imports `getProductReviews` from `lib/api` (a server fetcher) into a client component, so it runs in the browser via `fetchPublicAPI` (cross-origin).
  - `Compare/CompareResult.jsx` (314) and `Comparison/ProductComparisonHero.jsx` (391) are client pages doing their own data fetching.
- **State Management:** variant, color and quantity selection lives in `ProductDetails`' 15 `useState` hooks. Selected variant and color should be URL params (`?variant=…`) so they are shareable, SEO-indexable and survive refresh. Compare products are in `CompareContext` + `localStorage`, and should be a Redux `compare` slice (see `03`).
- **File Size (over 100 lines):** `ProductDetails.jsx` (937), `StickyBottomBar.jsx` (515), `Comparison/ProductComparisonHero.jsx` (391), `ProductReview.jsx` (360), `EMI/EmiModalContent.jsx` (359), `Compare/CompareResult.jsx` (314), `SEO/MetadataDebugger.jsx` (262), `DynamicPills.jsx` (200), `PhotoGallarySkeletonLoader.jsx` (199), `TekzoCare/TekzoCareCard.jsx` (175), `product/[productDetails]/page.jsx` (172), `ShareDetails.jsx` (164), `PricingSelector.jsx` (161), `TekzoCare/TekzoCarePopup.jsx` (152), `ShippingDetails.jsx` (121), `Coupon.jsx` (120), `EMI/EMI.jsx` (115), `ProductSpecs.jsx` (107), and `product/[productDetails]/loading.jsx` (239).
  - **`ProductDetails` split:** a `ProductGallery` (client), `ProductInfo` (server), `VariantPicker` (client, URL-driven), `AddToCartPanel` (client), `ProductTabs` (server content plus a tiny client tab switcher), and `RelatedProducts` (server).
  - **`StickyBottomBar` (515):** this should reuse `AddToCartPanel` logic via a shared `useAddToCart` hook instead of duplicating it.
- **TypeScript:** the product payload is the most complex object in the app (variants, colors, gifts, care plans, EMI banks, reviews) and is completely untyped. Add Zod `ProductSchema`, `VariantSchema`, `EmiBankSchema` and `ReviewSchema` urgently.

## 3. Duplication & Technical Debt
- **The whole ProductDetails tree is duplicated for used devices:** `UsedDevice/UsedDeviceProductDetails/ProductDetails/*` mirrors `ReuseableComponent/ProductDetails/*` (DynamicPills, PricingSelector, ProductBreadcrumbs, ProductDescription, ProductDetails, ProductReview, ProductSpecs, RelatedProducts, ShareDetails, ShippingDetails, TekzoCareCard, TekzoCarePopup, WarrantyInfo). That is about 2,500 duplicated lines. Consolidate into one tree with a `condition="new" | "preowned"` prop and small variant-specific slots.
- `ProductBenefits.jsx` vs `ProductBenefitsFooter.jsx`; `ProductRatingReviewsCards.jsx` vs `ProductReview.jsx`; `ShippingDetails.jsx` vs `ShippingDetailsUsed.jsx` vs `ShippingDetailsUsedMobile.jsx`.
- Compare search duplicates the main `SearchBar` (see `02` §3).
- `product/[productDetails]/loading.jsx` (239) and `PhotoGallarySkeletonLoader.jsx` (199) duplicate skeleton markup.
- `app/(main)/product-specs/page.jsx` (12 lines): verify it is reachable. It looks like a stub.

## 4. Data Fetching & Performance
- **Rendering:** ISR with `revalidate = 3600` and `generateStaticParams() → []` (on-demand ISR per slug) plus tag-based revalidation (`product-${slug}`). This is a good pattern. `generateMetadata` and the page both call `getProduct(slug)`, which is deduped by React `cache()`. Good.
- **Client fetches inside product pages:** reviews (used device), EMI banks (`EmiModalContent.jsx:29`, direct `NEXT_PUBLIC_API_URL`), settings (`OrderReassurance`), and the CartModal product refetch (`CartModal.jsx:67`). All are cross-origin and uncached.
- **Bundle:** the product page ships the 937-line component, the 515-line sticky bar, DOMPurify, framer-motion (modals), Swiper (gallery and related) and Lottie (`gift.json`, 121 KB, if used by `GiftPopup`). Splitting to server components would cut most of the JS.
- **Images:** gallery images are fine. Badge and Tekzo Care images use oversized intrinsic dimensions (see `04`).
- **Trackers** (`ProductViewTracker`, `CheckoutTracker`, `PurchaseTracker`) push to `dataLayer` client-side. Fine, but make sure they fire once (no duplicate events under React StrictMode or re-renders).

## 5. Actionable Refactor Checklist
- [ ] 1. **Security:** wrap `short_description` in `DynamicPills` (both copies) with `formatHtml()`. Add a lint rule (`react/no-danger` with an allow-list) so every `dangerouslySetInnerHTML` must use the sanitizer.
- [ ] 2. **Security:** create a `safeJsonLd(obj)` helper that escapes `<`, `>`, `&`, U+2028 and U+2029, and use it in all JSON-LD and inline `window.__X__ =` scripts.
- [ ] 3. Delete the `.bak` files, `MetadataDebugger.jsx` and `ViewersCount.jsx`.
- [ ] 4. Split `ProductDetails.jsx` into server and client parts per §2, each ≤100 lines. Move variant and color selection to URL params.
- [ ] 5. Merge the used-device ProductDetails tree into the main tree with variant slots.
- [ ] 6. Route EMI banks, reviews and product refetches through cached server fetchers (props) or BFF GET routes. Remove direct `NEXT_PUBLIC_API_URL` calls from client components.
- [ ] 7. Make the compare page use the shared search hook and BFF (see `02`), and normalize image hosts.
- [ ] 8. Replace `CompareContext` with a Redux `compare` slice (see `03`).
- [ ] 9. Extract a `useAddToCart()` hook shared by `ProductDetails`, `StickyBottomBar` and `CartModal`.
- [ ] 10. Add Zod and TS types for Product, Variant, EMI and Review.
