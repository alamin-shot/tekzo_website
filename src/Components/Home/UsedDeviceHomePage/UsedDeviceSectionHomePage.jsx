"use client";

import React from "react";
import DeviceCard from "@/Components/PreownedDevice/DeviceCard";
import UsedDeviceSlider from "@/Components/ReuseableComponent/Swiper/UsedDeviceSlider";
import { SwiperSlide } from "swiper/react";



export default function UsedDeviceSectionHomePage({ products }) {
  return (
    <div className="">
      {/* Responsive grid: 2 cols on mobile, 5 cols on larger screens */}
      <div className="overflow-x-clip rounded-2xl">
        {/* {products.map((listing) => (
          <DeviceCard key={listing.id} listing={listing} from={"homePage"} />
        ))} */}

        <UsedDeviceSlider>
          {products.map((listing) => (
            <SwiperSlide key={listing.id}>
              <DeviceCard listing={listing} from={"homePage"} />
            </SwiperSlide>
          ))}
        </UsedDeviceSlider>
      </div>
    </div>
  );
}
