# Module: Used Devices, Pre-owned Marketplace, Refurbished & Sell-Your-Device
**Path:** `src/app/(main)/(used-device)/**` (`marketplace`, `sell-your-device`, `used-device`, `used-device/[slug]`, `used-device/product/[slug]`), `src/app/(main)/refurbished`, `src/app/dashboard/sell-your-device/**`, `src/app/dashboard/my-sell-requests`, `src/Components/PreownedDevice/**`, `src/Components/UsedDevice/**`, `src/Components/Refurbished/*`, `src/Components/SellYourDevice/*`, `src/Components/Marketplace/*`

## 1. Critical Bugs & Security Risks
- **`RefurbishedProductGrid.jsx` (480 lines, client)** fetches products and brands **directly from the browser** (`:36`, `:57` use `NEXT_PUBLIC_API_URL`). That is the same cross-origin fragility as search (see `02`) and duplicates the server-side `getRefurbishedProducts`/`getRefurbishedBrands` that already exist in `lib/api.js:567-656`.
- **Unsanitized HTML:** `UsedDevice/.../DynamicPills.jsx:109-110` injects `short_description` without `formatHtml` (see `08` §1). `DeviceSidebar.jsx`, `PreOwnedDeviceClient.jsx` and `UsedDetailsFooter.jsx` use `dangerouslySetInnerHTML`. The grep shows they reference the sanitizer, but verify every branch.
- **`localStorage` writes** in `DeviceCard.jsx`, `DeviceSidebar.jsx`, `ProductSidebar.jsx` (dead) and the used `ProductDetails.jsx` put guest-cart and pre-owned selections into storage without a schema. Checkout then forces `quantity = 1` for pre-owned items (`checkout/page.jsx:824-827`), which means the cart can hold invalid states that only fail at submit.
- **`SellYourDevice.jsx` (1,096 lines)**: a device-trade-in wizard with image upload (`ImageModal.jsx`, 437 lines) and personal data (phone, address, IMEI likely). There is no schema validation library in the project. Uploads go through the generic BFF pass-through. Inferred from size and name: audit the file type and size limits and the PII handling.
- **`.bak` file** committed: `UsedDevice/UsedDeviceProductDetails/ProductDetails/ProductDetails.jsx.bak` (521 lines).

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `PreOwnedDeviceClient.jsx` (704), `UsedDeviceClient.jsx` (372), `RefurbishedProductGrid.jsx` (480) and `SellYourDevice.jsx` (1,096) are page-sized client components. The listing grids should be server-rendered, with only filters as client islands.
  - `RefurbishedSlugDetail.jsx` (438) is **unused**.
  - `UsedDevice/.../ProductReview.jsx` imports the server fetcher `getProductReviews` from `lib/api` into client code (see `08`).
- **State Management:** filters for used devices and the marketplace live in `PreOwnedFilter.jsx` (476), `FilterSidebar.jsx` (643, PreownedDevice), `Marketplace/FilterSidebar.jsx` (172), `Marketplace/MobileFilterSidebar.jsx` (204) and `UsedDeviceFilter.jsx` (354). That is **five filter implementations**. They must share one URL-param-driven filter hook (see `07`). The sell wizard step state should be in the URL (`?step=`) or a Redux slice, so refresh does not lose progress.
- **File Size (over 100 lines):** `SellYourDevice.jsx` (1,096), `PreOwnedDeviceClient.jsx` (704), `DeviceSidebar.jsx` (657), `PreownedDevice/FilterSidebar.jsx` (643), `UsedDevice/.../ProductDetails.jsx` (745), `RefurbishedProductGrid.jsx` (480), `PreOwnedFilter.jsx` (476), `RefurbishedSlugDetail.jsx` (438), `ImageModal.jsx` (437), `UsedDevice/.../ProductReview.jsx` (383), `SellYourDeviceContent.jsx` (375), `UsedDeviceClient.jsx` (372), `UsedDeviceFilter.jsx` (354), `DeviceCard.jsx` (293), `DeviceConditionContent.jsx` (232), `MobileFilterSidebar.jsx` (204), `used-device/product/[slug]/loading.jsx` (201), `ProductSidebar.jsx` (181), `PricingSelector.jsx` (173), `Marketplace/FilterSidebar.jsx` (172), `TekzoCarePopup.jsx` (165), `DeliveryContent.jsx` (161), `TekzoCareCard.jsx` (158), `CommonModal.jsx` (154), `DynamicPills.jsx` (145), `marketplace/page.jsx` (143), `WhyChooseBenefits.jsx` (139), `used-device/page.jsx` (123), `ShippingDetailsUsed*.jsx` (104/108), `ShareDetails.jsx` (108).
  - **`SellYourDevice`:** split into `DeviceSelectStep`, `ConditionStep`, `PhotosStep`, `ContactStep`, `ReviewStep`, a `useSellWizard` hook and a `sellRequest.service`.
