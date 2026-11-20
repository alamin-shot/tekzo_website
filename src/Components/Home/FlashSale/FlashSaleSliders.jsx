"use client";

import SwiperSlider2 from "@/Components/ReuseableComponent/Swiper/SwiperSlider4";
import Card from "../../ReuseableComponent/Card";
import { SwiperSlide } from "swiper/react";
import SwiperSlider22 from "@/Components/ReuseableComponent/Swiper/SwiperSlider22";
import CardMain from "@/Components/ReuseableComponent/CardMain";

const FlashSaleSliders = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No flash sale products available.
      </p>
    );
  }

  return (
    <div className="">
      <SwiperSlider22>
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <CardMain
              name={product?.product_name}
              product={product}
              category={product?.category?.name}
              categoryLink={product?.category?.slug?.toLowerCase()}
              badge={product?.badge}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discountPercentage={product?.discount_label}
              discountAmount={product?.discount_amount}
              rating={product?.rating}
              image={product?.product_image}
              link={product?.slug}
              isStock={product?.is_stock}
              productData={product}
              from="flashSale"
            />
          </SwiperSlide>
        ))}
      </SwiperSlider22>
    </div>
  );
};

export default FlashSaleSliders;
