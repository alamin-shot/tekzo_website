import React from "react";

const SearchModalSkeleton = () => {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 py-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all">
            {/* Image Section: Aspect-ratio utility for consistent height */}
            <div className="relative  aspect-square overflow-hidden rounded-xl bg-slate-100">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
            </div>

            {/* Content Section */}
            <div className="mt-4 flex flex-col space-y-3 px-1">
              {/* Title: Two lines to simulate realistic product naming */}
              <div className="space-y-2">
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchModalSkeleton;
