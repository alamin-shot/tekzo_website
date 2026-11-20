"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import { useRouter } from "next/navigation";

const BrandsWithFilter = ({ initialBrands, seoData }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query with 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBrandClick = (brandSlug) => {
    // Direct navigation to brand page
    router.push(`/brands/${brandSlug.toLowerCase()}`);
  };

  // Filter brands by search query only
  const filteredBrands = initialBrands.filter((brand) => brand.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

  // Only show banner if not searching
  const showBanner = !debouncedSearchQuery && seoData?.info_banner;

  // Split brands for layout with info banner in the middle (only when not searching)
  const leng = filteredBrands.length;

  const midPoint = showBanner ? Math.ceil(leng / 2 / 4) * 4 : leng;

  const firstHalf = filteredBrands.slice(0, midPoint);
  const secondHalf = filteredBrands.slice(midPoint);

  return (
    <>
      {/* Title & Search Bar Section */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image src="/sidebar-icons/brand.png" alt="Brands" width={60} height={60} className="object-contain w-full" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">All Brands</h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-64 px-4 py-2 pr-10 bg-dark border  border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden mb-4 relative">
        <input
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 pr-10 border bg-dark  border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="text-center col-span-full py-10 text-gray-500">No brands found.</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-gap-y">
          {firstHalf.map((brand) => (
            <div key={brand.id}>
              {/* Banner with hover effect */}
              <div className="relative group">
                <PreFetchLink href={`/brands/${brand?.slug?.toLowerCase()}`} className="relative h-[100px] lg:h-[200px] block w-full rounded-2xl lg:rounded-3xl overflow-hidden" prefetch={false}>
                  {/* Shop Banner */}
                  <Image
                    src={brand.shop_banner || "/all-product-banner.webp"}
                    alt={brand.name}
                    width={800}
                    height={400}
                    sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
                  />

                  {/* Secondary Logo on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                    <div className="relative w-24 h-12 lg:w-36 lg:h-16">
                      <Image src={brand.secondary_logo || "/all-product-banner.webp"} alt={brand.name} fill sizes="(max-width: 768px) 96px, 144px" className="object-contain brightness-0 invert" />
                    </div>
                  </div>
                </PreFetchLink>
              </div>

              {/* Brand Info Below Banner */}
              <div className="flex gap-2 lg:gap-3 mt-1 lg:mt-3 items-center">
                <div className="w-12 lg:w-18 shrink-0 bg-gray-100 p-2 rounded-lg">
                  <Image src={brand?.primary_logo || "/placeholder-logo.png"} alt={brand.name} width={72} height={54} className="w-full h-auto object-contain" />
                </div>
                <h4 className="text-sm lg:text-lg text-gray-700 line-clamp-2">{brand.name}</h4>
              </div>
            </div>
          ))}

          {/* Info Banner in the middle - Only show when not searching */}
          {showBanner && (
            <div className="w-full h-30 lg:h-50 xl:h-60 overflow-hidden col-span-2 lg:col-span-3 xl:col-span-4">
              <Image src={seoData.info_banner} alt={seoData?.title || "Brand Banner"} width={1600} height={300} sizes="100vw" className="w-full h-full object-cover rounded-2xl lg:rounded-3xl" />
            </div>
          )}

          {secondHalf.map((brand) => (
            <div key={brand.id}>
              {/* Banner with hover effect */}
              <div className="relative group">
                <PreFetchLink href={`/brands/${brand?.slug?.toLowerCase()}`} className="relative h-[100px] lg:h-[200px] block w-full rounded-2xl lg:rounded-3xl overflow-hidden" prefetch={false}>
                  {/* Shop Banner */}
                  <Image
                    src={brand.shop_banner || "/all-product-banner.webp"}
                    alt={brand.name}
                    width={800}
                    height={400}
                    sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
                  />

                  {/* Secondary Logo on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                    <div className="relative w-24 h-12 lg:w-36 lg:h-16">
                      <Image src={brand.secondary_logo || "/all-product-banner.webp"} alt={brand.name} fill sizes="(max-width: 768px) 96px, 144px" className="object-contain brightness-0 invert" />
                    </div>
                  </div>
                </PreFetchLink>
              </div>

              {/* Brand Info Below Banner */}
              <div className="flex gap-2 lg:gap-3 mt-1 lg:mt-3 items-center">
                <div className="w-12 lg:w-18 shrink-0 bg-gray-100 p-2 rounded-lg">
                  <Image src={brand?.primary_logo || "/placeholder-logo.png"} alt={brand.name} width={72} height={54} className="w-full h-auto object-contain" />
                </div>
                <h4 className="text-sm lg:text-lg text-gray-700 line-clamp-2">{brand.name}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default BrandsWithFilter;
