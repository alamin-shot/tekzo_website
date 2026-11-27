import React from "react";
import Image from "next/image";
import EMI from "./EMI/EMI";
import type { BenefitTile, ProductBenefitsProps } from "@/types/props/product";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function ProductBenefitsFooter({
  product,
  productDetails,
  from,
}: ProductBenefitsProps) {
  const currentPrice = Number(
    rec(product)?.final_price ||
    rec(product)?.regular_price ||
    rec(productDetails)?.final_price ||
    rec(productDetails)?.regular_price ||
    0
  );
  const isEmiDisabled = currentPrice < 5000;

  const benefits: BenefitTile[] = [
    {
      id: "purchase-points",
      label: "Purchase Points",
      value: rec(productDetails)?.purchase_point,
      altText: 0,
      iconSrc: "/product-details/points.webp",
    },
    {
      id: "booking-money",
      label: "Booking Money",
      value: rec(productDetails)?.booking_amount,
      altText: "N/A",
      iconSrc: "/product-details/booking-mony-icon.webp",
    },
  ];
  return (
    <div className="w-full h-full">
      {/* Dynamic Flex Wrapper */}
      <div className="flex  gap-2 2xl:gap-3 h-full">
        {benefits.map((item) => (
          <div
            key={item.id}
            className={`${from === "bottom" ? "aspect-auto" : "aspect-4/3"} flex-1 bg-white lg:bg-[#E7E9EB] flex flex-col justify-center items-center gap-1 2xl:gap-3 rounded-2xl 2xl:rounded-2xl transition-hover duration-300 hover:shadow-md`}
          >
            {/* Top Row: Icon and Value */}
            <div className="flex items-center justify-center gap-1 2xl:gap-2 w-full flex-row">
              {/* Asset Box - Maintained aspect ratio sizing instead of fixed widths */}
              <div className="flex items-center justify-center ">
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={64}
                  height={64}
                  className="w-6 lg:w-7 2xl:w-8"
                />
              </div>

              {/* Numerical Value / Bold Text */}
              <span className={`text-xs 2xl:text-xl font-medium text-gray-700`}>
                {nodeOf(item.value || item?.altText)}
              </span>
            </div>

            {/* Bottom Row: Label */}
            <p className="text-[10px] lg:text-xs 2xl:text-sm font-medium text-gray-700 text-center tracking-tight">
              {item.label}
            </p>
          </div>
        ))}
        <div className={`w-[calc(33.33%-0.333rem)] ${isEmiDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
          <EMI product={product || productDetails} productDetails={productDetails} from={from} disabled={isEmiDisabled}></EMI>
        </div>
      </div>
    </div>
  );
}
