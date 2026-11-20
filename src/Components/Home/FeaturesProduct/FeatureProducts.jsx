"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import SwiperSlider4 from "../../ReuseableComponent/Swiper/SwiperSlider4";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import SwiperSlider44 from "@/Components/ReuseableComponent/Swiper/SwiperSlider44";
import TitleHeading from "@/Components/ReuseableComponent/TitleHeading";
import Title from "@/Components/ReuseableComponent/Title";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const FeatureProducts = ({ slidersData, products }) => {
  // getSliders()/getFeaturedProducts() fall back to [] when the API is down,
  // so neither the banner object nor a products array can be assumed.
  const homePageLargeBannerImage = slidersData?.homePageLargeBanner;
  const productList = Array.isArray(products) ? products : [];

  return (
    <div className="mt-4 lg:mt-6">
      <TitleHeading className="flex items-center justify-between gap-2">
        <Title className="text-base sm:text-lg md:text-xl truncate">Today's Best Tech Deals</Title>

        <div className="gradient rounded-full p-[1px] md:p-0.5 group shrink-0">
          <PreFetchLink
            prefetch={false}
            href="/featured-products"
            className="text-xs sm:text-sm whitespace-nowrap rounded-full py-1.5 md:py-2 px-2.5 sm:px-3 md:px-4 bg-white flex gap-1 sm:gap-2 items-center group-hover:text-secondary duration-200"
          >
            See All
            <MdOutlineKeyboardArrowRight className="bg-black text-white text-base sm:text-lg rounded-full group-hover:bg-secondary duration-200" />
          </PreFetchLink>
        </div>
      </TitleHeading>
      <div className=" xl:mt-8 overflow-x-clip">
        <SwiperSlider4>
          {productList.slice(0, 4).map((product) => (
            <SwiperSlide key={product.id}>
              <CardMain
                name={product?.product_name}
                product={product}
                category={product?.category?.name}
                categoryLink={product?.category?.slug?.toLowerCase()}
                currentPrice={product?.final_price}
                originalPrice={product?.regular_price}
                discountPercentage={product?.discount_label}
                discountAmount={product?.discount_amount}
                rating={product?.rating}
                image={product?.product_image}
                link={product?.slug}
                isStock={product?.is_stock}
              />
            </SwiperSlide>
          ))}
        </SwiperSlider4>

        {homePageLargeBannerImage?.image && (
          <PreFetchLink prefetch={false} href={homePageLargeBannerImage.url || "/"} className="inline-block w-full mt-4 lg:mt-6 xl:mt-8 mb-2 lg:mb-4 overflow-x-clip">
            <Image
              src={homePageLargeBannerImage.image}
              alt={homePageLargeBannerImage.banner_feature || "home page banner"}
              className="w-full h-25 xl:h-50 object-cover rounded-2xl xl:rounded-4xl"
              width={1200}
              height={200}
              sizes="100vw"
              loading="lazy"
            />
          </PreFetchLink>
        )}
        <div className="mb-4 lg:mb-6">
          <Title className="text-base sm:text-lg md:text-xl truncate">Best Selling Smartphones</Title>
        </div>

        <SwiperSlider44>
          {productList.slice(4, 8).map((product) => (
            <SwiperSlide key={product.id}>
              <CardMain
                name={product?.product_name}
                product={product}
                category={product?.category?.name}
                categoryLink={product?.category?.slug?.toLowerCase()}
                currentPrice={product?.final_price}
                originalPrice={product?.regular_price}
                discountPercentage={product?.discount_label}
                discountAmount={product?.discount_amount}
                rating={product?.rating}
                image={product?.product_image}
                link={product?.slug}
                isStock={product?.is_stock}
              />
            </SwiperSlide>
          ))}
        </SwiperSlider44>
      </div>
    </div>
  );
};

export default FeatureProducts;
