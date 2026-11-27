"use client";
import React, { useState, useEffect, useRef, useCallback, useTransition } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import Image from "next/image";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import CategoryProducts from "./CategoryProducts";
import { useRouter, useSearchParams } from "next/navigation";
import { MdVerified } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import Filter from "./Filter";
import type { SingleCategoryProps } from "@/types/props/shop";
import { fieldsOf, mapOpt, rec } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

const SingleCategory = ({
  product,
  activeCategory,
  activeBrand,
  fromCategory,
  pagination,
  currentPage,
}: SingleCategoryProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams?.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);
  const isInitialMount = useRef(true);

  // Sync state if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setSearchQuery(currentSearch);
    setIsTyping(false);
  }, [currentSearch]);

  const updateSearchParam = useCallback(
    (term: string) => {
      setIsTyping(false);
      const params = new URLSearchParams(window.location.search);
      const trimmed = term.trim();
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `?${query}` : window.location.pathname, { scroll: false });
      });
    },
    [router]
  );

  // Debounce URL update when searchQuery changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const currentParam = params.get("search") || "";
      if (currentParam === searchQuery.trim()) return;
      updateSearchParam(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, updateSearchParam]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsTyping(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateSearchParam(searchQuery);
    }
  };

  const tabBase =
    // Same 40px height as the brand-logo chips; text tabs take 2 cells of the
    // mobile grid so longer names fit.
    "col-span-2 lg:col-span-1 h-10 px-3 lg:px-5 flex items-center justify-center rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap truncate cursor-pointer";
  const tabActive = "bg-secondary text-white shadow-md";
  const tabInactive = "bg-[#F3F4F6] text-gray-600 hover:bg-gray-200";

  // Pass currentFilters from URL to Filter component
  const handleFilterChange = (filters: unknown) => {
    // Filters are already handled by Filter component's router.push
    // This is just to maintain component hierarchy
  };

  const handleFilter = (slug: unknown, type: "category" | "brand") => {
    const params = new URLSearchParams(window.location.search);

    if (type === "category") {
      if (slug === "all") {
        params.delete("category");
      } else {
        params.set("category", String(slug));
      }
      params.delete("brand"); // mutual exclusion
    } else if (type === "brand") {
      if (slug === "all") {
        params.delete("brand");
      } else {
        params.set("brand", String(slug));
      }
      params.delete("category"); // mutual exclusion
    }

    // Reset to page 1 when changing category/brand
    params.set("page", "1");

    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  const info = rec(product);

  // Extracted to avoid duplicating JSX for desktop/mobile
  // (`item.id` / `item.slug` threw for a null item; idKey / fieldsOf keep that)
  const categoryTabs = mapOpt(info?.categories, (item) => (
    <button
      key={idKey(item)}
      onClick={() => handleFilter(fieldsOf(item).slug, "category")}
      className={`${tabBase} ${activeCategory === fieldsOf(item).slug ? tabActive : tabInactive}`}
    >
      {nodeOf(fieldsOf(item).name)}
    </button>
  ));

  const brandTabs = mapOpt(info?.brands, (item) => (
    <button
      key={idKey(item)}
      title={str(rec(item)?.name)}
      onClick={() => handleFilter(fieldsOf(item).slug, "brand")}
      // Fixed-size chip: every brand gets the same box and its logo is fitted
      // inside, so tall (ZTE, itel) and wide (Samsung, OPPO) logos line up.
      className={`h-10 w-full lg:w-24 px-2 flex items-center justify-center rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeBrand === fieldsOf(item).slug ? "bg-secondary text-white shadow-md" : "bg-gray-100"}`}
    >
      {fieldsOf(item).name === "All Products" ? (
        <span className="truncate">All Products</span>
      ) : (
        <Image
          src={str(rec(item)?.primary_logo) ?? ""}
          alt={str(rec(item)?.name) ?? ""}
          title={str(rec(item)?.name)}
          width={128}
          height={96}
          className="h-auto w-auto max-h-6 max-w-full object-contain"
        />
      )}
    </button>
  ));

  return (
    <div>
      <Breadcrumbs />
      <header className="w-full">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Logo */}
            <div className="w-17 h-17 lg:w-26 lg:h-26 p-2 shrink-0 rounded-full border-2 lg:border-4 border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
              {nodeOf(info?.logo && (
                <Image
                  src={str(info.logo) ?? ""}
                  alt={str(info.name || "Product Logo") ?? ""}
                  width={60}
                  height={60}
                  className="object-contain w-12 h-12 lg:w-17 lg:h-17"
                />
              ))}
            </div>

            <div className="lg:space-y-2.5">
              <div>
                <h1 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-700 capitalize flex gap-3 items-center">
                  {nodeOf(info?.name)}
                  <MdVerified className="text-blue-500" />
                </h1>
                <p className="mt-px italic text-xs font-medium uppercase tracking-widest text-slate-500">
                  {nodeOf(info?.tagline)}
                </p>
              </div>
              {/* Desktop tabs */}
              <div className="hidden lg:flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
                {categoryTabs}
                {brandTabs}
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden xl:flex items-center relative shrink-0">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-64 px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all text-sm"
            />
            <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
          </div>

          {/* Mobile tabs: equal-width grid so brand chips line up in rows */}
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:hidden gap-2">
            {categoryTabs}
            {brandTabs}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="xl:hidden mt-4 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 pr-10 border bg-dark border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all text-sm"
          />
          <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
        </div>
      </header>
      <div className="h-6 2xl:h-8"></div>
      <Filter></Filter>
      <CategoryProducts
        fromCategory={fromCategory}
        product={product}
        onFiltersChange={handleFilterChange}
        pagination={pagination}
        currentPage={currentPage}
        isSearching={isPending || isTyping}
      />
    </div>
  );
};

export default SingleCategory;
