import SwiperSlider2 from "@/Components/ReuseableComponent/Swiper/SwiperSlider2";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SwiperSlide } from "swiper/react";

const Category1 = ({ slidersData }) => {
  const newFeatureBannerImage = slidersData.newFeatureBanner;
  const comingSoonBannerImage = slidersData.comingSoonBanner;

  const cards = [newFeatureBannerImage, comingSoonBannerImage];

  return (
    <div className="my-mt overflow-x-hidden">
      <SwiperSlider2>
        {cards.map((card, index) => (
          <SwiperSlide key={index} className="!h-auto flex">
            <Link prefetch={false} href={card.url} className="relative w-full h-full flex flex-col">
              <div className="relative w-full h-full grow">
                <Image src={card.image} alt={card.heading} className="w-full h-full object-cover rounded-2xl md:rounded-[40px]" width={4000} height={3000} />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </SwiperSlider2>
    </div>
  );
};

export default Category1;
