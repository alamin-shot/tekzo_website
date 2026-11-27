"use client";

import type { SliderProps } from "@/types/props/home";

import React, { useState } from "react";
import LazySwiper from "./LazySwiper";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import CategorySliderSkeleton from "@/Components/Home/Categories/CategorySliderSkeleton";

export default function SwiperSlider3({ children }: SliderProps) {
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
          onInit={() => setIsLoaded(true)}
          className="mySwiper relative [&_.swiper-wrapper]:!flex [&_.swiper-wrapper]:!items-stretch [&_.swiper-slide]:!h-auto [&_.swiper-slide>*]:!h-full"
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 25,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
        >
          {children}
        </LazySwiper>
      </div>

      {/* Skeleton overlays absolutely — removed from DOM once Swiper is ready */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <CategorySliderSkeleton />
        </div>
      )}
    </div>
  );
}
