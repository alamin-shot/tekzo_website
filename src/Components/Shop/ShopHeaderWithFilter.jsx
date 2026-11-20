"use client";

import { useState, useEffect, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ShopHeaderWithFilter({ brands, currentBrand }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const isInitialMount = useRef(true);

  // Sync search query with current brand on mount and brand change
  useEffect(() => {
    if (currentBrand) {
      const selectedBrand = brands.find((b) => b.slug === currentBrand);
      if (selectedBrand) {
        setSearchQuery(selectedBrand.name);
      }
    } else {
      setSearchQuery("");
    }
  }, [currentBrand, brands]);

  // Live search: Apply brand filter as user types
  useEffect(() => {
    // Skip the initial mount to avoid unnecessary navigation
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");

      if (searchQuery.trim()) {
        // Find brands that match the search query
        const matchingBrands = brands.filter((brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // If exactly one brand matches, apply that brand filter automatically
        if (matchingBrands.length === 1) {
          params.set("brand", matchingBrands[0].slug);
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
        // If multiple brands match or no match, clear the filter if a non-matching brand is selected
        else {
          const currentBrandObj = brands.find((b) => b.slug === currentBrand);
          if (currentBrandObj && !currentBrandObj.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            params.delete("brand");
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          }
        }
      } else {
        // Clear brand filter when search is empty
        params.delete("brand");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 300); // 300ms debounce for instant feel

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBrandClick = (brandSlug) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (brandSlug) {
      params.set("brand", brandSlug);
      // Update search query to match selected brand
      const selectedBrand = brands.find((b) => b.slug === brandSlug);
      if (selectedBrand) {
        setSearchQuery(selectedBrand.name);
      }
    } else {
      params.delete("brand");
      setSearchQuery(""); // Clear search when "All Brands" is clicked
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Title, Brand Chips & Search Bar Section */}
      <div className="flex items-center lg:items-start gap-3 lg:gap-4 flex-1 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image src="/sidebar-icons/shop.png" alt="Shop" width={60} height={60} className="object-contain w-full" />
        </div>

        {/* Title & Brand Chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">TEKZO Shop</h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>

          {/* Brand Chips - Desktop - Always show all brands */}
          <div className="hidden lg:flex flex-wrap gap-1.5 lg:gap-2">
            {/* All Brands chip */}
            <button
              onClick={() => handleBrandClick("")}
              className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
                !currentBrand ? "text-white bg-secondary border border-secondary hover:bg-secondary/90" : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
              }`}
            >
              All Brands
            </button>

            {/* Individual brand chips - Show all brands always */}
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.slug)}
                className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
                  currentBrand === brand.slug
                    ? "text-white bg-secondary border border-secondary hover:bg-secondary/90"
                    : "text-gray-800 bg-dark border border-gray-200 hover:border-gray-400 hover:text-black"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-64 px-4 py-2 pr-10 border bg-dark  border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

      {/* Mobile Brand Chips - Always show all brands */}
      <div className="lg:hidden mb-4 flex flex-wrap gap-1.5 lg:gap-2">
        {/* All Brands chip */}
        <button
          onClick={() => handleBrandClick("")}
          className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
            !currentBrand ? "text-white bg-secondary border border-secondary hover:bg-secondary/90" : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
          }`}
        >
          All Brands
        </button>

        {/* Individual brand chips - Show all brands always */}
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => handleBrandClick(brand.slug)}
            className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
              currentBrand === brand.slug
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
          placeholder="Search brands..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 pr-10 bg-dark  border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>
    </>
  );
}
