"use client";

import SwiperSlider2 from "@/Components/ReuseableComponent/Swiper/SwiperSlider4";
import Card from "../../ReuseableComponent/Card";
import { SwiperSlide } from "swiper/react";
import SwiperSlider22 from "@/Components/ReuseableComponent/Swiper/SwiperSlider22";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import type { HomeSectionProps } from "@/types/props/home";
import { lengthOf, lowerOpt, mapList, rec } from "@/lib/json";
import { idKey } from "@/lib/render";

const FlashSaleSliders = ({ products }: HomeSectionProps) => {
  if (!products || lengthOf(products) === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No flash sale products available.
      </p>
    );
  }

  return (
    <div className="">
      <SwiperSlider22>
        {mapList(products, (entry) => {
          const product = rec(entry);
          return (
          <SwiperSlide key={idKey(entry)}>
            <CardMain
              name={product?.product_name}
              product={entry}
              category={rec(product?.category)?.name}
              categoryLink={lowerOpt(rec(product?.category)?.slug)}
              badge={product?.badge}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discountPercentage={product?.discount_label}
              discountAmount={product?.discount_amount}
              rating={product?.rating}
              image={product?.product_image}
              link={product?.slug}
              isStock={product?.is_stock}
              productData={entry}
              from="flashSale"
            />
          </SwiperSlide>
          );
        })}
      </SwiperSlider22>
    </div>
  );
};

export default FlashSaleSliders;
