// Props for the shop / listing filters and chips (P5c-2). API values
// (brands, categories, pagination) stay `unknown` and are read through
// src/lib/json.ts; filter values stay `unknown` because pages pass raw
// search-param values (string | string[] | undefined) through unchanged.
import type { ReactNode } from "react";

/** One choice in Filter's sort / availability selects. */
export type FilterOption = {
  label: string;
  value: string;
};

/** The filter fields Filter reads from `currentFilters` and writes to the URL. */
export type FilterValues = {
  min_price?: unknown;
  max_price?: unknown;
  sort_by?: unknown;
  brand?: unknown;
  category?: unknown;
  stock?: unknown;
};

/** CategoryDetails/Filter: its filter state is always URL strings. */
export type UrlFilterValues = {
  min_price?: string;
  max_price?: string;
  sort_by?: string;
  stock?: string;
};

/** SingleCategory / brand listing header. `product` is the raw listing payload. */
export type SingleCategoryProps = {
  product: unknown;
  activeCategory?: unknown;
  activeBrand?: unknown;
  fromCategory?: unknown;
  pagination?: unknown;
  currentPage: number;
};

export type CategoryProductsProps = {
  product: unknown;
  fromCategory?: unknown;
  onFiltersChange?: (filters: unknown) => void;
  pagination?: unknown;
  currentPage: number;
  isSearching?: boolean;
};

export type FilterProps = {
  currentFilters?: FilterValues;
};

export type CustomSelectProps = {
  value: unknown;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
};

/** Brand / category search combobox: `items` is the raw /brands or /categories list. */
export type BrandComboboxProps = {
  value: unknown;
  onChange: (slug: unknown) => void;
  brands: unknown;
  inputCls: string;
};

export type CategoryComboboxProps = {
  value: unknown;
  onChange: (slug: unknown) => void;
  categories: unknown;
  inputCls: string;
};

export type FilterFieldProps = {
  label: string;
  children?: ReactNode;
};

export type ActivePillProps = {
  hasActiveFilters: unknown;
};

/** Shop pagination (URL based). `shopProducts.pagination.last_page` gives the page count. */
export type ShopPaginationProps = {
  shopProducts: unknown;
  currentPage: number;
};

export type BrandChipsProps = {
  brands: unknown;
  currentBrand: unknown;
  className?: string;
  searchQuery?: string;
};

export type ShopClientWrapperProps = {
  brands: unknown;
  currentBrand: unknown;
  children?: ReactNode;
};

export type ShopSearchBarProps = {
  onSearch: (query: string) => void;
  className?: string;
};

export type ShopHeaderWithFilterProps = {
  brands: unknown;
  currentBrand: unknown;
};

export type ShopProductsProps = {
  shopProducts: unknown;
};

/** Products (demo grid from /card/products.json); `link` is accepted but unused. */
export type ProductsProps = {
  link?: unknown;
};

/** PriceRangeFilter (used by the JS DropdownModal with numeric/string price state). */
export type PriceRangeFilterProps = {
  minPrice: number | string;
  maxPrice: number | string;
  setMinPrice: (value: number | string) => void;
  setMaxPrice: (value: number | string) => void;
};
