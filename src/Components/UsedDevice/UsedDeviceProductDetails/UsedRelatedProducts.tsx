import React from "react";
import DeviceCard from "../../PreownedDevice/DeviceCard";
import type { UsedRelatedProductsProps } from "@/types/props/product";
import { lengthStrict, mapList } from "@/lib/json";
import { idKey } from "@/lib/render";

export default function UsedRelatedProducts({ relatedProducts }: UsedRelatedProductsProps) {
  if (!relatedProducts || lengthStrict(relatedProducts) === 0) {
    return null;
  }

  return (
    <div className="lg:mt-6">
      <div className="py-4">
        <h2 className="text-2xl lg:text-3xl font-medium capitalize text-gray-700">
          Related Products
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-3 2xl:gap-4 lg:mt-3 items-stretch">
        {mapList(relatedProducts, (product, index) => (
          <div
            key={idKey(product)}
            className={`h-full ${index >= 4 ? "hidden lg:flex flex-col" : "flex flex-col"}`}
          >
            <DeviceCard
              listing={product}
              from="relatedProducts"
              className={`h-full ${index === 4 && "lg:hidden 2xl:flex"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