- **TypeScript:** pre-owned products carry condition grades, storage, battery health and `preOwnedId` query params, all untyped. `GradeBadge` (Blog folder) is reused for conditions, which suggests misplaced shared UI.

## 3. Duplication & Technical Debt
- **The ProductDetails tree is fully duplicated** for used devices (about 2,500 lines; see `08` §3).
- **Five filter sidebars** (listed above). Consolidate into one.
- **Cards:** `DeviceCard.jsx` (293), `PreOwnedCard.jsx` (unused), `PreOwnedCard2.jsx` (unused) and `CardMain from="preOwned"`. Use one `ProductCard variant="preowned"`.
- **Sell-your-device has three entry points:** `(main)/(used-device)/sell-your-device/page.jsx` (63), `dashboard/sell-your-device/page.jsx` (46) plus `[id]` (47), and `Components/SellYourDevice/*`. Keep one wizard, with the dashboard showing history only.
- **Two TekzoCare implementations:** `ReuseableComponent/ProductDetails/TekzoCare/*` vs `UsedDevice/.../TekzoCare/*`.
- **`ProductSidebar.jsx` (181)** and **`RefurbishedSlugDetail.jsx` (438)** are unused.

## 4. Data Fetching & Performance
- `marketplace` and `refurbished` are ISR (`revalidate = 3600`). That is good, but `RefurbishedProductGrid` then re-fetches client-side, which defeats the ISR.
- `used-device/product/[slug]` uses query `?preOwnedId=` in fetch URLs (`/product/pixel-8?preOwnedId=144` in the fetch cache). Each pre-owned unit becomes a separate cache entry, which is correct, but canonical URLs must strip it (already handled in the product metadata).
- Heavy modals (`ImageModal` 437, `CommonModal` 154 and its five `ModalContents/*`) should be `dynamic()`-imported on open.
- Inferred: image galleries for used devices likely load full-resolution photos. Make sure `sizes` is set.

## 5. Actionable Refactor Checklist
- [ ] 1. Remove the client-side fetching from `RefurbishedProductGrid`. Use the existing `lib/api` refurbished fetchers in the server page and pass props.
- [ ] 2. Sanitize `short_description` in the used `DynamicPills`, and audit the other `dangerouslySetInnerHTML` sites.
- [ ] 3. Build one URL-driven `<DeviceFilters>` (≤100-line subcomponents) and replace the five filter sidebars.
- [ ] 4. Merge the used-device ProductDetails tree into the main product tree (see `08`). Delete the `.bak` file.
- [ ] 5. Split `SellYourDevice.jsx` into a step wizard with URL step state. Add Zod validation and server-side upload limits. Keep a single entry point.
- [ ] 6. Delete `ProductSidebar.jsx`, `RefurbishedSlugDetail.jsx`, `PreOwnedCard.jsx` and `PreOwnedCard2.jsx`.
- [ ] 7. Lazy-load `ImageModal`, `CommonModal` and the modal contents.
- [ ] 8. Add `PreOwnedProduct`, `Condition` and `SellRequest` schemas and types.
- [ ] 9. Validate pre-owned cart items (quantity = 1) at add-to-cart time, not only at checkout.
