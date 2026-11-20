"use client";

import React, { useRef, useState } from "react";
import { Swiper } from "swiper/react";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import SkeletonFlashSell from "@/Components/Home/FlashSale/SkeletonFlashSell";

export default function SwiperSlider44({ children }) {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const onAutoplayTimeLeft = (s, time, progress) => {
    if (!progressCircle.current) return;
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

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
        <Swiper
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
        </Swiper>
      </div>

      {/* Style the pagination absolutely */}
    </div>
  );
}
