export default function PreOwnedDeviceLoading() {
  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="flex flex-col lg:flex-row animate-pulse">
        {/* Sidebar skeleton */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white border-r border-gray-100 p-5">
          <div className="h-6 w-32 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 min-w-0 lg:bg-gray-50/50">
          <div className="lg:p-7">
            {/* Header */}
            <div className="flex items-end justify-between mb-5 gap-3">
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded-lg mb-1.5" />
                <div className="h-3.5 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-9 w-24 bg-gray-200 rounded-xl lg:hidden" />
            </div>

            {/* Filter bar skeleton (desktop) */}
            <div className="hidden lg:flex gap-2 mb-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-32 bg-gray-200 rounded-xl" />
              ))}
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-3.5 bg-gray-100 rounded w-3/5" />
                    <div className="h-5 bg-gray-200 rounded w-2/5 mt-1" />
                    <div className="h-9 bg-gray-100 rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
