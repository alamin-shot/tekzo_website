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
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchTerm || "");

  // Get current filter values directly from URL (no state needed)
  const selectedBrand = searchParams.get("brand") || null;
  const selectedCategory = searchParams.get("category") || null;

  // Client-side filtering for price, stock, and sorting only
  // (brand, category, search are handled server-side)
  const products = useMemo(() => {
    let filtered = [...(initialProducts || [])];

    // Filter by search term (client-side for instant results)
    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase();
      filtered = filtered.filter((product) => product.product_name?.toLowerCase().includes(searchLower));
    }

    // Filter by price range
    const minPrice = currentFilters.min_price ? parseFloat(currentFilters.min_price) : null;
    const maxPrice = currentFilters.max_price ? parseFloat(currentFilters.max_price) : null;

    if (minPrice !== null || maxPrice !== null) {
      filtered = filtered.filter((product) => {
        const price = product.final_price || product.regular_price;
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      });
    }

    // Filter by stock availability
    if (currentFilters.stock === "in_stock") {
      filtered = filtered.filter((product) => product.is_stock === true);
    } else if (currentFilters.stock === "out_of_stock") {
      filtered = filtered.filter((product) => product.is_stock === false);
    }

    // Sort products
    if (currentFilters.sort_by === "price_asc") {
      filtered.sort((a, b) => (a.final_price || a.regular_price) - (b.final_price || b.regular_price));
    } else if (currentFilters.sort_by === "price_desc") {
      filtered.sort((a, b) => (b.final_price || b.regular_price) - (a.final_price || a.regular_price));
    } else if (currentFilters.sort_by === "newest") {
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [initialProducts, searchInput, currentFilters]);

  // Sync search input with URL param on mount/navigation (browser back/forward)
  // This is intentional - we need to update local state when URL changes externally
  useEffect(() => {
    setSearchInput(searchTerm || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleBrandFilter = (brandSlug) => {
    startTransition(() => {
      const nextBrand = brandSlug === "all" || brandSlug === selectedBrand ? null : brandSlug;
      const urlParams = new URLSearchParams(searchParams.toString());

      if (nextBrand) {
        urlParams.set("brand", nextBrand);
      } else {
        urlParams.delete("brand");
      }

      // Reset to page 1 when filtering
      urlParams.delete("page");

      const newUrl = `${pathname}${urlParams.toString() ? `?${urlParams}` : ""}`;
      router.push(newUrl, { scroll: false });
    });
  };

  const handleCategoryFilter = (categorySlug) => {
    startTransition(() => {
      const nextCategory = categorySlug === "all" || categorySlug === selectedCategory ? null : categorySlug;
      const urlParams = new URLSearchParams(searchParams.toString());

      if (nextCategory) {
        urlParams.set("category", nextCategory);
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
      <Banner image={seoData?.banner || "/loginPage/contact-about-bg.webp"} title={seoData?.title || "Pre-owned Devices"} />
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
            {filterData.map((brand) => {
              const isActive = brand.slug === "all" ? !selectedBrand : selectedBrand === brand.slug;

              return (
                <button
                  key={brand.id}
                  onClick={() => handleBrandFilter(brand.slug)}
                  disabled={isPending}
                  className={`
                    group shrink-0 flex items-center justify-center transition-all duration-200
                    px-4 py-2 rounded-lg text-sm font-medium
                    hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isActive ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
                  `}
                >
                  {brand.secondary_logo ? (
                    <div className="relative w-16 h-5">
                      <Image
                        src={brand.secondary_logo}
                        alt={brand.name}
                        fill
                        className={`object-contain transition-all duration-200 ${isActive ? "brightness-0 invert" : ""}`}
                        sizes="64px"
                        priority={false}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold whitespace-nowrap">{brand.name}</span>
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isPending}
            className="w-64 px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
            className="w-64 px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

      {/* Mobile Brand Chips */}
      <div className="lg:hidden mb-4 flex flex-wrap items-center gap-2">
        {filterData.map((brand) => {
          const isActive = brand.slug === "all" ? !selectedBrand : selectedBrand === brand.slug;

          return (
            <button
              key={brand.id}
              onClick={() => handleBrandFilter(brand.slug)}
              disabled={isPending}
              className={`
                group shrink-0 flex items-center justify-center transition-all duration-200
                px-4 py-2 rounded-lg text-sm font-medium
                hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
              `}
            >
              {brand.secondary_logo ? (
                <div className="relative w-16 h-5">
                  <Image
                    src={brand.secondary_logo}
                    alt={brand.name}
                    fill
                    className={`object-contain transition-all duration-200 ${isActive ? "brightness-0 invert" : ""}`}
                    sizes="64px"
                    priority={false}
                  />
                </div>
              ) : (
                <span className="font-semibold whitespace-nowrap">{brand.name}</span>
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={isPending}
          className="w-full px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>

      {/* Category Filter Row */}
      {categories && categories.length > 0 && (
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
          {categories.map((category) => {
            const isActive = selectedCategory === category.slug;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.slug)}
                disabled={isPending}
                className={`
                  shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isActive ? "bg-secondary text-white shadow-md shadow-secondary/30" : "bg-white border border-gray-200 text-gray-700 hover:border-secondary/30 hover:bg-secondary/5"}
                `}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Component */}
      <UsedDeviceFilter currentFilters={currentFilters} />

      {/* First Section: Multiple of 4 cards */}
      {firstHalf.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 my-gap ">
          {firstHalf.map((product) => (
            <CardMain
              key={product.id}
              product={product}
              name={product?.product_name}
              category={product?.category?.name}
              categoryLink={product?.category?.slug?.toLowerCase()}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discountPercentage={product?.discount_label}
              rating={product?.total_review > 0 ? product?.total_review : ""}
              image={product?.product_image}
              link={product?.slug}
              isStock={product?.is_stock}
              from={"preOwned"}
              quantity={product?.total_pre_owned}
              priceRange={product?.price_range}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-8">
          <h3 className="text-lg font-semibold text-gray-900">{searchTerm.trim() ? `No products found for "${searchTerm}"` : "No products found for this brand"}</h3>
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
              key={product.id}
              product={product}
              name={product?.product_name}
              category={product?.category?.name}
              categoryLink={product?.category?.slug?.toLowerCase()}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discountPercentage={product?.discount_label}
              rating={product?.total_review > 0 ? product?.total_review : ""}
              image={product?.product_image}
              link={product?.slug}
              isStock={product?.is_stock}
              from={"preOwned"}
              quantity={product?.total_pre_owned}
              priceRange={product?.price_range}
            />
          ))}
        </div>
      )}
      {/* Pagination - hide when client-side filters are active */}
      {!searchInput.trim() && !currentFilters.min_price && !currentFilters.max_price && !currentFilters.sort_by && !currentFilters.stock && (
        <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
      )}

      {(searchInput.trim() || currentFilters.min_price || currentFilters.max_price || currentFilters.sort_by || currentFilters.stock) && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-secondary">{products.length}</span> filtered result{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
