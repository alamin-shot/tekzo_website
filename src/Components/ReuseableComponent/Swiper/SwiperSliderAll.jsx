"use client";

import React from "react";
import { Swiper } from "swiper/react";

import { Autoplay, FreeMode } from "swiper/modules";

export default function SwiperSliderAll({ children }) {
  return (
    <div className="relative w-full overflow-x-hidden my-mt">
      <Swiper
        loop={true}
        speed={6000}
        allowTouchMove={true}
        grabCursor={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        freeMode={true}
        slidesPerView={1.3}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 1.3, spaceBetween: 15 },
          768: { slidesPerView: 2.5, spaceBetween: 20 },
          1024: { slidesPerView: 3.5, spaceBetween: 30 },
        }}
        modules={[Autoplay, FreeMode]}
        className="mySwiper marquee-swiper"
      >
        {children}
      </Swiper>
    </div>
  );
}
