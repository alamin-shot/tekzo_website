"use client";

import React from "react";
import { Award, ShieldCheck, BriefcaseMedical } from "lucide-react";
import type { WarrantyInfoProps } from "@/types/props/product";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function WarrantyInfo({ productDetails, supportPhone }: WarrantyInfoProps) {
  const pd = rec(productDetails);
  const hasWarranty = Boolean(pd?.warranty_day || pd?.service_warranty || pd?.warranty_text);

  if (!hasWarranty) return null;

  return (
    <div className="bg-[#E7E9EB] rounded-xl lg:rounded-[20px] p-4 lg:p-0 space-y-3">
      <h2 className="text-sm lg:text-base 2xl:text-lg font-bold text-gray-700 tracking-tight">Warranty Information</h2>

      {/* Brand Warranty Row */}
      {nodeOf(pd?.warranty_day && (
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <Award className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-xs lg:text-sm 2xl:text-base text-gray-900">
              {/* <span className="font-semibold">Brand warranty: </span> */}
              <span className="font-normal text-gray-700">{nodeOf(pd?.warranty_day)}</span>
            </p>
          </div>
        </div>
      ))}

      {/* service warranty */}
      {nodeOf(pd?.service_warranty && (
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <BriefcaseMedical className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-xs lg:text-sm 2xl:text-base text-gray-900">
              {/* <span className="font-semibold">Service Warranty: </span> */}
              <span className="font-normal text-gray-700">{nodeOf(pd?.service_warranty)}</span>
            </p>
          </div>
        </div>
      ))}

      {/* Tekzo Warranty Row */}
      {nodeOf(pd?.warranty_text && (
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-xs lg:text-sm 2xl:text-base text-gray-900">
              {/* <span className="font-semibold">TEKZO Warranty: </span> */}
              <span className="font-normal text-gray-700">{nodeOf(pd?.warranty_text)}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
