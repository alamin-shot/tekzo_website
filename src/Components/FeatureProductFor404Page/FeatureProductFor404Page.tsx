"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import SwiperSlider2 from "../ReuseableComponent/Swiper/SwiperSlider4";
import type { FeatureProductFor404Props } from "@/types/props/checkout";
import { isList, lowerOpt, rec } from "@/lib/json";
import { keyFrom } from "@/lib/render";

const FeatureProductFor404Page = ({ products = [] }: FeatureProductFor404Props) => {
  if (!isList(products) || products.length === 0) {
    return null;
  }

  const sliderOneProducts = products.slice(0, 4);
  const sliderTwoProducts = products.slice(4, 8);

  const hasFirstSlider = sliderOneProducts.length > 0;
  const hasSecondSlider = sliderTwoProducts.length > 0;

  return (
    <div className="mt-4 lg:mt-6 xl:mt-8 overflow-x-clip">
      {hasFirstSlider && (
        <SwiperSlider2>
          {sliderOneProducts.map((product) => (
            <SwiperSlide key={keyFrom(rec(product)?.id || rec(product)?._id)}>
              <CardMain
                name={rec(product)?.product_name}
                product={product}
                category={rec(rec(product)?.category)?.name}
                categoryLink={lowerOpt(rec(rec(product)?.category)?.slug)}
                currentPrice={rec(product)?.final_price}
                originalPrice={rec(product)?.regular_price}
                discountPercentage={rec(product)?.discount_label}
                discountAmount={rec(product)?.discount_amount}
                rating={rec(product)?.rating}
                image={rec(product)?.product_image}
                link={rec(product)?.slug}
                isStock={rec(product)?.is_stock}
              />
            </SwiperSlide>
          ))}
        </SwiperSlider2>
      )}

      <PreFetchLink
        prefetch={false}
        href={"/"}
        className="inline-block w-full my-4 lg:my-6 xl:my-8 overflow-x-clip"
      >
        <Image
          src={"/Used-Device-info-Banner.webp"}
          alt="404 page middle banner"
          className="w-full h-25 xl:h-50 object-cover rounded-2xl xl:rounded-4xl"
          width={1200}
          height={300}
          sizes="100vw"
          priority
          fetchPriority="high"
        />
      </PreFetchLink>

      {hasSecondSlider && (
        <SwiperSlider2>
          {sliderTwoProducts.map((product) => (
            <SwiperSlide key={keyFrom(rec(product)?.id || rec(product)?._id)}>
              <CardMain
                name={rec(product)?.product_name}
                product={product}
                category={rec(rec(product)?.category)?.name}
                categoryLink={lowerOpt(rec(rec(product)?.category)?.slug)}
                currentPrice={rec(product)?.final_price}
                originalPrice={rec(product)?.regular_price}
                discountPercentage={rec(product)?.discount_label}
                discountAmount={rec(product)?.discount_amount}
                rating={rec(product)?.rating}
                image={rec(product)?.product_image}
                link={rec(product)?.slug}
                isStock={rec(product)?.is_stock}
              />
            </SwiperSlide>
          ))}
        </SwiperSlider2>
      )}
    </div>
  );
};

export default FeatureProductFor404Page;
