"use client";

import { useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import MobileFilterSidebar from "./MobileFilterSidebar";
import type { MarketplaceBrandsProps } from "@/types/props/product";

export default function MobileFilterButton({ brands }: MarketplaceBrandsProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6 flex justify-end">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-secondary text-white rounded-xl font-semibold shadow-lg shadow-secondary/20 hover:bg-secondary/90 active:scale-95 transition-all"
        >
          <HiOutlineAdjustmentsHorizontal className="text-xl" />
          Filters
        </button>
      </div>

      {/* Mobile Sidebar Modal */}
      <MobileFilterSidebar
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        brands={brands}
      />
    </>
  );
}
