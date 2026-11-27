"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { BrandChipsProps } from "@/types/props/shop";
import { fieldsOf, filterList, requireString } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

export default function BrandChips({ brands, currentBrand, className, searchQuery = "" }: BrandChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleBrandClick = (brandSlug: unknown) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (brandSlug) {
      params.set("brand", String(brandSlug));
    } else {
      params.delete("brand");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter brands based on search query
  // (`brand.name.toLowerCase()` threw for a null brand or non-string name; kept)
  const filteredBrands = filterList(brands, (brand) => requireString(fieldsOf(brand).name).toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`flex flex-wrap gap-1.5 lg:gap-2 ${className}`}>
      {/* All Brands chip */}
      <button
        onClick={() => handleBrandClick("")}
        className={` px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
          !currentBrand ? "text-white bg-secondary border border-secondary hover:bg-secondary/90" : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
        }`}
      >
        All Brands
      </button>

      {/* Individual brand chips */}
      {filteredBrands.map((brand) => {
        const { slug, name } = fieldsOf(brand);
        return (
        <button
          key={idKey(brand)}
          onClick={() => handleBrandClick(slug)}
          className={`px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full cursor-pointer transition-all duration-150 select-none ${
            currentBrand === slug
              ? "text-white bg-secondary border border-secondary hover:bg-secondary/90"
              : "text-gray-800 bg-white border border-gray-200 hover:border-gray-400 hover:text-black"
          }`}
        >
          {nodeOf(name)}
        </button>
        );
      })}
    </div>
  );
}
