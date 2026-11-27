"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import type { HomeBannerProps } from "@/types/props/catalog";
import { fieldsOf, mapOpt, rec } from "@/lib/json";
import { str } from "@/lib/render";
import SwiperSliderHome from "./Swiper/HomeSlider";
import PreFetchLink from "./CustomUIComponent/PreFetchLink";
import SearchBar from "./SearchBar";

// Homepage-only. swiper is statically imported here on purpose — this
// component is only ever rendered by HomePage.jsx, so it's the sole route
// whose bundle pays for it. See Banner.jsx for why a dynamic()-wrapped
// version of this inside the shared component didn't achieve that.
// (`src || ""` then .test: RegExp.test stringifies its argument, as String() does.)
const isVideo = (src: unknown): boolean => /\.(webm|mp4|ogg)$/i.test(String(src || ""));

// `key={hero.id}`: throws for a null slide (as before); a missing id stays an
// undefined key rather than the string "undefined".
const keyOf = (hero: unknown): string | undefined => {
  const id = fieldsOf(hero).id;
  return id === undefined || id === null ? undefined : String(id);
};

const HomeBanner = ({ slidersData }: HomeBannerProps) => {
  const heroImage = rec(slidersData)?.sliders || [];

  return (
    <div className="relative">
      <SearchBar />

      <SwiperSliderHome>
        {mapOpt(heroImage, (hero, index) => {
          const h = rec(hero);
          return (
          <SwiperSlide key={keyOf(hero)}>
            <PreFetchLink
              prefetch={false}
              href={str(h?.url) ?? ""}
              className="block w-full h-[150px] md:h-[300px] xl:h-[520px] rounded-2xl lg:rounded-[40px] overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
            >
              {isVideo(h?.image) ? (
                <video
                  src={str(h?.image)}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-[40px]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                />
              ) : (
                <Image
                  src={str(h?.image) || "/placeholder.jpg"}
                  alt={str(h?.heading) || "banner image"}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-[40px]"
                  height={450}
                  width={1200}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              )}
            </PreFetchLink>
          </SwiperSlide>
          );
        })}
      </SwiperSliderHome>
    </div>
  );
};

export default HomeBanner;
