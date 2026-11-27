import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import Image from "next/image";
import type { HomeSectionProps } from "@/types/props/home";
import { fieldsOf, firstOf, mapList, rec, sliceOf } from "@/lib/json";
import { idKey, str } from "@/lib/render";

const FeatureProductsCategory = ({ slidersData }: HomeSectionProps) => {
  const threeCardBannersImage = rec(slidersData)?.threeCardBanners || [];
  const sideImages = sliceOf(threeCardBannersImage, 1, 3);
  const firstImage = firstOf(threeCardBannersImage);

  if (!firstImage) return null;
  const first = fieldsOf(firstImage);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 w-full items-stretch">
      {/* Left Large Banner (76% Width) */}
      <PreFetchLink prefetch={false} href={str(first.url) || "/"} className="w-full lg:w-[76%] block">
        <div className="w-full relative aspect-[16/9] lg:aspect-[2/1]">
          <Image src={str(first.image) ?? ""} alt={str(first.heading) || "Main feature banner"} fill sizes="(max-width: 1023px) 100vw, 76vw" className="my-rounded object-cover" loading="lazy" />
        </div>
      </PreFetchLink>

      {/* Right Aligned Small Side Banners (24% Width) */}
      <div className="w-full lg:w-[24%] flex flex-row lg:flex-col gap-4 lg:gap-6 xl:gap-8 items-stretch justify-between">
        {mapList(sideImages, (entry) => {
          const img = fieldsOf(entry);
          return (
          <PreFetchLink prefetch={false} key={idKey(entry)} href={str(img.url) || "/"} className="flex-1 self-stretch min-w-0">
            <div className="w-full relative aspect-[4/3]">
              <Image src={str(img.image) ?? ""} fill sizes="(max-width: 1023px) 50vw, 24vw" className="my-rounded object-cover" alt={str(img.heading) || "Side feature banner"} />
            </div>
          </PreFetchLink>
          );
        })}
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
