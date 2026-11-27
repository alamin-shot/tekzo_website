"use client";

import { useState, useCallback } from "react";
import BrandChips from "./BrandChips";
import ShopSearchBar from "./ShopSearchBar";
import type { ShopClientWrapperProps } from "@/types/props/shop";

export default function ShopClientWrapper({ brands, currentBrand, children }: ShopClientWrapperProps) {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    setDebouncedSearchQuery(query);
  }, []);

  return (
    <>
      {/* Title, Brand Chips & Search Bar Section */}
      <div className="flex items-center lg:items-start gap-3 lg:gap-4 flex-1 mb-6">
        {children}
        {/* Brand Chips - Desktop */}
        <div className="flex-1 min-w-0">
          <BrandChips brands={brands} currentBrand={currentBrand} className="hidden lg:flex flex-wrap gap-1.5 lg:gap-2" searchQuery={debouncedSearchQuery} />
        </div>
        {/* Search Bar - Desktop */}

        <ShopSearchBar onSearch={handleSearch} className="hidden lg:flex items-center relative" />
      </div>

      {/* Mobile Brand Chips */}
      <BrandChips brands={brands} currentBrand={currentBrand} className="lg:hidden mb-4 flex flex-wrap gap-1.5 lg:gap-2" searchQuery={debouncedSearchQuery} />

      {/* Mobile Search Bar */}
      <ShopSearchBar onSearch={handleSearch} className="lg:hidden mb-4 relative" />
    </>
  );
}
