const S = ({ className = "" }) => <div className={`skeleton ${className}`} />;

const SD = ({ className = "" }) => (
  <div className={`skeleton-dark ${className}`} />
);

export default function UsedDeviceProductLoading() {
  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="skeleton w-full h-[120px] md:h-[160px] rounded-none" />

      <div className="my-rounded-t bg-white lg:bg-[#E7E9EB] mt-3 lg:mt-5">
        <div className="my-rounded lg:pb-0">
          {/* Breadcrumb */}
          <div className="bg-dark my-rounded-t p-4 lg:p-8 flex items-center gap-2">
            {["w-10", "w-3", "w-20", "w-3", "w-24", "w-3", "w-16"].map(
              (w, i) => (
                <S
                  key={i}
                  className={`h-3 ${w} ${i % 2 !== 0 ? "opacity-40" : ""}`}
                />
              ),
            )}
          </div>

          {/* 3-column grid */}
          <div className="bg-[#E7E9EB] my-rounded-b pb-5 lg:pb-0 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
            {/* LEFT: product info */}
            <div className="bg-dark px-4 lg:px-8 space-y-3 lg:space-y-4 order-2 lg:order-1 my-rounded-b pt-4 lg:pt-0">
              <S className="h-8 w-4/5" />
              <S className="h-3 w-full" />
              <S className="h-3 w-3/4" />

              {/* SKU / Status row */}
              <div className="flex items-center gap-4">
                <S className="h-3 w-24" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-3 w-28" />
              </div>

              {/* Mobile: compare / color / brand */}
              <div className="lg:hidden flex items-center justify-between gap-2">
                <S className="h-8 w-24 rounded-xl" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-3 w-20" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-6 w-16" />
              </div>

              {/* Mobile: variant badges */}
              <div className="lg:hidden grid grid-cols-2 gap-2">
                <SD className="h-14 rounded-xl" />
                <SD className="h-14 rounded-xl" />
                <SD className="h-14 rounded-xl" />
              </div>

              {/* Coupon */}
              <S className="h-14 w-full rounded-xl" />

              {/* Mobile gift */}
              <div className="lg:hidden">
                <S className="h-16 w-full rounded-xl" />
              </div>

              {/* Pricing cards */}
              <div className="grid grid-cols-2 gap-2">
                <S className="h-20 rounded-xl" />
                <S className="h-20 rounded-xl" />
              </div>

              {/* Desktop gift */}
              <div className="hidden lg:block">
                <S className="h-16 w-full rounded-xl" />
              </div>

              {/* Buy Now + Add to Bag */}
              <div className="hidden lg:grid grid-cols-2 gap-3 pb-5">
                <S className="h-14 rounded-[20px]" />
                <S className="h-14 rounded-[20px]" />
              </div>
            </div>

            {/* CENTER: photo gallery */}
            <div className="bg-dark order-1 lg:order-2">
              <div className="max-w-[480px] lg:max-w-[380px] 2xl:max-w-[480px] m-auto px-4 lg:px-0 pb-6 flex flex-col items-center justify-center gap-4">
                <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden mt-4 lg:mt-0">
                  <S className="w-full h-full" />
                </div>
                {/* Dot pagination */}
                <div className="flex justify-center gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <SD
                      key={i}
                      className={`h-1.5 rounded-sm ${i === 0 ? "w-12" : "w-4"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: variants + info + buttons */}
            <div className="order-3 flex flex-col gap-3 pt-4 lg:pt-0 lg:pb-5 px-4 lg:px-8 lg:bg-dark rounded-br-[40px]">
              {/* Share row */}
              <div className="flex items-center gap-3 justify-between">
                <S className="h-8 w-24 rounded-xl" />
                <div className="flex gap-2">
                  <S className="w-8 h-8 rounded-full" />
                  <S className="w-8 h-8 rounded-full" />
                  <S className="w-8 h-8 rounded-full" />
                </div>
              </div>

              {/* Desktop: compare / color / brand */}
              <div className="hidden lg:flex items-center justify-between gap-2">
                <S className="h-8 w-24 rounded-xl" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-3 w-20" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-6 w-16" />
              </div>

              {/* Desktop: variant badges grid */}
              <div className="hidden lg:grid grid-cols-2 gap-1.5 h-[130px] overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                  <SD key={i} className="h-full rounded-xl" />
                ))}
              </div>

              {/* Mobile: rating */}
              <div className="lg:hidden flex items-center gap-3">
                <S className="w-7 h-7 rounded-full" />
                <S className="h-4 w-12" />
                <S className="h-3 w-36" />
              </div>

              {/* Mobile: key features */}
              <div className="lg:hidden space-y-2 border border-gray-200 rounded-xl p-3">
                <S className="h-5 w-28 rounded-lg" />
                <S className="h-3 w-full" />
                <S className="h-3 w-5/6" />
                <S className="h-3 w-4/5" />
              </div>

              <div className="space-y-2 lg:space-y-3">
                {/* Viewers + Shipping */}
                <div className="flex gap-2">
                  <S className="w-1/2 h-14 rounded-xl" />
                  <S className="w-1/2 h-14 rounded-xl" />
                </div>

                {/* Tekzo Care */}
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                  <SD className="w-24 h-14 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <S className="h-3 w-full" />
                    <S className="h-3 w-3/4" />
                    <S className="h-5 w-16 rounded-md" />
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <S className="w-10 h-10 rounded-full" />
                      <S className="h-4 w-12 rounded" />
                      <S className="h-3 w-14 rounded" />
                    </div>
                  ))}
                </div>

                {/* Mobile: action buttons */}
                <div className="lg:hidden flex flex-col gap-2">
                  <S className="h-10 w-full rounded-xl" />
                  <S className="h-11 w-full rounded-xl" />
                  <S className="h-11 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* DynamicPills */}
          <div className="mt-4 px-4 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["w-28", "w-24", "w-20", "w-24"].map((w, i) => (
                <S key={i} className={`h-9 ${w} rounded-full flex-shrink-0`} />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <S className="h-4 w-full rounded" />
              <S className="h-4 w-11/12 rounded" />
              <S className="h-4 w-4/5 rounded" />
              <S className="h-4 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
