"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { CareAmountData, TekzoCarePopupProps } from "@/types/props/product";
import { fieldsOf, findList, isList, lengthStrict, mapOpt, rec } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

// `careData?.find(fn)`: undefined for nullish data, throws for a non-array.
const findOpt = (list: unknown, fn: (item: unknown) => boolean): unknown =>
  list === null || list === undefined ? undefined : findList(list, fn);

export default function TekzoCarePopup({
  isOpen,
  careData,
  selectedVariant,
  onSelectCare,
}: TekzoCarePopupProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<unknown>(null);
  const isFirstRender = useRef(true);

  const getAmountData = useCallback(
    (careRaw: unknown): CareAmountData => {
      const care = rec(careRaw);
      if (!careRaw) {
        return { amount: 0, variant_id: null, care_id: null };
      }

      const amounts = care?.amounts;
      if (isList(amounts)) {
        const amountEntry = rec(amounts.find(
          (a) => fieldsOf(a).variant_id === rec(selectedVariant)?.id,
        ));
        return {
          amount: amountEntry?.amount ?? 0,
          variant_id: amountEntry?.variant_id ?? null,
          care_id: amountEntry?.care_id ?? null,
        };
      }

      return {
        amount: typeof amounts === "number" ? amounts : 0,
        variant_id: rec(selectedVariant)?.id ?? null,
        care_id: care?.care_id ?? null,
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
      const selectedPlan = findOpt(careData, (plan) => fieldsOf(plan).id === selectedPlanId);
      const amountData = getAmountData(selectedPlan);
      onSelectCare?.({
        planId: rec(selectedPlan)?.id,
        planName: rec(selectedPlan)?.name,
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
        {/* Price summary (single-line): product price + plan price = total */}
        {/* <div className="w-full mb-2">
          <div className="w-full flex items-center justify-between text-xs font-medium gap-3 whitespace-nowrap">
            <div className="text-gray-600">Price</div>
            <div className="flex items-center gap-2">
              <span>
                ৳{(selectedVariant?.regular_price ?? 0).toLocaleString()}
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
                  (selectedVariant?.regular_price ?? 0) +
                  (selectedPlanId
                    ? (getAmountData(
                        careData?.find((p) => p.id === selectedPlanId),
                      )?.amount ?? 0)
                    : 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div> */}
        {/* not available care */}
        {(!careData || lengthStrict(careData) === 0) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Tekzo Care is unavailable for this item.</span>
          </div>
        )}

        {/* Plan List */}
        {mapOpt(careData, (planRaw) => {
          // `plan.id` throws for a null plan, as before
          const plan = fieldsOf(planRaw);
          const isActive = selectedPlanId === plan.id;
          const amountData = getAmountData(planRaw);
          return (
            <div
              key={idKey(planRaw)}
              onClick={() =>
                setSelectedPlanId((prev: unknown) => (prev === plan.id ? null : plan.id))
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
                <p className="font-normal leading-normal">{nodeOf(plan.name)}</p>
                <span className="text-xs sm:text-sm font-bold">
                  {nodeOf(amountData.amount)}
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
