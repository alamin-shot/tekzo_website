import { PackageOpen } from "lucide-react";
import React from "react";

const NoProductFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 my-mt bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
      {/* Icon Container */}
      <div className="bg-white p-5 rounded-full shadow-sm mb-6">
        <PackageOpen size={48} className="text-gray-300 stroke-[1.5]" />
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No Products Found
      </h3>
      <p className="text-gray-500 text-center max-w-[280px] mb-8">
        We couldn&apos;t find any products on this page. Please try another page
        or reset your filters.
      </p>
    </div>
  );
};

export default NoProductFound;
