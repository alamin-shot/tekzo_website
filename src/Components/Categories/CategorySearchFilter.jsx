"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import Image from "next/image";

const SEARCH_DEBOUNCE_MS = 300;

export default function CategorySearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const timerRef = useRef(null);
  // The URL value this component last wrote; lets the sync below tell our
  // own (debounced) update apart from an external one such as back/forward.
  const lastWrittenRef = useRef(searchParams.get("search") || "");

  // Update search query when URL changes externally
  useEffect(() => {
    const search = searchParams.get("search") || "";
    if (search !== lastWrittenRef.current) {
      lastWrittenRef.current = search;
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // The input updates on every keystroke; the URL (a server round trip) only
  // once typing pauses, as a non-urgent transition, and without adding a
  // history entry per letter (same pattern as SingleCategory).
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const trimmed = value.trim();

      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }

      lastWrittenRef.current = trimmed;
      // Keep category filter if exists
      startTransition(() => {
        router.replace(`/categories?${params.toString()}`, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);
  };

  return (
    <>
      {/* Title & Search Bar Section */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image src="/sidebar-icons/shop.png" alt="Categories" width={60} height={60} className="object-contain w-full mr-1.5 mt-1.5" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">All Categories</h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-64 px-4 py-2 pr-10 border bg-dark border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
          />
          <IoSearchOutline className="absolute right-3 text-gray-400 text-xl pointer-events-none" />
        </div>
      </div>

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
    </>
  );
}
