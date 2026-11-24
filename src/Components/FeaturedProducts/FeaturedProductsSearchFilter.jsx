"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import Image from "next/image";

const SEARCH_DEBOUNCE_MS = 300;

export default function FeaturedProductsSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const timerRef = useRef(null);
  // The URL value this component last wrote, so our own debounced update
  // doesn't overwrite what the user has typed since.
  const lastWrittenRef = useRef(currentSearch);

  // Sync state if searchParams change externally (back/forward, links)
  useEffect(() => {
    if (currentSearch !== lastWrittenRef.current) {
      lastWrittenRef.current = currentSearch;
      setSearchQuery(currentSearch);
    }
  }, [currentSearch]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // The input updates on every keystroke; the URL (a server round trip) only
  // once typing pauses, as a non-urgent transition, without a history entry
  // per letter (same pattern as SingleCategory).
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
      startTransition(() => {
        router.replace(`/featured-products?${params.toString()}`, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);
  };

  return (
    <>
      {/* Title & Search Bar Section */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
          <Image
            src="/sidebar-icons/offers.png"
            alt="Featured Products"
            width={60}
            height={60}
            className="object-contain w-full"
          />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Featured Products
            </h1>
            <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
            Explore our handpicked selection of top-featured devices and
            accessories.
          </p>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search featured products..."
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
          placeholder="Search featured products..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 pr-10 border bg-dark border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-300 focus:border-transparent transition-all"
        />
        <IoSearchOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>
    </>
  );
}
