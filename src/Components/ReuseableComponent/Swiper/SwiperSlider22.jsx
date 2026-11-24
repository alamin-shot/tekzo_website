"use client";

import React, { useRef, useState } from "react";
import LazySwiper from "./LazySwiper";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import SkeletonFlashSell from "@/Components/Home/FlashSale/SkeletonFlashSell";

export default function SwiperSlider22({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const progressCircle = useRef(null);
  const progressContent = useRef(null);

  const onAutoplayTimeLeft = (s, time, progress) => {
    if (!progressCircle.current) return;
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  return (
    <div className="relative w-full">
      {/* 1. Skeleton Loader: overlays the swiper (doesn't affect layout height) */}
      {!isLoaded && (
        <div className="absolute inset-0">
          <SkeletonFlashSell></SkeletonFlashSell>
        </div>
      )}

      {/* 2. Swiper Container: stays in normal flow (real height) the whole
         time so the page never collapses/re-expands around it — only its
         opacity toggles once initialized. */}
      <div
        className={`w-full transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <LazySwiper
          spaceBetween={15}
          speed={1200}
          centeredSlides={false}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={false}
          modules={[Autoplay, Pagination, Navigation]}
          onAutoplayTimeLeft={onAutoplayTimeLeft}
          onInit={() => setIsLoaded(true)}
          className="mySwiper22 relative [&_.swiper-wrapper]:!flex [&_.swiper-wrapper]:!items-stretch [&_.swiper-slide]:!h-auto [&_.swiper-slide>*]:!h-full"
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
    </div>
  );
}
