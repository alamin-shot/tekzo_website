# Module: Home Page
**Path:** `src/app/(main)/page.jsx`, `src/app/(main)/HomePage.jsx`, `src/Components/Home/**`, `src/Components/ReuseableComponent/HomeBanner.jsx`, `src/Components/HomePageNews/*`, `src/Components/HomePageDescription/*`, `src/Components/news/NewsHomePage.jsx`

## 1. Critical Bugs & Security Risks
- **iOS Chrome tab kills (memory).** Recent history shows the team fighting this: `d5b841b` paused videos behind the search modal, and `7f0b863` limited flash-sale products "to prevent memory issues". The home page stacks several memory-heavy pieces:
  - autoplaying hero videos (`HomeBanner.jsx:30-39`, first slide `preload="auto"`);
  - about 9 Swiper instances (categories, flash sale, brands, features ×2, new arrival, used devices, news);
  - a 638-line `LiveProductModal` with a reels/video player;
  - hundreds of `next/image` nodes, many with 4000×3000 intrinsic sizes;
  - Lottie in the footer.

  Search opening on top of this (see `02-search-bug.md`) is the last straw on low-RAM iPhones. Recommended budget: one carousel and one video above the fold, with everything else virtualized or lazy.
- **Unsanitized CMS HTML.** `HomePageNews.jsx` and `news/NewsHomePage.jsx` use `dangerouslySetInnerHTML`. Per the grep they reference `formatHtml`/sanitization, so verify every branch goes through it. `HomePageDescription/DescText.jsx` is the same (and unused).
- **`HomePage.jsx:16`** awaits `getSettings()` again, although the `(main)` layout already fetched it. It is deduped by React `cache()`, but it is a hidden coupling.
- **`FlashSaleCountdown.jsx:31`** runs `setInterval(…, 1000)`, which re-renders every second. Make sure the cleanup is present. It is client-only, so server and client time can drift at hydration. Render it server-side with `endAt` and let the client only tick.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:** the section shells are mostly Server Components that fetch through `lib/api` (good: `FlashSale`, `Features`, `NewArrival`, `LiveSection`, `UsedDeviceHomePage`). But many purely presentational children are needlessly `"use client"`:
  - `Brands.jsx`, `Brand.jsx`, `Category.jsx`, `Categories.jsx` (client only to host a Swiper; pass slides as children to one client `Carousel`).
  - `TrustFeatures.jsx` (61 lines, static content as client).
  - `HomeFAQ.jsx` (416 lines; an accordion can be `<details>/<summary>` with zero JS, or a tiny client island).
  - `HomePageNews.jsx` (271 lines).
  - `FlashSaleCategory.jsx` (dead) and `FlashSaleProduct.jsx` (dead).
  - `Home/Categories/CategoryDetails/{Filter, SingleCategory, CategoryProducts}.jsx` live under `Home/` but serve the category page (`/categories/[slug]`). They are misplaced (see `07`).
- **State Management:** `CategoryDetails/Filter.jsx` (414 lines) keeps filter state locally and syncs it to the URL. Make the URL the single source of truth: read `searchParams` and write through `router.replace`, with no mirrored state.
- **File Size (over 100 lines):** `LiveProductModal.jsx` (638), `HomeFAQ.jsx` (416), `CategoryDetails/Filter.jsx` (414), `HomePageNews.jsx` (271), `CategoryDetails/SingleCategory.jsx` (234), `CategoryDetails/CategoryProducts.jsx` (187), `LiveProducts.jsx` (163), `WhyChooseTekzo.jsx` (159).
  - `LiveProductModal`: split into `ReelPlayer`, `ReelProductList`, `ReelControls` and a `useReelNavigation` hook.
  - `HomeFAQ`: move the Q/A content to data (CMS or a JSON file) and render it with a 20-line accordion.
  - `WhyChooseTekzo`: move the static copy into data.
- **TypeScript:** slider data (`slidersData.sliders`), reels and flash-sale responses are untyped. `HomeBanner.jsx:16` defensively does `slidersData?.sliders || []`. Add Zod schemas at the `lib/api` boundary.

