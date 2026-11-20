# Module: UI / Reusable Components
**Path:** `src/Components/ReuseableComponent/*` (excluding `ProductDetails/`, covered in `08`; `SearchBar`/`SearchModalOverlay`, covered in `02`; `CartModal`, covered in `09`), `src/Components/Skeleton/*`, `src/Components/Loader/*`, `src/Components/Description/*`, `src/Components/ReuseableComponent/Swiper/*`, `src/Components/ReuseableComponent/Form/*`, `src/Components/ReuseableComponent/JobApplicationForm/*`

## 1. Critical Bugs & Security Risks
- **`BusinessForm.jsx` (817 lines)** imports `useState` on line 1 **without a `"use client"` directive**. It only works because every importer (`partners/*/page.jsx`) is itself `"use client"`. Importing it from a Server Component throws at build time. It is also a huge form with no schema validation. The library grep found no `zod`, `yup` or `react-hook-form`, so validation is hand-written per field (inferred from size).
- **`JobApplicationForm.jsx` (352 lines)**: CV/file upload goes through the BFF multipart path (`api/client-fetch`). There is no client-side file type or size validation visible at this layer, and the BFF forwards any `_endpoint` (see `13-api-utils-data.md`). Inferred: confirm the MIME and size checks.
- **`PageDescription.jsx`** renders CMS HTML via `dangerouslySetInnerHTML`. It is sanitized through `formatHtml` (DOMPurify), which is good, but `formatHtml` then **re-writes the sanitized HTML with regexes** (adds classes and target attributes). Regex post-processing after sanitization is fragile. Use DOMPurify hooks (`afterSanitizeAttributes`) instead.
- **`CardMain.jsx` (364 lines)** passes `image` straight to `next/image`. Any non-allow-listed host (for example the S3 bucket returned by `/search-products`) gives a broken image in production and a thrown error in dev. The warranty and badge `Image`s use `width={4000} height={3000}` for 80-100 px icons (lines 98-140), so the optimizer generates oversized variants: wasted CPU on the AVIF-encoding server that the comments in `next.config.mjs` already flag at 94-96% CPU.
- **`RouterStaleRecovery.jsx`** forces `window.location.href = href` 2 s after any `data-nav-recovery` link click, if the pathname has not changed. That breaks legitimately slow navigations (for example a slow `/search` or a cold ISR render) and **double-loads** them: soft navigation plus hard reload. It is also blind to same-path query-only navigations such as pagination (`?page=2`), which always "fail" its check and trigger a full reload after 2 s.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `PreFetchLink.jsx` is `"use client"` only to wrap `next/link` (already a client component) and add a data attribute. It can be a plain server-compatible component.
  - `HomeBanner.jsx` is `"use client"` for the entire hero, just to use Swiper. Keep the slide markup in a Server Component and isolate a tiny client `HeroCarousel` shell.
  - `CardMain.jsx` is a client component (image-loaded state, cart modal), rendered dozens of times per page. Split it into a server `ProductCard` (markup) plus a client `AddToCartButton` island.
  - Swiper wrappers (`SwiperSlider*.jsx`) are all client components that receive server-rendered children. That is acceptable, but there are 9 of them (see §3).
- **State Management:** `CardMain` owns cart-modal open state locally and lazy-mounts `CartModal`. A global `ui.cartModal` slice with one modal instance would avoid N modal trees on listing pages.
- **File Size (over 100 lines):** `BusinessForm.jsx` (817), `CartModal.jsx` (538), `CardMain.jsx` (364), `JobApplicationForm.jsx` (352), `Card.jsx` (189), `Loader.jsx` (129), `Card2.jsx` (115, dead), `Pagination.jsx` (106), `SearchBar.jsx` (234, see 02).
  - `BusinessForm.jsx`: split into a field config array, a `<FormField>` renderer, a Zod schema and a submit service.
  - `CardMain.jsx`: split into `ProductCardImage`, `ProductCardBadges`, `ProductCardPrice` and `AddToCartButton`.
  - `Loader.jsx`: a 129-line loader suggests inline SVG or animation markup. Move it to CSS.
- **TypeScript:** no prop types anywhere. `CardMain` takes about 15 loosely-named props (`currentPrice`, `originalPrice`, `discount`, `discountAmount`, `discountPercentage` …) that each caller maps by hand from the API product. Define a `ProductCardDTO` and pass a single typed `product` prop.

