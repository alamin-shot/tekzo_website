import MyImageSquire from "@/Components/ReuseableComponent/MyImageSquire";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { HomeSectionProps } from "@/types/props/home";
import { fieldsOf, mapList } from "@/lib/json";
import { idKey, str } from "@/lib/render";

const Category2 = ({ slidersData }: HomeSectionProps) => {
  const fourCardBannersImage = fieldsOf(slidersData).fourCardBanners;

  return (
    <div className="mt-4 lg:mt-6 xl:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 ">
      {mapList(fourCardBannersImage, (entry) => {
        const img = fieldsOf(entry);
        return (
        <Link prefetch={false} key={idKey(entry)} href={str(img.url) || "/"}>
          <Image src={str(img.image) ?? ""} alt={str(img.banner_feature) ?? ""} width={1000} height={1000} className="my-rounded"></Image>
        </Link>
        );
      })}
    </div>
  );
};

export default Category2;
