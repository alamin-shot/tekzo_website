"use client";

import Title from "../../ReuseableComponent/Title";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Image from "next/image";
import TitleHeading from "../../ReuseableComponent/TitleHeading";
import Section from "../../ReuseableComponent/Section";
import { SwiperSlide } from "swiper/react";
import SwiperSlider3 from "@/Components/ReuseableComponent/Swiper/SwiperSlider3";
import Category from "./Category";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import type { HomeSectionProps } from "@/types/props/home";
import { fieldsOf, lengthOf, mapList, rec } from "@/lib/json";
import { idKey, str } from "@/lib/render";

const Categories = ({ slidersData, categoriesData }: HomeSectionProps) => {
  const bannerImage = rec(slidersData)?.banners || [];

  return (
    <div>
      <Section>
        {/* Categories Section */}
        <div>
          <TitleHeading>
            <Title>
              <span className="hidden md:inline-block">Shop By Popular</span> Categories
            </Title>

            <div className="gradient rounded-full p-[1px] md:p-0.5 group">
              <PreFetchLink
                prefetch={false}
                href={"/categories"}
                className="text-xs md:text-sm font-medium rounded-full py-1 md:py-1.5 px-3 md:px-4 bg-white flex gap-1.5 md:gap-2 items-center group-hover:text-secondary transition-all duration-200 shadow-xs"
              >
                <span>See All</span>
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-secondary group-hover:translate-x-0.5 transition-all duration-200">
                  <MdOutlineKeyboardArrowRight className="text-base" />
                </span>
              </PreFetchLink>
            </div>
          </TitleHeading>

          {/* display category card */}
          <Category categoriesData={categoriesData} />
        </div>

        {Number(lengthOf(bannerImage)) > 0 && (
          <div className="overflow-clip mt-6 lg:mt-8">
            <SwiperSlider3>
              {mapList(bannerImage, (card) => (
                <SwiperSlide key={idKey(card)}>
                  <PreFetchLink
                    prefetch={false}
                    href={str(fieldsOf(card).url) || "/"}
                    className="w-full"
                  >
                    <Image
                      src={str(rec(card)?.image) || "/placeholder.jpg"}
                      alt={str(rec(card)?.heading) || "banner image"}
                      className="w-full h-auto rounded-2xl lg:rounded-[40px]"
                      width={800}
                      height={600}
                      sizes="(max-width: 1023px) 50vw, 33vw"
                    />
                  </PreFetchLink>
                </SwiperSlide>
              ))}
            </SwiperSlider3>
          </div>
        )}
      </Section>
    </div>
  );
};

export default Categories;
