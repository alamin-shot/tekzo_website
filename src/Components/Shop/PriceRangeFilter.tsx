"use client";

import React from "react";
import type { ChangeEvent } from "react";
import type { PriceRangeFilterProps } from "@/types/props/shop";

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: PriceRangeFilterProps) {
  // Sync range slider with inputs
  const handleRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  const handleApply = () => {

  };

  return (
    <div className="w-full p-5">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Price Range</h3>

      {/* Custom Slider Track */}
      <div className="relative w-full h-1.5 bg-gray-200 rounded-full mb-8">
        {/* The Colored Progress Bar */}
        <div
          className="absolute  h-full bg-secondary rounded-full"
          style={{ width: `${(Number(maxPrice) / 650000) * 100}%`, left: "0%" }}
        ></div>

        {/* Range Input */}
        <input
          type="range"
          min="0"
          max="650000"
          value={maxPrice}
          onChange={handleRangeChange}
          className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent cursor-pointer accent-secondary [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
        />
      </div>

      {/* Min/Max Inputs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Min Price</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full p-3 text-center  text-gray-600 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Max Price</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full p-3 text-center text-gray-600  border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <button
          onClick={handleApply}
          className="bg-secondary text-white px-8 py-2.5 rounded-xl font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
