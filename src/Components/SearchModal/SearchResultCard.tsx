import Link from "next/link";
import SafeProductImage from "./SafeProductImage";
import ProductBadges from "./ProductBadges";
import { formatBDT } from "@/utils/formatBDT";
import { hasRealDiscount } from "@/lib/search/mapSearchProduct";
import type { SearchProductCardProps } from "@/types/search";

// Card for live search results. Expects a mapped product (mapSearchProduct).
export default function SearchResultCard({ product, onSelect }: SearchProductCardProps) {
  const hasDiscount = hasRealDiscount(product);
  const price = formatBDT(product.price);

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onSelect}
      className=" group flex flex-col bg-white border border-gray-100 rounded-2xl lg:rounded-3xl p-5 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 h-full overflow-hidden"
    >
      {/* 1. Image Section */}
      <div className="relative aspect-square relative mb-4 flex items-center justify-center flex-shrink-0 p-2 lg:p-3 2xl:p-5">
        <div className="relative w-full h-full">
          <SafeProductImage
            src={product.image}
            alt={product.name || "search product image"}
            fill
            className="object-contain lg:group-hover:scale-105 lg:transition-transform lg:duration-700 lg:ease-out"
            sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
        <ProductBadges badges={product.badges} />
      </div>

      {/* 2. Title Section: fixed height so all borders line up */}
      <div className="h-10 mb-3 flex items-center">
        <h3 className="text-[13px] font-semibold text-gray-700 leading-tight group-hover:text-black transition-colors line-clamp-2">{product.name}</h3>
      </div>

      {/* 3. Price Block: h-[56px] with a discount, h-[28px] without */}
      <div className={` flex flex-col gap-1 pt-3 border-t border-gray-100 -mx-4 px-4 ${hasDiscount ? "h-[56px]" : "h-[28px]"}`}>
        <p className="text-[17px] font-bold text-gray-900 tracking-tight leading-none">{price ? `৳ ${price}` : "See price →"}</p>

        {hasDiscount && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] text-gray-600 line-through">৳ {formatBDT(product.regularPrice)}</span>

            <div className="bg-[#E7FAED] px-1.5 py-0.5 rounded-full flex items-center">
              <span className="text-[10px] font-bold text-[#14C94F] whitespace-nowrap">৳ {formatBDT(product.discount)} OFF</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
