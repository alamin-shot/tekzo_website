import Image from "next/image";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import { getAllBrands } from "@/lib/api";
import { fieldsOf, isList, lengthOf, lowerOpt, mapList, rec, sliceOf } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

async function getBrandsData() {
  try {
    const result = await getAllBrands();

    const data = rec(result)?.data;
    if (data) {
      return {
        brands: rec(data)?.brands || [],
        seoData: rec(data)?.seoData || {},
      };
    }
    if (isList(result)) return { brands: result, seoData: {} };
    return { brands: [], seoData: {} };
  } catch (error) {
    console.error("Brands Fetch Error:", error);
    return { brands: [], seoData: {} };
  }
}

const BrandList = async () => {
  const { brands, seoData } = await getBrandsData();
  if (!lengthOf(brands)) {
    return (
      <div className="text-center col-span-full py-10 text-gray-500">
        No brands found.
      </div>
    );
  }

  // (`brands.length - 1` converts the length to a number, as Number() does)
  const leng = Number(lengthOf(brands)) - 1;
  const midPoint = Math.ceil(leng / 6);
  const firstHalf = sliceOf(brands, 0, midPoint);
  const secondHalf = sliceOf(brands, midPoint);
  const seo = rec(seoData);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-gap-y ">
      {mapList(firstHalf, (entry) => {
        // `brand.id` / `brand.name` threw for a null brand; fieldsOf keeps that.
        const brand = fieldsOf(entry);
        return (
        <div key={idKey(entry)}>
          {/* Banner with hover effect */}
          <div className="relative group">
            <PreFetchLink
              href={`/brands/${lowerOpt(brand?.slug)}`}
              className=" relative h-[100px] lg:h-[200px] block w-full rounded-2xl lg:rounded-3xl overflow-hidden"
              prefetch={false}
            >
              {/* Shop Banner */}
              <Image
                src={str(brand.shop_banner || "/all-product-banner.webp") ?? ""}
                alt={str(brand.name) ?? ""}
                width={8000}
                height={5000}
                className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
              />

              {/* Secondary Logo on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                <div className="relative w-24 h-12 lg:w-36 lg:h-16">
                  <Image
                    src={str(brand.secondary_logo || "/all-product-banner.webp") ?? ""}
                    alt={str(brand.name) ?? ""}
                    fill
                    sizes="(max-width: 768px) 96px, 144px"
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </div>
            </PreFetchLink>
          </div>

          {/* Brand Info Below Banner */}
          <div className="flex gap-2 lg:gap-3 mt-1 lg:mt-3 items-center">
            <div className="w-12 lg:w-18 shrink-0 bg-gray-100 p-2 rounded-lg">
              <Image
                src={str(brand?.primary_logo || "/all-product-banner.webp") ?? ""}
                alt={str(brand.name) ?? ""}
                width={72}
                height={54}
                className="w-full h-auto object-contain"
              />
            </div>
            <h4 className="text-sm lg:text-lg text-gray-700 line-clamp-2">
              {nodeOf(brand.name)}
            </h4>
          </div>
        </div>
        );
      })}
      {nodeOf(seo?.info_banner && (
        <div className="w-full h-30 lg:h-50 xl:h-60  overflow-hidden col-span-2 lg:col-span-3 xl:col-span-4">
          <Image
            src={str(seo.info_banner) ?? ""}
            alt={str(seo?.title || "Brand Banner") ?? ""}
            width={4000}
            height={3000}
            className="w-full h-full object-cover rounded-2xl lg:rounded-3xl"
          />
        </div>
      ))}
      {mapList(secondHalf, (entry) => {
        const brand = fieldsOf(entry);
        return (
        <div key={idKey(entry)}>
          {/* Banner with hover effect */}
          <div className="relative group">
            <PreFetchLink
              href={`/brands/${lowerOpt(brand?.slug)}`}
              className="relative h-[100px] lg:h-[200px] block w-full rounded-2xl lg:rounded-3xl overflow-hidden"
              prefetch={false}
            >
              {/* Shop Banner */}
              <Image
                src={str(brand.shop_banner || "/all-product-banner.webp") ?? ""}
                alt={str(brand.name) ?? ""}
                width={8000}
                height={5000}
                className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
              />

              {/* Secondary Logo on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                <div className="relative w-24 h-12 lg:w-36 lg:h-16">
                  <Image
                    src={str(brand.secondary_logo || "/all-product-banner.webp") ?? ""}
                    alt={str(brand.name) ?? ""}
                    fill
                    sizes="(max-width: 768px) 96px, 144px"
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </div>
            </PreFetchLink>
          </div>

          {/* Brand Info Below Banner */}
          <div className="flex gap-2 lg:gap-3 mt-1 lg:mt-3 items-center">
            <div className="w-12 lg:w-18 shrink-0 bg-gray-100 p-2 rounded-lg">
              <Image
                src={str(brand?.primary_logo || "/all-product-banner.webp") ?? ""}
                alt={str(brand.name) ?? ""}
                width={72}
                height={54}
                className="w-full h-auto object-contain"
              />
            </div>
            <h4 className="text-sm lg:text-lg text-gray-700 line-clamp-2">
              {nodeOf(brand.name)}
            </h4>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default BrandList;
