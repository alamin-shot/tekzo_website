"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import SwiperSlider2 from "../ReuseableComponent/Swiper/SwiperSlider4";

const FeatureProductFor404Page = ({ products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) {
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
            <SwiperSlide key={product?.id || product?._id}>
              <CardMain
                name={product?.product_name}
                product={product}
                category={product?.category?.name}
                categoryLink={product?.category?.slug?.toLowerCase()}
                currentPrice={product?.final_price}
                originalPrice={product?.regular_price}
                discountPercentage={product?.discount_label}
                discountAmount={product?.discount_amount}
                rating={product?.rating}
                image={product?.product_image}
                link={product?.slug}
                isStock={product?.is_stock}
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
            <SwiperSlide key={product?.id || product?._id}>
              <CardMain
                name={product?.product_name}
                product={product}
                category={product?.category?.name}
                categoryLink={product?.category?.slug?.toLowerCase()}
                currentPrice={product?.final_price}
                originalPrice={product?.regular_price}
                discountPercentage={product?.discount_label}
                discountAmount={product?.discount_amount}
                rating={product?.rating}
                image={product?.product_image}
                link={product?.slug}
                isStock={product?.is_stock}
              />
            </SwiperSlide>
          ))}
        </SwiperSlider2>
      )}
    </div>
  );
};

export default FeatureProductFor404Page;
