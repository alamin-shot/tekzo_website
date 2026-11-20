"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

export default function TekzoCarePopup({
  isOpen,
  careData,
  selectedVariant,
  onSelectCare,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const isFirstRender = useRef(true);

  const getAmountData = useCallback(
    (care) => {
      if (!care) {
        return { amount: 0, variant_id: null, care_id: null };
      }

      if (Array.isArray(care.amounts)) {
        const amountEntry = care.amounts.find(
          (a) => a.variant_id === selectedVariant?.id,
        );
        return {
          amount: amountEntry?.amount ?? 0,
          variant_id: amountEntry?.variant_id ?? null,
          care_id: amountEntry?.care_id ?? null,
        };
      }

      return {
        amount: typeof care.amounts === "number" ? care.amounts : 0,
        variant_id: selectedVariant?.id ?? null,
        care_id: care.care_id ?? null,
      };
    },
    [selectedVariant],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (selectedPlanId) {
      const selectedPlan = careData?.find((plan) => plan.id === selectedPlanId);
      const amountData = getAmountData(selectedPlan);
      onSelectCare?.({
        planId: selectedPlan?.id,
        planName: selectedPlan?.name,
        amount: amountData.amount,
        care_id: amountData.care_id,
      });
    } else {
      onSelectCare?.(null);
    }
  }, [selectedPlanId, careData, selectedVariant, getAmountData, onSelectCare]);

  return (
    <div
      className={`absolute left-0 right-0 lg:left-auto lg:right-0 top-[110%] w-full z-50 bg-white/50 backdrop-blur-sm rounded-2xl p-4 lg:p-5 shadow-2xl transition-all duration-300 origin-top transform overflow-visible ${
        isOpen ? "opacity-100 " : "max-h-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-2 overflow-y-auto pb-0.5">
        {/* Price summary (single-line): offer price + plan price = total */}
        <div className="w-full mb-2">
          <div className="w-full flex items-center justify-between text-xs font-medium gap-3 whitespace-nowrap">
            <div className="text-gray-600">Price</div>
            <div className="flex items-center gap-2">
              <span>
                ৳
                {(
                  selectedVariant?.final_price ??
                  selectedVariant?.regular_price ??
                  0
                ).toLocaleString()}
              </span>
              <span className="text-gray-400">+</span>
              <span>
                ৳
                {(selectedPlanId
                  ? (getAmountData(
                      careData?.find((p) => p.id === selectedPlanId),
                    )?.amount ?? 0)
                  : 0
                ).toLocaleString()}
              </span>
              <span className="text-gray-400">=</span>
              <span className="text-primary font-bold">
                ৳
                {(
                  (selectedVariant?.final_price ??
                    selectedVariant?.regular_price ??
                    0) +
                  (selectedPlanId
                    ? (getAmountData(
                        careData?.find((p) => p.id === selectedPlanId),
                      )?.amount ?? 0)
                    : 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        {/* Plan List */}
        {careData?.map((plan) => {
          const isActive = selectedPlanId === plan.id;
          const amountData = getAmountData(plan);
          return (
            <div
              key={plan.id}
              onClick={() =>
                setSelectedPlanId((prev) => (prev === plan.id ? null : plan.id))
              }
              className={`w-full flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                isActive
                  ? "bg-primary border-transparent text-white"
                  : "shadow-sm  bg-white/30 backdrop-blur-xl rounded-xl border border-gray-100/50 "
              }`}
            >
              {/* Left Selection Checkbox */}
              <div
                className={`shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded border ${isActive ? "bg-white text-[#F26522] border-white" : "border-gray-400"}`}
              >
                {isActive && <Check className="w-3 h-3 stroke-3" />}
              </div>

              {/* Status Indicator Icon */}
              <div className="shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-2" />
              </div>

              {/* Text Information */}
              <div className="flex-1 flex flex-col gap-1 text-[10px] sm:text-xs">
                <p className="font-normal leading-normal">{plan.name}</p>
                <span className="text-xs sm:text-sm font-bold">
                  {amountData.amount}
                </span>
              </div>
            </div>
          );
        })}

        {/* (old multi-line breakdown removed) */}
        {/* selection toggle: clicking an active plan will deselect it */}
      </div>
    </div>
  );
}