## 3. Duplication & Technical Debt
- **Cards:** `Card.jsx` (189, used in 7 places), `Card2.jsx` (115, **unused**), `CardMain.jsx` (364, used in 18 places), `PreOwnedCard.jsx` (146, **unused**), `PreOwnedCard2.jsx` (129, **unused**), plus `PreownedDevice/DeviceCard.jsx` (293) and two inline card implementations in `SearchModal/ModalContent.jsx`. Consolidate into one `ProductCard` with `variant` props (`"default" | "compact" | "preowned"`), and delete `Card2`, `PreOwnedCard` and `PreOwnedCard2`.
- **Swiper wrappers:** `SwiperSlider.jsx` (**unused**), `SwiperSlider2.jsx`, `SwiperSlider22.jsx`, `SwiperSlider3.jsx`, `SwiperSlider4.jsx`, `SwiperSlider44.jsx`, `SwiperSliderAll.jsx`, `UsedDeviceSlider.jsx`, `NewsSlider.jsx`, `HomeSlider.jsx`, plus `styles.css` and `styles22.css` (**unused**). They differ only in breakpoints, navigation and autoplay config. Replace them with one `<Carousel breakpoints={…} autoplay navigation>` component plus a config map.
- **Titles:** `Title.jsx`, `Title2.jsx`, `TitleHeading.jsx`, `SectionHeading.jsx`, `SectionTitle.jsx` (**unused**), `Text.jsx` (**unused**), `AboutUs/ReuseableComponent/AboutSectionHeading.jsx`. Make one `<Heading as level variant>`.
- **Buttons:** `Button.jsx`, `MyButton.jsx` (**unused**). Make one `<Button variant>`.
- **Description components:** `Components/Description/{Brands,Category,Offer,Shop,UsedPhone}PageDesc.jsx` are all **unused**, and `Description/PageDescription.jsx` (3 lines) duplicates `ReuseableComponent/PageDescription.jsx`. Delete the folder.
- **Pagination:** `ReuseableComponent/Pagination.jsx` (106) vs `Shop/Pagination.jsx` (122). Make one URL-driven `<Pagination>`.
- **Skeletons:** `Skeleton/BrandSkeleton.jsx` and `Skeleton/CategorySkeleton.jsx` are **unused**. `ProductDetails/PhotoGallarySkeletonLoader.jsx` (199) and the route `loading.jsx` files (201-239 lines) duplicate skeleton markup.
- `DropdownModal.jsx` is **unused**. `MyImageSquire.jsx` is misspelled.

## 4. Data Fetching & Performance
- These are presentational components and should not fetch. `Components/FeatureProductFor404Page/FeatureProductAPI.jsx` is an exception: a "component" that fetches, which should be a service.
- **Images:** oversized intrinsic `width`/`height` on badges (4000×3000) waste encode CPU. Use the real display size (about 120×120) or SVG. For the payment logos in `Footer/FooterPage.jsx:157` (`width={4000} height={3000}`), use `unoptimized` for SVGs.
- **Bundle:** `swiper` ships wherever any slider renders (most of the home page). `framer-motion` is used for simple fades in several places, and `react-icons` plus `lucide-react` are two icon libraries. Pick one icon set (lucide is tree-shakable per icon).
- **`HomeBanner` hero:** up to N videos with `autoPlay` and `preload="auto"` on the first slide. This is fine for desktop but heavy on mobile data. Gate it with `matchMedia('(prefers-reduced-data)')` or swap to a poster image on mobile.

## 5. Actionable Refactor Checklist
- [ ] 1. Delete the dead files: `Card2.jsx`, `PreOwnedCard.jsx`, `PreOwnedCard2.jsx`, `SwiperSlider.jsx`, `styles22.css`, `SectionTitle.jsx`, `Text.jsx`, `MyButton.jsx`, `DropdownModal.jsx`, `Components/Description/*`, `Skeleton/BrandSkeleton.jsx`, `Skeleton/CategorySkeleton.jsx`.
- [ ] 2. Build one `ProductCard` (server markup) plus an `AddToCartButton` (client island), driven by a typed `ProductCardDTO`. Migrate the `Card`, `CardMain` and `DeviceCard` call sites.
- [ ] 3. Build one `Carousel` client component with a breakpoint/config map, and migrate the nine Swiper wrappers.
- [ ] 4. Make one `Heading`, one `Button` and one `Pagination` (URL-driven) component.
- [ ] 5. Add `"use client"` to `BusinessForm.jsx`, or better, split it into a server form shell, a client field islands and a Zod schema with a Server Action submit.
- [ ] 6. Fix the badge image sizes (real dimensions or SVG `unoptimized`).
- [ ] 7. Rework `RouterStaleRecovery`: compare the full `pathname + search`, extend the timeout, and only hard-reload if the router reported an error (or remove it once the root cause of the stale router is fixed).
- [ ] 8. Replace the regex post-processing in `formatHtml` with DOMPurify hooks.
- [ ] 9. Make `PreFetchLink` a non-client component, or replace it with `next/link` directly.
- [ ] 10. Convert to TS, giving each component a typed props interface, and keep each file ≤100 lines.
