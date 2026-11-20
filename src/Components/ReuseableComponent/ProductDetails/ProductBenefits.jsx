import React from "react";
import Image from "next/image";
import EMI from "./EMI/EMI";

export default function ProductBenefits({ product, productDetails }) {
  const purchasePoints = productDetails?.purchase_point ?? 0;
  const bookingMoney = productDetails?.booking_amount;

  const currentPrice = Number(
    product?.final_price ||
    product?.regular_price ||
    productDetails?.final_price ||
    productDetails?.regular_price ||
    0
  );
  const isEmiDisabled = currentPrice < 5000;

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 2xl:gap-3 w-full">
        {/* Card 1: Purchase Points */}
        <div className="flex-1 bg-gradient-to-r lg:bg-gradient-to-l from-amber-500/15 via-orange-500/10 to-amber-500/5 lg:from-amber-500/25 lg:via-orange-500/12 lg:to-amber-500/5 p-2 sm:p-2.5 lg:py-3 lg:px-2.5 flex flex-col justify-center items-center gap-1 sm:gap-1.5 rounded-xl lg:rounded-2xl transition-all duration-300 hover:shadow-md shadow-2xs">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0 flex items-center justify-center">
              <Image
                src="/product-details/points.webp"
                alt="Purchase Points"
                width={32}
                height={32}
                className="w-full h-full object-contain filter drop-shadow-2xs"
              />
            </div>
            <span className="text-xs sm:text-sm lg:text-base font-bold text-amber-700 tracking-tight truncate">
              +{purchasePoints}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-amber-900/80 text-center tracking-tight leading-tight truncate">
            Purchase Points
          </p>
        </div>

        {/* Card 2: Booking Money */}
        <div className="flex-1 bg-gradient-to-r lg:bg-gradient-to-l from-blue-500/15 via-indigo-500/10 to-blue-500/5 lg:from-blue-500/25 lg:via-indigo-500/12 lg:to-blue-500/5 p-2 sm:p-2.5 lg:py-3 lg:px-2.5 flex flex-col justify-center items-center gap-1 sm:gap-1.5 rounded-xl lg:rounded-2xl transition-all duration-300 hover:shadow-md shadow-2xs">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0 flex items-center justify-center">
              <Image
                src="/product-details/booking-mony-icon.webp"
                alt="Booking Money"
                width={32}
                height={32}
                className="w-full h-full object-contain filter drop-shadow-2xs"
              />
            </div>
            <span className="text-xs sm:text-sm lg:text-base font-bold text-blue-700 tracking-tight truncate">
              {bookingMoney ? `${bookingMoney}৳` : "N/A"}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-blue-900/80 text-center tracking-tight leading-tight truncate">
            Booking Money
          </p>
        </div>

        {/* Card 3: EMI Details */}
        <div className="flex-1">
          <EMI
            product={product || productDetails}
            productDetails={productDetails}
            disabled={isEmiDisabled}
            className={`w-full h-full p-2 sm:p-2.5 lg:py-3 lg:px-2.5 flex flex-col justify-center items-center gap-1 sm:gap-1.5 rounded-xl lg:rounded-2xl transition-all duration-300 shadow-2xs ${
              isEmiDisabled
                ? "bg-slate-100/90 lg:bg-slate-200/50 border border-slate-200/80 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r lg:bg-gradient-to-l from-teal-500/15 via-emerald-500/10 to-teal-500/5 lg:from-teal-500/25 lg:via-emerald-500/12 lg:to-teal-500/5 hover:shadow-md cursor-pointer"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
