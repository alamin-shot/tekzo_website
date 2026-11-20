# Module: Shop, Catalog, Categories, Brands, Offers & Listings
**Path:** `src/app/(main)/shop/**`, `src/app/(main)/categories/**`, `src/app/(main)/brands/**`, `src/app/(main)/tags/[slug]`, `src/app/(main)/featured-products`, `src/app/(main)/new-arrival`, `src/app/(main)/new-arrival-products`, `src/app/(main)/flash-sale`, `src/app/(main)/shop/offer/**`, `src/Components/Shop/*`, `src/Components/Brands/*`, `src/Components/Categories/*`, `src/Components/FeaturedProducts/*`, `src/Components/Home/Categories/CategoryDetails/*`, `src/utils/filterProducts.js`

## 1. Critical Bugs & Security Risks
- **The shop "search" box only filters brand names (CONFIRMED).** `ShopHeaderWithFilter.jsx:28-65` live-filters brands by name and rewrites `?brand=`. Typing a product name clears the brand filter instead of searching. `ShopSearchBar.jsx` and `ShopClientWrapper.jsx` are **dead code**. Details are in `02-search-bug.md` §1.8.
- **`router.push` on every keystroke (CONFIRMED).** `ShopHeaderWithFilter.jsx:47-60` pushes a new history entry for every matching keystroke (no debounce visible in that effect, which depends on `[searchQuery]`). That triggers an RSC refetch of `/shop` per character and pollutes the back button. Use `router.replace` plus a debounce.
- **Client-side sort and filter over paginated server data (CONFIRMED).**
  - `ShopProducts.jsx:11-32` re-sorts only the **current page** by `final_price`. With server pagination, "price low→high" is wrong across pages unless the backend already sorts. If it does, the client sort is redundant.
  - `flash-sale/page.jsx`, `new-arrival-products/page.jsx` and `shop/offer/[slug]/page.jsx` run `utils/filterAndSortProducts` **in memory after fetching a page**, so filter results and pagination counts disagree.
  - Filtering and sorting must be done by the API.
- **`Shop/Filter.jsx` (710 lines, client) calls the Server Action `fetchAPI`** for `/brands` and `/categories` (lines 381-385). These are uncached reads through the public-RPC Server Action (see `02` §1.6), and the same data is already fetched server-side in `shop/page.jsx` (`getBrands`). Pass it as props.
- **`brands/[slug]/page.jsx:9-13`** `generateStaticParams` fetches **all brands** at build time and pre-renders each one. That is fine (about 70 brands per the fetch cache), but builds fail hard if the API is down (as it is now with the 522). Wrap the call in try/catch and return `[]` so ISR takes over.
- `categories/[slug]/opengraph-image.jsx` (110 lines) generates OG images at request time. Make sure it is cached, or it costs CPU on every social crawl.
- Sitemap route handlers (`shop/`, `brands/`, `categories/sitemap.xml/route.js`) fetch the full product list. See `13`.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `ShopProducts.jsx` is `"use client"` only to call `useSearchParams()` for sorting. The page already has `searchParams`, so do the sorting on the server or the API and render the grid server-side.
  - `Pagination.jsx` (Shop) is client only for `usePathname`/`useSearchParams`. Pass `pathname` and `searchParams` from the page and render plain `<Link>`s server-side.
  - `Filter.jsx` (710) and `CategoryDetails/Filter.jsx` (414) are huge client components. Only the interactive controls need to be client. The option lists can be server-rendered.
  - `BrandsWithFilter.jsx`, `CategoryList.jsx` and `CategorySearchFilter.jsx` are client-side list filters over data that is already loaded. Acceptable, but keep the list markup on the server.
- **State Management:** filter state is mirrored into `useState` and then synced into the URL in both Filter components (`router.push` vs `router.replace`, inconsistently). The URL must be the **only** source of truth. Read from `searchParams`, write via one `useUpdateSearchParams()` hook with debounce and `replace`.
- **File Size (over 100 lines):** `Shop/Filter.jsx` (710), `CategoryDetails/Filter.jsx` (414), `CategoryDetails/SingleCategory.jsx` (234), `flash-sale/page.jsx` (220), `ShopHeaderWithFilter.jsx` (189), `CategoryDetails/CategoryProducts.jsx` (187), `Brands/BrandsWithFilter.jsx` (174), `Categories/CategoryList.jsx` (174), `new-arrival-products/page.jsx` (164), `shop/offer/[slug]/page.jsx` (159), `Brands/BrandsCategory.jsx` (155, dead), `shop/page.jsx` (143), `categories/[slug]/page.jsx` (135), `brands/[slug]/page.jsx` (132), `Brands/SingleBrand.jsx` (128, dead), `Shop/Pagination.jsx` (122), `shop/offer/OfferCard.jsx` (112), `categories/[slug]/opengraph-image.jsx` (110).
  - **Filter split:** `PriceRangeFilter` (already exists, 76 lines; reuse it), `BrandFilter`, `CategoryFilter`, `StockFilter`, `SortSelect`, `MobileFilterDrawer` and a `useFilterParams` hook.
