import FeaturedProductCard from "./FeaturedProductCard";
import type { FeaturedGridProps } from "@/types/search";
import { keyFrom } from "@/lib/render";

// Right column before the user types. `products` are mapped products.
export default function FeaturedGrid({ products, onSelect }: FeaturedGridProps) {
  return (
    <div className="flex-1 overflow-y-auto lg:px-6 custom-scrollbar">
      <div className="pb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Featured Products</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
        {products.map((product) => (
          <FeaturedProductCard key={keyFrom(product.id ?? product.slug)} product={product} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
