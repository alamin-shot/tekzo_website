"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import SwiperSliderHome from "./Swiper/HomeSlider";
import PreFetchLink from "./CustomUIComponent/PreFetchLink";
import SearchBar from "./SearchBar";

// Homepage-only. swiper is statically imported here on purpose — this
// component is only ever rendered by HomePage.jsx, so it's the sole route
// whose bundle pays for it. See Banner.jsx for why a dynamic()-wrapped
// version of this inside the shared component didn't achieve that.
const isVideo = (src) => /\.(webm|mp4|ogg)$/i.test(src || "");

const HomeBanner = ({ slidersData }) => {
  const heroImage = slidersData?.sliders || [];

  return (
    <div className="relative">
      <SearchBar />

      <SwiperSliderHome>
        {heroImage?.map((hero, index) => (
          <SwiperSlide key={hero.id}>
            <PreFetchLink
              prefetch={false}
              href={hero?.url}
              className="block w-full h-[150px] md:h-[300px] xl:h-[520px] rounded-2xl lg:rounded-[40px] overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
            >
              {isVideo(hero?.image) ? (
                <video
                  src={hero.image}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-[40px]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                />
              ) : (
                <Image
                  src={hero?.image || "/placeholder.jpg"}
                  alt={hero?.heading || "banner image"}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-[40px]"
                  height={3000}
                  width={4000}
                  sizes="100vw"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              )}
            </PreFetchLink>
          </SwiperSlide>
        ))}
      </SwiperSliderHome>
    </div>
  );
};

export default HomeBanner;
