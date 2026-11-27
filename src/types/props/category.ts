// Props for the category listing components (P5c-2). Values that come from
// search params or the API stay `unknown` and are read through src/lib/json.ts.

/** CategoryList (server): `categoryFilter` / `searchQuery` are raw `?category` / `?search` values. */
export type CategoryListProps = {
  categoryFilter?: unknown;
  searchQuery?: unknown;
};

/** CategoriesClientWrapper (currently unused by any route). */
export type CategoriesClientWrapperProps = {
  categories?: unknown;
  currentCategory?: unknown;
};

/** CategoryChips renders nothing; its props are accepted and ignored. */
export type CategoryChipsProps = {
  categories?: unknown;
  currentCategory?: unknown;
  className?: string;
};
