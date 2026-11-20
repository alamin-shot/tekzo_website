const CardSkeleton = () => (
  <div className="animate-pulse">
    {/* Image placeholder */}
    <div className="bg-gray-200 rounded-xl aspect-square w-full mb-3" />
    {/* Badge placeholder */}
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
    {/* Title placeholder */}
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
    {/* Price placeholder */}
    <div className="flex gap-2 items-center">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-1/4" />
    </div>
  </div>
);

const SectionHeadingSkeleton = () => (
  <div className="animate-pulse flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      {/* Logo placeholder */}
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      {/* Title placeholder */}
      <div className="h-6 bg-gray-200 rounded w-40" />
    </div>
    {/* Link placeholder */}
    <div className="h-4 bg-gray-200 rounded w-20" />
  </div>
);

const CategorySkeleton = ({ sections = 2, cardsPerSection = 4 }) => {
  return (
    <div className="">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className={`${sectionIndex > 0 ? "my-my" : ""}`}
        >
          <SectionHeadingSkeleton />
          <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
            {Array.from({ length: cardsPerSection }).map((_, cardIndex) => (
              <CardSkeleton key={cardIndex} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySkeleton;
