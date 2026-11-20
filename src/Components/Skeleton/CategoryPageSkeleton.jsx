import React from "react";

const CategoryPageSkeleton = () => {
  // Shimmer animation-er jonno ekta inline style block
  const shimmerStyle = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-container {
      position: relative;
      overflow: hidden;
      background: #f3f4f6; /* gray-100 */
    }
    .shimmer-effect {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }
  `;

  // Reusable Skeleton Component
  const Skeleton = ({ className }) => (
    <div className={`shimmer-container ${className}`}>
      <style>{shimmerStyle}</style>
      <div className="shimmer-effect" />
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen font-sans">
      {/* Hero banner now renders separately above this fallback (see
          categories/[slug]/page.jsx), so it's not duplicated here. */}

      {/* 3. Brand Info Section (Logo, Name, Filters) */}
      <div className=" mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo & Name */}
          <div className="flex items-center gap-4">
            {/* Round Logo Placeholder */}
            <div className="relative">
              <Skeleton className="w-20 h-20 rounded-full border-4 border-white shadow-sm" />
            </div>
            {/* Brand Name & Verified Icon */}
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-8 rounded-md" />
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          </div>

          {/* Filters (All Products, Earbuds, etc.) */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-24 md:w-28 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Product Grid (4 Columns) */}
      <div className="mt-12  dp">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="flex flex-col gap-3">
              {/* Product Image */}
              <Skeleton className="w-full aspect-[4/5] rounded-3xl" />

              {/* Product Title (2 lines) */}
              <Skeleton className="w-3/4 h-5 rounded-md" />
              <Skeleton className="w-1/2 h-5 rounded-md" />

              {/* Price/Footer */}
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="w-20 h-6 rounded-md" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPageSkeleton;
