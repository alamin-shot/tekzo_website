import MyImageSquire from "@/Components/ReuseableComponent/MyImageSquire";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Category2 = ({ slidersData }) => {
  const fourCardBannersImage = slidersData.fourCardBanners;

  return (
    <div className="mt-4 lg:mt-6 xl:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 ">
      {fourCardBannersImage.map((img) => (
        <Link prefetch={false} key={img.id} href={img.url || "/"}>
          <Image src={img.image} alt={img.banner_feature} width={1000} height={1000} className="my-rounded"></Image>
        </Link>
      ))}
    </div>
  );
};

export default Category2;
