export default function SkeletonFlashSell() {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-[15px] md:gap-[25px] lg:gap-[30px]">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="animate-pulse bg-white border border-gray-100 rounded-[24px] p-3 flex flex-col gap-3 w-full shadow-sm"
        >
          {/* 1. Main Top Image Card Container Placeholder */}
          <div className="w-full aspect-[1/1.1]  lg:aspect-[1/1.2] bg-gray-100 rounded-[20px] flex items-center justify-center">
            {/* Inner asset placeholder graphic */}
            <div className="hidden lg:block aspect-square lg:w-[80%] bg-gray-200 rounded-lg opacity-60"></div>
          </div>

          {/* 2. Content Details Container */}
          <div className="flex flex-col gap-2 px-1 flex-grow">
            {/* Category badge placeholder */}
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>

            {/* Title line placeholder */}
            <div className="h-4 bg-gray-200 rounded w-11/12 mt-1"></div>

            {/* Price & Discount Row Placeholder */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 w-1/2">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              {/* Discount Tag */}
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>

          {/* 3. Bottom Actions: Add to Bag Pill Button & Wishlist Circle */}
          <div className="flex items-center gap-2 mt-auto pt-1">
            {/* Add to Bag pill placeholder */}
            <div className="h-9 bg-gray-100 border border-gray-200 rounded-full flex-grow"></div>
            {/* Wishlist button placeholder */}
            <div className="h-9 w-9 bg-gray-100 border border-gray-200 rounded-full shrink-0"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
