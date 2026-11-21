# 11 — Product card: "Add To Bag" ↔ Star swap (analysis)

Status: **Implemented** on branch `feat/card-button-swap` (see §7).

## 0. Findings that change the brief

1. **The Star is not a wishlist button.** In `CardMain.jsx` the `<FaStar />` sits inside a
   plain `<div>` "rating circle" that displays `{rating}`. It has **no `onClick`**, no
   wishlist call, no handler at all. Wishlist logic exists only on the product details
   page (`ProductDetails.jsx` → `handleWishlist`), never on the card.
2. **"Add To Bag" does not add to the bag.** Its handler only opens a modal:
   `onClick={() => isStock && setIsModalOpen(true)}`. Every cart action (auth check, API
   call, GTM event, toast state, `fireCartAdded`) lives inside `CartModal.jsx` and runs
   only when the user clicks **"Add To Cart"** or **"Buy Now"** inside that modal.
3. **The compare page needs the full product-details object.** A card's `product` prop
   (listing data) is not enough — see §3.

So "move the cart chain to the Eye" = move **one line** (`isStock && setIsModalOpen(true)`)
to the Eye. The modal and everything inside it stays exactly as is.

## 1. Component

`src/Components/ReuseableComponent/CardMain.jsx` — the standard card, used in ~25 places
(home sliders, shop, categories, brands, flash sale, offers, new arrivals, related products,
404, refurbished, used-device). The button area has three branches:

| Branch | Condition | Element | Affected by this change? |
|---|---|---|---|
| Pre-owned | `from === "preOwned"` | `PreFetchLink` "View all Products" | No |
| Pre-order | `isPreOrder` | `PreFetchLink` "Pre Order" | No |
| **Standard** | otherwise | `<button>` "Add To Bag" / "Out of Stock" | **Yes** |

The rating circle also has two variants: `from === "flashSale"` (inline) and default
(absolute, bottom-right). Both contain `<FaStar />` + `{rating}`.

Unused prop: `btnClick` is destructured but never called in `CardMain` (only `Card2.jsx`
uses its own `btnClick`).

## 2. "Add To Bag" execution chain (traced)

```
CardMain <button onClick={() => isStock && setIsModalOpen(true)} disabled={!isStock}>
  └─ isModalOpen = true
     └─ hasOpenedCart = true (render-time latch) → mounts <CartModal> (next/dynamic, ssr:false)
        CartModal props: isModalOpen, setIsModalOpen, name, currentPrice, image, slug={link}
        ├─ effect: lockScroll() while open, unlockScroll() on close
        ├─ effect: GET ${NEXT_PUBLIC_API_URL}/product/{slug}  (AbortController)
        │    → builds colors from images, picks first in-stock colour + variant
        │    → skeleton while loading; console.error on failure (no toast)
        └─ renders portal to document.body (framer-motion) with 3 actions:
```

**A. "Add To Cart" → `handleAddToCart`**
- Guard: does nothing while already adding / just added / no product / no variant.
- `setAddingToCart(true)` → button text "Adding...".
- **Auth check:** `getAuthUser()` → `hasAuthCookie()` then `GET /customer/profile`.
- **Logged in:**
  - `clientFetchAPI("/customer/carts", "POST", { variant_id, quantity })`
  - **GTM:** `window.dataLayer.push({ event: "add_to_cart", ecommerce: { currency: "BDT", value, items: [...] } })`
  - `setIsAdded(true)` → button text "Added Successfully!" for 2 s (the "toast" — inline text, no toast library)
  - **Context/event:** `fireCartAdded()` → `window.dispatchEvent(new Event("cart:added"))` (picked up by CounterContext for the nav badge)
- **Guest:** **no localStorage save** — closes modal, `router.push("/login")`.
- Errors: `console.error` only. `finally` → `setAddingToCart(false)`.

**B. "Buy Now" → `handleBuyNow`**
- Same auth check.
- Logged in: `POST /customer/carts`.
- **Guest: saves to `localStorage["cart"]`** (merges quantity if the variant exists).
- Always closes modal and `router.push("/checkout")` (even on error). No GTM event, no `fireCartAdded`.

**C. "View Product" → `handleViewProduct`** → closes modal, `router.push("/product/{slug}")`.

Summary vs. the checklist in the brief:

| Question | Answer |
|---|---|
| Auth check? | Yes — inside the modal, `getAuthUser()` |
| Guest → localStorage? | Only via **Buy Now**. Add To Cart sends guests to `/login` |
| Logged in → API? | Yes, `POST /customer/carts` (both actions) |
| Context update? | `fireCartAdded()` window event — Add To Cart only |
| Loading / success state? | "Adding..." / "Added Successfully!" button text; skeleton while fetching |
| GTM? | `add_to_cart` dataLayer push — Add To Cart (logged in) only |

## 3. Star icon chain

None. `<FaStar />` is decorative inside the rating `<div>`; no `onClick`, no wishlist.

## 4. Compare

