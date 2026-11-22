import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import Image from "next/image";

const FeatureProductsCategory = ({ slidersData }) => {
  const threeCardBannersImage = slidersData?.threeCardBanners || [];
  const sideImages = threeCardBannersImage.slice(1, 3);
  const firstImage = threeCardBannersImage[0];

  if (!firstImage) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 w-full items-stretch">
      {/* Left Large Banner (76% Width) */}
      <PreFetchLink prefetch={false} href={firstImage.url || "/"} className="w-full lg:w-[76%] block">
        <div className="w-full relative aspect-[16/9] lg:aspect-[2/1]">
          <Image src={firstImage.image} alt={firstImage.heading || "Main feature banner"} fill sizes="(max-width: 1023px) 100vw, 76vw" className="my-rounded object-cover" loading="lazy" />
        </div>
      </PreFetchLink>

      {/* Right Aligned Small Side Banners (24% Width) */}
      <div className="w-full lg:w-[24%] flex flex-row lg:flex-col gap-4 lg:gap-6 xl:gap-8 items-stretch justify-between">
        {sideImages.map((img) => (
          <PreFetchLink prefetch={false} key={img.id} href={img.url || "/"} className="flex-1 self-stretch min-w-0">
            <div className="w-full relative aspect-[4/3]">
              <Image src={img.image} fill sizes="(max-width: 1023px) 50vw, 24vw" className="my-rounded object-cover" alt={img.heading || "Side feature banner"} />
            </div>
          </PreFetchLink>
        ))}
      </div>
    </div>
  );
};

export default FeatureProductsCategory;

// --- Server-Side Suspense Skeleton Loader ---
export function FeatureProductsCategorySkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 w-full items-stretch animate-pulse">
      {/* Left Skeleton Block */}
      <div className="w-full lg:w-[76%] bg-gray-100 my-rounded min-h-[250px] lg:min-h-[450px]" />

      {/* Right Aligned Side Skeleton Blocks */}
      <div className="w-full lg:w-[24%] flex flex-row lg:flex-col gap-4 lg:gap-6 xl:gap-8 items-stretch">
        <div className="flex-1 bg-gray-100 my-rounded min-h-[120px] lg:min-h-[210px]" />
        <div className="flex-1 bg-gray-100 my-rounded min-h-[120px] lg:min-h-[210px]" />
      </div>
    </div>
  );
}
