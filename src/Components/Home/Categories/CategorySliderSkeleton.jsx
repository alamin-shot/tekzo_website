export default function CategorySliderSkeleton() {
  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-[15px] md:gap-[25px] lg:gap-[30px]">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded-2xl lg:rounded-[40px] aspect-[3.8/2] w-full overflow-hidden ${index === 3 ? "hidden lg:block" : "block"}`}
        ></div>
      ))}
    </div>
  );
}
