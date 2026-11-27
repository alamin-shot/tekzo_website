"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  useTransition,
} from "react";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import type {
  CustomSelectProps,
  FilterFieldProps,
  FilterOption,
  FilterProps,
  UrlFilterValues,
} from "@/types/props/shop";

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

const inputCls = `h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800
  focus:outline-none focus:ring-2 focus:ring-teal-200  focus:border-teal-400 focus:bg-white transition-all`;

/* ── Polished Custom Select ─────────────────────────────────── */
function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Mouse targets are DOM nodes; `contains(null)` is false.
      const target = e.target instanceof Node ? e.target : null;
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative w-full ">
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
                  <Check size={13} className="text-teal-500" />
                )}
              </li>
            ))}
          </ul>
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

/* ── Inner Filter handling search parameters safely ──────────── */
function FilterContent({ currentFilters = {} }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state from URL params once
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("min_price") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("max_price") || "",
  );
  const [sortBy, setSortBy] = useState(() => searchParams.get("sort_by") || "");
  const [stock, setStock] = useState(() => searchParams.get("stock") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state with URL changes (for browser back/forward) using refs to avoid dependency warnings
  const prevSearchParamsRef = useRef("");

  useEffect(() => {
    const currentSearchString = searchParams.toString();
    if (currentSearchString !== prevSearchParamsRef.current) {
      setMinPrice(searchParams.get("min_price") || "");
      setMaxPrice(searchParams.get("max_price") || "");
      setSortBy(searchParams.get("sort_by") || "");
      setStock(searchParams.get("stock") || "");
      prevSearchParamsRef.current = currentSearchString;
    }
  }, [searchParams]);

  const applyFilters = useCallback(
    (overrides: UrlFilterValues = {}) => {
      const merged: UrlFilterValues = {
        min_price: minPrice,
        max_price: maxPrice,
        sort_by: sortBy,
        stock,
        ...overrides,
      };
      const params = new URLSearchParams(searchParams.toString());

      // Preserve existing params (category, brand, etc.)
      params.set("page", "1");

      // Update filter params
      if (merged.min_price) {
        params.set("min_price", merged.min_price);
      } else {
        params.delete("min_price");
      }

      if (merged.max_price) {
        params.set("max_price", merged.max_price);
      } else {
        params.delete("max_price");
      }

      if (merged.sort_by) {
        params.set("sort_by", merged.sort_by);
      } else {
        params.delete("sort_by");
      }

      if (merged.stock) {
        params.set("stock", merged.stock);
      } else {
        params.delete("stock");
      }

      // Use startTransition to make this a non-blocking update
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [
      minPrice,
      maxPrice,
      sortBy,
      stock,
      pathname,
      router,
      searchParams,
      startTransition,
    ],
  );

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setStock("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("min_price");
    params.delete("max_price");
    params.delete("sort_by");
    params.delete("stock");
    params.set("page", "1");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const hasActiveFilters = minPrice || maxPrice || sortBy || stock;

  return (
    <>
      {/* ─────────────── DESKTOP FILTER STRIP ─────────────────── */}
      <div className="hidden lg:flex items-end gap-3 mb-6 flex-wrap">
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
              value={minPrice}
              min={0}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className={`${inputCls} w-20`}
            />
            <span className="text-gray-300 text-sm">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
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

        {hasActiveFilters && (
          <>
            <div className="h-5 w-px bg-gray-200 self-end mb-1" />
            <button
              onClick={clearFilters}
              className="self-end h-[38px] flex items-center gap-1.5 text-[12px] text-teal-500 hover:text-teal-700 hover:bg-teal-50 px-3 rounded-lg transition-all"
            >
              <X size={12} strokeWidth={2.5} /> Clear all
            </button>
          </>
        )}
      </div>

      {/* ─────────────── MOBILE TRIGGER BAR ───────────────────── */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 h-[40px] px-4 bg-secondary text-white rounded-lg text-sm font-medium transition-colors"
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="bg-white/25 text-white text-[11px] font-semibold rounded-full px-2 py-0.5">
              {[minPrice, maxPrice, sortBy, stock].filter(Boolean).length}
            </span>
          )}
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
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-50 text-teal-600 border border-teal-200 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                Active
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close filters"
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={14} className="text-gray-600" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
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
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-[40px] w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
              <span className="text-gray-300 self-center">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
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
          {hasActiveFilters && (
            <button
              onClick={() => {
                clearFilters();
                setSidebarOpen(false);
              }}
              className="w-full h-[38px] bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm rounded-xl border border-gray-200 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Main Export wrapped in Suspense for SSR/SSG safety ───────── */
export default function Filter(props: FilterProps) {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-full animate-pulse bg-gray-100 rounded-lg mb-6" />
      }
    >
      <FilterContent {...props} />
    </Suspense>
  );
}
