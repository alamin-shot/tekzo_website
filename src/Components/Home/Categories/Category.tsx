"use client";

import React, { useMemo, useState, useEffect } from "react";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import LazySwiper from "@/Components/ReuseableComponent/Swiper/LazySwiper";
import { Autoplay, Pagination } from "swiper/modules";
import type { HomeItemProps, CategorySliderProps } from "@/types/props/home";
import { isList, lowerOpt, rec } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

const CategoryCard = ({ item }: HomeItemProps) => {
  const i = rec(item);
  return (
  <PreFetchLink prefetch={false} href={`/categories/${lowerOpt(i?.slug)}`} aria-label={`${i?.name} home category`} className="flex flex-col items-center group w-full text-center">
    {/* Premium Box: crisp white surface, subtle border, gentle shadow and micro-lift on hover */}
    <div className="w-full aspect-square bg-white border border-gray-200/80 rounded-2xl md:rounded-3xl flex items-center justify-center p-2.5 sm:p-3 md:p-3.5 shadow-xs group-hover:shadow-md group-hover:border-secondary/40 group-hover:-translate-y-1 transition-all duration-300 ease-out">
      <Image
        src={str(i?.logo || i?.image || i?.primary_logo || "/placeholder.jpg") ?? ""}
        alt={`${i?.name} category`}
        width={140}
        height={140}
        // The box is 1/4 of the row on mobile and 1/8 from md up, and the logo
        // fills 66% of it; without sizes the browser fetched a 384px file for
        // a ~45px logo on mobile.
        sizes="(max-width: 767px) 16vw, 9vw"
        className="w-[66%] h-[66%] object-contain group-hover:scale-108 transition-transform duration-300 ease-out"
      />
    </div>

    {/* Item name: polished typography outside the box */}
    <p className="mt-2 md:mt-2.5 text-[11px] sm:text-xs md:text-[14px] font-semibold text-gray-700 group-hover:text-secondary whitespace-nowrap truncate max-w-full tracking-tight transition-colors duration-200">
      {nodeOf(i?.name)}
    </p>
  </PreFetchLink>
  );
};

const Category = ({ categoriesData = [] }: CategorySliderProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount the rest of the slides during idle time after initial paint/hydration
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setMounted(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Group categories into chunks of 8 (8 items per slide on both mobile and desktop)
  const slides = useMemo(() => {
    const items: unknown[] = isList(categoriesData) ? categoriesData : [];
    const chunks: unknown[][] = [];
    for (let i = 0; i < items.length; i += 8) {
      chunks.push(items.slice(i, i + 8));
    }
    return chunks;
  }, [categoriesData]);

  if (!slides.length) return null;

  // Render first slide during SSR / initial paint; mount the rest after hydration
  const visibleSlides = mounted ? slides : slides.slice(0, 1);

  return (
    <div className="relative w-full overflow-hidden circle-pagination-container pb-2">
      <LazySwiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={20}
        speed={650}
        rewind={true}
        grabCursor={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        className="pt-2 pb-1 !overflow-visible"
      >
        {visibleSlides.map((slideItems, slideIndex) => (
          <SwiperSlide key={slideIndex}>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3 md:gap-3.5 xl:gap-4 items-start">
              {slideItems.map((item) => (
                <CategoryCard key={keyFrom(rec(item)?.id || rec(item)?.slug)} item={item} />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </LazySwiper>
    </div>
  );
};

export default Category;
