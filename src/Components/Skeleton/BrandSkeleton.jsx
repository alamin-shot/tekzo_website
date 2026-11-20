// components/Skeleton/BrandSkeleton.jsx

const BrandCardSkeleton = () => (
  <div className="animate-pulse">
    {/* Banner placeholder */}
    <div className="h-[100px] lg:h-[200px] w-full rounded-2xl lg:rounded-3xl bg-gray-200" />

    {/* Brand info below */}
    <div className="flex gap-2 lg:gap-3 mt-1 lg:mt-3 items-center">
      {/* Logo placeholder */}
      <div className="w-12 lg:w-18 h-12 lg:h-14 bg-gray-200 rounded-lg shrink-0" />
      {/* Name placeholder */}
      <div className="h-4 lg:h-5 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const BrandSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-gap-y my-my">
    {Array.from({ length: count }).map((_, i) => (
      <BrandCardSkeleton key={i} />
    ))}
  </div>
);

export default BrandSkeleton;
