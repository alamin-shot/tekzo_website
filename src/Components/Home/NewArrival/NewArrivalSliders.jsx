"use client";

import { SwiperSlide } from "swiper/react";
import SwiperSlider22 from "@/Components/ReuseableComponent/Swiper/SwiperSlider22";
import CardMain from "@/Components/ReuseableComponent/CardMain";

const NewArrivalSliders = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="text-center text-gray-500 py-8">No new arrival products available.</p>;
  }

  return (
    <div className="overflow-x-clip">
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
            />
          </SwiperSlide>
        ))}
      </SwiperSlider22>
    </div>
  );
};

export default NewArrivalSliders;
