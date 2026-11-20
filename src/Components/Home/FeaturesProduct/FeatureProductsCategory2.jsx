"use client";

import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import SwiperSliderAll from "@/Components/ReuseableComponent/Swiper/SwiperSliderAll";
import Title from "@/Components/ReuseableComponent/Title";
import TitleHeading from "@/Components/ReuseableComponent/TitleHeading";
import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { SwiperSlide } from "swiper/react";

const FeatureProductsCategory2 = ({ brands }) => {
  return (
    <div className="my-mt">
      <TitleHeading>
        <Title>Explore Brands</Title>

        <div className="gradient rounded-full p-[1] md:p-0.5 group">
          <PreFetchLink
            prefetch={false}
            href={"/brands"}
            className="text-sm rounded-full  py-1 md:py-2  px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
          >
            See All{" "}
            <MdOutlineKeyboardArrowRight className=" bg-black text-white text-lg rounded-full group-hover:bg-secondary duration-200" />{" "}
          </PreFetchLink>
        </div>
      </TitleHeading>
      <SwiperSliderAll>
        {brands.map((brand) => (
          <SwiperSlide key={brand.id}>
            <div>
              <div className="relative group">
                <PreFetchLink
                  prefetch={false}
                  href={`/brands/${brand?.slug?.toLowerCase()}`}
                  className="relative h-[100px] lg:h-[200px] block w-full rounded-2xl xl:rounded-4xl overflow-hidden"
                >
                  {/* Shop Banner — displayed at most h-[200px], full container
                      width; intrinsic size only needs to be a bit above that,
                      not 4000x3000 (was forcing near-max-resolution requests
                      for every one of the ~72 brands here). */}
                  <Image
                    src={brand.shop_banner || "/all-product-banner.webp"}
                    alt={brand.name}
                    height={200}
                    width={800}
                    sizes="100vw"
                    className="w-full h-full object-cover brightness-50 duration-400"
                  />

                  {/* Secondary Logo on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-24 h-12 lg:w-36 lg:h-16">
                      {/* Displayed at most 144x64 (lg:w-36 lg:h-16) — 2x for
                          retina is plenty, not 8000x4000. */}
                      <Image
                        src={brand.secondary_logo || "/all-product-banner.webp"}
                        alt={brand.name}
                        width={288}
                        height={128}
                        className="w-full h-full object-contain brightness-0 invert"
                      />
                    </div>
                  </div>
                </PreFetchLink>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </SwiperSliderAll>
    </div>
  );
};

export default FeatureProductsCategory2;
