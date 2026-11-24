"use client";

import React from "react";
import { Swiper } from "swiper/react";

// import "swiper/css/pagination";
// import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function SwiperSliderHome({ children }) {
  return (
    <div className="relative w-full rounded-2xl lg:rounded-[40px] overflow-hidden ">
      <Swiper
        spaceBetween={15}
        speed={1000}
        centeredSlides={false}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper relative"
        slidesPerView={1}
      >
        {children}
      </Swiper>

      {/* Style the pagination absolutely */}
    </div>
  );
}
