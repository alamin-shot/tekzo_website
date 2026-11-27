"use client";

import React from "react";
import DeviceCard from "@/Components/PreownedDevice/DeviceCard";
import UsedDeviceSlider from "@/Components/ReuseableComponent/Swiper/UsedDeviceSlider";
import { SwiperSlide } from "swiper/react";
import type { HomeSectionProps } from "@/types/props/home";
import { mapList } from "@/lib/json";
import { idKey } from "@/lib/render";



export default function UsedDeviceSectionHomePage({ products }: HomeSectionProps) {
  return (
    <div className="">
      {/* Responsive grid: 2 cols on mobile, 5 cols on larger screens */}
      <div className="overflow-x-clip rounded-2xl">
        {/* {products.map((listing) => (
          <DeviceCard key={listing.id} listing={listing} from={"homePage"} />
        ))} */}

        <UsedDeviceSlider>
          {mapList(products, (listing) => (
            <SwiperSlide key={idKey(listing)}>
              {/* className was never passed; explicit undefined satisfies DeviceCard's inferred (JS) props. */}
              <DeviceCard listing={listing} from={"homePage"} className={undefined} />
            </SwiperSlide>
          ))}
        </UsedDeviceSlider>
      </div>
    </div>
  );
}
