"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { HiCheck } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";

export default function FilterSidebar({ brands }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // The URL is the source of truth for which brand is selected (single selection), so the
  // page's server component can fetch the actually-filtered product list —
  // not just local UI state that never left the client.
  const selectedBrand = searchParams.get("brand") || "";

  const applyBrand = (slug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("brand", slug);
    } else {
      params.delete("brand");
    }
    // Filtering changes the result set, so any existing page number could
    // now point past the end — back to page 1.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectBrand = (slug) => {
    // If clicking the already-selected brand, deselect it
    const next = selectedBrand === slug ? "" : slug;
    applyBrand(next);
  };

  // Filter brands based on search query
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="hidden lg:block lg:sticky lg:top-5 w-80 max-h-screen flex-col">
      <div className="bg-dark rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[87vh] overflow-hidden">
        {/* Filter Sub-header */}
        <div className="flex items-center justify-between mb-4 px-1 ">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filter by Brand
          </span>
          {selectedBrand && (
            <button
              onClick={() => applyBrand("")}
              className="text-xs font-semibold text-secondary hover:underline transition-all"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4 px-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200 bg-white"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <IoClose className="text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Brand Filter List */}
        <div className="space-y-1.5 overflow-y-auto pr-3 flex-1 scrollbar-hide">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => {
              const isChecked = selectedBrand === brand.slug;
              return (
                <label
                  key={brand.slug}
                  onClick={() => selectBrand(brand.slug)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 select-none group
                    ${
                      isChecked
                        ? "bg-secondary/10 border border-secondary/20 text-secondary"
                        : "hover:bg-slate-50/80 border border-transparent text-slate-600 hover:text-slate-900"
                    }
                  `}
                >
                  {/* Custom Styled Radio Button */}
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200
                      ${
                        isChecked
                          ? "bg-secondary text-white shadow-sm shadow-secondary/30 scale-105"
                          : "border-2 border-slate-200 group-hover:border-slate-300 bg-white"
                      }
                    `}
                  >
                    {isChecked && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium tracking-tight">
                    {brand.name}
                  </span>
                </label>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg
                className="w-12 h-12 text-slate-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-slate-500 font-medium">
                No brands found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hide Scrollbar */}
      <style jsx global>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
}
