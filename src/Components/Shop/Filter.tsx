"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import fetchAPI from "@/utils/fetchAPI";
import { SlidersHorizontal, X, ChevronDown, Check, Search } from "lucide-react";
import type {
  ActivePillProps,
  BrandComboboxProps,
  CategoryComboboxProps,
  CustomSelectProps,
  FilterFieldProps,
  FilterOption,
  FilterProps,
  FilterValues,
} from "@/types/props/shop";
import { fieldsOf, filterList, findIndexList, findList, isList, rec, requireString } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

const SORT_OPTIONS: FilterOption[] = [
  { label: "Default", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const STOCK_OPTIONS: FilterOption[] = [
  { label: "All", value: "" },
  { label: "In Stock", value: "in_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
];

const CATEGORY_ALL_OPTION = { label: "All Categories", value: "" };

const inputCls = `h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800
  focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 focus:bg-white transition-all`;

// `item.name.toLowerCase()` — throws for a null item or a non-string name, as before.
const nameLower = (item: unknown): string => requireString(fieldsOf(item).name).toLowerCase();
// `item.slug` — throws for a null item, as before.
const slugOf = (item: unknown): unknown => fieldsOf(item).slug;
// Mouse targets are DOM nodes; `contains(null)` is false.
const nodeTarget = (target: EventTarget | null): Node | null => (target instanceof Node ? target : null);

/* ── Polished Custom Select ─────────────────────────────────── */
function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(nodeTarget(e.target))) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`${inputCls} flex items-center justify-between text-left cursor-pointer`}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-[60] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <ul className="py-1">
            {options.map((o) => (
              <li
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700
                  ${value === o.value ? "text-teal-700 font-medium bg-teal-50" : "text-gray-700"}`}
              >
                {o.label}
                {value === o.value && (
                  <Check size={13} className="text-secondary" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Brand search combobox ───────────────────────────────────── */
function BrandCombobox({ value, onChange, brands, inputCls }: BrandComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync query with the selected brand name when value changes
  useEffect(() => {
    if (value) {
      const selectedBrand = findList(brands, (b) => slugOf(b) === value);
      if (selectedBrand) {
        setQuery(requireString(fieldsOf(selectedBrand).name));
      }
    } else {
      setQuery("");
    }
  }, [value, brands]);

  // Every name passed `.toLowerCase()` here, so they are strings below.
  const filtered = filterList(brands, (b) =>
    nameLower(b).includes(query.toLowerCase()),
  );

  const select = (b: unknown) => {
    onChange(slugOf(b));
    setQuery(requireString(fieldsOf(b).name));
    setOpen(false);
  };

  const handleFocus = () => {
    // Clear the input when focusing to allow easy search for new brand
    setQuery("");
    setOpen(true);
  };

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (open && value && listRef.current) {
      const selectedIndex = findIndexList(filtered, (b) => slugOf(b) === value);
      if (selectedIndex !== -1) {
        // +1 because "All brands" is at index 0
        const selectedElement = listRef.current.children[selectedIndex + 1];
        if (selectedElement) {
          selectedElement.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }
    }
  }, [open, value, filtered]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(nodeTarget(e.target))) {
        setOpen(false);
        // Reset query to selected brand name when closing without selection
        if (value) {
          const selectedBrand = findList(brands, (b) => slugOf(b) === value);
          if (selectedBrand) {
            setQuery(requireString(fieldsOf(selectedBrand).name));
          }
        } else {
          setQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, brands]);

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={handleFocus}
          placeholder="Search brand…"
          className={`${inputCls} pl-8 pr-8`}
        />
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-3">
              No brand found
            </p>
          ) : (
            <ul ref={listRef} className="max-h-48 overflow-y-auto py-1">
              <li
                onMouseDown={() => select({ slug: "", name: "All brands" })}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700
                  ${!value ? "text-teal-700 font-medium bg-teal-50" : "text-gray-700"}`}
              >
                All brands
                {!value && <Check size={13} className="text-secondary" />}
              </li>
              {filtered.map((b) => (
                <li
                  key={idKey(b)}
                  onMouseDown={() => select(b)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700
                    ${value === slugOf(b) ? "text-teal-700 font-medium bg-teal-50" : "text-gray-700"}`}
                >
                  {nodeOf(fieldsOf(b).name)}
                  {value === slugOf(b) && (
                    <Check size={13} className="text-secondary" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Category search combobox ───────────────────────────────────── */
function CategoryCombobox({ value, onChange, categories, inputCls }: CategoryComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync query with the selected category name when value changes
  useEffect(() => {
    if (value) {
      const selectedCategory = findList(categories, (c) => slugOf(c) === value);
      if (selectedCategory) {
        setQuery(requireString(fieldsOf(selectedCategory).name));
      }
    } else {
      setQuery("");
    }
  }, [value, categories]);

  // Every name passed `.toLowerCase()` here, so they are strings below.
  const filtered = filterList(categories, (c) =>
    nameLower(c).includes(query.toLowerCase()),
  );

  const select = (c: unknown) => {
    onChange(slugOf(c));
    setQuery(requireString(fieldsOf(c).name));
    setOpen(false);
  };

  const handleFocus = () => {
    // Clear the input when focusing to allow easy search for new category
    setQuery("");
    setOpen(true);
  };

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (open && value && listRef.current) {
      const selectedIndex = findIndexList(filtered, (c) => slugOf(c) === value);
      if (selectedIndex !== -1) {
        // +1 because "All Categories" is at index 0
        const selectedElement = listRef.current.children[selectedIndex + 1];
        if (selectedElement) {
          selectedElement.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }
    }
  }, [open, value, filtered]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(nodeTarget(e.target))) {
        setOpen(false);
        // Reset query to selected category name when closing without selection
        if (value) {
          const selectedCategory = findList(categories, (cat) => slugOf(cat) === value);
          if (selectedCategory) {
            setQuery(requireString(fieldsOf(selectedCategory).name));
          }
        } else {
          setQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, categories]);

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={handleFocus}
          placeholder="Search category…"
          className={`${inputCls} pl-8 pr-8`}
        />
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-3">
              No category found
            </p>
          ) : (
            <ul ref={listRef} className="max-h-48 overflow-y-auto py-1">
              <li
                onMouseDown={() => select({ slug: "", name: "All Categories" })}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700
                  ${!value ? "text-teal-700 font-medium bg-teal-50" : "text-gray-700"}`}
              >
                All Categories
                {!value && <Check size={13} className="text-secondary" />}
              </li>
              {filtered.map((c) => (
                <li
                  key={idKey(c)}
                  onMouseDown={() => select(c)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700
                    ${value === slugOf(c) ? "text-teal-700 font-medium bg-teal-50" : "text-gray-700"}`}
                >
                  {nodeOf(fieldsOf(c).name)}
                  {value === slugOf(c) && (
                    <Check size={13} className="text-secondary" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Reusable field wrapper ──────────────────────────────────── */
function Field({ label, children }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      {children}
    </div>
  );
}

/* ── Active Pill Component ───────────────────────────────────── */
function ActivePill({ hasActiveFilters }: ActivePillProps) {
  if (!hasActiveFilters) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-50 text-teal-600 border border-teal-200 rounded-full px-2 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
      Active
    </span>
  );
}

// Filter values are kept as given (pages may pass raw search-param values);
// inputs and URLSearchParams stringify them exactly as React / `.set` did.
const text = (value: unknown): string => String(value);

/* ── Main Filter component ───────────────────────────────────── */
export default function Filter({ currentFilters = {} }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState<unknown>(currentFilters.min_price || "");
  const [maxPrice, setMaxPrice] = useState<unknown>(currentFilters.max_price || "");
  const [sortBy, setSortBy] = useState<unknown>(currentFilters.sort_by || "");
  const [brand, setBrand] = useState<unknown>(currentFilters.brand || "");
  const [category, setCategory] = useState<unknown>(currentFilters.category || "");
  const [stock, setStock] = useState<unknown>(currentFilters.stock || "");
  const [brands, setBrands] = useState<unknown>([]);
  const [categories, setCategories] = useState<unknown>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAPI(`/brands`)
      .then((res) => setBrands(rec(res)?.data || []))
      .catch(() => setBrands([]));

    fetchAPI(`/categories`)
      .then((res) => {
        const data = isList(res) ? res : rec(res)?.data;
        setCategories(data || []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setSortBy(searchParams.get("sort_by") || "");
    setBrand(searchParams.get("brand") || "");
    setCategory(searchParams.get("category") || "");
    setStock(searchParams.get("stock") || "");
  }, [searchParams]);

  const applyFilters = useCallback(
    (overrides: FilterValues = {}) => {
      const merged: FilterValues = {
        min_price: minPrice,
        max_price: maxPrice,
        sort_by: sortBy,
        brand,
        category,
        stock,
        ...overrides,
      };
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      if (merged.min_price) params.set("min_price", text(merged.min_price));
      else params.delete("min_price");
      if (merged.max_price) params.set("max_price", text(merged.max_price));
      else params.delete("max_price");
      if (merged.sort_by) params.set("sort_by", text(merged.sort_by));
      else params.delete("sort_by");
      if (merged.brand) params.set("brand", text(merged.brand));
      else params.delete("brand");
      if (merged.category) params.set("category", text(merged.category));
      else params.delete("category");
      if (merged.stock) params.set("stock", text(merged.stock));
      else params.delete("stock");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [
      minPrice,
      maxPrice,
      sortBy,
      brand,
      category,
      stock,
      pathname,
      router,
      searchParams,
    ],
  );

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setBrand("");
    setCategory("");
    setStock("");
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    minPrice || maxPrice || sortBy || brand || category || stock;

  return (
    <>
      {/* ─────────────── DESKTOP FILTER STRIP ─────────────────── */}
      <div className="hidden lg:flex items-end gap-3 my-6 lg:mt-8 flex-wrap">
        <Field label="Sort by">
          <div className="w-[160px]">
            <CustomSelect
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={(val) => {
                setSortBy(val);
                applyFilters({ sort_by: val });
              }}
            />
          </div>
        </Field>

        <Field label="Category">
          <div className="w-[170px]">
            <CategoryCombobox
              value={category}
              categories={categories}
              inputCls={inputCls}
              onChange={(slug) => {
                setCategory(slug);
                applyFilters({ category: slug });
              }}
            />
          </div>
        </Field>

        <Field label="Brand">
          <div className="w-[170px]">
            <BrandCombobox
              value={brand}
              brands={brands}
              inputCls={inputCls}
              onChange={(slug) => {
                setBrand(slug);
                applyFilters({ brand: slug });
              }}
            />
          </div>
        </Field>

        <Field label="Availability">
          <div className="w-[140px]">
            <CustomSelect
              value={stock}
              options={STOCK_OPTIONS}
              onChange={(val) => {
                setStock(val);
                applyFilters({ stock: val });
              }}
            />
          </div>
        </Field>

        <div className="h-5 w-px bg-gray-200 self-end mb-1" />

        <Field label="Price range">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={text(minPrice)}
              min={0}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className={`${inputCls} w-20`}
            />
            <span className="text-gray-300 text-sm">—</span>
            <input
              type="number"
              placeholder="Max"
              value={text(maxPrice)}
              min={0}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className={`${inputCls} w-20`}
            />
            <button
              onClick={() => applyFilters()}
              className="h-[38px] px-4 bg-secondary hover:bg-secondary/90 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </Field>

        {nodeOf(hasActiveFilters && (
          <>
            <div className="h-5 w-px bg-gray-200 self-end mb-1" />
            <button
              onClick={clearFilters}
              className="self-end h-[38px] flex items-center gap-1.5 text-[12px] text-secondary hover:text-teal-700 hover:bg-teal-50 px-3 rounded-lg transition-all"
            >
              <X size={12} strokeWidth={2.5} /> Clear all
            </button>
          </>
        ))}
      </div>

      {/* ─────────────── MOBILE TRIGGER BAR ───────────────────── */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 h-[40px] px-4 bg-secondary text-white rounded-lg text-sm font-medium transition-colors"
        >
          <SlidersHorizontal size={14} />
          Filters
          {nodeOf(hasActiveFilters && (
            <span className="bg-white/25 text-white text-[11px] font-semibold rounded-full px-2 py-0.5">
              {
                [minPrice, maxPrice, sortBy, brand, category, stock].filter(
                  Boolean,
                ).length
              }
            </span>
          ))}
        </button>

        <div className="relative flex-1 max-w-[180px]">
          <CustomSelect
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={(val) => {
              setSortBy(val);
              applyFilters({ sort_by: val });
            }}
          />
        </div>
      </div>

      {/* ─────────────── MOBILE SIDEBAR ───────────────────────── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`lg:hidden fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-[9999] w-[300px] bg-white flex flex-col
        transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] border-l border-gray-100
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-gray-500" />
            <span className="text-[15px] font-semibold text-gray-900">
              Filters
            </span>
            <ActivePill hasActiveFilters={hasActiveFilters} />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={14} className="text-gray-600" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Category
            </p>
            <CategoryCombobox
              value={category}
              categories={categories}
              inputCls={`h-[40px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 focus:bg-white transition-all pl-8 pr-8`}
              onChange={(slug) => {
                setCategory(slug);
                applyFilters({ category: slug });
                setSidebarOpen(false);
              }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Brand
            </p>
            <BrandCombobox
              value={brand}
              brands={brands}
              inputCls={`h-[40px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 focus:bg-white transition-all pl-8 pr-8`}
              onChange={(slug) => {
                setBrand(slug);
                applyFilters({ brand: slug });
                setSidebarOpen(false);
              }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Availability
            </p>
            <CustomSelect
              value={stock}
              options={STOCK_OPTIONS}
              onChange={(val) => setStock(val)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Price range
            </p>
            <div className="flex flex-row items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={text(minPrice)}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-[40px] w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
              <span className="text-gray-300 self-center">—</span>
              <input
                type="number"
                placeholder="Max"
                value={text(maxPrice)}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-[40px] w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => {
              applyFilters();
              setSidebarOpen(false);
            }}
            className="w-full h-[44px] bg-secondary hover:bg-secondary/90 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Apply filters
          </button>
          {nodeOf(hasActiveFilters && (
            <button
              onClick={() => {
                clearFilters();
                setSidebarOpen(false);
              }}
              className="w-full h-[38px] bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm rounded-xl border border-gray-200 transition-colors"
            >
              Clear all
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
