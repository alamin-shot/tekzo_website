"use client";

/**
 * Technical Specifications Modal Content
 * Displays product technical specifications in a structured format
 *
 * @param {object} product - Product object containing specifications
 */
export default function TechnicalSpecsContent({ product }) {
  if (!product?.specifications || product.specifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No specifications available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {product.specifications.map((section, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
        >
          <h4 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wide">
            {section.name || "Specification"}
          </h4>
          <div className="space-y-2">
            {section.group_values?.map((spec, specIdx) => (
              <div
                key={specIdx}
                className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600 font-medium">
                  {spec.name}
                </span>
                <span className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">
                  {spec.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
