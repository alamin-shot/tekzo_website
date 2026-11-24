"use client";

import React, { useState } from "react";
import LazySwiper from "./LazySwiper";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import SkeletonFlashSell from "@/Components/Home/FlashSale/SkeletonFlashSell";

export default function SwiperSlider4({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full">
      {/* Swiper always in DOM — defines the outer height so nothing shifts */}
      <div
        className={`w-full transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        <LazySwiper
          spaceBetween={15}
          speed={1000}
          centeredSlides={false}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={false}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper relative [&_.swiper-wrapper]:!flex [&_.swiper-wrapper]:!items-stretch [&_.swiper-slide]:!h-auto [&_.swiper-slide>*]:!h-full"
          onInit={() => setIsLoaded(true)}
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 25,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          style={{
            "--swiper-wrapper-display": "flex",
          }}
        >
          {children}
        </LazySwiper>
      </div>

      {/* Skeleton overlays absolutely — removed from DOM once Swiper is ready */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <SkeletonFlashSell />
        </div>
      )}
    </div>
  );
}
