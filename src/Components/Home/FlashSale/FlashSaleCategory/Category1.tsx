import SwiperSlider2 from "@/Components/ReuseableComponent/Swiper/SwiperSlider2";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SwiperSlide } from "swiper/react";
import type { HomeSectionProps } from "@/types/props/home";
import { fieldsOf } from "@/lib/json";
import { str } from "@/lib/render";

const Category1 = ({ slidersData }: HomeSectionProps) => {
  // `slidersData.x` / `card.url`: a missing value threw before; fieldsOf keeps that.
  const sliders = fieldsOf(slidersData);
  const newFeatureBannerImage = sliders.newFeatureBanner;
  const comingSoonBannerImage = sliders.comingSoonBanner;

  const cards = [newFeatureBannerImage, comingSoonBannerImage];

  return (
    <div className="my-mt overflow-x-hidden">
      <SwiperSlider2>
        {cards.map((entry, index) => {
          const card = fieldsOf(entry);
          return (
          <SwiperSlide key={index} className="!h-auto flex">
            <Link prefetch={false} href={str(card.url) ?? ""} className="relative w-full h-full flex flex-col">
              <div className="relative w-full h-full grow">
                <Image src={str(card.image) ?? ""} alt={str(card.heading) ?? ""} className="w-full h-full object-cover rounded-2xl md:rounded-[40px]" width={4000} height={3000} />
              </div>
            </Link>
          </SwiperSlide>
          );
        })}
      </SwiperSlider2>
    </div>
  );
};

export default Category1;
