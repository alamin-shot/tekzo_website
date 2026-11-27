import DeviceCard from "@/Components/PreownedDevice/DeviceCard";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import type { MarketplaceProductSectionProps } from "@/types/props/product";
import { mapList } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

// Server Component - No "use client" directive
export default function ProductSection({ title, products, slug }: MarketplaceProductSectionProps) {
  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          {nodeOf(title)}
        </h2>
        <div className="gradient rounded-full p-[1px] md:p-0.5 group">
          <PreFetchLink
            prefetch={false}
            href={`/used-device/${String(slug)}`}
            className="text-sm rounded-full py-1 md:py-2 px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
          >
            See All{" "}
            <svg
              className="w-4 h-4 p-0.5 bg-black text-white rounded-full group-hover:bg-secondary duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </PreFetchLink>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
        {mapList(products, (product) => (
          <DeviceCard
            key={idKey(product)}
            listing={product}
            from="marketplace"
            className="h-full"
          />
        ))}
      </div>
    </section>
  );
}
