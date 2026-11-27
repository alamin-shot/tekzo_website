"use client";

import Title from "../../ReuseableComponent/Title";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import TitleHeading from "../../ReuseableComponent/TitleHeading";
import Section from "../../ReuseableComponent/Section";
import Brand from "./Brand";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import type { HomeSectionProps } from "@/types/props/home";
import { isList } from "@/lib/json";

const Brands = ({ brands = [] }: HomeSectionProps) => {
  const displayBrands: unknown[] = isList(brands) ? brands : [];

  if (!displayBrands.length) return null;

  return (
    <div>
      <Section>
        <TitleHeading>
          <Title>
            <span className="hidden md:inline-block">Shop By Popular</span> Brands
          </Title>

          <div className="gradient rounded-full p-[1px] md:p-0.5 group">
            <PreFetchLink
              prefetch={false}
              href={"/brands"}
              className="text-xs md:text-sm font-medium rounded-full py-1 md:py-1.5 px-3 md:px-4 bg-white flex gap-1.5 md:gap-2 items-center group-hover:text-secondary transition-all duration-200 shadow-xs"
            >
              <span>See All</span>
              <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-secondary group-hover:translate-x-0.5 transition-all duration-200">
                <MdOutlineKeyboardArrowRight className="text-base" />
              </span>
            </PreFetchLink>
          </div>
        </TitleHeading>

        {/* display brand card */}
        <Brand brandsData={displayBrands} />
      </Section>
    </div>
  );
};

export default Brands;
