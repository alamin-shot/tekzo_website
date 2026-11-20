import React, { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import EmiModalContent from "./EmiModalContent";

// framer-motion + the modal UI only ship once the user actually opens it,
// instead of bloating the product page's initial JS bundle.
const EmiModal = dynamic(() => import("./EmiModal"), { ssr: false });

export default function EMI({ product, productDetails, from, className, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedEmi, setHasOpenedEmi] = useState(false);

  const price = Number(
    product?.final_price ||
    product?.regular_price ||
    productDetails?.final_price ||
    productDetails?.regular_price ||
    0
  );

  const isEmiDisabled = typeof disabled === "boolean" ? disabled : price < 5000;

  const handleOpen = () => {
    if (isEmiDisabled) return;
    if (!hasOpenedEmi) {
      setHasOpenedEmi(true);
    }
    setIsOpen(true);
  };

  const emiItem = {
    id: "emi-available",
    label: isEmiDisabled ? "EMI Plans" : "Details",
    value: isEmiDisabled ? "Unavailable" : "",
    iconSrc: "/product-details/emi.svg",
    isEmi: true,
  };

  const defaultClasses = isEmiDisabled
    ? `${from === "bottom" ? "aspect-auto" : "aspect-4/3"} flex-1 bg-slate-100 lg:bg-[#E7E9EB]/70 flex flex-col justify-center items-center gap-1 2xl:gap-3 rounded-2xl 2xl:rounded-2xl cursor-not-allowed opacity-60 border border-slate-200/60`
    : `${from === "bottom" ? "aspect-auto" : "aspect-4/3"} flex-1 bg-white lg:bg-[#E7E9EB] flex flex-col justify-center items-center gap-1 2xl:gap-3 rounded-2xl 2xl:rounded-2xl transition-hover duration-300 hover:shadow-md cursor-pointer`;

  return (
    <div className="w-full h-full">
      <div className="flex gap-2 2xl:gap-3 h-full">
        <div
          key={emiItem.id}
          onClick={handleOpen}
          title={isEmiDisabled ? "EMI is only available for purchases of 5,000 BDT or more" : undefined}
          className={className || defaultClasses}
        >
          {className ? (
            <>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0 flex items-center justify-center">
                  <Image
                    src={emiItem.iconSrc}
                    alt={emiItem.label}
                    width={48}
                    height={48}
                    className={`w-full h-full object-contain ${isEmiDisabled ? "grayscale opacity-40" : ""}`}
                  />
                </div>
                <span className={`text-xs sm:text-sm lg:text-base font-bold tracking-tight truncate ${isEmiDisabled ? "text-slate-400" : "text-teal-700"}`}>
                  {isEmiDisabled ? "Unavailable" : "Available"}
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] lg:text-xs font-semibold text-center tracking-tight leading-tight truncate ${isEmiDisabled ? "text-slate-400" : "text-teal-900/80"}`}>
                EMI Plans
              </p>
            </>
          ) : (
            <>
              {/* Top Row: Icon and Value */}
              <div
                className={`flex items-center justify-center gap-1 2xl:gap-2 w-full ${emiItem.isEmi ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Asset Box */}
                <div className="flex items-center justify-center">
                  <Image
                    src={emiItem.iconSrc}
                    alt={emiItem.label}
                    width={144}
                    height={144}
                    className={`${emiItem.id === "emi-available" ? "w-12 lg:w-14 2xl:w-18 mb-2 mt-2" : "w-6 lg:w-7 2xl:w-8"} ${isEmiDisabled ? "grayscale opacity-40" : ""}`}
                  />
                </div>

                {/* Numerical Value / Bold Text */}
                <span className={`text-xs 2xl:text-xl font-medium ${isEmiDisabled ? "text-slate-400" : "text-gray-700"}`}>
                  {emiItem.value}
                </span>
              </div>

              {/* Bottom Row: Label */}
              <p className={`text-[10px] lg:text-xs 2xl:text-sm font-medium ${isEmiDisabled ? "text-slate-400" : "text-gray-700"} text-center tracking-tight`}>
                {emiItem.label}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Render Modal */}
      {!isEmiDisabled && hasOpenedEmi && (
        <EmiModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="p-4 lg:p-6 cursor-auto">
            <EmiModalContent product={product} />
          </div>
        </EmiModal>
      )}
    </div>
  );
}
