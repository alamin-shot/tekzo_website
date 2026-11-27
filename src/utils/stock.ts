// Single stock rule shared by the PDP (ProductDetails, StickyBottomBar) and
// product cards (CardMain) so they never disagree.
// In stock: true / 1 (and the string forms "true" / "1" some callers pass).
export const isInStockFlag = (stock: unknown): boolean => stock === true || stock === 1 || stock === "1" || stock === "true";

// Stock out: not in stock and not pre-bookable.
export const isStockOut = (stock: unknown, isPrebook: unknown = false): boolean => !isInStockFlag(stock) && !isPrebook;
