"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MdVerified } from "react-icons/md";
import { ShieldCheck, BatteryCharging, Sparkles, Award, X } from "lucide-react";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import Pagination from "@/Components/Shop/Pagination";
import type { RefurbishedFilterOverrides, RefurbishedSlugDetailProps } from "@/types/props/product";
import { fieldsOf, lengthStrict, lowerOpt, mapList, rec, requireString, spreadList } from "@/lib/json";
import { idKey, keyFrom, nodeOf, str } from "@/lib/render";

// `(p.final_price || p.regular_price || 0)` in price filters / sorting (`>=` / `-` convert as Number() does)
const priceOf = (p: unknown): number => Number(fieldsOf(p).final_price || fieldsOf(p).regular_price || 0);
// `(value || "").toLowerCase()` (a non-string value threw, as before)
const lowerOr = (value: unknown): string => requireString(value || "").toLowerCase();

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const STOCK_OPTIONS = [
  { label: "All", value: "" },
  { label: "In Stock", value: "in_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
];

export default function RefurbishedSlugDetail({
  slug,
  title,
  logo,
  tagline,
  products = [],
  pagination,
  currentPage = 1,
  subCategories = [],
  brands = [],
  activeBrand = "",
}: RefurbishedSlugDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sort_by") || "";
  const stock = searchParams.get("stock") || "";
  const [minPrice, setMinPrice] = useState(() => searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("max_price") || "");

  const applyFilters = (overrides: RefurbishedFilterOverrides = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = {
      sort_by: sortBy,
      stock,
      min_price: minPrice,
      max_price: maxPrice,
      ...overrides,
    };

    if (merged.sort_by) params.set("sort_by", merged.sort_by);
    else params.delete("sort_by");

    if (merged.stock) params.set("stock", merged.stock);
    else params.delete("stock");

    if (merged.min_price) params.set("min_price", merged.min_price);
    else params.delete("min_price");

    if (merged.max_price) params.set("max_price", merged.max_price);
    else params.delete("max_price");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sort_by");
    params.delete("stock");
    params.delete("min_price");
    params.delete("max_price");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleBrandTabClick = (brandSlug: unknown) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandSlug && brandSlug !== "all") {
      params.set("brand", String(brandSlug));
    } else {
      params.delete("brand");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters =
    Boolean(sortBy) ||
    Boolean(stock) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(activeBrand);

  // Client-side sorting & filtering on current page products
  const filteredProducts = useMemo(() => {
    let list = spreadList(products);

    if (activeBrand) {
      const bLower = requireString(activeBrand).toLowerCase();
      list = list.filter((p) => {
        const pBrand = lowerOpt(rec(fieldsOf(p).brand)?.slug) || lowerOpt(rec(fieldsOf(p).brand)?.name);
        const pCat = lowerOpt(rec(fieldsOf(p).category)?.slug) || lowerOpt(rec(fieldsOf(p).category)?.name);
        const pName = lowerOr(fieldsOf(p).product_name || fieldsOf(p).name);
        const pSlug = lowerOr(fieldsOf(p).slug);

        return (
          pBrand === bLower ||
          pCat === bLower ||
          (bLower === "apple" && (pCat === "iphone" || pBrand === "apple" || pName.includes("iphone") || pName.includes("apple") || pSlug.includes("iphone"))) ||
          (bLower === "samsung" && (pCat === "galaxy" || pBrand === "samsung" || pName.includes("samsung") || pName.includes("galaxy") || pSlug.includes("samsung"))) ||
          (bLower === "google" && (pCat === "pixel" || pBrand === "google" || pName.includes("pixel") || pName.includes("google") || pSlug.includes("pixel"))) ||
          pName.includes(bLower) ||
          pSlug.includes(bLower)
        );
      });
    }

    if (stock) {
      list = list.filter((p) => {
        if (stock === "in_stock") return fieldsOf(p).is_stock === true || fieldsOf(p).is_stock === 1;
        if (stock === "out_of_stock") return fieldsOf(p).is_stock === false || fieldsOf(p).is_stock === 0;
        return true;
      });
    }

    if (minPrice) {
      list = list.filter((p) => priceOf(p) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      list = list.filter((p) => priceOf(p) <= parseFloat(maxPrice));
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => priceOf(b) - priceOf(a));
    }

    return list;
  }, [products, activeBrand, stock, minPrice, maxPrice, sortBy]);

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center lg:items-start gap-3 lg:gap-4 flex-1 mb-4">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
          {logo ? (
            <Image
              src={str(logo) ?? ""}
              alt={str(title) ?? ""}
              width={60}
              height={60}
              className="object-contain w-full"
            />
          ) : (
            <Image
              src="/sidebar-icons/used-device.png"
              alt={str(title) ?? ""}
              width={60}
              height={60}
              className="object-contain w-full"
            />
          )}
        </div>

        {/* Title & Brand/Category Tabs */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">
              Refurbished {nodeOf(title)}
            </h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>

          {nodeOf(tagline && (
            <p className="text-xs text-gray-500 italic mb-3">
              {nodeOf(tagline)}
            </p>
          ))}

          {/* Brand/Model Tabs */}
          {Number(lengthStrict(brands)) > 0 && (
            <div className="flex flex-wrap gap-1.5 lg:gap-2">
              <button
                onClick={() => handleBrandTabClick("all")}
                className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
                  !activeBrand
                    ? "text-white bg-secondary border border-secondary hover:bg-secondary/90"
                    : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
                }`}
              >
                All {nodeOf(title)}
              </button>

              {mapList(brands, (b) => (
                <button
                  key={keyFrom(fieldsOf(b).id || fieldsOf(b).slug)}
                  onClick={() => handleBrandTabClick(fieldsOf(b).slug)}
                  className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
                    activeBrand === fieldsOf(b).slug
                      ? "text-white bg-secondary border border-secondary hover:bg-secondary/90"
                      : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
                  }`}
                >
                  {nodeOf(fieldsOf(b).name)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trust Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 lg:gap-4 mb-6">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">32-Point Inspection</p>
            <p className="text-[11px] text-gray-500 truncate">Genuine {nodeOf(title)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 shadow-xs">
          <BatteryCharging className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">85%+ Battery</p>
            <p className="text-[11px] text-gray-500 truncate">Peak Performance</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 shadow-xs">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">Certified Grade A+</p>
            <p className="text-[11px] text-gray-500 truncate">Pristine Condition</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 shadow-xs">
          <Award className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">Replacement Warranty</p>
            <p className="text-[11px] text-gray-500 truncate">Official Service</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Strip */}
      <div className="hidden lg:flex items-end gap-3 mb-6 flex-wrap">
        {/* Sort by */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Sort by
          </span>
          <div className="w-[160px]">
            <select
              value={sortBy}
              onChange={(e) => {
                applyFilters({ sort_by: e.target.value });
              }}
              className="h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Availability */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Availability
          </span>
          <div className="w-[140px]">
            <select
              value={stock}
              onChange={(e) => {
                applyFilters({ stock: e.target.value });
              }}
              className="h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all cursor-pointer"
            >
              {STOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 self-end mb-1" />

        {/* Price Range */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Price range
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              min={0}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="h-[38px] w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
            />
            <span className="text-gray-300 text-sm">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              min={0}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="h-[38px] w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
            />
            <button
              onClick={() => applyFilters()}
              className="h-[38px] px-4 bg-secondary hover:bg-secondary/90 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <>
            <div className="h-5 w-px bg-gray-200 self-end mb-1" />
            <button
              onClick={clearAllFilters}
              className="self-end h-[38px] flex items-center gap-1.5 text-[12px] text-teal-600 hover:text-teal-800 hover:bg-teal-50 px-3 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          </>
        )}
      </div>

      {/* Mobile Filter Controls */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-4">
        <div className="relative flex-1">
          <select
            value={sortBy}
            onChange={(e) => {
              applyFilters({ sort_by: e.target.value });
            }}
            className="h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <select
            value={stock}
            onChange={(e) => {
              applyFilters({ stock: e.target.value });
            }}
            className="h-[38px] w-full bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
          >
            {STOCK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="h-[38px] px-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg border border-rose-200 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Product Grid - Using standard CardMain in grid-cols-2 lg:grid-cols-4 */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
            {filteredProducts.map((product) => (
              <CardMain
                key={idKey(product)}
                product={product}
                name={rec(product)?.product_name || rec(product)?.name}
                category={rec(rec(product)?.category)?.name || rec(rec(product)?.brand)?.name || "Smartphone"}
                categoryLink={lowerOpt(rec(rec(product)?.category)?.slug) || lowerOpt(rec(rec(product)?.brand)?.slug) || "smartphones"}
                badge={rec(product)?.product_badge || "Refurbished"}
                currentPrice={rec(product)?.final_price}
                originalPrice={rec(product)?.regular_price}
                discount={rec(product)?.discount_amount}
                discountPercentage={rec(product)?.discount_label}
                discountAmount={rec(product)?.discount_amount}
                rating={rec(product)?.rating || rec(product)?.avg_rating || 5}
                image={rec(product)?.product_image}
                link={rec(product)?.slug}
                isStock={rec(product)?.is_stock}
                from={"refurbished-smartphones"}
                categoryPageName={rec(rec(product)?.brand)?.name || rec(rec(product)?.category)?.name}
                categoryPageLink={rec(rec(product)?.brand)?.slug || rec(rec(product)?.category)?.slug}
              />
            ))}
          </div>

          {/* Pagination */}
          {nodeOf(pagination && (
            <Pagination
              shopProducts={{ pagination }}
              currentPage={currentPage}
            />
          ))}
        </>
      ) : (
        <NoProductFound />
      )}
    </>
  );
}