## 3. Duplication & Technical Debt
- **Feature products:** `FeatureProducts.jsx`, `FeatureProductsCategory.jsx`, `FeatureProductsCategory2.jsx` and `FeatureProductsCategory2Lazy.jsx` are four variants of the same section. The "2" versus "2Lazy" split exists only to defer a client chunk. Consolidate into one section with a `lazy` prop, or use an `IntersectionObserver` wrapper component reused everywhere.
- **Lazy wrappers:** `UsedDeviceSectionHomePageLazy.jsx`, `FeatureProductsCategory2Lazy.jsx`, `LiveSectionClient.jsx` and `Footer.jsx` each re-implement the same "mount when in viewport" `IntersectionObserver` logic. Extract one `<LazyMount rootMargin>` component.
- **Flash sale:** `FlashSaleCategory/Category1.jsx`, `Category2.jsx` and `FlashSaleCategory.jsx` (unused), plus `FlashSaleProduct.jsx` (unused). Delete the dead ones and merge the rest.
- **News:** `HomePageNews/HomePageNews.jsx` (271), `news/NewsHomePage.jsx` (174, **unused**), `Home/NewsCoverage/NewsCoverage.jsx` (58, **unused**) and `news/News.jsx` (290). That is three near-duplicate news renderers. Keep one.
- `HomePageDescription/*` is **unused**, superseded by `ReuseableComponent/PageDescription`.
- `src/app/(main)/test/page.jsx` is a public `/test` route rendering skeletons (named `HonorProductCard`). Delete it.

## 4. Data Fetching & Performance
- **Rendering:** `/` is SSR/ISR. `lib/api` calls use `revalidate: false` plus tags, which gives cache-forever with on-demand revalidation through `api/revalidate` (good pattern). `page.jsx:5-7` awaits `getSliders`, `getCategories` and `getBrands` **sequentially**. That is a waterfall on a cold cache. Use `Promise.all`, or let each section fetch its own data inside `<Suspense>` boundaries so sections stream.
- **No `<Suspense>` boundaries** around the slow sections (reels, used devices, flash sale), so the whole page waits for the slowest fetch on cold renders.
- **Images:** the hero uses `width={4000} height={3000}` with `sizes="100vw"` (fine for a hero). Product cards inside sliders use oversized badge images (see `04`). There is no `placeholder="blur"` on the hero.
- **Videos:** autoplay hero and reels. Add `poster` images, `preload="none"` for non-first slides (already `metadata`), and disable autoplay on `Save-Data` or small viewports.
- **Bundle:** `swiper` (statically imported in `HomeBanner.jsx`, intentionally), `framer-motion` (modals), Lottie (footer, lazy), and both `react-icons` and `lucide-react`.

## 5. Actionable Refactor Checklist
- [ ] 1. Parallelize the `page.jsx` fetches, or move each fetch into its section, and wrap the slow sections in `<Suspense fallback={<Skeleton/>}>`.
- [ ] 2. Convert the static or presentational home components to Server Components: `TrustFeatures`, `WhyChooseTekzo`, `HomeFAQ` (as `<details>`), and the slide markup in `Brands`/`Categories`.
- [ ] 3. Replace the per-section Swiper wrappers with the single `Carousel` from `04`.
- [ ] 4. Extract `<LazyMount>` and use it for all below-the-fold sections.
- [ ] 5. Split `LiveProductModal.jsx` and `HomeFAQ.jsx` into components under 100 lines, with content moved to data.
- [ ] 6. Delete the dead files: `FlashSaleProduct.jsx`, `FlashSaleCategory.jsx`, `NewsCoverage.jsx`, `news/NewsHomePage.jsx`, `HomePageDescription/*`, and `app/(main)/test/page.jsx`.
- [ ] 7. Move `Home/Categories/CategoryDetails/*` to `Components/Category/` (it belongs to `/categories/[slug]`).
- [ ] 8. Set a memory budget for mobile: one autoplay video max, poster on mobile, and fewer simultaneous Swipers. Profile with Safari Web Inspector on a real iPhone.
- [ ] 9. Add Zod schemas for sliders, reels and flash-sale responses in `lib/api`.
- [ ] 10. Render `FlashSaleCountdown` with the server-supplied `endAt` and a hydration-safe initial value.
