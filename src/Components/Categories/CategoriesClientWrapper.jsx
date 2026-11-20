"use client";

import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import CategoryChips from "./CategoryChips";
import CategoryList from "./CategoryList";

export default function CategoriesClientWrapper({ categories, currentCategory: initialCategory }) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();

  // Get current category from URL (this updates when URL changes)
  const currentCategory = searchParams.get("category") || initialCategory || "";

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center lg:items-start gap-3 lg:gap-4 flex-1 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image src="/sidebar-icons/shop.png" alt="Used Device" width={60} height={60} className="object-contain w-full mr-1.5 mt-1.5" />
        </div>

        {/* Title & Category Chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">All Categories</h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>

          <CategoryChips categories={categories} currentCategory={currentCategory} className={"hidden lg:flex"} />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

      {/* Mobile Category Chips */}
      <CategoryChips categories={categories} currentCategory={currentCategory} className={"lg:hidden mb-4"} />

      {/* Mobile Search Bar */}
      <div className="lg:hidden mb-4 relative">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 pr-10 border bg-dark  border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>

      {/* Category List */}
      <CategoryList categoryFilter={currentCategory} searchQuery={searchQuery} />
    </>
  );
}
