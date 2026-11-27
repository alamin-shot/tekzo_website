"use client";
import type { SearchModalContentProps } from "@/types/search";

import { useEffect, useState } from "react";
import getFeature from "@/library/getFeatureProduct";
import getHomeCategories from "@/library/getHomeCategories";
import { normalizeSearchResponse } from "@/lib/search/mapSearchProduct";
import SearchSidebar from "./SearchSidebar";
import SearchResults from "./SearchResults";
import FeaturedGrid from "./FeaturedGrid";

// Body of the search modal: sidebar on the left; search results (while
// typing) or featured products (before typing) on the right.
export default function PremiumModalContent({ searchQuery, searchResults, isLoading, searchError, setIsModalOpen }: SearchModalContentProps) {
  const [products, setProducts] = useState<unknown>(null);
  const [homeCat, setHomeCat] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFeature();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // get home cat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHomeCategories();
        setHomeCat(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const closeModal = () => setIsModalOpen(false);
  // Featured rows come from the API raw; map them like search results so
  // both grids get the same null-safe prices and image handling.
  const featuredProducts = normalizeSearchResponse(products);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 gap-4 lg:gap-0 ">
      {/* SIDEBAR */}
      <SearchSidebar searchQuery={searchQuery} homeCat={homeCat} loading={loading} onSelect={closeModal} />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent overflow-hidden">
        {searchQuery ? (
          <SearchResults
            searchQuery={searchQuery}
            searchResults={searchResults}
            isLoading={isLoading}
            searchError={searchError}
            onSelect={closeModal}
          />
        ) : (
          <FeaturedGrid products={featuredProducts} onSelect={closeModal} />
        )}
      </main>
    </div>
  );
}
