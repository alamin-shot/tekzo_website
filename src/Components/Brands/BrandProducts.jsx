"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import Link from "next/link";
import Card from "../ReuseableComponent/Card";
import SwiperSlider4 from "../ReuseableComponent/Swiper/SwiperSlider4";
import CardMain from "../ReuseableComponent/CardMain";

const BrandProducts = ({ products }) => {
  // grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8
  return (
    <div className="mt-6 lg:mt-8 xl:mt-10 overflow-x-clip ">
      <SwiperSlider4>
        {products.slice(0, 4).map((product) => (
          <SwiperSlide key={product.id}>
            <CardMain
              key={product.id}
              product={product}
              name={product?.product_name}
              discountPrice={product?.discount_price}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discount={product?.discount_amount}
              discountPercentage={product?.discount_label}
              discountAmount={product?.discount_amount}
              rating={product?.rating}
              image={product?.product_image}
              link={product?.slug}
              from={"brand"}
            />
          </SwiperSlide>
        ))}
      </SwiperSlider4>
      <Link
        href={"/"}
        className="inline-block w-full my-4 mt-8 lg:my-6 xl:my-8 overflow-x-clip"
      >
        <Image
          src="/iPhone/Apple-Brand-Cover.webp"
          alt=""
          className="w-full h-25 xl:h-50 object-cover rounded-2xl xl:rounded-4xl"
          width={1200}
          height={3000}
          sizes="100vw"
          priority
          fetchPriority="high"
        />
      </Link>
      <SwiperSlider4>
        {products.slice(4, 8).map((product) => (
          <SwiperSlide key={product.id}>
            <CardMain
              key={product.id}
              product={product}
              name={product?.product_name}
              discountPrice={product?.discount_price}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discount={product?.discount_amount}
              discountPercentage={product?.discount_label}
              discountAmount={product?.discount_amount}
              rating={product?.rating}
              image={product?.product_image}
              link={product?.slug}
              from={"brand"}
            />
          </SwiperSlide>
        ))}
      </SwiperSlider4>
    </div>
  );
};

export default BrandProducts;
