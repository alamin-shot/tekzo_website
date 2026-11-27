"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import type { CustomSelectProps, FilterFieldProps, FilterOption } from "@/types/props/shop";
import type { StorageComboboxProps, UsedFilterOverrides, UsedFilterProps } from "@/types/props/product";

// Filter values stay raw (pages may pass any search-param value); inputs and
// URLSearchParams stringify them exactly as React / `.set` did.
const text = (value: unknown): string => String(value);

const SORT_OPTIONS: FilterOption[] = [
  { label: "Default", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
];

const BATTERY_HEALTH_OPTIONS: FilterOption[] = [
  { label: "All", value: "" },
  { label: "Below 80%", value: "0-80" },
  { label: "80% - 85%", value: "80-85" },
  { label: "86% - 90%", value: "86-90" },
  { label: "91% - 95%", value: "91-95" },
  { label: "96% - 100%", value: "96-100" },
];

const STORAGE_OPTIONS: FilterOption[] = [
  { label: "All Storage", value: "" },
  { label: "128GB", value: "128" },
  { label: "256GB", value: "256" },
  { label: "512GB", value: "512" },
  { label: "1TB", value: "1024" },
];

const inputCls = `h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800
  focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400  focus:bg-white transition-all`;

/* ── Polished Custom Select ─────────────────────────────────── */
function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target instanceof Node ? e.target : null)) setOpen(false);
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
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <ul className="py-1 max-h-64 overflow-y-auto">
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

/* ── Storage Combobox (using hardcoded options) ───────────────────────────────────── */
function StorageCombobox({ value, onChange }: StorageComboboxProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target instanceof Node ? e.target : null)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedStorage = STORAGE_OPTIONS.find((s) => s.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`${inputCls} flex items-center justify-between text-left cursor-pointer`}
      >
        <span className="truncate">
          {selectedStorage?.label || "All Storage"}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
          <ul className="max-h-48 overflow-y-auto py-1">
            {STORAGE_OPTIONS.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 hover:text-teal-700
                  ${value === option.value ? "text-teal-700 font-medium bg-teal-50" : "text-gray-700"}`}
              >
                {option.label}
                {value === option.value && (
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

/* ── Main PreOwned Filter component ───────────────────────────────────── */
export default function PreOwnedFilter({ currentFilters = {} }: UsedFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  void isPending; // Used for transition state (optional loading indicator)

  const [minPrice, setMinPrice] = useState<unknown>(currentFilters.min_price || "");
  const [maxPrice, setMaxPrice] = useState<unknown>(currentFilters.max_price || "");
  const [sortBy, setSortBy] = useState<unknown>(currentFilters.sort_by || "");
  const [batteryHealth, setBatteryHealth] = useState<unknown>(
    currentFilters.battery_health || "",
  );
  const [storage, setStorage] = useState<unknown>(currentFilters.storage || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setSortBy(searchParams.get("sort_by") || "");
    setBatteryHealth(searchParams.get("battery_health") || "");
    setStorage(searchParams.get("storage") || "");
  }, [searchParams]);

  const applyFilters = useCallback(
    (overrides: UsedFilterOverrides = {}) => {
      const merged: UsedFilterOverrides = {
        min_price: minPrice,
        max_price: maxPrice,
        sort_by: sortBy,
        battery_health: batteryHealth,
        storage,
        condition: searchParams.get("condition") || "",
        ...overrides,
      };
      const params = new URLSearchParams(window.location.search);

      if (merged.min_price) params.set("min_price", text(merged.min_price));
      else params.delete("min_price");

      if (merged.max_price) params.set("max_price", text(merged.max_price));
      else params.delete("max_price");

      if (merged.sort_by) params.set("sort_by", text(merged.sort_by));
      else params.delete("sort_by");

      if (merged.battery_health)
        params.set("battery_health", text(merged.battery_health));
      else params.delete("battery_health");

      if (merged.storage) params.set("storage", text(merged.storage));
      else params.delete("storage");

      if (merged.condition) params.set("condition", text(merged.condition));

      const newUrl = `${pathname}${params.toString() ? `?${params}` : ""}`;
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [
      minPrice,
      maxPrice,
      sortBy,
      batteryHealth,
      storage,
      searchParams,
      pathname,
      router,
    ],
  );

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setBatteryHealth("");
    setStorage("");

    const params = new URLSearchParams(window.location.search);
    params.delete("min_price");
    params.delete("max_price");
    params.delete("sort_by");
    params.delete("battery_health");
    params.delete("storage");

    const newUrl = `${pathname}${params.toString() ? `?${params}` : ""}`;
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  const hasActiveFilters =
    Boolean(minPrice || maxPrice || sortBy || batteryHealth || storage);

  const ActivePill = () =>
    hasActiveFilters ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-50 text-secondary border border-teal-400 rounded-full px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
        Active
      </span>
    ) : null;

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

        <Field label="Storage">
          <div className="w-[140px]">
            <StorageCombobox
              value={storage}
              onChange={(val) => {
                setStorage(val);
                applyFilters({ storage: val });
              }}
            />
          </div>
        </Field>

        <Field label="Battery Health">
          <div className="w-[140px]">
            <CustomSelect
              value={batteryHealth}
              options={BATTERY_HEALTH_OPTIONS}
              onChange={(val) => {
                setBatteryHealth(val);
                applyFilters({ battery_health: val });
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

        {hasActiveFilters && (
          <>
            <div className="h-5 w-px bg-gray-200 self-end mb-1" />
            <button
              onClick={clearFilters}
              className="self-end h-[38px] flex items-center gap-1.5 text-[12px] text-secondary hover:text-teal-700 hover:bg-teal-50 px-3 rounded-lg transition-all"
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
              {
                [minPrice, maxPrice, sortBy, batteryHealth, storage].filter(
                  Boolean,
                ).length
              }
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
        className={`lg:hidden fixed inset-0 z-9000 bg-black/40 transition-opacity duration-300
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-9001 w-[300px] bg-white flex flex-col
        transition-transform duration-300 ease-in-out border-l border-gray-100
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-gray-500" />
            <span className="text-[15px] font-semibold text-gray-900">
              Filters
            </span>
            <ActivePill />
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
              Storage
            </p>
            <StorageCombobox
              value={storage}
              onChange={(val) => setStorage(val)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Battery Health
            </p>
            <CustomSelect
              value={batteryHealth}
              options={BATTERY_HEALTH_OPTIONS}
              onChange={(val) => setBatteryHealth(val)}
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
                className="h-[40px] w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all"
              />
              <span className="text-gray-300 self-center">—</span>
              <input
                type="number"
                placeholder="Max"
                value={text(maxPrice)}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-[40px] w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all"
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
