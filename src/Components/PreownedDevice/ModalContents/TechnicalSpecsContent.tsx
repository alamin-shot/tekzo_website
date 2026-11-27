"use client";

import type { TechnicalSpecsContentProps } from "@/types/props/product";
import { fieldsOf, lengthStrict, mapList, mapOpt, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

/**
 * Technical Specifications Modal Content
 * Displays product technical specifications in a structured format
 *
 * @param {object} product - Product object containing specifications
 */
export default function TechnicalSpecsContent({ product }: TechnicalSpecsContentProps) {
  const specs = rec(product)?.specifications;
  if (!specs || lengthStrict(specs) === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No specifications available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mapList(specs, (section, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
        >
          <h4 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wide">
            {nodeOf(fieldsOf(section).name || "Specification")}
          </h4>
          <div className="space-y-2">
            {mapOpt(fieldsOf(section).group_values, (spec, specIdx) => (
              <div
                key={specIdx}
                className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600 font-medium">
                  {nodeOf(fieldsOf(spec).name)}
                </span>
                <span className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">
                  {nodeOf(fieldsOf(spec).details)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
