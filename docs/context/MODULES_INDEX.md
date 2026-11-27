# Modules index

Where things live and how big they are, measured at commit `622a1f9`. Counts cover `.js`/`.jsx` files only. Update the "Conv." column as batches land.

- **Conv. values:** `JS` (not converted) · `TS` (converted) · `SPLIT` (broken up into a feature folder).
- **Batch** refers to the phase plan (P2 Core … P9 Dashboard).

## Folders

| Folder | Files | Lines | Role | Batch | Conv. |
|---|---|---|---|---|---|
| `src/proxy.ts` | 1 | 116 | Redirects, auth gate, `has_auth` sync | P2 | **TS** |
| `src/app/api` | 4 | 433 | `client-fetch`, `logout`, `revalidate`, `search` route handlers | P2 | **TS** |
| `src/app/{robots,llms.txt,sitemap.xml,static-pages-sitemap.xml}` + `(main)/{shop,categories,brands}/sitemap.xml` | 7 | ~320 | Feeds and sitemaps | P2 | **TS** |
| `src/app/layout.tsx`, `error.tsx`, `not-found.tsx`, `ClientNotFoundContent.tsx`; `src/app/(main)/layout.tsx`, `error.tsx`, `not-found.tsx` | 7 | — | Root and storefront layouts, error boundaries, 404 pages | P4 | **TS** |
| `src/app/(main)` (pages) | ~66 | ~8,000 | Storefront routes | P5–P8 | JS |
| `src/app/dashboard` | 29 | 6,096 | Customer dashboard (layout is server; most pages are client) | P9 | JS |
| `src/lib` | 20 | — | `api/` (split, see below), `http/` (fetch wrappers), `json.ts` (JSON guards), `fonts`, `formatHtml`, `homeQuote`, `seo/`, `search/` | P2 | **TS** |
| `src/utils` | 11 | — | Re-export shims for the fetch wrappers (`fetchAPI`, `fetchPublicAPI`, `clientFetchAPI` → `lib/http`), `getAuthUser`, `hasAuthCookie`, `buildMetadata`, `filterProducts`, `formatBDT`, `stock`, `scrollLock`, `variantImages` | P2 | **TS** |
| `src/library` | 4 | 60 | Duplicate fetchers on `fetchAPI` (bug #7) | P2 | JS |
| `src/fetch-API` | 3 | 49 | Duplicate fetchers on `fetchAPI` (bug #7) | P2 | JS |
| `src/context` | 3 | — | `CounterContext`, `CompareContext`, `DashboardThemeContext`: compatibility wrappers over `src/stores/*` | P3 | **TS** |
| `src/stores` | 3 | — | Zustand stores: `counter`, `compare`, `dashboardUi` (see below) | P3 | **TS** |
| `src/hooks` | 5 | 195 | `useAutoSlide`, `useBodyScrollLock`, `useModalScrollbar`, `useProductSearch`, `useVoiceSearch` | P2 | JS |
| `Components/ReuseableComponent` | 75 | 8,973 | Cards, CartModal, ProductDetails, forms, Pagination, CustomUIComponent | P4 / P6 | JS |
| `Components/PreownedDevice` | 13 | 4,093 | Pre-owned listing, filters, sidebars, image modal | P7 | JS |
| `Components/Home` | 35 | 3,654 | Homepage sections | P5 | JS |
| `Components/UsedDevice` | 21 | 3,431 | Used-device listing and detail (duplicate ProductDetails) | P7 | JS |
| `Components/Dashboard` | 11 | 2,490 | Dashboard nav, sidebar, address popup | P9 | JS |
| `Components/SellYourDevice` | 2 | 1,471 | Sell-device flow | P7 | JS |
| `Components/Navbar` | 17 | 1,355 | Navbar2 (server), NavAuthClient, badges, mega-menus, mobile sidebar (`Navbar`, `NavbarAuthSection`, `NavHoverServer`, `FetchItemsData` are dead, N14) | P4 | **TS** |
| `Components/Shop` | 9 | 1,348 | Shop listing and Filter | P5 | JS |
| `Components/AboutUs` | 13 | 986 | About page | P5 | JS |
| `Components/Refurbished` | 2 | 918 | Refurbished grid and detail | P7 | JS |
| `Components/TekzoCare` | 7 | 762 | Tekzo Care page | P5 | JS |
| `Components/SEO` | 6 | 673 | JSON-LD components, QuickAnswers. `MetadataDebugger.jsx` stays JS (dead dev tool, N14) | P4 | **TS** (5/6) |
| `Components/Footer`, `GTM`, `Tracker`, `Login`, `WhatsAppPopUp`, `WelcomePopup.tsx`, `ReuseableComponent/CustomUIComponent/{PreFetchLink,RouterStaleRecovery}` | 16 | ~1,400 | Footer, tag loading, Web Vitals, `dataLayer` trackers, login page + auth Server Actions, popups, shared link + stale-router recovery | P4 | **TS** |
| `Components/OrderTracking` | 1 | 586 | Order tracking | P8 | JS |
| `Components/Claim` | 2 | 570 | Warranty claim | P5 | JS |
| `Components/Brands`, `Categories`, `Marketplace`, `Blog`, `news`, `SearchModal`, `Comparison`, `Compare`, `HomePageNews`, `Careers`, `Contact`, `FeaturedProducts`, `Skeleton`, `OrderSuccess`, `Loader`, `Partners`, `FeatureProductFor404Page`, `Description`, `ErrorFallback`, `HomePageDescription` | 2–13 each | 25–546 each | Feature components | P4–P8 | JS |

## New TypeScript foundation (P1)

| Path | Role | Imported by |
|---|---|---|
| `src/types/tracking.ts` | `DataLayerEvent` union: one type per push site (`gtm_idle`, `web_vitals`, `view_item`, `add_to_cart`, `add_to_wishlist`, `begin_checkout`, `purchase`) | `tracking/dataLayer.ts`, `types/global.d.ts` |
| `src/types/global.d.ts` | `Window.dataLayer`, `Window.__purchase_fired` | global |
| `src/types/next.d.ts` | Loads Next's ambient types for standalone `tsc` | global |
| `src/types/env.ts` | `PublicEnv`, `ServerEnv`, `ServerEnvIssue` | `config/*` |
| `src/types/api.ts` | `ApiEnvelope<T>`, `ApiFieldErrors`, `ClientFetchError`, `ClientFetchMethod` | (P2) |
| `src/types/cart.ts` | `GuestCartStorageItem` (shape of checkout's `toStorageItem`), `CartStorageKey` | (P6–P8) |
| `src/types/pos.ts` | `PurchasePoint`, `PurchasePointPayload` | (P6–P8) |
| `src/config/env.ts` | `publicEnv`: literal `NEXT_PUBLIC_*` reads, no defaults | (P2) |
| `src/config/env.server.ts` | `serverEnv`, `reportServerEnvIssues()`: zod-checked, `server-only`, never throws | (P2) |
| `src/tracking/dataLayer.ts` | `pushDataLayer(event)`: does exactly `window.dataLayer = window.dataLayer \|\| []; push(event)` | (P4–P8) |

Planned type files, created in the batch that first needs them: `checkout.ts`, `order.ts`, `auth.ts`, `dashboard.ts`, `store.ts`, `ui.ts`, `props/<domain>.ts`.

## Checkout, orders, login & remaining routes (P8)

| Area | Files | Notes |
|---|---|---|
| Checkout | `app/(main)/checkout/{page,layout,AuthorizeUserAddress}.tsx` | Cart lines are `JsonRecord`s (API items normalised by `normalizeApiCartItem`, guest items from `localStorage.cart`, written back by `toStorageItem` with the same keys and order). `begin_checkout` via `CheckoutTracker` → `pushDataLayer()`. Payload key order as sent (`CheckoutPayload`) |
| Order results | `app/(main)/order/{layout,successful,failed,canceled}`, `Components/OrderSuccess/OrderSuccessClient.tsx` | `purchase` via `PurchaseTracker` (N9 de-dupe kept) |
| Login | `app/(main)/login/{layout,page,reset-password/page}.tsx` | Login form components were converted in P4 |
| Compare | `app/(main)/compare/page.tsx`, `Components/Comparison/ProductComparisonHero.tsx`, `Components/Compare/CompareResult.tsx` | `localStorage.compareProducts` kept |
| Order tracking | `app/(main)/order-tracking/page.tsx`, `Components/OrderTracking/OrderTracking.tsx` | Local `str()` display helper returns `unknown` (objects by name/title/label/value) |
| Misc live | `ErrorFallback`, `FeatureProductFor404Page/*`, `Loader`, `library/{getFeatureProduct,getHomeCategories}.ts`, `app/(main)/{product-specs,test}/*` | |

Types: `src/types/props/checkout.ts`; `Window.__CHECKOUT_BANNER__` in `types/global.d.ts`.

**Still JS (intentional):** careers stubs — `app/(main)/careers/{page,application-form/page,apply/[slug]/page}.jsx`, `Components/Careers/{CareersClient,JobCircular,TeamMembers}.jsx` (P5d: left untouched). **Still JS (no importers, dead code):** `ReuseableComponent/{Card2,DropdownModal,MyButton,PreOwnedCard,PreOwnedCard2,SectionTitle,Text}.jsx`, `SEO/MetadataDebugger.jsx`, `Skeleton/{BrandSkeleton,CategoryPageSkeleton,CategorySkeleton}.jsx`, `fetch-API/getCategories.jsx`, `hooks/useModalScrollbar.js`, `library/{getBrands,getCart}.js(x)`. Delete or convert in the clean-up pass.

## Dashboard (P7)

| Area | Files | Notes |
|---|---|---|
| Shell | `app/dashboard/layout.tsx`, `Components/Dashboard/{DashboardLayoutClient,Sidebar,DashboardTopNavbar,DashboardMobileHeader,DashboardBottomNav,DashboardMobileDrawer}.tsx` | `DASHBOARD_MENU_GROUPS` typed `DashboardMenuGroup[]`; profile updates arrive via the `userProfileUpdated` window event (same handler as NavAuthClient) |
| Account | `manage-account`, `profile/{page,ProfileView}`, `edit-profile/{page,EditProfile}`, `elite-status/{page,EliteContent}`, `coupons` | `fetch-API/getAuthUser.ts`, `getRecentOrder.ts` (bug #6: every page re-fetches the profile, kept) |
| Orders | `(orders)/{all-orders,my-bag,wishlist,order-status/[id]}`, 7 status pages via `Components/Dashboard/OrderStatusList.tsx` | Bag/wishlist price maths keep JS semantics (`Number()` where JS converted, `addJs` for `+`) |
| Addresses | `(address)/{address-book,default-billing-address,default-shipping-address}`, `Components/Dashboard/AddressBook/AddAddressPopup.tsx` | Edit uses `PUT` (added to `ClientFetchMethod`) |
| Reviews | `to-reviews/{page,[id]/page}`, `review-history` | |
| Selling | `sell-your-device/{page,[id]/page}`, `my-sell-requests` | Form is `Components/SellYourDevice/SellYourDevice.tsx` (P6) |
| Unused | `Components/Dashboard/{DashboardTable,ManageAccount}.tsx` | No importers |

Types: `src/types/props/dashboard.ts`. New helpers in lib/render: `initialsOf` (avatar initials). `ClientFetchMethod` gains `"PUT"`.

## Product detail & used devices (P6)

| Area | Files | Notes |
|---|---|---|
| PDP | `Components/ReuseableComponent/ProductDetails/**` (29), `ReuseableComponent/CartModal.tsx`, `app/(main)/product/[productDetails]/page.tsx`, `hooks/useAutoSlide.ts` | dataLayer pushes (`add_to_cart`, share, pills) go through `pushDataLayer()`; `purchase_point` is forwarded unchanged. `TekzoCare/TekzoCarePopup` has no importers |
| Used-device PDP | `Components/UsedDevice/UsedDeviceProductDetails/**`, `app/(main)/(used-device)/used-device/product/[slug]/page.tsx` | Price maths through `addJs` / `greaterJs` (JS `+` / `>`) |
| Used-device listings | `Components/UsedDevice/{UsedDeviceClient,UsedDeviceFilter,WhyChooseSection/*}`, `Components/PreownedDevice/**`, `app/(main)/(used-device)/used-device/{page,[slug]/page}.tsx`, `hooks/useBodyScrollLock.ts` | `PreownedDevice/{FilterSidebar,ProductSidebar}` have no importers; `PreOwnedCard`, `PreOwnedCard2` not converted (unused) |
| Marketplace | `Components/Marketplace/*` (5), `app/(main)/(used-device)/marketplace/page.tsx` | |
| Refurbished | `Components/Refurbished/{RefurbishedProductGrid,RefurbishedSlugDetail}.tsx`, `app/(main)/refurbished/page.tsx` | `RefurbishedSlugDetail` has no importers; N21 kept |
| Sell your device | `Components/SellYourDevice/{SellYourDevice,SellYourDeviceContent}.tsx`, `app/(main)/(used-device)/sell-your-device/page.tsx` | `SellYourDevice` is also imported by the (still JS) `app/dashboard/sell-your-device` pages; N22 kept |

Types: `src/types/props/product.ts`. New helpers: `inputValue` (lib/render: a form value as React reads `value=`), and in lib/json `filterList`, `findList`, `findIndexList`, `spreadList`, `lengthStrict`, `valuesOf`, `addJs`, `greaterJs`, `itemOpt`.

## Content pages (P5d)

| Area | Files | Notes |
|---|---|---|
| Blog | `Components/Blog/*` (6), `app/(main)/blog/{page,[slug]/page}.tsx` | Date formatting shared in `lib/formatPostDate.ts` (invalid dates render the raw value, as before) |
| News | `Components/news/{News,NewsHomePage}.tsx`, `app/(main)/news/page.tsx` | `NewsHomePage` has no importers |
| About us | `Components/AboutUs/**` (13), `app/(main)/about-us/page.tsx` | Static content; `AboutBrands` is commented out of the pill map |
| Tekzo Care | `Components/TekzoCare/*` (7), `app/(main)/tekzo-care/page.tsx` | Static |
| Claims | `Components/Claim/*` (2), `app/(main)/(claim)/*` (3) | Claim submit through `clientFetchAPI` |
| Contact | `Components/Contact/{ContactForm.tsx,actions.ts}`, `app/(main)/contact-us/page.tsx` | `actions.ts` is a `"use server"` module (N19 kept) |
| Partners | `Components/Partners/*` (2), `ReuseableComponent/Form/BusinessForm.tsx`, `app/(main)/partners/**` (6) | |
| Other | `app/(main)/{discovery,faq,policy/[slug],outlets,outlets/[id]}/*`, `Components/Description/*` (6), `ReuseableComponent/{JobApplicationForm,LoginPage}/*` | Outlet time/capitalize shared in `lib/outletFormat.ts`; `JobApplicationForm` is referenced only by commented-out careers code |

Types: `src/types/props/content.ts`; `TagPost` / `BlogListPost` in `types/content.ts`. New helper: `firstErrorOf` (lib/json, `Object.values(x ?? {})?.[0]?.[0]`).

## Catalog listings (P5c-2)

| Area | Files | Notes |
|---|---|---|
| Shop | `Components/Shop/*` (9), `app/(main)/shop/page.tsx` | `Filter` (sort, category/brand comboboxes, stock, price; fetches `/brands` + `/categories` through the Server Action `fetchAPI`, bug #4), URL-based `Pagination`, `ShopHeaderWithFilter` brand chips |
| Categories | `Components/Categories/*` (5), `Components/Home/Categories/CategoryDetails/*` (3), `app/(main)/categories/{page,[slug]/page,[slug]/opengraph-image}.tsx` | `SingleCategory` (header, tabs, debounced search) is shared by category and brand pages; its own `CategoryDetails/Filter` keeps URL strings only |
| Brands | `Components/Brands/*` (5), `app/(main)/brands/{page,[slug]/page}.tsx` | `BrandsCategory`, `SingleBrand`, `BrandProducts` have no route importers today |
| Offers | `app/(main)/shop/offer/{OfferCard,page}.tsx`, `shop/offer/[slug]/{CountdownTimer,page}.tsx` | |
| Other listings | `app/(main)/{flash-sale,new-arrival,new-arrival-products,featured-products,tags/[slug]}/page.tsx` | |

Types: `src/types/props/{shop,category,brand,offer}.ts`, `TagPost` in `types/content.ts`. New helpers: `filterList`, `findList`, `findIndexList`, `spreadList`, `lengthStrict` (lib/json); `tagsOr`, `absoluteOgImage` (`lib/seo/metadata.ts`, shared by the listing pages' `generateMetadata`). `ProductListJsonLdProps.name/listName/description` widened to `unknown` (passed through unchanged).

## Search (P5c-1)

| Area | Files | Notes |
|---|---|---|
| Search bar | `ReuseableComponent/SearchBar.tsx`, `SearchBarParts/{MicButton,SearchInput,SearchBarAction}.tsx` | Debounced live search (`hooks/useProductSearch.ts` → `/api/search`), voice input (`hooks/useVoiceSearch.ts`) |
| Search modal | `ReuseableComponent/SearchModalOverlay.tsx`, `SearchModal/*` (13 files) | Lazy overlay; featured grid + live results (`SearchProduct`), sidebar with quick links and home categories (raw `/home-categories`, bug #4 path via `library/*`) |
| Route | `app/(main)/search/page.tsx` | SSR `no-store` search; Shop components it renders stay JS until P5c-2 |

Types: `src/types/search.ts`, `src/types/route.ts` (Next 16 Promise `params` / `searchParams`). New: `isSearchProduct()` (lib/search), `lengthOpt()` (lib/json).

## Homepage (P5b)

| Area | Files | Notes |
|---|---|---|
| Route | `app/(main)/page.tsx`, `HomePage.tsx` | Server: sliders/categories/brands → sections; settings + customer quote; description sanitized on the server |
| Hero / categories / brands | `ReuseableComponent/HomeBanner.tsx` (P5a), `Home/Categories/{Categories,Category}.tsx`, `Home/Brands/{Brands,Brand}.tsx` | Brand/category tiles chunked 8 per slide, first slide SSR'd, rest mounted on idle |
| Flash sale | `Home/FlashSale/*` (7 files) | Server fetch (12 items), countdown, sliders via `CardMain` |
| Features / new arrivals / used devices | `Home/FeaturesProduct/*` (5), `Home/NewArrival/*` (2), `Home/UsedDeviceHomePage/*` (3) | IntersectionObserver-gated lazy sliders |
| Live reels | `Home/LiveSection/*` (4) | Reels grid + framer-motion modal (mobile / desktop tracks) |
| FAQ / trust / why-choose / news | `Home/HomeFAQ/*`, `Home/TrustFeatures`, `Home/WhyChooseTekzo`, `Home/NewsCoverage`, `HomePageNews/HomePageNews.tsx` | FAQ answers server-rendered; only the accordion state ships as JS |
| Swiper wrappers | `ReuseableComponent/Swiper/*` (11) | Configs unchanged; `LazySwiper` mounts Swiper near the viewport |
| Other | `HomePageDescription/*`, `FeaturedProducts/*` (used by `/featured-products`) | |

Types: `src/types/props/home.ts`. New helpers: `mapList`, `sliceOf`, `itemAt` (`lib/json.ts`); `idKey`, `idKeyOpt`, `keyFrom` (`lib/render.ts`).

**Moved to P5c:** `Home/Categories/CategoryDetails/{Filter,SingleCategory,CategoryProducts}.jsx` (category-page components, not homepage).

## Catalog primitives (P5a)

| File | Role | Importers |
|---|---|---|
| `ReuseableComponent/CardMain.tsx` | Main product card: badges (official/unofficial/Chinese/refurbished, care, offer, gift, coupon), `purchase_point` badge, pre-order price, **Stock Out** button (`utils/stock` rule), Compare (fetches full product then `/compare`), Buy → lazy `CartModal` | 18 |
| `ReuseableComponent/Card.tsx` | Older product card (Add To Cart / Out of Stock, pre-owned View Details) | 7 |
| `ReuseableComponent/Banner.tsx`, `HomeBanner.tsx` | Page hero (with optional visually hidden h1) / homepage slider hero | 51 / 1 |
| `ReuseableComponent/Breadcrumbs.tsx`, `Pagination.tsx` | Path breadcrumbs; numbered pager | 28 / 12 |
| `ReuseableComponent/PageDescription.tsx`, `PageDescriptionView.tsx` | Collapsible CMS description (sanitized via `formatHtml`) | 28 / 2 |
| `ReuseableComponent/{SectionHeading,NoProductFound,Title,Title2,TitleHeading,Section,Button,MyImageSquire}.tsx` | Small layout primitives | — |

Prop types: `src/types/props/catalog.ts`. New helper: `localeOpt()` in `src/lib/json.ts`.

**Still JS in `ReuseableComponent/`:** `CartModal` (P6), `SearchBar`, `SearchModalOverlay`, `SearchBarParts/` (P5c), `Swiper/` (P5b), `ProductDetails/` (P6), `Form/`, `JobApplicationForm/`, `LoginPage/` (P5d), and unused `PreOwnedCard`, `PreOwnedCard2`, `Card2`, `DropdownModal`, `SectionTitle`, `Text`, `MyButton` (no importers).

## Shared chrome helpers and types (P4)

| Path | Role |
|---|---|
| `src/lib/render.ts` | `str()` (string props: `src`/`alt`/`href`), `nodeOf()` (API values as React children, with React's own rules) |
| `src/lib/json.ts` (additions) | `lowerOpt` (`x?.toLowerCase()`), `firstOf` (`x[0]`), `mapOpt` (`x?.map(fn)`), `lengthOf` (`x.length`) |
| `src/types/props/layout.ts` | Props for layouts, error boundaries, `PreFetchLink`, navbar, footer, SEO, trackers |
| `src/types/nav.ts` | Menu item shapes (`NavImageItem`, `NavIconItem`, `SidebarButtonItem`, `FooterLink`, `FooterIconLink`, `NavMenuTitle`) |
| `src/types/auth.ts` | `AuthActionState` (login/register `useActionState`), `AuthFormFields`, `NavUser` |
| `src/types/ui.ts` | `WelcomePopupState` |
| `src/types/tracking.ts` (revised) | API-sourced payload fields are `TrackingValue` (`unknown`), so typing can never alter a pushed payload |

Every `window.dataLayer` push in converted code goes through `pushDataLayer()` (`src/tracking/dataLayer.ts`). The remaining inline pushes (`ProductDetails`, `CartModal`, `DynamicPills`, `ShareDetails`) move when P6 converts them.

## State stores (P3)

| Store | File | State | Actions / selectors | Storage | Wrapped by (unchanged API) |
|---|---|---|---|---|---|
| Counter | `src/stores/counter.store.ts` | `cartCount`, `wishlistCount` (`BadgeCount`) | `setCartCount`, `setWishlistCount`, `incrementCart`, `decrementCart`, `incrementWishlist`, `decrementWishlist`, `refreshCart`, `refreshWishlist`; `selectCartCount`, `selectWishlistCount` | none (server data via `/api/client-fetch`) | `context/CounterContext.tsx`: `CounterProvider` (route-change and focus re-sync, `cart:*` / `wishlist:*` listeners), `useCounter`, `fireCartAdded` / `fireCartRemoved` / `fireWishlistAdded` / `fireWishlistRemoved` |
| Compare | `src/stores/compare.store.ts` | `compareProducts` (`unknown[]`), `isHydrated` | `addToCompare`, `removeFromCompare`, `clearCompare`, `hydrate`; `persistCompareProducts()`; `selectCompareProducts`, `selectIsCompareHydrated` | `localStorage.compareProducts`: same plain JSON array | `context/CompareContext.tsx`: `CompareProvider` (hydrate on mount, save after each change), `useCompare`, `useCompareActions`, `fireCompareAdded` |
| Dashboard UI | `src/stores/dashboardUi.store.ts` | `theme`, `isSidebarCollapsed`, `showPoints` | `setTheme`, `toggleTheme` (view-transition ripple), `toggleSidebar`, `toggleShowPoints`, `hydrate`; `selectDashboardTheme`, `selectIsLight` | `dash_theme`, `dash_sidebar_collapsed`, `dash_show_points`: same keys and values | `context/DashboardThemeContext.tsx`: `DashboardThemeProvider` (hydrate on mount, `light`/`dark` class on `<html>`), `useDashboardTheme` |

Types: `src/types/store.ts` (state, actions, hook return values) and `src/types/props/context.ts` (provider props). New code can read a store directly (`useCounterStore(selectCartCount)`); the context hooks remain for existing components until their batch converts them.

## HTTP and API layer (P2)

| Path | Role | Notes |
|---|---|---|
| `src/lib/json.ts` | Guards for untyped JSON: `isRecord`, `rec`, `isList`, `fieldsOf`, `orList`, `requireString`, `errMessage`, `isNextRedirect`, `toDateInput` | Each mirrors a JS idiom exactly (`a?.b`, destructuring, `x \|\| []` + array method, …). Use these instead of `as` or `Array.isArray` |
| `src/lib/http/fetchPublicAPI.ts` | Path A: public fetch with `tags`/`revalidate` → `next` | Client-importable (bug 8c) |
| `src/lib/http/fetchAPI.ts` | Path A′: `"use server"`, cookie → Bearer | **Bug #4 preserved.** Still a Server Action (verified in the build's server-reference manifest: same 8 actions, same page sets as P0) |
| `src/lib/http/clientFetchAPI.ts` | Path B: browser → `/api/client-fetch` | |
| `src/utils/{fetchAPI,fetchPublicAPI,clientFetchAPI}.ts` | One-line re-exports of `lib/http/*` | Keep the ~50 existing `@/utils/...` imports working. Remove once all importers are converted |
| `src/lib/api/index.ts` | Barrel. `@/lib/api` resolves here | Same 53 exports as the old `lib/api.js` (diffed) |
| `src/lib/api/settings.ts` | `getSettings`, `getSeoPage`, `getPopupDialog` | |
| `src/lib/api/catalog.ts` | sliders, brands (`getAllBrands`, `getBrands`, `getBrandProducts`), categories (5) | |
| `src/lib/api/product.ts` | featured, product, reviews (not `cache()`d), related, new arrivals (2) | |
| `src/lib/api/offers.ts` | `DEFAULT_FLASH_SALE_SEO` (spliced verbatim), flash sale, offers, offer products, shop | |
| `src/lib/api/devices.ts` | pre-owned (9), refurbished (3, incl. the `getRefurbisheds` alias) | |
| `src/lib/api/content.ts` | news, blogs (7), reels, policies (2), FAQ, outlets, careers, team, job | |
| `src/lib/api/location.ts` | `getDistricts` | |
| `src/lib/api/shared.ts` | `dataOf` (`result?.data`), `setIf` (`if (v) query.set(k, v)`), `logFetchError` | |

Every fetcher returns `Promise<unknown>` (or a typed result object whose fields are `unknown`), with the same fallback values, cache tags and `revalidate` settings as before. Domain types replace `unknown` when the consuming pages are converted (P4–P9).

## Large files to break up (≥ 600 lines, plus named targets)

| File | Lines | Mixed responsibilities | Batch |
|---|---|---|---|
| `src/app/(main)/checkout/page.jsx` | 1,387 | Client page: storage↔API cart mapping, guest and user cart, per-item re-fetch, districts and areas, coupons (guest and user), OTP, validation, order payload, payment redirect. 39 `useState`, 10 `useEffect`, 23 `localStorage` | P8 |
| `src/Components/SellYourDevice/SellYourDevice.jsx` | 1,096 | Multi-step form, uploads, submit | P7 |
| `src/Components/ReuseableComponent/ProductDetails/ProductDetails.jsx` | 997 | Variants and gallery, cart, buy now, pre-order, wishlist, compare, guest cart, 4 dataLayer pushes, fallback fetches | P6 |
| `src/lib/api.js` | 904 | 53 server fetchers with tags and fallbacks | P2 |
| `src/Components/ReuseableComponent/Form/BusinessForm.jsx` | 817 | Partner forms | P5 |
| `src/app/dashboard/edit-profile/EditProfile.jsx` | 749 | Profile, email and phone OTP, `userProfileUpdated` event | P9 |
| `src/Components/UsedDevice/UsedDeviceProductDetails/ProductDetails/ProductDetails.jsx` | 747 | Used-device copy of ProductDetails | P7 |
| `src/Components/Shop/Filter.jsx` | 710 | Filter UI and URL sync (15 `useState`, 10 `useEffect`) | P5 |
| `src/app/(main)/login/reset-password/page.jsx` | 704 | Reset OTP flow (path C) | P8 |
| `src/Components/PreownedDevice/PreOwnedDeviceClient.jsx` | 704 | Pre-owned listing UI | P7 |
| `src/app/dashboard/profile/ProfileView.jsx` | 658 | Profile view | P9 |
| `src/Components/PreownedDevice/DeviceSidebar.jsx` | 657 | Device sidebar, cart writes | P7 |
| `src/app/dashboard/(orders)/all-orders/page.jsx` | 652 | Orders list, invoices | P9 |
| `src/Components/PreownedDevice/FilterSidebar.jsx` | 643 | Filters | P7 |
| `src/Components/Home/LiveSection/LiveProductModal.jsx` | 638 | Live product modal | P5 |
| `src/app/(main)/discovery/page.jsx` | 634 | Discovery page | P5 |
| `src/Components/Dashboard/Sidebar.jsx` | 604 | Dashboard sidebar | P9 |
| `src/Components/OrderTracking/OrderTracking.jsx` | 586 | Tracking form and result | P8 |
| `src/Components/ReuseableComponent/CartModal.jsx` | 543 | Variant pick, cart and wishlist, dataLayer | P6 |
| `src/app/dashboard/(orders)/my-bag/page.jsx` | 533 | Logged-in cart | P9 |
| `src/Components/ReuseableComponent/ProductDetails/StickyBottomBar.jsx` | 518 | Mobile buy bar | P6 |

## Shared contracts (keep stable across batches)

| Contract | Owner | Consumers |
|---|---|---|
| `localStorage.cart` JSON | `checkout/page.jsx` `toStorageItem` (one of several writers) | see bug #1 |
| `localStorage.compareProducts` | `CompareContext` | `ProductComparisonHero` |
| `dash_theme`, `dash_sidebar_collapsed`, `dash_show_points` | `DashboardThemeContext` | dashboard nav |
| `guestCouponCode`, `guestCouponDiscount` | checkout | checkout |
| Window events `cart:*`, `wishlist:*`, `compare:added`, `userProfileUpdated` | `CounterContext` helpers, `EditProfile` | CounterProvider, NavAuthClient |
| Cookies `auth_token`, `has_auth` | `Login/actions.ts`, `proxy.ts`, `api/logout` | proxy, client-fetch, counters, checkout |
| `window.dataLayer` events | see [baseline/README.md §3](baseline/README.md#3-datalayer-event-inventory-static) | GTM container |
| `useCounter()`, `useCompare()`, `fireCartAdded()` and the other `fire*` exports | `context/*` | ~12 call sites |
