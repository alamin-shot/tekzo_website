"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { IoSearchOutline } from "react-icons/io5";
import type { ShopSearchBarProps } from "@/types/props/shop";

export default function ShopSearchBar({ onSearch, className = "" }: ShopSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={className}>
      <input
        type="text"
        placeholder="Search brands..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-64 px-4 py-2 pr-10 bg-dark border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all lg:w-64 max-lg:w-full"
      />
      <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none lg:top-1/2 lg:-translate-y-1/2 max-lg:top-1/2 max-lg:-translate-y-1/2" />
    </div>
  );
}
