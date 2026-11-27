"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Pagination from "@/Components/Shop/Pagination";
import CardMain from "../ReuseableComponent/CardMain";
import UsedDeviceFilter from "./UsedDeviceFilter";
import { MdVerified } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import type { UsedDeviceClientProps } from "@/types/props/product";
import { fieldsOf, lengthStrict, lowerOpt, mapList, rec, requireString, spreadList } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

// `(p.final_price || p.regular_price)` for price filters / sorting — throws for a null product, as before
const priceOf = (product: unknown): unknown => fieldsOf(product).final_price || fieldsOf(product).regular_price;

export default function PreownedDeviceClient({
  initialProducts,
  seoData,
  pagination,
  currentPage,
  filterData,
  categories,
  selectedBrand: initialBrand,
  selectedCategory: initialCategory,
  searchTerm,
  currentFilters,
}: UsedDeviceClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState<unknown>(searchTerm || "");

  // Get current filter values directly from URL (no state needed)
  const selectedBrand = searchParams.get("brand") || null;
  const selectedCategory = searchParams.get("category") || null;

  // Client-side filtering for price, stock, and sorting only
  // (brand, category, search are handled server-side)
  const products = useMemo(() => {
    let filtered = spreadList(initialProducts || []);

    // Filter by search term (client-side for instant results)
    if (requireString(searchInput).trim()) {
      const searchLower = requireString(searchInput).toLowerCase();
      filtered = filtered.filter((product) => lowerOpt(fieldsOf(product).product_name)?.includes(searchLower));
    }

    // Filter by price range
    const minPrice = currentFilters.min_price ? parseFloat(String(currentFilters.min_price)) : null;
    const maxPrice = currentFilters.max_price ? parseFloat(String(currentFilters.max_price)) : null;

    if (minPrice !== null || maxPrice !== null) {
      filtered = filtered.filter((product) => {
        const price = Number(priceOf(product));
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      });
    }

    // Filter by stock availability
    if (currentFilters.stock === "in_stock") {
      filtered = filtered.filter((product) => fieldsOf(product).is_stock === true);
    } else if (currentFilters.stock === "out_of_stock") {
      filtered = filtered.filter((product) => fieldsOf(product).is_stock === false);
    }

    // Sort products
    if (currentFilters.sort_by === "price_asc") {
      filtered.sort((a, b) => Number(priceOf(a)) - Number(priceOf(b)));
    } else if (currentFilters.sort_by === "price_desc") {
      filtered.sort((a, b) => Number(priceOf(b)) - Number(priceOf(a)));
    } else if (currentFilters.sort_by === "newest") {
      filtered.sort((a, b) => Number(fieldsOf(b).id) - Number(fieldsOf(a).id));
    }

    return filtered;
  }, [initialProducts, searchInput, currentFilters]);

  // Sync search input with URL param on mount/navigation (browser back/forward)
  // This is intentional - we need to update local state when URL changes externally
  useEffect(() => {
    setSearchInput(searchTerm || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleBrandFilter = (brandSlug: unknown) => {
    startTransition(() => {
      const nextBrand = brandSlug === "all" || brandSlug === selectedBrand ? null : brandSlug;
      const urlParams = new URLSearchParams(searchParams.toString());

      if (nextBrand) {
        urlParams.set("brand", String(nextBrand));
      } else {
        urlParams.delete("brand");
      }

      // Reset to page 1 when filtering
      urlParams.delete("page");

      const newUrl = `${pathname}${urlParams.toString() ? `?${urlParams}` : ""}`;
      router.push(newUrl, { scroll: false });
    });
  };

  const handleCategoryFilter = (categorySlug: unknown) => {
    startTransition(() => {
      const nextCategory = categorySlug === "all" || categorySlug === selectedCategory ? null : categorySlug;
      const urlParams = new URLSearchParams(searchParams.toString());

      if (nextCategory) {
        urlParams.set("category", String(nextCategory));
      } else {
        urlParams.delete("category");
      }

      // Reset to page 1 when filtering
      urlParams.delete("page");

      const newUrl = `${pathname}${urlParams.toString() ? `?${urlParams}` : ""}`;
      router.push(newUrl, { scroll: false });
    });
  };

  // 1. Calculate the split point (50% of products)
  // 2. Ensure the split point is a multiple of 4 so the grid rows are full
  const halfCount = Math.floor(products.length / 2);
  const splitPoint = Math.max(4, halfCount - (halfCount % 4));

  const firstHalf = products.slice(0, splitPoint);
  const secondHalf = products.slice(splitPoint);

  return (
    <div>
      <Banner image={rec(seoData)?.banner || "/loginPage/contact-about-bg.webp"} title={rec(seoData)?.title || "Pre-owned Devices"} />
      <Breadcrumbs />

      {/* Header Section with Logo, Title, Brands & Search */}
      <div className="flex items-center lg:items-start gap-3 lg:gap-4 flex-1 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image src="/sidebar-icons/used-device.png" alt="Used Device" width={60} height={60} className="object-contain w-full" />
        </div>
        {/* Title & Brand Chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Used Device</h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>

          {/* Brand Chips - Desktop */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {mapList(filterData, (brand) => {
              const isActive = fieldsOf(brand).slug === "all" ? !selectedBrand : selectedBrand === fieldsOf(brand).slug;

              return (
                <button
                  key={idKey(brand)}
                  onClick={() => handleBrandFilter(fieldsOf(brand).slug)}
                  disabled={isPending}
                  className={`
                    group shrink-0 flex items-center justify-center transition-all duration-200
                    px-4 py-2 rounded-lg text-sm font-medium
                    hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isActive ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
                  `}
                >
                  {fieldsOf(brand).secondary_logo ? (
                    <div className="relative w-16 h-5">
                      <Image
                        src={str(fieldsOf(brand).secondary_logo) ?? ""}
                        alt={str(fieldsOf(brand).name) ?? ""}
                        fill
                        className={`object-contain transition-all duration-200 ${isActive ? "brightness-0 invert" : ""}`}
                        sizes="64px"
                        priority={false}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold whitespace-nowrap">{nodeOf(fieldsOf(brand).name)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search products..."
            value={String(searchInput)}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isPending}
            className="w-64 px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

      {/* Mobile Brand Chips */}
      <div className="lg:hidden mb-4 flex flex-wrap items-center gap-2">
        {mapList(filterData, (brand) => {
          const isActive = fieldsOf(brand).slug === "all" ? !selectedBrand : selectedBrand === fieldsOf(brand).slug;

          return (
            <button
              key={idKey(brand)}
              onClick={() => handleBrandFilter(fieldsOf(brand).slug)}
              disabled={isPending}
              className={`
                group shrink-0 flex items-center justify-center transition-all duration-200
                px-4 py-2 rounded-lg text-sm font-medium
                hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
              `}
            >
              {fieldsOf(brand).secondary_logo ? (
                <div className="relative w-16 h-5">
                  <Image
                    src={str(fieldsOf(brand).secondary_logo) ?? ""}
                    alt={str(fieldsOf(brand).name) ?? ""}
                    fill
                    className={`object-contain transition-all duration-200 ${isActive ? "brightness-0 invert" : ""}`}
                    sizes="64px"
                    priority={false}
                  />
                </div>
              ) : (
                <span className="font-semibold whitespace-nowrap">{nodeOf(fieldsOf(brand).name)}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden mb-4 relative">
        <input
          type="text"
          placeholder="Search products..."
          value={String(searchInput)}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={isPending}
          className="w-full px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>

      {/* Category Filter Row */}
      {nodeOf(categories && Number(lengthStrict(categories)) > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5 lg:mb-6 pb-5 lg:pb-6 border-b border-gray-200">
          <button
            onClick={() => handleCategoryFilter("all")}
            disabled={isPending}
            className={`
              shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              ${!selectedCategory ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
            `}
          >
            All Categories
          </button>
          {mapList(categories, (category) => {
            const isActive = selectedCategory === fieldsOf(category).slug;

            return (
              <button
                key={idKey(category)}
                onClick={() => handleCategoryFilter(fieldsOf(category).slug)}
                disabled={isPending}
                className={`
                  shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isActive ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
                `}
              >
                {nodeOf(fieldsOf(category).name)}
              </button>
            );
          })}
        </div>
      ))}

      {/* Filter Component */}
      <UsedDeviceFilter currentFilters={currentFilters} />

      {/* First Section: Multiple of 4 cards */}
      {firstHalf.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 my-gap ">
          {firstHalf.map((product) => (
            <CardMain
              key={idKey(product)}
              product={product}
              name={rec(product)?.product_name}
              category={rec(rec(product)?.category)?.name}
              categoryLink={lowerOpt(rec(rec(product)?.category)?.slug)}
              currentPrice={rec(product)?.final_price}
              originalPrice={rec(product)?.regular_price}
              discountPercentage={rec(product)?.discount_label}
              rating={Number(rec(product)?.total_review) > 0 ? rec(product)?.total_review : ""}
              image={rec(product)?.product_image}
              link={rec(product)?.slug}
              isStock={rec(product)?.is_stock}
              from={"preOwned"}
              quantity={rec(product)?.total_pre_owned}
              priceRange={rec(product)?.price_range}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-8">
          <h3 className="text-lg font-semibold text-gray-900">{requireString(searchTerm).trim() ? `No products found for "${String(searchTerm)}"` : "No products found for this brand"}</h3>
        </div>
      )}
      {/* Mid-Page Banner */}
      <div className="my-mt">
        {/* {currentPage === 1 && seoData?.info_banner && (
          <div className="w-full h-30 lg:h-50 xl:h-60 my-4 lg:my-6 xl:my-8 overflow-hidden">
            <Image
              src={seoData?.info_banner}
              alt={seoData?.title || "Promotion"}
              width={4000}
              height={3000}
              className="w-full h-full object-cover rounded-2xl lg:rounded-3xl"
              unoptimized
              priority
              // Add sizes to help Next.js serve smaller versions to mobile
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1600px"
            />
          </div>
        )} */}
      </div>
      {/* Second Section: Remaining cards */}
      {secondHalf.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 my-gap mb-8">
          {secondHalf.map((product) => (
            <CardMain
              key={idKey(product)}
              product={product}
              name={rec(product)?.product_name}
              category={rec(rec(product)?.category)?.name}
              categoryLink={lowerOpt(rec(rec(product)?.category)?.slug)}
              currentPrice={rec(product)?.final_price}
              originalPrice={rec(product)?.regular_price}
              discountPercentage={rec(product)?.discount_label}
              rating={Number(rec(product)?.total_review) > 0 ? rec(product)?.total_review : ""}
              image={rec(product)?.product_image}
              link={rec(product)?.slug}
              isStock={rec(product)?.is_stock}
              from={"preOwned"}
              quantity={rec(product)?.total_pre_owned}
              priceRange={rec(product)?.price_range}
            />
          ))}
        </div>
      )}
      {/* Pagination - hide when client-side filters are active */}
      {!requireString(searchInput).trim() && !currentFilters.min_price && !currentFilters.max_price && !currentFilters.sort_by && !currentFilters.stock && (
        <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
      )}

      {nodeOf((requireString(searchInput).trim() || currentFilters.min_price || currentFilters.max_price || currentFilters.sort_by || currentFilters.stock) && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-secondary">{products.length}</span> filtered result{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
