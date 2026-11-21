"use client";

import Image from "next/image";
import { MdArrowForwardIos } from "react-icons/md";
import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCompare } from "@/context/CompareContext";
import PreFetchLink from "./CustomUIComponent/PreFetchLink";

// framer-motion + the modal UI only ship once the user actually opens it,
// instead of bloating every listing page's initial JS bundle.
const CartModal = dynamic(() => import("./CartModal"), { ssr: false });

const CardMain = ({
  name,
  category,
  badge,
  currentPrice,
  originalPrice,
  discountPercentage,
  preOrderPrice: preOrderPriceProp,
  isPreOrder: isPreOrderProp,
  rating,
  image,
  isStock,
  status,
  btnClick,
  productData,
  link,
  from,
  quantity,
  preOwned,
  brandName,
  brandLink,
  categoryLink,
  fromCategory,
  categoryName,
  offerLink,
  offerName,
  categoryPageLink,
  categoryPageName,
  product,
  priceRange,
  // Some pages (e.g. categories) have no h2 between their h1 and this card
  // grid, so the product name needs to render one level up to keep headings
  // sequential — see SingleCategory.jsx's h1 -> CardMain h3 skip.
  titleAs: TitleTag = "h3",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedCart, setHasOpenedCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const imageRef = useRef(null);
  const router = useRouter();
  const { addToCompare } = useCompare();

  // /compare renders specifications/variants/images, which listing data
  // lacks — fetch the full product first (same endpoint the compare page uses).
  const handleCompare = async () => {
    if (isComparing) return;
    setIsComparing(true);
    let details = null;
    try {
      if (link) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${link}`);
        if (res.ok) details = (await res.json())?.data ?? null;
      }
    } catch (err) {
      console.error("Compare fetch failed:", err);
    }
    try {
      const toCompare = details || product || productData;
      if (toCompare) {
        addToCompare(toCompare);
        router.push("/compare");
      }
    } finally {
      setIsComparing(false);
    }
  };

  // Eye icon: opens the existing CartModal (the old "Add To Bag" trigger).
  const openCartModal = () => setIsModalOpen(true);
  const handleEyeKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCartModal();
    }
  };

  if (isModalOpen && !hasOpenedCart) {
    setHasOpenedCart(true);
  }

  // A cached image can finish loading before React attaches the onLoad
  // listener below, so that event never fires — check .complete as a fallback.
  useEffect(() => {
    if (imageRef.current?.complete) {
      setImageLoaded(true);
    }
  }, [image]);

  currentPrice = Math.trunc(Number(currentPrice) || 0);
  originalPrice = Math.trunc(Number(originalPrice) || 0);

  const rawIsPreOrder = isPreOrderProp !== undefined ? isPreOrderProp : (product?.is_prebook ?? productData?.is_prebook);

  const isPreOrder = rawIsPreOrder === true || rawIsPreOrder === 1 || rawIsPreOrder === "1" || rawIsPreOrder === "true";

  const rawPreOrderPrice = preOrderPriceProp !== undefined && preOrderPriceProp !== null ? preOrderPriceProp : (product?.booking_amount ?? productData?.booking_amount);

  const hasPreOrderPrice = rawPreOrderPrice !== undefined && rawPreOrderPrice !== null && rawPreOrderPrice !== "" && !isNaN(Number(rawPreOrderPrice)) && Number(rawPreOrderPrice) > 0;

  const preOrderPrice = hasPreOrderPrice ? Math.trunc(Number(rawPreOrderPrice)) : 0;

  const showPreOrderPrice = isPreOrder === true && hasPreOrderPrice;

  const calculateDiscount = (original, current) => {
    if (!original || !current || original <= current) return null;

    const discount = ((original - current) / original) * 100;

    return discount.toFixed(2);
  };

  const discountPercentageCalc = calculateDiscount(originalPrice, currentPrice);

  const showCoupon = !(from === "preOwned" || badge);
  return (
    <div className="rounded-2xl xl:rounded-4xl bg-[#F3F2F7] group flex flex-col">
      {" "}
      {/* Image + category/badge overlay */}
      <div className="relative block ">
        {product?.official_warranty && (
          <Image
            src={"/official-logoo.webp"}
            alt="warranty logo"
            width={4000}
            height={3000}
            priority={false}
            className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10"
          />
        )}

        {product?.is_unofficial && (
          <Image
            src={"/unofficial-iconn.webp"}
            alt="warranty logo"
            width={4000}
            height={3000}
            priority={false}
            className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10"
          />
        )}
        {product?.is_chinese && (
          <Image src={"/Chinese.svg"} alt="warranty logo" width={4000} height={3000} priority={false} className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10" />
        )}
        {product?.is_refurbished && (
          <Image
            src={"/Refurbish.webp"}
            alt="warranty logo"
            width={4000}
            height={3000}
            priority={false}
            className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10"
          />
        )}

        {/* {from === "preOwned" && (
          <span className="bg-primary text-white px-2 py-px rounded-md absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10">
            brand name
          </span>
        )} */}

        {product?.purchase_point && (
          <div className="absolute top-1.5 left-1.5 lg:top-4 lg:left-4 z-10 flex items-start gap-0.5 lg:gap-1 2xl:gap-1.5">
            <Image src={"/pointCardLogo.svg"} alt="warranty logo" width={4000} height={3000} priority={false} className="w-3 lg:w-5 2xl:w-6 " />
            <div className="">
              <p className="text-[6px] lg:text-[11px] 2xl:text-[13px] text-gray-700 leading-1.5 lg:leading-2 2xl:leading-2.5 2xl:mt-px">Get</p>
              <p className="text-[6px] lg:text-[12px] 2xl:text-[13px] text-gray-700 font-semibold">{product?.purchase_point} Points</p>
            </div>
          </div>
        )}

        <div className="relative w-full aspect-square overflow-hidden flex items-center rounded-t-xl md:rounded-t-2xl xl:rounded-t-4xl">
          {!imageLoaded && <div className="skeleton absolute inset-0 rounded-none" />}
          <PreFetchLink prefetch={false} href={`/${from === "preOwned" ? "used-device" : "product"}/${link}`} className="relative w-full  flex items-center justify-center p-3.5 lg:p-0">
            <Image
              ref={imageRef}
              src={image}
              alt={name}
              width={800}
              height={600}
              priority={false}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
              onLoad={() => setImageLoaded(true)}
              className={`${from === "preOwned" ? "w-full" : "w-[90%] xl:w-[70%] "} h-auto object-contain transition-all duration-300 ease-in-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </PreFetchLink>
          {/* tekzo care */}
          {product?.is_care && (
            <PreFetchLink prefetch={false} href={"/tekzo-care"}>
              <Image
                src={"/product-details/tekzo-care.webp"}
                alt="warranty logo"
                width={4000}
                height={3000}
                priority={false}
                className="w-14 lg:w-[95px] 2xl:w-[120px] absolute bottom-1 right-1.5 lg:bottom-3.5 lg:right-4 z-10"
              />
            </PreFetchLink>
          )}
          {/* offer */}
          {product?.is_offer && (
            <PreFetchLink prefetch={false} href={"/shop/offer"}>
              <Image
                src={"/Offer.svg"}
                alt="warranty logo"
                width={4000}
                height={3000}
                priority={false}
                className={`w-8 sm:w-10 lg:w-[60px] 2xl:w-[80px] absolute left-1 lg:left-3.5 z-10 ${product?.gift ? "bottom-4.5 lg:bottom-9  border" : "bottom-1 lg:bottom-3.5"}`}
              />
            </PreFetchLink>
          )}
        </div>
        <div
          className={`relative rounded-b-xl lg:rounded-b-3xl flex justify-between items-center text-[10px] lg:text-xs xl:text-sm w-full bg-[#DCDEE3] px-2 lg:px-4 h-6 lg:h-10 xl:h-12 text-secondary`}
        >
          {product?.gift && (
            <div className="absolute -top-[67%] lg:-top-[62%] 2xl:-top-[63%] rounded-tr-lg lg:rounded-tr-2xl left-0 bg-[#DCDEE3]  text-primary text-[7px] lg:text-[10px] 2xl:text-[11px] font-medium px-1.5 lg:px-2.5 py-0.5 lg:py-1.5 pr-2 lg:pr-4 tracking-wide uppercase">
              With Amazing Gift
            </div>
          )}

          {fromCategory && (
            <PreFetchLink prefetch={false} href={`/brands/${categoryLink.toLowerCase()}`} className="capitalize hover:text-primary">
              {categoryName}
            </PreFetchLink>
          )}

          {from === "offer" && (
            <PreFetchLink prefetch={false} href={`/brands/${offerLink.toLowerCase()}`} className="capitalize hover:text-primary">
              {offerName}
            </PreFetchLink>
          )}

          {from === "categories" && categoryPageLink && (
            <PreFetchLink prefetch={false} href={`/brands/${categoryPageLink}`} className="capitalize hover:text-primary">
              {categoryPageName}
            </PreFetchLink>
          )}

          {brandLink && (
            <PreFetchLink prefetch={false} href={`/categories/${brandLink.toLowerCase()}`} className="capitalize hover:text-primary">
              {brandName}
            </PreFetchLink>
          )}

          {category && from !== "preOwned" && (
            <PreFetchLink
              prefetch={false}
              href={`/categories/${categoryLink}`}
              className={`capitalize hover:text-primary ${from === "flashSale" && "text-[8px] lg:text-xs xl:text-sm whitespace-nowrap"}`}
            >
              {category}
            </PreFetchLink>
          )}

          {badge && <span className="bg-primary text-white text-[8px] lg:text-xs px-2 py-px rounded">{badge}</span>}

          {from === "preOwned" && quantity !== undefined && (
            <div className="flex justify-between items-center  w-full">
              <PreFetchLink prefetch={false} href={`/used-device?brand=${product?.brand?.slug}`} className="capitalize hover:text-primary cursor-pointer">
                {product?.brand?.name}
              </PreFetchLink>
              <div className="">
                Quantity: <span className="font-semibold">{quantity}</span>
              </div>
            </div>
          )}

          {/* coupon cui */}
          {showCoupon && product?.coupon && (
            <span className={`bg-gray-600/70 text-white px-2 py-0.5 lg:py-1 rounded ${from === "flashSale" ? "text-[6px] lg:text-xs whitespace-nowrap" : "text-[8px] lg:text-xs "}`}>
              Coupon: Get {product?.coupon?.amount} OFF
            </span>
          )}
        </div>
      </div>
      {/* Card content */}
      <div className="p-1.5 lg:p-2.5 xl:p-4 text-gray-700 relative flex flex-col flex-1 ">
        <PreFetchLink prefetch={false} className="cursor-pointer flex flex-col flex-1" href={`/${from === "preOwned" ? "used-device" : "product"}/${link}`}>
          <TitleTag className="text-xs lg:text-base xl:text-xl line-clamp-2 pb-1 lg:pb-2">{name}</TitleTag>

          {from === "preOwned" && <div className="text-xs md:text-sm text-primary pb-1 lg:pb-2 ">Starting Price</div>}
          <div className="flex items-center justify-between mt-auto border-t border-gray-300 pt-1  ">
            <div className="flex items-baseline gap-1 lg:gap-2 2xl:gap-3">
              {from === "preOwned" ? (
                <span className="font-semibold text-sm lg:text-lg xl:text-[26px] whitespace-nowrap">
                  ৳ {priceRange?.min?.toLocaleString()} - ৳ {priceRange?.max?.toLocaleString()}
                </span>
              ) : showPreOrderPrice ? (
                <span className="font-semibold text-sm lg:text-2xl 2xl:text-[26px] whitespace-nowrap">
                  ৳ {preOrderPrice?.toLocaleString()} <span className="text-[10px] lg:text-xs 2xl:text-sm font-normal text-gray-700">(Booking Money) </span>
                </span>
              ) : (
                <span className="font-semibold text-sm lg:text-2xl 2xl:text-[26px] whitespace-nowrap">৳ {currentPrice?.toLocaleString()}</span>
              )}

              {!showPreOrderPrice && originalPrice && discountPercentage && (
                <span className="text-gray-600 line-through text-[8px] lg:text-sm 2xl:text-base font-normal whitespace-nowrap">৳ {originalPrice?.toLocaleString()}</span>
              )}
            </div>
            {!showPreOrderPrice && discountPercentage && (
              <span className="bg-secondary text-white px-1 md:px-2 py-0.5 rounded text-[8px]  md:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{discountPercentageCalc}% OFF</span>
            )}
          </div>
        </PreFetchLink>

        <div className="h-1.5 lg:h-3 xl:h-4 mt-auto"></div>
        {/* Button + Rating */}
        <div className="flex items-end">
          {from === "preOwned" ? (
            /* Pre-owned: navigate to detail page */
            <PreFetchLink
              prefetch={false}
              href={isStock ? `/used-device/${link}` : "#"}
              disabled={!isStock}
              className={`w-[calc(100%-34px)] lg:w-[calc(100%-52px)] xl:w-[calc(100%-76px)] inline-block rounded-full overflow-hidden p-px xl:p-[1.5px] ${
                isStock ? "gradient cursor-pointer" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <div className="bg-white rounded-full flex items-center justify-center text-xs lg:text-sm 2xl:text-lg gap-1 lg:gap-2 py-[3px] lg:py-1.5 xl:py-2.5 font-semibold">
                <span className={isStock ? "bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent" : "text-gray-500"}>{isStock ? "View all Products" : "Out of Stock"}</span>
                {isStock && <MdArrowForwardIos className="text-primary" />}
              </div>
            </PreFetchLink>
          ) : isPreOrder ? (
            /* Pre-order product: link to product details */
            <PreFetchLink
              prefetch={false}
              href={`/product/${link}`}
              className="w-[calc(100%-34px)] lg:w-[calc(100%-52px)] xl:w-[calc(100%-76px)] inline-block rounded-full overflow-hidden p-px xl:p-[1.5px] gradient cursor-pointer"
            >
              <div className="bg-white rounded-full flex items-center justify-center text-xs lg:text-sm xl:text-lg gap-1 lg:gap-2 py-[3px] lg:py-1.5 xl:py-2.5 font-semibold">
                <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">Pre Order</span>
                <MdArrowForwardIos className="text-primary" />
              </div>
            </PreFetchLink>
          ) : (
            /* Standard product: add to compare, then go to /compare */
            <button
              onClick={handleCompare}
              disabled={isComparing}
              className="w-[calc(100%-34px)] lg:w-[calc(100%-52px)] xl:w-[calc(100%-76px)] inline-block rounded-full overflow-hidden p-px xl:p-[1.5px] gradient cursor-pointer"
            >
              <div className="bg-white rounded-full flex items-center justify-center text-xs lg:text-sm  2xl:text-lg gap-1 lg:gap-2 py-[3px] lg:py-1.5 xl:py-2.5 font-semibold">
                <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">{isComparing ? "Adding..." : "Compare"}</span>
                <MdArrowForwardIos className="text-primary" />
              </div>
            </button>
          )}

          {/* Rating circle */}
          {from === "flashSale" ? (
            <div className="pl-1.5 lg:pl-2.5 xl:pl-3">
              <div className="aspect-square w-8 lg:w-12 xl:w-17  ">
                <div className="gradient p-px xl:p-[1.5px] rounded-full">
                  <div
                    onClick={openCartModal}
                    onKeyDown={handleEyeKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label="Add to cart"
                    className="w-full h-full aspect-square whitespace-nowrap flex gap-px xl:gap-1 items-center justify-center rounded-full bg-[#F3F2F7] text-[10px] xl:text-sm text-primary"
                  >
                    <Eye size="1em" />
                    <span>{rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square w-10 lg:w-15 xl:w-21 absolute -bottom-1 -right-[3px] lg:-bottom-1.5 lg:-right-1.5 z-10 ">
              <div
                className={`w-full h-full aspect-square p-[3px] lg:p-1 xl:p-[6px] rounded-full ${from === "flashSale" ? "bg-transparent" : "bg-[#D9D7D7]"}`}
                // className={`w-full h-full aspect-square p-[3px] lg:p-1 xl:p-[6px] rounded-full bg-white`}
              >
                <div className="gradient p-px xl:p-[1.5px] rounded-full">
                  <div
                    onClick={openCartModal}
                    onKeyDown={handleEyeKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label="Add to cart"
                    className="w-full h-full aspect-square whitespace-nowrap flex gap-px xl:gap-1 items-center justify-center rounded-full bg-[#F3F2F7] text-[10px] xl:text-sm text-primary"
                  >
                    <Eye size="1em" />
                    <span>{rating}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {hasOpenedCart && <CartModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} name={name} currentPrice={currentPrice} image={image} slug={link} />}
    </div>
  );
};

export default CardMain;
