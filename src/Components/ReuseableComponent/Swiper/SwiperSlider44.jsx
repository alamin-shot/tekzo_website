"use client";

import React, { useState } from "react";
import LazySwiper from "./LazySwiper";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import SkeletonFlashSell from "@/Components/Home/FlashSale/SkeletonFlashSell";

export default function SwiperSlider44({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full">
      {/* 1. Show skeleton ONLY while loading */}
      {!isLoaded && (
        <div className="w-full">
          <SkeletonFlashSell />
        </div>
      )}

      {/* 2. Hidden initially without crashing Swiper inner metrics, fades in beautifully */}
      <div
        className={`w-full transition-opacity duration-300 ${
          isLoaded
            ? "opacity-100 h-auto visible"
            : "opacity-0 h-0 overflow-hidden invisible"
        }`}
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
        >
          {children}
        </LazySwiper>
      </div>

      {/* Style the pagination absolutely */}
    </div>
  );
}
