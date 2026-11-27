"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import type { ProductSelectorPopupProps } from "@/types/props/product";
import { fieldsOf, mapList, rec } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

export default function ProductSelectorPopup({
  isOpen,
  products,
  selectedId,
  onSelectProduct,
}: ProductSelectorPopupProps) {
  return (
    <div
      className={`absolute left-0 right-0 top-[104%] z-10 w-full overflow-hidden bg-[#F3F4F6] border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 ease-in-out ${
        isOpen
          ? "max-h-[400px] opacity-100 p-2 sm:p-3 pointer-events-auto"
          : "max-h-0 opacity-0 p-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
        {mapList(products, (item) => {
          // Handle both API structure (item.product) and direct product structure
          const product = rec(fieldsOf(item).product || item);
          const isSelected = selectedId === product?.id;
          return (
            <div
              key={keyFrom(product?.id)}
              onClick={() => onSelectProduct(item)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? "bg-[#F26522] border-[#F26522] text-white shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300 text-gray-800"
              }`}
            >
              {/* Custom selection ring/dot check indicator */}
              <div
                className={`shrink-0 flex items-center justify-center w-4 h-4 rounded-full border transition-colors ${
                  isSelected
                    ? "bg-white text-[#F26522] border-white"
                    : "bg-transparent border-gray-300"
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-3" />}
              </div>

              {/* Product Tiny Row Thumbnail Image */}
              <div className="relative w-8 h-8 shrink-0 bg-gray-50 rounded-md p-0.5 flex items-center justify-center">
                <Image
                  src={str(product?.product_image || "/placeholder.jpg") ?? ""}
                  alt={str(product?.product_name || "Gift Product") ?? ""}
                  width={50}
                  height={50}
                  className="object-contain max-h-full max-w-full "
                  onError={(e) => {
                    if (e.target instanceof HTMLImageElement) e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>

              {/* Title Description Layout Wrapper */}
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium tracking-tight leading-none">
                  {nodeOf(product?.product_name)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
