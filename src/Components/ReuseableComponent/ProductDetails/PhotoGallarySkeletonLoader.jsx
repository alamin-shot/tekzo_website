import React from "react";

const Sk = ({ className = "" }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
  />
);

const PhotoGallarySkeletonLoader = () => {
  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* MOBILE MOBILE ONLY LAYOUT (Hidden on large screens)                       */}
      {/* ========================================================================= */}
      <div className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-gray-900 block lg:hidden">
        {/* Breadcrumbs */}
        <Sk className="h-3 w-2/3 mb-2" />

        {/* Product Title */}
        <Sk className="h-5 w-1/2 mb-4" />

        {/* Main Image Box */}
        <div className="w-full aspect-[4/5] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
          {/* Phone shape placeholder inside */}
          <div className="w-20 h-36 bg-gray-300 dark:bg-gray-600 rounded opacity-40 animate-pulse" />
        </div>

        {/* Touch-friendly Thumbnail Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {/* Selected Thumbnail */}
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-gray-400 dark:border-gray-500 flex-shrink-0 snap-start animate-pulse" />

          {/* Standard Thumbnails */}
          <Sk className="w-14 h-14 flex-shrink-0 snap-start" />
          <Sk className="w-14 h-14 flex-shrink-0 snap-start" />
          <Sk className="w-14 h-14 flex-shrink-0 snap-start" />
          <Sk className="w-14 h-14 flex-shrink-0 snap-start" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP / LARGE SCREEN LAYOUT (Hidden on mobile devices)                 */}
      {/* ========================================================================= */}
      <div className="hidden lg:block w-full bg-dark my-rounded p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          {[
            "w-10",
            "w-1",
            "w-20",
            "w-1",
            "w-16",
            "w-1",
            "w-12",
            "w-1",
            "w-16",
          ].map((w, i) => (
            <Sk
              key={i}
              className={`h-3 ${w} ${i % 2 !== 0 ? "opacity-30" : ""}`}
            />
          ))}
        </div>

        {/* Title + Action Buttons */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex flex-col gap-2">
            <Sk className="h-7 w-32" />
            <Sk className="h-3 w-56" />
          </div>
          <div className="flex gap-2">
            <Sk className="h-10 w-28 rounded-full" />
            <Sk className="h-10 w-24 rounded-full" />
            <Sk className="h-10 w-24 rounded-full" />
          </div>
        </div>

        {/* SKU + Status */}
        <div className="flex items-center gap-3 mb-5">
          <Sk className="h-3 w-24" />
          <Sk className="h-3 w-16" />
          <Sk className="h-3 w-20" />
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-3 gap-10 items-start">
          {/* LEFT COLUMN: E-commerce purchase actions */}
          <div className="flex flex-col gap-3">
            {/* Coupon */}
            <Sk className="h-16 w-full" />
            {/* Price cards */}
            <div className="grid grid-cols-2 gap-2">
              <Sk className="h-20" />
              <Sk className="h-20" />
            </div>
            {/* Discount + Qty */}
            <div className="grid grid-cols-2 gap-2">
              <Sk className="h-14" />
              <Sk className="h-14" />
            </div>
            {/* Gift box */}
            <Sk className="h-16 w-full" />
            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Sk className="h-12 rounded-full" />
              <Sk className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-transparent" />
            </div>
          </div>

          {/* CENTER COLUMN: Large Photo Display */}
          <div className="flex flex-col gap-4 px-15">
            {/* Main image */}
            <Sk className="h-[500px] w-full rounded-2xl" />
            {/* Thumbnails */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Sk
                  key={i}
                  className={`w-12 h-12 rounded-lg flex-shrink-0 ${
                    i === 2 ? "ring-2 ring-gray-400 dark:ring-gray-500" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Secondary specifications and information */}
          <div className="flex flex-col gap-4">
            {/* Compare / Color / Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sk className="h-4 w-16" />
                <Sk className="h-7 w-7 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Sk className="h-3 w-20" />
                <Sk className="h-3 w-16" />
                <Sk className="h-3 w-20" />
              </div>
            </div>

            {/* Variant grid */}
            <div className="grid grid-cols-2 gap-2">
              <Sk className="h-[70px] rounded-xl" />
              <Sk className="h-[70px] rounded-xl" />
              <Sk className="h-[70px] rounded-xl" />
              <Sk className="h-[70px] rounded-xl" />
              <Sk className="col-span-2 h-10 rounded-xl" />
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <Sk className="h-7 w-7 rounded-full flex-shrink-0" />
              <Sk className="h-3 flex-1" />
              <Sk className="h-3 w-24 flex-shrink-0" />
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-3">
              <Sk className="w-14 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Sk className="h-3 w-4/5" />
                <Sk className="h-3 w-3/5" />
              </div>
              <Sk className="w-7 h-7 rounded-full flex-shrink-0" />
            </div>

            {/* Tekzo Care */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3">
              <Sk className="w-28 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Sk className="h-3 w-11/12" />
                <Sk className="h-3 w-3/4" />
                <Sk className="h-5 w-16 rounded-md mt-1" />
              </div>
            </div>

            {/* Points / Booking / EMI */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "w-8", label: "w-14" },
                { icon: "w-10", label: "w-16" },
                { icon: "w-8", label: "w-12" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Sk className={`h-8 ${item.icon} rounded-full`} />
                  <Sk className={`h-5 ${item.icon} rounded`} />
                  <Sk className={`h-3 ${item.label} rounded`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoGallarySkeletonLoader;