- **TypeScript:** listing responses are normalized ad hoc (`products?.products || products`, `result?.data ?? { products: [], seoData: null }`). Define a `PaginatedProducts<T>` type and a Zod schema shared by shop, category, brand, tag, offer and search.

## 3. Duplication & Technical Debt
- **Three listing pages that are 80% the same:** `/shop`, `/categories/[slug]`, `/brands/[slug]`, plus `/tags/[slug]`, `/featured-products`, `/new-arrival-products`, `/flash-sale` and `/shop/offer/[slug]`, all rendering Banner → Breadcrumbs → Filter → Grid → Pagination → PageDescription. Build one `<ProductListingPage source={…} />` layout component.
- **Two Filter components** (`Shop/Filter.jsx`, `Home/Categories/CategoryDetails/Filter.jsx`) and **two Pagination components** (`Shop/Pagination.jsx`, `ReuseableComponent/Pagination.jsx`).
- **Dead:** `Shop/Products.jsx`, `Shop/ShopClientWrapper.jsx`, `Shop/ShopSearchBar.jsx`, `Brands/BrandsCategory.jsx`, `Brands/SingleBrand.jsx`, `Brands/BrandDescription.jsx`, `Categories/CategoriesClientWrapper.jsx`, `Categories/SingleCategoryPage/SingleCategoryPage.jsx`, `Components/Description/*PageDesc.jsx`.
- `src/app/(main)/new-arrival/page.jsx` is a **1-line file** next to `new-arrival-products/`. Merge it or turn it into a redirect.
- `Categories/CategoryChips.jsx` (7 lines) vs `Shop/BrandChips.jsx` (54): generalize into `<FilterChips>`.
- Description components duplicated per page (see `04`).

## 4. Data Fetching & Performance
- **Rendering:** listing pages are SSR/ISR via `lib/api` with tags (`shops`, `brands`, `categories`) and `revalidate: false` or `3600`. That is a good base. But `searchParams` makes them dynamic per query, so every filter or page combination renders on demand. That is acceptable if the API is fast.
- **Double fetching:** `shop/page.jsx` fetches products and brands, then `Filter.jsx` (client) re-fetches brands and categories via the Server Action.
- `shop/page.jsx:26` calls `getShopProducts(buildShopQuery({ page: 1 }))` inside `generateMetadata` **and** again in the page with real params. They are deduped only when the query strings match exactly.
- **Images:** `CardMain` badge images are oversized (see `04`). The OG image is generated per category.
- `utils/filterProducts.js` (154 lines) does client and server in-memory filtering. Once the API filters, remove it.

## 5. Actionable Refactor Checklist
- [ ] 1. Make the URL the single source of truth for filters: write a `useFilterParams()` hook (read and debounced `router.replace`), and remove the mirrored `useState` in both Filter components.
- [ ] 2. Move all sorting and filtering to the API: pass `sort_by`, `min_price`, `max_price`, `brand`, `stock` and `search` to every listing endpoint. Delete `ShopProducts`' client sort and `utils/filterProducts.js`.
- [ ] 3. Replace the shop brand-name box with a real product search (`?search=`) or rename it "Filter brands". Delete `ShopSearchBar.jsx`, `ShopClientWrapper.jsx` and `Products.jsx`.
- [ ] 4. Stop `Filter.jsx` from calling `fetchAPI`. Pass brands and categories from the page (already cached server-side).
- [ ] 5. Build one `<ProductListingPage>` and one `<Filter>` composed of small controls (each ≤100 lines), and migrate the eight listing routes.
- [ ] 6. Make `Shop/Pagination` a server component that builds links from props, and delete the duplicate Pagination.
- [ ] 7. Guard `generateStaticParams` in `brands/[slug]` (and similar) with try/catch so builds survive API outages.
- [ ] 8. Delete the dead Brand, Category and Description components and `new-arrival/page.jsx`, or convert the latter to a `redirect()`.
- [ ] 9. Add a `PaginatedProducts` Zod schema and TS type shared by all listing fetchers.
- [ ] 10. Cache `categories/[slug]/opengraph-image` (`revalidate = 86400`).
