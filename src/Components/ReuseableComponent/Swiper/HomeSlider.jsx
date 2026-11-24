"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// import "swiper/css/pagination";
// import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function SwiperSliderHome({ children }) {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);

  const onAutoplayTimeLeft = (s, time, progress) => {
    if (!progressCircle.current) return;
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  return (
    <div className="relative w-full rounded-2xl lg:rounded-[40px] overflow-hidden ">
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
        className="mySwiper relative"
        slidesPerView={1}
      >
        {children}
      </Swiper>

      {/* Style the pagination absolutely */}
    </div>
  );
}
