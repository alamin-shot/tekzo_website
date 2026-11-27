import React from "react";
import { BadgePercent, CircleSlash, ReceiptText, Tag } from "lucide-react";
import ShippingDetailsUsed from "./ShippingDetailsUsed";
import type { PricingCardProps, UsedPricingSelectorProps } from "@/types/props/product";
import { addJs, greaterJs, localeOpt, rec } from "@/lib/json";

const CardWrapper = ({ children, active, disabled, className = "" }: PricingCardProps) => {
  const baseStyles =
    "relative flex flex-col items-center justify-center rounded-xl lg:rounded-[20px] transition-all w-full min-h-[58px] sm:min-h-[64px] lg:min-h-[76px] 2xl:min-h-[96px] py-2 sm:py-2.5 lg:py-3.5 2xl:py-6";

  const stateStyles =
    active && !disabled
      ? "bg-secondary border-transparent text-white [&_*]:text-white shadow-md"
      : "bg-[#E7E9EB] border-slate-300 text-slate-700";

  const disabledStyles = disabled
    ? "cursor-not-allowed opacity-60"
    : "cursor-default opacity-100";

  return (
    <div className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}>
      {active && !disabled && (
        <div className="absolute inset-[-2px] -z-10 rounded-xl lg:rounded-[22px] bg-secondary opacity-40 blur-[4px]" />
      )}
      <div className="flex items-center gap-2 z-10">{children}</div>
    </div>
  );
};

const PricingSelector = ({
  productDetails,
  selectedVariant,
  quantity,
  setQuantity,
  selectedCare,
}: UsedPricingSelectorProps) => {
  const sv = rec(selectedVariant);
  const pd = rec(productDetails);
  const care = rec(selectedCare);
  const basePriceWithoutCare =
    sv?.regular_price || pd?.regular_price || 0;
  const baseFinalPrice =
    sv?.final_price ||
    pd?.final_price ||
    basePriceWithoutCare;
  const discountAmount =
    sv?.discount_amount ||
    pd?.discount_amount ||
    (greaterJs(basePriceWithoutCare, baseFinalPrice)
      ? Number(basePriceWithoutCare) - Number(baseFinalPrice)
      : 0);

  const hasCare = Boolean(care?.care_id);
  const actualCareAmount = hasCare ? care?.amount || 0 : 0;

  const hasOffer =
    Number(basePriceWithoutCare) > 0 &&
    basePriceWithoutCare !== baseFinalPrice &&
    Number(baseFinalPrice) > 0;

  const offerPrice = addJs(baseFinalPrice, actualCareAmount);
  const regularPrice = addJs(basePriceWithoutCare, actualCareAmount);

  const currentPrice = hasOffer ? offerPrice : regularPrice;
  const isEmiAvailable = Number(currentPrice) >= 5000;

  const selectedOption = hasOffer ? "offer" : "regular";

  const discountPercent =
    Number(basePriceWithoutCare) > 0
      ? Math.round(
          ((Number(basePriceWithoutCare) - Number(baseFinalPrice)) / Number(basePriceWithoutCare)) * 100
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:gap-4 pb-1 lg:pb-0">
      {/* Offer Price Card */}
      <CardWrapper active={selectedOption === "offer"} disabled={!hasOffer}>
        <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center">
          {!hasOffer ? (
            <CircleSlash className="w-4 h-4 2xl:w-5 2xl:h-5 text-gray-400 stroke-[2.2]" />
          ) : (
            <Tag className="w-4 h-4 2xl:w-5 2xl:h-5 stroke-[2.2]" />
          )}
        </div>
        <div className="flex flex-col">
          {!hasOffer ? (
            <>
              <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold text-gray-700">
                No Offer
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">
                Regular Price Only
              </span>
            </>
          ) : (
            <>
              <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold">
                Offer Price: {localeOpt(offerPrice)}৳
              </span>
              <span className="text-[10px] text-white/90 leading-tight truncate">
                {hasCare
                  ? discountPercent > 0
                    ? `Save ${discountPercent}% • Care: +${String(localeOpt(actualCareAmount))}৳`
                    : `Includes Care: +${String(localeOpt(actualCareAmount))}৳`
                  : discountPercent > 0
                    ? `Save ${discountPercent}%`
                    : "Special Offer"}
              </span>
            </>
          )}
        </div>
      </CardWrapper>

      {/* Regular Price Card */}
      <CardWrapper active={selectedOption === "regular"} disabled={hasOffer}>
        <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center">
          <ReceiptText
            className={`w-4 h-4 2xl:w-5 2xl:h-5 stroke-[2.2] ${hasOffer ? "text-gray-400" : ""}`}
          />
        </div>
        <div className="flex flex-col">
          <span
            className={`text-xs whitespace-nowrap 2xl:text-base font-semibold ${hasOffer ? "text-gray-600" : ""}`}
          >
            Regular Price:{" "}
            <span
              className={
                hasOffer ? "line-through text-gray-500 font-normal ml-0.5" : ""
              }
            >
              {localeOpt(regularPrice)}৳
            </span>
          </span>
          {hasCare ? (
            <span
              className={`text-[10px] leading-tight truncate ${hasOffer ? "text-gray-400" : "text-white/90"}`}
            >
              Includes Care: +{localeOpt(actualCareAmount)}৳
            </span>
          ) : (
            <span
              className={`text-[10px] leading-tight truncate ${hasOffer ? "text-gray-400" : "text-white/90"}`}
            >
              {isEmiAvailable ? "Cash/Card/EMI" : "Cash/Card"}
            </span>
          )}
        </div>
      </CardWrapper>

      {/* Discount Amount Card */}
      <div className="hidden lg:flex flex-col items-center justify-center rounded-xl lg:rounded-[20px] transition-all w-full min-h-[58px] sm:min-h-[64px] lg:min-h-[76px] 2xl:min-h-[96px] py-2 sm:py-2.5 lg:py-3.5 2xl:py-6 bg-[#E7E9EB] text-slate-700">
        <div className="flex items-center gap-2 z-10">
          <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center text-secondary">
            <BadgePercent className="w-4 h-4 2xl:w-5 2xl:h-5 text-secondary stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold text-gray-800">
              Discount:{" "}
              {discountAmount ? `${String(localeOpt(discountAmount))}৳` : "0৳"}
            </span>
            <span className="text-[10px] text-gray-500 leading-tight">
              Discount Amount
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Details Component - Took perfect 50% width */}
      <div className="col-span-2 lg:col-auto hidden lg:block">
        <ShippingDetailsUsed />
      </div>
    </div>
  );
};

export default PricingSelector;
