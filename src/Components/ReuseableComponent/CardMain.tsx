"use client";

import { isStockOut } from "@/utils/stock";
import Image from "next/image";
import { MdArrowForwardIos } from "react-icons/md";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { CardMainProps } from "@/types/props/catalog";
import { useCompareActions } from "@/context/CompareContext";
import { localeOpt, rec, requireString } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import PreFetchLink from "./CustomUIComponent/PreFetchLink";

// framer-motion + the modal UI only ship once the user actually opens it,
// instead of bloating every listing page's initial JS bundle.
const CartModal = dynamic(() => import("./CartModal"), { ssr: false });

// One height for the whole button row (pill + round action) at every breakpoint.
const ROW_HEIGHT = "h-8 lg:h-11 xl:h-13 2xl:h-14";
const PILL_OUTER = `${ROW_HEIGHT} flex-1 min-w-0 block rounded-full overflow-hidden p-px xl:p-[1.5px]`;
const PILL_INNER = "h-full bg-white rounded-full flex items-center justify-center gap-1 lg:gap-2 px-2 text-[11px] lg:text-sm 2xl:text-lg font-semibold whitespace-nowrap";
const GRADIENT_TEXT = "bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent truncate";

const CardMain = ({
  name,
  category,
  badge,
  currentPrice: rawCurrentPrice,
  originalPrice: rawOriginalPrice,
  discountPercentage,
  preOrderPrice: preOrderPriceProp,
  isPreOrder: isPreOrderProp,
  image,
  isStock,
  productData,
  link,
  from,
  quantity,
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
}: CardMainProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedCart, setHasOpenedCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const router = useRouter();
  const { addToCompare } = useCompareActions();
  const p = rec(product);
  const pd = rec(productData);

  // /compare renders specifications/variants/images, which listing data
  // lacks — fetch the full product first (same endpoint the compare page uses).
  const handleCompare = async () => {
    if (isComparing) return;
    setIsComparing(true);
    let details: unknown = null;
    try {
      if (link) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${link}`);
        if (res.ok) {
          const body: unknown = await res.json();
          details = rec(body)?.data ?? null;
        }
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

  // Buy button: opens the existing CartModal.
  const openCartModal = () => setIsModalOpen(true);

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

  const currentPrice = Math.trunc(Number(rawCurrentPrice) || 0);
  const originalPrice = Math.trunc(Number(rawOriginalPrice) || 0);

  const rawIsPreOrder = isPreOrderProp !== undefined ? isPreOrderProp : (p?.is_prebook ?? pd?.is_prebook);

  const isPreOrder = rawIsPreOrder === true || rawIsPreOrder === 1 || rawIsPreOrder === "1" || rawIsPreOrder === "true";

  const rawPreOrderPrice = preOrderPriceProp !== undefined && preOrderPriceProp !== null ? preOrderPriceProp : (p?.booking_amount ?? pd?.booking_amount);

  const hasPreOrderPrice = rawPreOrderPrice !== undefined && rawPreOrderPrice !== null && rawPreOrderPrice !== "" && !isNaN(Number(rawPreOrderPrice)) && Number(rawPreOrderPrice) > 0;

  const preOrderPrice = hasPreOrderPrice ? Math.trunc(Number(rawPreOrderPrice)) : 0;

  const showPreOrderPrice = isPreOrder === true && hasPreOrderPrice;

  // Same rule as the PDP (utils/stock). A card with no stock data at all keeps "Buy".
  const stockFlag = isStock ?? p?.is_stock ?? pd?.is_stock;
  const cardStockOut = stockFlag !== undefined && stockFlag !== null && isStockOut(stockFlag, isPreOrder);

  const calculateDiscount = (original: number, current: number) => {
    if (!original || !current || original <= current) return null;

    const discount = ((original - current) / original) * 100;

    return discount.toFixed(2);
  };

  const discountPercentageCalc = calculateDiscount(originalPrice, currentPrice);

  const showCoupon = !(from === "preOwned" || badge);

  // `a && b && <el/>` renders a falsy a/b itself (e.g. 0) — kept via nodeOf.
  const categoryPageCond = from === "categories" && categoryPageLink;
  const categoryCond = category && from !== "preOwned";
  const couponCond = showCoupon && p?.coupon;
  const originalPriceCond = !showPreOrderPrice && originalPrice && discountPercentage;
  const discountCond = !showPreOrderPrice && discountPercentage;
  const brand = rec(p?.brand);
  // `disabled` on the pre-owned link renders `disabled=""` on the <a>, as
  // before. It isn't a typed <a> prop, so it is passed through a spread.
  const preOwnedLinkAttrs = { disabled: !isStock };

  return (
    <div className="rounded-2xl xl:rounded-4xl bg-[#F3F2F7] group flex flex-col">
      {" "}
      {/* Image + category/badge overlay */}
      <div className="relative block ">
        {p?.official_warranty ? (
          <Image
            src={"/official-logoo.webp"}
            alt="warranty logo"
            width={120}
            height={39}
            priority={false}
            className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10"
          />
        ) : (
          nodeOf(p?.official_warranty)
        )}

        {p?.is_unofficial ? (
          <Image
            src={"/unofficial-iconn.webp"}
            alt="warranty logo"
            width={120}
            height={39}
            priority={false}
            className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10"
          />
        ) : (
          nodeOf(p?.is_unofficial)
        )}
        {p?.is_chinese ? (
          <Image src={"/Chinese.svg"} alt="warranty logo" width={120} height={45} priority={false} className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10" />
        ) : (
          nodeOf(p?.is_chinese)
        )}
        {p?.is_refurbished ? (
          <Image
            src={"/Refurbish.webp"}
            alt="warranty logo"
            width={120}
            height={39}
            priority={false}
            className="w-11 lg:w-[80px] 2xl:w-[100px] absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10"
          />
        ) : (
          nodeOf(p?.is_refurbished)
        )}

        {/* {from === "preOwned" && (
          <span className="bg-primary text-white px-2 py-px rounded-md absolute top-1.5 right-1.5 lg:top-4 lg:right-4 z-10">
            brand name
          </span>
        )} */}

        {p?.purchase_point ? (
          <div className="absolute top-1.5 left-1.5 lg:top-4 lg:left-4 z-10 flex items-start gap-0.5 lg:gap-1 2xl:gap-1.5">
            <Image src={"/pointCardLogo.svg"} alt="warranty logo" width={24} height={27} priority={false} className="w-3 lg:w-5 2xl:w-6 " />
            <div className="">
              <p className="text-[6px] lg:text-[11px] 2xl:text-[13px] text-gray-700 leading-1.5 lg:leading-2 2xl:leading-2.5 2xl:mt-px">Get</p>
              <p className="text-[6px] lg:text-[12px] 2xl:text-[13px] text-gray-700 font-semibold">{nodeOf(p?.purchase_point)} Points</p>
            </div>
          </div>
        ) : (
          nodeOf(p?.purchase_point)
        )}

        <div className="relative w-full aspect-square overflow-hidden flex items-center rounded-t-xl md:rounded-t-2xl xl:rounded-t-4xl">
          {!imageLoaded && <div className="skeleton absolute inset-0 rounded-none" />}
          <PreFetchLink prefetch={false} href={`/${from === "preOwned" ? "used-device" : "product"}/${link}`} className="relative w-full  flex items-center justify-center p-3.5 lg:p-0">
            <Image
              ref={imageRef}
              src={str(image) ?? ""}
              alt={str(name) ?? ""}
              width={800}
              height={600}
              priority={false}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
              onLoad={() => setImageLoaded(true)}
              className={`${from === "preOwned" ? "w-full" : "w-[90%] xl:w-[70%] "} h-auto object-contain transition-[transform,opacity] duration-300 ease-in-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </PreFetchLink>
          {/* tekzo care */}
          {p?.is_care ? (
            <PreFetchLink prefetch={false} href={"/tekzo-care"}>
              <Image
                src={"/product-details/tekzo-care.webp"}
                alt="warranty logo"
                width={120}
                height={39}
                priority={false}
                className="w-14 lg:w-[95px] 2xl:w-[120px] absolute bottom-1 right-1.5 lg:bottom-3.5 lg:right-4 z-10"
              />
            </PreFetchLink>
          ) : (
            nodeOf(p?.is_care)
          )}
          {/* offer */}
          {p?.is_offer ? (
            <PreFetchLink prefetch={false} href={"/shop/offer"}>
              <Image
                src={"/Offer.svg"}
                alt="warranty logo"
                width={80}
                height={55}
                priority={false}
                className={`w-8 sm:w-10 lg:w-[60px] 2xl:w-[80px] absolute left-1 lg:left-3.5 z-10 ${p?.gift ? "bottom-4.5 lg:bottom-9  border" : "bottom-1 lg:bottom-3.5"}`}
              />
            </PreFetchLink>
          ) : (
            nodeOf(p?.is_offer)
          )}
        </div>
        <div
          className={`relative rounded-b-xl lg:rounded-b-3xl flex justify-between items-center text-[10px] lg:text-xs xl:text-sm w-full bg-[#DCDEE3] px-2 lg:px-4 h-6 lg:h-10 xl:h-12 text-[#0b666b]`}
        >
          {p?.gift ? (
            <div className="absolute -top-[67%] lg:-top-[62%] 2xl:-top-[63%] rounded-tr-lg lg:rounded-tr-2xl left-0 bg-[#DCDEE3]  text-primary text-[7px] lg:text-[10px] 2xl:text-[11px] font-medium px-1.5 lg:px-2.5 py-0.5 lg:py-1.5 pr-2 lg:pr-4 tracking-wide uppercase">
              With Amazing Gift
            </div>
          ) : (
            nodeOf(p?.gift)
          )}

          {fromCategory ? (
            <PreFetchLink prefetch={false} href={`/brands/${requireString(categoryLink).toLowerCase()}`} className="capitalize hover:text-primary">
              {nodeOf(categoryName)}
            </PreFetchLink>
          ) : (
            nodeOf(fromCategory)
          )}

          {from === "offer" && (
            <PreFetchLink prefetch={false} href={`/brands/${requireString(offerLink).toLowerCase()}`} className="capitalize hover:text-primary">
              {nodeOf(offerName)}
            </PreFetchLink>
          )}

          {categoryPageCond ? (
            <PreFetchLink prefetch={false} href={`/brands/${categoryPageLink}`} className="capitalize hover:text-primary">
              {nodeOf(categoryPageName)}
            </PreFetchLink>
          ) : (
            nodeOf(categoryPageCond)
          )}

          {brandLink ? (
            <PreFetchLink prefetch={false} href={`/categories/${requireString(brandLink).toLowerCase()}`} className="capitalize hover:text-primary">
              {nodeOf(brandName)}
            </PreFetchLink>
          ) : (
            nodeOf(brandLink)
          )}

          {categoryCond ? (
            <PreFetchLink
              prefetch={false}
              href={`/categories/${categoryLink}`}
              className={`capitalize hover:text-primary ${from === "flashSale" ? "text-[8px] lg:text-xs xl:text-sm whitespace-nowrap" : ""}`}
            >
              {nodeOf(category)}
            </PreFetchLink>
          ) : (
            nodeOf(categoryCond)
          )}

          {badge ? <span className="bg-primary text-white text-[8px] lg:text-xs px-2 py-px rounded">{nodeOf(badge)}</span> : nodeOf(badge)}

          {from === "preOwned" && quantity !== undefined && (
            <div className="flex justify-between items-center  w-full">
              <PreFetchLink prefetch={false} href={`/used-device?brand=${brand?.slug}`} className="capitalize hover:text-primary cursor-pointer">
                {nodeOf(brand?.name)}
              </PreFetchLink>
              <div className="">
                Quantity: <span className="font-semibold">{nodeOf(quantity)}</span>
              </div>
            </div>
          )}

          {/* coupon cui */}
          {couponCond ? (
            <span className={`bg-gray-600/70 text-white px-2 py-0.5 lg:py-1 rounded ${from === "flashSale" ? "text-[6px] lg:text-xs whitespace-nowrap" : "text-[8px] lg:text-xs "}`}>
              Coupon: Get {nodeOf(rec(p?.coupon)?.amount)} OFF
            </span>
          ) : (
            nodeOf(couponCond)
          )}
        </div>
      </div>
      {/* Card content */}
      <div className="p-1.5 lg:p-2.5 xl:p-4 text-gray-700 relative flex flex-col flex-1 ">
        <PreFetchLink prefetch={false} className="cursor-pointer flex flex-col flex-1" href={`/${from === "preOwned" ? "used-device" : "product"}/${link}`}>
          <TitleTag className="text-xs lg:text-base xl:text-xl line-clamp-2 pb-1 lg:pb-2">{nodeOf(name)}</TitleTag>

          {from === "preOwned" && <div className="text-xs md:text-sm text-primary pb-1 lg:pb-2 ">Starting Price</div>}
          <div className="flex items-center justify-between mt-auto border-t border-gray-300 pt-1  ">
            <div className="flex items-baseline gap-1 lg:gap-2 2xl:gap-3">
              {from === "preOwned" ? (
                <span className="font-semibold text-sm lg:text-lg xl:text-[26px] whitespace-nowrap">
                  ৳ {localeOpt(rec(priceRange)?.min)} - ৳ {localeOpt(rec(priceRange)?.max)}
                </span>
              ) : showPreOrderPrice ? (
                <span className="font-semibold text-sm lg:text-2xl 2xl:text-[26px] whitespace-nowrap">
                  ৳ {preOrderPrice?.toLocaleString()} <span className="text-[10px] lg:text-xs 2xl:text-sm font-normal text-gray-700">(Booking Money) </span>
                </span>
              ) : (
                <span className="font-semibold text-sm lg:text-2xl 2xl:text-[26px] whitespace-nowrap">৳ {currentPrice?.toLocaleString()}</span>
              )}

              {/* AUDIT_NOTES N16 (preserved): renders a stray "0" when originalPrice is 0 */}
              {originalPriceCond ? (
                <span className="text-gray-600 line-through text-[8px] lg:text-sm 2xl:text-base font-normal whitespace-nowrap">৳ {originalPrice?.toLocaleString()}</span>
              ) : (
                nodeOf(originalPriceCond)
              )}
            </div>
            {discountCond ? (
              <span className="bg-secondary text-white px-1 md:px-2 py-0.5 rounded text-[8px]  md:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{discountPercentageCalc}% OFF</span>
            ) : (
              nodeOf(discountCond)
            )}
          </div>
        </PreFetchLink>

        <div className="h-1.5 lg:h-3 xl:h-4 mt-auto"></div>
        {/* Button row: pill + round action share one fixed height so every card lines up */}
        <div className="flex items-center gap-1.5 lg:gap-2.5 xl:gap-3">
          {from === "preOwned" ? (
            /* Pre-owned: navigate to detail page */
            <PreFetchLink
              prefetch={false}
              href={isStock ? `/used-device/${link}` : "#"}
              {...preOwnedLinkAttrs}
              className={`${PILL_OUTER} ${isStock ? "gradient cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
            >
              <div className={PILL_INNER}>
                <span className={isStock ? GRADIENT_TEXT : "text-gray-500"}>{isStock ? "View all Products" : "Out of Stock"}</span>
                {isStock ? <MdArrowForwardIos className="text-primary shrink-0" /> : nodeOf(isStock)}
              </div>
            </PreFetchLink>
          ) : isPreOrder ? (
            /* Pre-order product: link to product details */
            <PreFetchLink prefetch={false} href={`/product/${link}`} className={`${PILL_OUTER} gradient cursor-pointer`}>
              <div className={PILL_INNER}>
                <span className={GRADIENT_TEXT}>Pre Order</span>
                <MdArrowForwardIos className="text-primary shrink-0" />
              </div>
            </PreFetchLink>
          ) : (
            /* Standard product: add to compare, then go to /compare */
            <button type="button" onClick={handleCompare} disabled={isComparing} className={`${PILL_OUTER} gradient cursor-pointer`}>
              <div className={PILL_INNER}>
                {/* Short label on narrow cards (mobile), full label from lg up */}
                <span className={GRADIENT_TEXT}>
                  {isComparing ? (
                    "Adding..."
                  ) : (
                    <>
                      <span className="hidden lg:inline">Add to </span>Compare
                    </>
                  )}
                </span>
                <MdArrowForwardIos className="text-primary shrink-0" />
              </div>
            </button>
          )}

          {/* Buy action: solid gradient pill = primary action; opens the cart modal. */}
          <button
            type="button"
            onClick={cardStockOut ? undefined : openCartModal}
            disabled={cardStockOut}
            aria-disabled={cardStockOut}
            aria-label={cardStockOut ? `${name} is stock out` : `Buy ${name}`}
            className={`${ROW_HEIGHT} shrink-0 rounded-full flex items-center justify-center gap-1.5 lg:gap-2 text-xs lg:text-base 2xl:text-lg font-semibold whitespace-nowrap ${cardStockOut ? "px-3 lg:px-5 xl:px-6 bg-gray-300 text-gray-600 cursor-not-allowed" : "px-4 lg:px-7 xl:px-9 text-white gradient cursor-pointer shadow-sm hover:brightness-110 hover:shadow-md"}`}
          >
            <span>{cardStockOut ? "Stock Out" : "Buy"}</span>
            {!cardStockOut && <ShoppingBag className="size-3.5 lg:size-5 2xl:size-6" strokeWidth={2.25} />}
          </button>
        </div>
      </div>
      {hasOpenedCart && <CartModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} name={name} currentPrice={currentPrice} image={image} slug={link} />}
    </div>
  );
};

export default CardMain;
