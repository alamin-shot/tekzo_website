import Link from "next/link";
import SafeProductImage from "./SafeProductImage";
import ProductBadges from "./ProductBadges";
import { formatBDT } from "@/utils/formatBDT";
import type { SearchProductCardProps } from "@/types/search";

// Card for the modal's "Featured Products" grid (shown before typing).
// Same layout as before; values that are missing are no longer rendered
// as a bare "৳" (or crash on .toLocaleString()).
export default function FeaturedProductCard({ product, onSelect }: SearchProductCardProps) {
  const price = formatBDT(product.price);
  const regularPrice = formatBDT(product.regularPrice);
  const discount = formatBDT(product.discount);

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onSelect}
      className="group flex flex-col bg-white border border-gray-100 rounded-2xl lg:rounded-3xl p-4 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative aspect-square relative mb-4 flex items-center justify-center p-2 lg:p-3 2xl:p-5">
        <div className="relative w-full h-full p-2">
          <SafeProductImage
            src={product.image}
            alt={product.name}
            fill
            className="object-contain lg:group-hover:scale-105 lg:transition-transform lg:duration-700 lg:ease-out"
            sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
        <ProductBadges badges={product.badges} />
      </div>

      {/* Content Section: Lite Black Style */}
      <div className="flex flex-col gap-1 h-full">
        <h3 className="text-[13px] font-semibold text-gray-700 leading-tight group-hover:text-black transition-colors line-clamp-2">{product.name}</h3>

        <div className="flex flex-col gap-1 mt-auto">
          <p className="text-[17px] font-bold text-gray-900 tracking-tight">{price ? `৳ ${price}` : "See price →"}</p>

          <div className="flex items-center gap-3">
            {regularPrice && <span className="text-[12px] text-gray-600 line-through">৳ {regularPrice}</span>}
            {discount && (
              <div className="bg-[#E7FAED] px-2 py-1 rounded-full flex items-center">
                <span className="text-[10px] font-bold text-[#14C94F] whitespace-nowrap">৳ {discount} OFF</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
