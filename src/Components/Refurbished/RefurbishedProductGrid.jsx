"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { ShieldCheck, BatteryCharging, Sparkles, Award, X, ChevronDown, Check } from "lucide-react";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";

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

export default function RefurbishedProductGrid({ initialProducts = [], brands = [], initialBrand = "", initialSearch = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fallback client-fetched data if mounted standalone without props
  const [clientProducts, setClientProducts] = useState([]);
  const [clientBrands, setClientBrands] = useState([]);

  useEffect(() => {
    let ignore = false;
    if (!initialProducts || initialProducts.length === 0) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (baseUrl) {
        fetch(`${baseUrl}/refurbisheds?per_page=100`)
          .then((r) => r.json())
          .then((res) => {
            if (!ignore) {
              const list = res?.data?.data || [];
              if (list.length > 0) setClientProducts(list);
            }
          })
          .catch((err) => console.error("Client Refurbisheds fetch error:", err));
      }
    }
    return () => {
      ignore = true;
    };
  }, [initialProducts]);

  useEffect(() => {
    let ignore = false;
    if (!brands || brands.length === 0) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (baseUrl) {
        fetch(`${baseUrl}/refurbished-brands`)
          .then((r) => r.json())
          .then((res) => {
            if (!ignore) {
              const list = res?.data || [];
              if (list.length > 0) setClientBrands(list);
            }
          })
          .catch((err) => console.error("Client Refurbished Brands fetch error:", err));
      }
    }
    return () => {
      ignore = true;
    };
  }, [brands]);

  const effectiveProducts = initialProducts?.length ? initialProducts : clientProducts;
  const effectiveBrands = brands?.length ? brands : clientBrands;

  // Values driven directly by URL
  const currentBrand = searchParams.get("brand") || initialBrand || "";
  const urlSearch = searchParams.get("search") || initialSearch || "";
  const sortBy = searchParams.get("sort_by") || "";
  const stock = searchParams.get("stock") || "";

  // Local input states for search and price range
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [minPrice, setMinPrice] = useState(() => searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("max_price") || "");

  const isInitialMount = useRef(true);

  // Sync search input if URL changes externally
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  // Handle brand click
  const handleBrandClick = (brandSlug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandSlug) {
      params.set("brand", brandSlug);
    } else {
      params.delete("brand");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Live search debounce to URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  // Handle price & filter apply
  const applyFilters = (overrides = {}) => {
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

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = Boolean(currentBrand) || Boolean(searchQuery) || Boolean(sortBy) || Boolean(stock) || Boolean(minPrice) || Boolean(maxPrice);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    let list = [...effectiveProducts];

    // Filter by Brand
    if (currentBrand) {
      const bLower = currentBrand.toLowerCase();
      list = list.filter((p) => {
        const pBrand = p.brand?.slug?.toLowerCase() || p.brand?.name?.toLowerCase();
        const pCat = p.category?.slug?.toLowerCase() || p.category?.name?.toLowerCase();
        const pName = (p.product_name || p.name || "").toLowerCase();
        const pSlug = (p.slug || "").toLowerCase();

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

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const name = (p.product_name || p.name || "").toLowerCase();
        const brand = (p.brand?.name || "").toLowerCase();
        const cat = (p.category?.name || "").toLowerCase();
        const headline = (p.headline || "").toLowerCase();
        return name.includes(q) || brand.includes(q) || cat.includes(q) || headline.includes(q);
      });
    }

    // Filter by Stock
    if (stock) {
      list = list.filter((p) => {
        if (stock === "in_stock") return p.is_stock === true || p.is_stock === 1;
        if (stock === "out_of_stock") return p.is_stock === false || p.is_stock === 0;
        return true;
      });
    }

    // Filter by Price Range
    if (minPrice) {
      list = list.filter((p) => (p.final_price || p.regular_price || 0) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      list = list.filter((p) => (p.final_price || p.regular_price || 0) <= parseFloat(maxPrice));
    }

    // Sort
    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.final_price || a.regular_price || 0) - (b.final_price || b.regular_price || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.final_price || b.regular_price || 0) - (a.final_price || a.regular_price || 0));
    }

    return list;
  }, [effectiveProducts, currentBrand, searchQuery, stock, minPrice, maxPrice, sortBy]);

  return (
    <>
      {/* Header with Logo, Title, Brand Chips & Search */}
      <div className="flex items-center lg:items-start gap-3 lg:gap-4 flex-1 mb-4">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image src="/sidebar-icons/used-device.png" alt="Refurbished" width={60} height={60} className="object-contain w-full" />
        </div>

        {/* Title & Desktop Brand Chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Certified Refurbished</h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>

          {/* Desktop Brand Chips */}
          <div className="hidden lg:flex flex-wrap gap-1.5 lg:gap-2">
            <button
              onClick={() => handleBrandClick("")}
              className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
                !currentBrand ? "text-white bg-secondary border border-secondary hover:bg-secondary/90" : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
              }`}
            >
              All Brands
            </button>

            {effectiveBrands.map((brand) => (
              <button
                key={brand.id || brand.slug}
                onClick={() => handleBrandClick(brand.slug)}
                className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
                  currentBrand?.toLowerCase() === brand.slug?.toLowerCase()
                    ? "text-white bg-secondary border border-secondary hover:bg-secondary/90"
                    : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search refurbished phones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-4 py-2 pr-10 border bg-dark border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

      {/* Mobile Brand Chips */}
      <div className="lg:hidden mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => handleBrandClick("")}
          className={`px-3.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
            !currentBrand ? "text-white bg-secondary border border-secondary hover:bg-secondary/90" : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
          }`}
        >
          All Brands
        </button>

        {effectiveBrands.map((brand) => (
          <button
            key={brand.id || brand.slug}
            onClick={() => handleBrandClick(brand.slug)}
            className={`px-3.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
              currentBrand?.toLowerCase() === brand.slug?.toLowerCase()
                ? "text-white bg-secondary border border-secondary hover:bg-secondary/90"
                : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
            }`}
          >
            {brand.name}
          </button>
        ))}
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden mb-4 relative">
        <input
          type="text"
          placeholder="Search refurbished phones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all text-sm"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>

      {/* Filter Toolbar Strip */}
      <div className="hidden lg:flex items-end gap-3  mb-6 flex-wrap mt-6">
        {/* Sort by */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Sort by</span>
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
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Availability</span>
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
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Price range</span>
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
            <button onClick={() => applyFilters()} className="h-[38px] px-4 bg-secondary hover:bg-secondary/90 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
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
          <button onClick={clearAllFilters} className="h-[38px] px-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg border border-rose-200 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Products Grid - Using standard CardMain in grid-cols-2 lg:grid-cols-4 */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
          {filteredProducts.map((product) => (
            <CardMain
              key={product.id}
              product={product}
              name={product?.product_name || product?.name}
              category={product?.category?.name || product?.brand?.name || "Smartphone"}
              categoryLink={product?.category?.slug?.toLowerCase() || product?.brand?.slug?.toLowerCase() || "smartphones"}
              badge={product?.product_badge || "Refurbished"}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discount={product?.discount_amount}
              discountPercentage={product?.discount_label}
              discountAmount={product?.discount_amount}
              rating={product?.rating || product?.avg_rating || 5}
              image={product?.product_image}
              link={product?.slug}
              isStock={product?.is_stock}
              from={"refurbished-smartphones"}
              categoryPageName={product?.brand?.name || product?.category?.name}
              categoryPageLink={product?.brand?.slug || product?.category?.slug}
            />
          ))}
        </div>
      ) : (
        <NoProductFound />
      )}
    </>
  );
}
