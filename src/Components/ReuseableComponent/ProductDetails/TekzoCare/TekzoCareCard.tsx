"use client";

import React, { useCallback, useEffect } from "react";
import Image from "next/image";
import { Check, X, ShieldOff } from "lucide-react";
import type { CareAmountData, TekzoCareCardProps } from "@/types/props/product";
import { fieldsOf, findList, isList, itemAt, localeOpt, rec } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

export default function TekzoCareCard({ careData, selectedVariant, selectedCare: selectedCareRaw, onCareSelect }: TekzoCareCardProps) {
  const selectedCare = rec(selectedCareRaw);
  const getAmountData = useCallback(
    (careRaw: unknown): CareAmountData => {
      const care = rec(careRaw);
      if (!careRaw) {
        return { amount: 0, variant_id: null, care_id: null };
      }

      const amounts = care?.amounts;
      if (isList(amounts)) {
        const amountEntry = amounts.find((a) => fieldsOf(a).variant_id === rec(selectedVariant)?.id);
        const fallbackEntry = amounts[0];
        const entry = rec(amountEntry || fallbackEntry);
        return {
          amount: entry?.amount ?? 0,
          variant_id: entry?.variant_id ?? null,
          care_id: entry?.care_id ?? care?.id ?? null,
        };
      }

      return {
        amount: typeof amounts === "number" ? amounts : 0,
        variant_id: rec(selectedVariant)?.id ?? null,
        care_id: care?.care_id ?? care?.id ?? null,
      };
    },
    [selectedVariant],
  );

  // Sync selected care's amount when selectedVariant changes
  useEffect(() => {
    if (!selectedCare?.planId || !careData) return;

    const currentPlan = findList(careData, (p) => fieldsOf(p).id === selectedCare.planId);
    if (currentPlan) {
      const amountData = getAmountData(currentPlan);
      if (amountData.amount !== selectedCare.amount || amountData.care_id !== selectedCare.care_id) {
        onCareSelect?.({
          planId: fieldsOf(currentPlan).id,
          planName: fieldsOf(currentPlan).name,
          amount: amountData.amount,
          care_id: amountData.care_id,
        });
      }
    }
  }, [selectedVariant, careData, getAmountData, onCareSelect, selectedCare]);

  const isCareAvailable = isList(careData) && careData.length > 0;

  if (!isCareAvailable) {
    return (
      <div className="w-full bg-white lg:bg-[#E7E9EB] rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-2.5 2xl:p-3 text-gray-700 transition-all flex flex-col h-auto lg:h-[210px] 2xl:h-[245px]">
        {/* Header: Section Image on Left & Title on Right */}
        <div className="flex items-center justify-between gap-2.5 mb-2 lg:mb-1.5 2xl:mb-2.5 shrink-0">
          <div className="shrink-0 flex items-center">
            <Image src="/product-details/tekzo-care.webp" alt="TEKZO Care" width={160} height={52} className="h-6 sm:h-7 2xl:h-8 w-auto object-contain drop-shadow-xs" />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="text-xs sm:text-sm 2xl:text-base font-bold text-gray-900 tracking-tight whitespace-nowrap">TEKZO Care</span>
          </div>
        </div>

        {/* Care Not Available Message */}
        <div className="flex-1 min-h-0  ">
          <div className="w-full flex items-center gap-2.5 p-2 sm:p-2.5 lg:p-2 2xl:p-2.5 rounded-lg lg:rounded-xl border border-gray-200/90 bg-white/70">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/60">
              <ShieldOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">Care Not Available</p>
              <p className="text-[10px] sm:text-[11px] 2xl:text-xs text-gray-500 leading-tight">TEKZO Care protection is currently not available for this product.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveCare = Boolean(selectedCare?.care_id || selectedCare?.planId);

  const handlePlanToggle = (planRaw: unknown) => {
    const plan = fieldsOf(planRaw);
    const isCurrentlySelected = selectedCare?.planId === plan.id || selectedCare?.care_id === plan.id;

    if (isCurrentlySelected) {
      onCareSelect?.(null);
    } else {
      const amountData = getAmountData(planRaw);
      onCareSelect?.({
        planId: plan.id,
        planName: plan.name,
        amount: amountData.amount,
        care_id: amountData.care_id,
      });
    }
  };

  return (
    <div
      className={`w-full bg-white lg:bg-[#E7E9EB] rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-2.5 2xl:p-3 text-gray-700 transition-all flex flex-col h-auto lg:h-[210px] 2xl:h-[245px] ${
        hasActiveCare ? "shadow-xs" : ""
      }`}
    >
      {/* Header: Section Image on Left & Title / Actions on Right */}
      <div className="flex items-center justify-between gap-2.5 mb-2 lg:mb-1.5 2xl:mb-2.5 shrink-0">
        <div className="shrink-0 flex items-center">
          <Image src="/product-details/tekzo-care.webp" alt="TEKZO Care" width={160} height={52} className="h-6 sm:h-7 2xl:h-8 w-auto object-contain drop-shadow-xs" />
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="text-xs sm:text-sm 2xl:text-base font-bold text-gray-900 tracking-tight whitespace-nowrap">TEKZO Care</span>

          {hasActiveCare && (
            <button
              type="button"
              onClick={() => onCareSelect?.(null)}
              className="text-[10px] sm:text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 font-medium transition-colors cursor-pointer select-none"
              title="Deselect"
              aria-label="Deselect"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Plans List - Full natural height on mobile, fixed scrollable area on large screen */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(isList(careData) ? careData : []).map((planRaw) => {
          // `plan.id` throws for a null plan, as before
          const plan = fieldsOf(planRaw);
          const isSelected = selectedCare?.planId === plan.id || selectedCare?.care_id === plan.id;
          const amountData = getAmountData(planRaw);
          const amount = amountData.amount;

          return (
            <div
              key={idKey(planRaw)}
              onClick={() => handlePlanToggle(planRaw)}
              className={`group flex items-center justify-between p-2 sm:p-2.5 lg:p-1.5 2xl:p-2.5 rounded-lg lg:rounded-xl border transition-all cursor-pointer select-none ${
                isSelected ? "bg-secondary text-white border-secondary shadow-sm" : "bg-white/80 hover:bg-white text-gray-800 border-gray-200/90 hover:border-secondary/50 shadow-2xs"
              }`}
            >
              {/* Left: Checkmark indicator & Plan name */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div
                  className={`w-4 h-4 2xl:w-5 2xl:h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected ? "bg-white text-secondary border-white" : "border-gray-400 bg-white group-hover:border-secondary"
                  }`}
                >
                  {isSelected ? <Check className="w-2.5 h-2.5 2xl:w-3 2xl:h-3 stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-secondary/40" />}
                </div>
                <span className={`text-[11px] sm:text-xs 2xl:text-sm font-medium leading-snug break-words ${isSelected ? "text-white line-clamp-none" : "text-gray-800 line-clamp-2"}`}>{nodeOf(plan.name)}</span>
              </div>

              {/* Right: Plan price badge */}
              <div className="shrink-0 flex items-center">
                <span
                  className={`text-[11px] sm:text-xs 2xl:text-sm font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900 group-hover:bg-secondary/10 group-hover:text-secondary"
                  }`}
                >
                  ৳ {localeOpt(amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
