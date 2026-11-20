import React from "react";
import { BadgePercent, CalendarClock, CircleSlash, Gem, Minus, Plus, ReceiptText, Tag } from "lucide-react";

const CardWrapper = ({ children, active, disabled, className = "" }) => {
  const baseStyles =
    "relative flex flex-col items-center justify-center rounded-xl lg:rounded-[20px] transition-all w-full min-h-[58px] sm:min-h-[64px] lg:min-h-[76px] 2xl:min-h-[96px] py-2 sm:py-2.5 lg:py-3.5 2xl:py-6";
  const stateStyles = active && !disabled ? "bg-secondary border-transparent text-white [&_*]:text-white shadow-md" : "bg-[#E7E9EB] border-slate-300 text-slate-700";
  const disabledStyles = disabled ? "cursor-not-allowed opacity-50" : "cursor-default opacity-100";

  return (
    <div className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}>
      {/* Border effect: Glow or Ring effect shown only when active */}
      {active && !disabled && <div className="absolute inset-[-2px] -z-10 rounded-xl lg:rounded-[22px] bg-secondary opacity-40 blur-[4px]" />}

      <div className="flex items-center gap-2 z-10">{children}</div>
    </div>
  );
};

const PricingSelector = ({ selectedVariant, quantity, setQuantity, careAmount = 0, hasCare = false, isPreOrder: isPreOrderProp = false, bookingAmount = 0 }) => {
  const isPreOrder = isPreOrderProp || Boolean(selectedVariant?.is_prebook);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Base prices without care
  const basePriceWithoutCare = selectedVariant?.regular_price || 0;
  const baseFinalPrice = selectedVariant?.final_price || selectedVariant?.regular_price || 0;

  // Tekzo care plan price (fixed amount, not percentage)
  const actualCareAmount = hasCare ? careAmount : 0;

  // Regular price: stays the same (regular_price only)
  const regularPrice = basePriceWithoutCare;

  // Offer price: add care plan price to the final/offer price
  const offerPrice = baseFinalPrice + actualCareAmount;

  // Determine if there's an offer available
  const hasOffer = basePriceWithoutCare > 0 && basePriceWithoutCare !== baseFinalPrice && baseFinalPrice > 0;

  const currentPrice = hasOffer ? offerPrice : regularPrice;
  const isEmiAvailable = currentPrice >= 5000;

  // Automatically select best option
  const selectedOption = isPreOrder ? "prebook" : hasOffer ? "offer" : "regular";

  // Calculate discount percentage
  const discountPercent = basePriceWithoutCare > 0 ? Math.round(((basePriceWithoutCare - baseFinalPrice) / basePriceWithoutCare) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:gap-4 pb-1 lg:pb-0">
      {/* Offer / Pre-Book Price Card */}
      {isPreOrder ? (
        <CardWrapper active={true} disabled={false}>
          <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 2xl:w-5 2xl:h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold">Pre-Book Price: {bookingAmount}৳</span>
            <span className="text-[10px] opacity-90 leading-tight">Advance Booking</span>
          </div>
        </CardWrapper>
      ) : (
        <CardWrapper active={selectedOption === "offer"} disabled={!hasOffer}>
          <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center">
            {!hasOffer ? <CircleSlash className="w-4 h-4 2xl:w-5 2xl:h-5 text-gray-400 stroke-[2.2]" /> : <Tag className="w-4 h-4 2xl:w-5 2xl:h-5 stroke-[2.2]" />}
          </div>
          <div className="flex flex-col">
            {!hasOffer ? (
              <>
                <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold text-gray-700">No Offer</span>
                <span className="text-[10px] text-gray-400 leading-tight">Regular Price Only</span>
              </>
            ) : (
              <>
                <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold text-gray-700">Offer Price: {offerPrice}৳</span>
                <span className="text-[10px] text-green-600 leading-tight truncate">
                  {hasCare
                    ? discountPercent > 0
                      ? `Save ${discountPercent}% • Care: +${actualCareAmount}৳`
                      : `Includes Care: +${actualCareAmount}৳`
                    : discountPercent > 0
                      ? `Save ${discountPercent}%`
                      : "Special Offer"}
                </span>
              </>
            )}
          </div>
        </CardWrapper>
      )}

      {/* Regular Price Card - blurred & disabled for pre-orders */}
      <CardWrapper active={!isPreOrder && selectedOption === "regular"} disabled={isPreOrder} className={isPreOrder ? "blur-[3px] opacity-60 select-none pointer-events-none" : ""}>
        <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center">
          <ReceiptText className="w-4 h-4 2xl:w-5 2xl:h-5 stroke-[2.2]" />
        </div>
        <div className={`flex flex-col ${isPreOrder ? "blur-[3px] select-none" : ""}`}>
          <span className={`text-xs whitespace-nowrap 2xl:text-base font-semibold ${hasOffer && !isPreOrder ? "text-gray-700" : "text-gray-800"}`}>
            Regular Price:{" "}
            <span className={hasOffer && !isPreOrder ? "line-through text-gray-500 font-normal" : ""}>
              {regularPrice + actualCareAmount}৳
            </span>
          </span>
          {hasCare ? (
            <span className="text-[10px] text-green-600 leading-tight truncate">Includes Care: +{actualCareAmount}৳</span>
          ) : (
            <span className="text-[10px] text-gray-500 leading-tight truncate">{isEmiAvailable ? "Cash/Card/EMI" : "Cash/Card"}</span>
          )}
        </div>
      </CardWrapper>

      {/* Card 3: Discount Amount Card */}
      <div
        className={`flex flex-col items-center justify-center rounded-xl lg:rounded-[20px] transition-all w-full min-h-[58px] sm:min-h-[64px] lg:min-h-[76px] 2xl:min-h-[96px] py-2 sm:py-2.5 lg:py-3.5 2xl:py-6 bg-[#E7E9EB] text-slate-700 ${
          isPreOrder ? "blur-[3px] opacity-60 select-none pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-2 z-10">
          <div className="w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 flex items-center justify-center text-secondary">
            <BadgePercent className="w-4 h-4 2xl:w-5 2xl:h-5 text-secondary stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs whitespace-nowrap 2xl:text-base font-semibold text-gray-800">
              Discount: {selectedVariant?.discount_amount ? `${selectedVariant.discount_amount.toLocaleString()}৳` : "0৳"}
            </span>
            <span className="text-[10px] text-gray-500 leading-tight">Discount Amount</span>
          </div>
        </div>
      </div>

      {/* Card 4: Quantity Selector Card */}
      <div className="flex flex-col items-center justify-center rounded-xl lg:rounded-[20px] transition-all w-full min-h-[58px] sm:min-h-[64px] lg:min-h-[76px] 2xl:min-h-[96px] py-2 sm:py-2.5 lg:py-3.5 2xl:py-6 bg-[#E7E9EB] text-slate-700">
        <div className="flex flex-col items-center justify-center z-10">
          <div className="flex items-center gap-3 2xl:gap-4">
            <button
              type="button"
              onClick={decrement}
              className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-7 2xl:h-7 rounded-full bg-white hover:bg-slate-200 text-gray-700 hover:text-black shadow-2xs flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5]" />
            </button>
            <span className="text-xs whitespace-nowrap 2xl:text-base font-bold text-secondary min-w-[20px] text-center select-none">{quantity}</span>
            <button
              type="button"
              onClick={increment}
              className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-7 2xl:h-7 rounded-full bg-white hover:bg-slate-200 text-gray-700 hover:text-black shadow-2xs flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 2xl:w-4 2xl:h-4 stroke-[2.5]" />
            </button>
          </div>
          <span className="text-[10px] text-gray-500 leading-tight mt-0.5 select-none font-medium">Quantity</span>
        </div>
      </div>
    </div>
  );
};

export default PricingSelector;
