import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import SearchModalSkeleton from "./SearchModalSkeleton";
import SearchResultCard from "./SearchResultCard";

// Right column while searching: header, skeleton, results grid, or an
// empty / unavailable message. `searchResults` are mapped products.
export default function SearchResults({ searchQuery, searchResults, isLoading, searchError, onSelect }) {
  const results = Array.isArray(searchResults) ? searchResults : [];

  return (
    <div className="flex-1 overflow-y-auto lg:px-6 custom-scrollbar ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Search Results
          <span className="ml-2 text-xs font-normal text-gray-400 font-mono">({results.length})</span>
        </h2>
        <Link href={`/search?query=${encodeURIComponent(searchQuery)}`} className="flex gap-2 text-primary items-center text-sm" onClick={onSelect}>
          View All <FaArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <SearchModalSkeleton></SearchModalSkeleton>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 py-4">
          {results.slice(0, 20).map((product) => (
            <SearchResultCard key={product.id ?? product.slug} product={product} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-500">
              {searchError ? searchError : <>No products found for &ldquo;{searchQuery}&rdquo;</>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