- `useCompare` is **not** imported in `CardMain`. Needs `import { useCompare } from "@/context/CompareContext"`.
- `CompareProvider` wraps the app in `src/app/layout.jsx`, so the hook works on every page
  `CardMain` renders on (it throws outside the provider).
- `useRouter` is **not** imported in `CardMain` either (needs `next/navigation`).
- `addToCompare(product)` puts the object in the first empty slot (or overwrites slot 2)
  and the provider persists `[a, b]` to `localStorage["compareProducts"]`.
- `/compare` (`ProductComparisonHero` → `CompareResult`) reads that key and renders
  `specifications`, `variants`, `images`, `warranty_text`, `brand`, `category`,
  `product_quantity`. Its own search flow always fetches **`GET /product/{slug}`** first
  and stores that full object. `ProductDetails.jsx` likewise passes its full details object.
- The card's `product` prop is listing data and will not reliably have `specifications`
  / `variants`. **Storing it directly would give an empty or broken comparison table.**

## 5. UI swap plan (proposal)

All edits in `CardMain.jsx` only. No Tailwind class, margin, padding or wrapper changes.

1. **Imports:** add `useRouter` (`next/navigation`), `useCompare` (`@/context/CompareContext`),
   `Eye` (`lucide-react`, already a dependency). Remove `FaStar` once unused.
2. **New handler `handleCompare`** (mirrors `ProductDetails.handleAddToCompare` + the compare
   page's own fetch):
   ```js
   const [comparing, setComparing] = useState(false);
   const handleCompare = async () => {
     if (comparing || !link) return;
     setComparing(true);
     let details = null;
     try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${link}`);
       if (res.ok) details = (await res.json())?.data ?? null;
     } catch (err) {
       console.error("Compare fetch failed:", err);
     }
     try {
       addToCompare(details || product || productData); // fall back, never crash
       router.push("/compare");
     } finally {
       setComparing(false);
     }
   };
   ```
3. **Standard-branch button:** `onClick={handleCompare}`, label `"Add To Bag"` → `"Compare"`.
   `className`, inner `<div>`/`<span>` classes and the `MdArrowForwardIos` stay identical.
4. **Rating circle (both variants):** `<FaStar />` → `<Eye />`, and the old chain bound to it:
   `onClick={() => isStock && setIsModalOpen(true)}`. The `CartModal` mount at the bottom is
   untouched, so Add To Cart / Buy Now / GTM / `fireCartAdded` behave exactly as today.
5. Pre-owned and Pre-order branches unchanged.

## 6. Decisions needed before coding

1. **Clickable element for the Eye.** The rating circle is a `<div>`. Options:
   (a) add `onClick` + `role="button"` + `tabIndex={0}` + `aria-label="Quick view"` to the
   existing innermost `<div>` — zero structural change; or (b) change that `<div>` to a
   `<button>` with the same classes — better a11y, but it is an element change.
   **Recommend (a).**
2. **Keep the `{rating}` number next to the Eye?** Recommend yes (only the icon swaps).
3. **Out-of-stock cards.** Today the button shows grey "Out of Stock" and is disabled.
   Compare doesn't need stock. Options: keep the current `isStock` conditional (grey,
   disabled, "Out of Stock") — no class branch change; or always enable Compare (uses the
   existing `gradient` branch for all cards). The Eye keeps the `isStock` gate either way,
   because the modal's cart actions already disable themselves when out of stock.
4. **Flash-sale variant:** apply the Eye there too? Recommend yes, for consistency.
5. **Fetch on click** (§5.2) adds a short delay before navigating. The alternative is to store the
   listing object and make `/compare` refetch by slug — but that changes the compare page,
   which is out of scope. Recommend the fetch-on-click approach.

## 7. Implementation (complete)

Decisions applied: Eye on the existing `<div>` (`role="button"`, `tabIndex={0}`,
`aria-label="Add to cart"`, Enter/Space key handler); rating number kept; Compare always
enabled; Eye opens `CartModal` even when out of stock; flash-sale variant updated too;
fetch-on-click with `isComparing` → button disabled + "Adding...".

Only `src/Components/ReuseableComponent/CardMain.jsx` changed. The flash-sale card is the
`from === "flashSale"` branch inside `CardMain`, not a separate component.

- Imports: `+ Eye` (lucide-react), `+ useRouter`, `+ useCompare`; `- FaStar`.
- `handleCompare`: `GET /product/{link}` → `addToCompare(details || product || productData)`
  → `router.push("/compare")`. A failed fetch is logged and falls back to listing data.
- Compare button: reuses the in-stock "Add To Bag" class strings verbatim (always the
  `gradient cursor-pointer` branch); arrow icon always shown.
- Eye: `<Eye size="1em" />` so it renders at the same size as `FaStar` (lucide defaults
  to 24px; react-icons uses 1em). It's a prop, not a class change.
- `CartModal.jsx` untouched: Add To Cart / Buy Now / GTM / `fireCartAdded` unchanged.
- ESLint: clean on `CardMain.jsx`.
