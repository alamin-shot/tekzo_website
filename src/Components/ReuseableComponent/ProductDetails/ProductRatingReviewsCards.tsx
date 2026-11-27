"use client";

import React from "react";
import Link from "next/link";
import { Star, ArrowLeftRight } from "lucide-react";
import type { ProductDetailsProp } from "@/types/props/product";
import { rec } from "@/lib/json";

export default function ProductRatingReviewsCards({ productDetails }: ProductDetailsProp) {
  const pd = rec(productDetails);
  const avgRating = pd?.avg_rating
    ? Number(pd.avg_rating).toFixed(1)
    : "5.0";

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 2xl:gap-3 w-full">
        {/* Card 1: Exchange Button (links to /dashboard/sell-your-device) */}
        <Link
          href="/dashboard/sell-your-device"
          prefetch={false}
          className="flex-1 bg-gradient-to-r lg:bg-gradient-to-l from-emerald-500/15 via-teal-500/10 to-emerald-500/5 lg:from-emerald-500/25 lg:via-teal-500/12 lg:to-emerald-500/5 p-2 sm:p-2.5 lg:py-3 lg:px-2.5 flex flex-col justify-center items-center gap-1 sm:gap-1.5 rounded-xl lg:rounded-2xl transition-all duration-300 hover:shadow-md shadow-2xs select-none active:scale-[0.98] group cursor-pointer"
        >
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0 flex items-center justify-center text-emerald-600 transition-transform duration-200 group-hover:scale-110">
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600 filter drop-shadow-2xs stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm lg:text-base font-bold text-emerald-700 tracking-tight truncate">
              Exchange
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-emerald-900/80 text-center tracking-tight leading-tight truncate">
            Sell Your Device
          </p>
        </Link>

        {/* Card 2: Customer Rating */}
        <div className="flex-1 bg-gradient-to-r lg:bg-gradient-to-l from-amber-500/15 via-orange-500/10 to-amber-500/5 lg:from-amber-500/25 lg:via-orange-500/12 lg:to-amber-500/5 p-2 sm:p-2.5 lg:py-3 lg:px-2.5 flex flex-col justify-center items-center gap-1 sm:gap-1.5 rounded-xl lg:rounded-2xl transition-all duration-300 hover:shadow-md shadow-2xs select-none">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-amber-400 text-amber-500 filter drop-shadow-2xs" />
            </div>
            <span className="text-xs sm:text-sm lg:text-base font-bold text-amber-700 tracking-tight truncate">
              {avgRating}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-amber-900/80 text-center tracking-tight leading-tight truncate">
            Customer Rating
          </p>
        </div>
      </div>
    </div>
  );
}
