"use client";
import type { SearchSidebarProps } from "@/types/search";

import { useState } from "react";
import TrendingLinks from "./TrendingLinks";
import QuickLinks from "./QuickLinks";

// Left column of the search modal: trending links before typing, quick
// links while searching.
export default function SearchSidebar({ searchQuery, homeCat, loading, onSelect }: SearchSidebarProps) {
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);

  return (
    <aside className="flex w-full lg:w-65 xl:w-72 lg:border-r border-gray-100 flex-col bg-[#F9FAFB] rounded-2xl lg:rounded-3xl h-auto lg:sticky lg:top-0 lg:self-start overflow-y-auto">
      <div className="p-4 md:p-8">
        {!searchQuery ? (
          <TrendingLinks loading={loading} homeCat={homeCat} onSelect={onSelect} />
        ) : (
          <QuickLinks isOpen={isQuickLinksOpen} setIsOpen={setIsQuickLinksOpen} onSelect={onSelect} />
        )}
      </div>
    </aside>
  );
}
