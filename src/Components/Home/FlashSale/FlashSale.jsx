import dynamic from "next/dynamic";
import Image from "next/image";
import Section from "../../ReuseableComponent/Section";
import { getFlashSaleData } from "@/lib/api";
import FlashSaleCountdown from "./FlashSaleCountdown";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";

// swiper only ships to routes that actually render a slider — see
// Banner.jsx for why this has to be a dynamic import at the call site
// rather than just inside FlashSaleSliders itself.
const FlashSaleSliders = dynamic(() => import("./FlashSaleSliders"));

// The flash-sale API returns every offer product (100+). Rendering all of them
// into the autoplaying homepage slider made iOS (Chrome/Safari) run out of
// memory and kill the tab ("Can't open this page"). The full list lives on
// /flash-sale behind "See All".
const HOME_FLASH_SALE_LIMIT = 12;

const FlashSale = async ({ slidersData }) => {
  const { products, endAt, seoData } = await getFlashSaleData({ limit: HOME_FLASH_SALE_LIMIT });

  if (!products?.length) {
    return null;
  }

  const bgImage = slidersData?.flashSellBanner?.image || seoData?.banner || seoData?.info_banner;
  const heading = slidersData?.flashSellBanner?.heading || seoData?.title || "Flash Sale";

  return (
    <div>
      <Section>
        <div className="relative isolate my-rounded overflow-hidden min-h-[160px] lg:min-h-[220px]">
          {/* A lazy <Image> instead of an inline background-image: CSS backgrounds
              are fetched as soon as the element is laid out, so this full-size
              banner competed with the hero (LCP) image on first load. */}
          {bgImage && <Image src={bgImage} alt="" fill sizes="100vw" className="object-cover object-center -z-10" />}
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-2 md:py-4  sm:gap-0">
            {/* Left: Flash Sale Title */}

            <div className="flex flex-col lg:flex-row justify-between items-center gap-2 w-full">
              <div className="flex justify-between w-full">
                <h2 className="w-fit text-lg md:text-2xl xl:text-3xl font-medium capitalize bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent">
                  {heading}
                </h2>
                <div className="gradient rounded-full p-[1] md:p-0.5 group lg:hidden">
                  <PreFetchLink
                    prefetch={false}
                    href={"/flash-sale"}
                    className="text-sm rounded-full  py-1 md:py-2  px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
                  >
                    See All <MdOutlineKeyboardArrowRight className=" bg-black text-white text-lg rounded-full group-hover:bg-secondary duration-200" />{" "}
                  </PreFetchLink>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-6 shrink-0 pb-3">
                {/* Offer Ending Label & Countdown */}
                <div className="flex flex-col items-center">
                  <div className="hidden md:block">
                    <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide leading-tight">OFFER ENDING IN:</p>
                  </div>
                  <FlashSaleCountdown endAt={endAt} />
                </div>

                {/* SEE ALL Button */}
                <div className="gradient rounded-full p-[1] md:p-0.5 group hidden lg:block">
                  <PreFetchLink
                    prefetch={false}
                    href={"/flash-sale"}
                    className="text-sm rounded-full  py-1 md:py-2  px-2 md:px-4 bg-white flex gap-2 items-center group-hover:text-secondary duration-200"
                  >
                    See All <MdOutlineKeyboardArrowRight className=" bg-black text-white text-lg rounded-full group-hover:bg-secondary duration-200" />{" "}
                  </PreFetchLink>
                </div>
              </div>
            </div>

            {/* Right: Countdown + SEE ALL */}
          </div>

          {/* Products Grid */}
          <div className="px-2 md:px-4 lg:px-6 pb-6 md:pb-6">
            <FlashSaleSliders products={products.slice(0, HOME_FLASH_SALE_LIMIT)} />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default FlashSale;
