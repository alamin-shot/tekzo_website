"use client";

import React from "react";
import { Swiper } from "swiper/react";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function SwiperSlider2({ children }) {
  return (
    <div className="relative w-full mb-8 lg:mb-0">
      <Swiper
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
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
        }}
      >
        {children}
      </Swiper>

      {/* Style the pagination absolutely */}
    </div>
  );
}
