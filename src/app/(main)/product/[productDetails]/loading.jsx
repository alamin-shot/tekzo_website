const S = ({ className = "" }) => <div className={`skeleton ${className}`} />;

const SD = ({ className = "" }) => (
  <div className={`skeleton-dark ${className}`} />
);

export default function ProductDetailsLoading() {
  return (
    <div className="pb-20">
      {/* ── Banner ── */}
      <div className="skeleton w-full h-[120px] md:h-[160px] rounded-none" />

      <div className="my-rounded-t bg-white lg:bg-[#E7E9EB] mt-3 lg:mt-5">
        <div className="my-rounded bg-[#E7E9EB] lg:bg-dark pb-4 lg:pb-0">
          {/* ── Breadcrumb ── */}
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

          {/* ── 3-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:pb-5">
            {/* ─────────────────────────────────────────────
                LEFT: product info + pricing + buttons
                order-2 on mobile, order-1 on desktop
            ───────────────────────────────────────────── */}
            <div className="bg-dark px-4 lg:px-8 space-y-3 lg:space-y-4 order-2 lg:order-1 my-rounded-b pt-4 lg:pt-0">
              {/* Product name */}
              <S className="h-8 w-4/5" />
              {/* Headline */}
              <S className="h-3 w-full" />
              <S className="h-3 w-3/4" />

              {/* SKU / Status row */}
              <div className="flex items-center gap-4">
                <S className="h-3 w-24" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-3 w-28" />
              </div>

              {/* Mobile-only: compare / color / brand row */}
              <div className="lg:hidden flex items-center justify-between gap-2">
                <S className="h-8 w-24 rounded-xl" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-3 w-20" />
                <div className="w-px h-5 bg-gray-300" />
                <S className="h-6 w-16" />
              </div>

              {/* Mobile variant list */}
              <div className="lg:hidden space-y-2">
                <SD className="h-[68px] w-full rounded-xl" />
                <SD className="h-[68px] w-full rounded-xl" />
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
              <div className="hidden lg:grid grid-cols-2 gap-3">
                <S className="h-14 rounded-[20px]" />
                <S className="h-14 rounded-[20px]" />
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                CENTER: photo gallery
                order-1 on mobile, order-2 on desktop
            ───────────────────────────────────────────── */}
            <div className="relative bg-dark flex flex-col items-center justify-center order-1 lg:order-2 p-4 lg:p-0">
              {/* Main image */}
              <div className="relative w-full aspect-square p-2 mt-4 lg:mt-0 xl:p-10 2xl:p-15">
                <S className="w-full h-full rounded-2xl" />
              </div>

              {/* Thumbnails */}
              <div className="flex justify-center gap-2 mt-4 lg:mt-0 mb-4 flex-nowrap">
                {[0, 1, 2, 3, 4].map((i) => (
                  <SD
                    key={i}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg ${i === 0 ? "ring-2 ring-gray-400" : ""}`}
                  />
                ))}
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                RIGHT: variants + shipping + care
                order-3 on mobile and desktop
            ───────────────────────────────────────────── */}
            <div className="order-3 flex flex-col gap-3 pt-4 lg:pt-0 px-4 lg:px-8 lg:bg-dark rounded-br-[40px]">
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

              {/* Desktop variant grid */}
              <div className="hidden lg:grid grid-cols-2 gap-2 max-h-[180px] overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                  <SD key={i} className="h-[70px] rounded-xl" />
                ))}
              </div>

              {/* Mobile: rating */}
              <div className="lg:hidden flex items-center gap-3">
                <S className="w-7 h-7 rounded-full" />
                <S className="h-4 w-12" />
                <S className="h-3 w-36" />
              </div>

              {/* Mobile: key features box */}
              <div className="lg:hidden space-y-2 border border-gray-200 rounded-xl p-3">
                <S className="h-5 w-28 rounded-lg" />
                <S className="h-3 w-full" />
                <S className="h-3 w-5/6" />
                <S className="h-3 w-4/5" />
                <S className="h-3 w-full" />
              </div>

              <div className="space-y-2 lg:space-y-3">
                {/* Viewers + Shipping row */}
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

                {/* Benefits / EMI / Booking */}
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <S className="w-10 h-10 rounded-full" />
                      <S className="h-4 w-12 rounded" />
                      <S className="h-3 w-14 rounded" />
                    </div>
                  ))}
                </div>

                {/* Mobile: discount amount */}
                <div className="lg:hidden">
                  <S className="h-10 w-full rounded-xl" />
                </div>

                {/* Mobile: quantity */}
                <div className="lg:hidden">
                  <S className="h-12 w-full rounded-xl" />
                </div>

                {/* Mobile: Buy Now + Add to Bag */}
                <div className="lg:hidden grid grid-cols-2 gap-2">
                  <S className="h-12 rounded-xl" />
                  <S className="h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DynamicPills skeleton ── */}
      <div className="mt-4 px-4 lg:px-8">
        {/* Pills tab row */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["w-24", "w-20", "w-28", "w-24", "w-20"].map((w, i) => (
            <S key={i} className={`h-9 ${w} rounded-full flex-shrink-0`} />
          ))}
        </div>
        {/* Tab content area */}
        <div className="mt-4 space-y-3">
          <S className="h-4 w-full rounded" />
          <S className="h-4 w-11/12 rounded" />
          <S className="h-4 w-4/5 rounded" />
          <S className="h-4 w-full rounded" />
          <S className="h-4 w-3/4 rounded" />
        </div>
      </div>

      {/* ── Related Products skeleton ── */}
      <div className="mt-8 px-4 lg:px-8">
        <S className="h-6 w-48 mb-5 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <S className="aspect-square w-full rounded-xl" />
              <S className="h-3 w-3/4" />
              <S className="h-3 w-1/2" />
              <S className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
