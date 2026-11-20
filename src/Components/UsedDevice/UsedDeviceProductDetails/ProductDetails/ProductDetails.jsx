"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { formatHtml } from "@/lib/formatHtml";
import Image from "next/image";
import Breadcrumbs from "@/Components/ReuseableComponent/ProductDetails/ProductBreadcrumbs";
import PricingSelector from "./PricingSelector";

import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import { useRouter } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { getAuthUser } from "@/utils/getAuthUser";
import ShareDetails from "./ShareDetails";
import { fireCartAdded } from "@/context/CounterContext";
import Banner from "@/Components/ReuseableComponent/Banner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ImageModal from "@/Components/PreownedDevice/ImageModal";
import { Layers, ShoppingCart } from "lucide-react";
import DynamicPills from "./DynamicPills";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import Coupon from "@/Components/ReuseableComponent/ProductDetails/Coupon";
import GiftForUser from "@/Components/ReuseableComponent/ProductDetails/Gift/GiftForUser";
import Link from "next/link";
import ProductBenefits from "@/Components/ReuseableComponent/ProductDetails/ProductBenefits";
import TekzoCareCard from "../TekzoCare/TekzoCareCard";
import MobileTekzoCareCard from "@/Components/ReuseableComponent/ProductDetails/TekzoCare/TekzoCareCard";
import ShippingDetailsUsedMobile from "./ShippingDetailsUsedMobile";
import UsedDetailsFooter from "./UsedDetailsFooter";
import UsedRelatedProducts from "../UsedRelatedProducts";
import UsedWarrantyInfo from "../UsedWarrantyInfo";
import ProductBenefitsFooter from "@/Components/ReuseableComponent/ProductDetails/ProductBenefitsFooter";

function getDefaultVariant(productDetails) {
  if (!productDetails?.variants?.length) return null;
  const inStock = productDetails.variants.filter((v) => v.stock === true || v.stock === 1);
  return inStock.length > 0 ? inStock[0] : productDetails.variants[0];
}

export default function ProductDetails({ productDetails, supportPhone, relatedProducts }) {
  // productDetails arrives already resolved as a prop (server-fetched), so
  // selectedVariant/activeIndex can be computed synchronously on first
  // render instead of via a post-mount effect — that's what caused the
  // extra generic spinner flash after the route's own skeleton (loading.jsx)
  // already finished.
  const [selectedVariant, setSelectedVariant] = useState(() => getDefaultVariant(productDetails));
  const [activeIndex, setActiveIndex] = useState(() => {
    const defaultVariant = getDefaultVariant(productDetails);
    if (!defaultVariant || !productDetails?.images) return 0;
    const idx = productDetails.images.findIndex((img) => img.attribute?.id === defaultVariant.attribute?.id);
    return idx !== -1 ? idx : 0;
  });
  // Slide 0 starts pre-marked "loaded" — it's the one rendered with
  // priority/fetchPriority below, and gating it behind the same opacity-0
  // fade as the rest meant Chrome couldn't count it as the LCP paint until
  // a JS onLoad + CSS transition round trip finished, well after the image
  // bytes actually arrived.
  const [loadedImages, setLoadedImages] = useState(() => new Set([0]));
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const variantContainerRef = useRef(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedCare, setSelectedCare] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const router = useRouter();

  // useCallback keeps these stable across renders — prevents infinite loops
  // in GiftPopup/TekzoCarePopup whose useEffects depend on these callbacks
  const handleCareSelect = useCallback((care) => setSelectedCare(care), []);
  const handleGiftSelect = useCallback((giftId) => setSelectedGift(giftId || null), []);

  // Stable object for care amount lookup — cares[].amounts[].variant_id matches product_variant_id
  const careVariant = useMemo(() => ({ id: productDetails?.product_variant_id }), [productDetails?.product_variant_id]);

  const availableVariants = productDetails?.variants?.filter((v) => v.stock === true || v.stock === 1) || [];

  useEffect(() => {
    const activeImgColorId = productDetails?.images?.[activeIndex]?.attribute?.id;
    if (!activeImgColorId) return;

    if (selectedVariant?.attribute?.id === activeImgColorId) return;

    const colorVariants = productDetails?.variants?.filter((v) => v.attribute?.id === activeImgColorId);

    if (colorVariants.length > 0) {
      const inStock = colorVariants.find((v) => v.stock === true || v.stock === 1);
      setSelectedVariant(inStock || colorVariants[0]);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (selectedVariant) setQuantity(1);
  }, [selectedVariant?.id]);

  useEffect(() => {
    if (selectedVariant && variantContainerRef.current) {
      const activeElement = variantContainerRef.current.querySelector(`[data-id="${selectedVariant.id}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedVariant]);

  const saveToLocalCart = (quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const slug = productDetails?.slug || productDetails?.id?.toString();

    // Check if pre_owned_id already exists in cart
    const preOwnedExists = cart.some((item) => item.pre_owned_id === productDetails?.id);

    // If pre_owned_id already exists, don't add it again
    if (preOwnedExists) {
      return;
    }

    const existingIndex = cart.findIndex((item) => item.slug === slug && item.variantId === productDetails?.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      const productImage = productDetails?.images?.[0]?.image_path || productDetails?.product_image || "";
      cart.push({
        slug: slug,
        productId: productDetails?.product_id || 0,
        variantId: productDetails?.id,
        productVariantId: productDetails?.product_variant_id || 0,
        quantity,
        pre_owned_id: productDetails?.id,
        productName: productDetails?.product_name || "",
        productImage,
        variantPrice: productDetails?.final_price ?? productDetails?.regular_price ?? 0,
        regularPrice: productDetails?.regular_price ?? productDetails?.final_price ?? 0,
        bookingAmount: productDetails?.booking_amount || 0,
        ...(selectedGift
          ? (() => {
              const giftItem = productDetails?.gift_products?.find((g) => String(g.gift_id) === String(selectedGift));
              const gp = giftItem?.product || giftItem;
              return {
                giftId: String(selectedGift),
                giftProductName: gp?.product_name || "",
                giftProductImage: gp?.product_image || "",
              };
            })()
          : {}),
        ...(selectedCare?.care_id
          ? {
              tekzoCareId: String(selectedCare.care_id),
              tekzoCarePlanName: selectedCare.planName || "",
              tekzoCareAmount: selectedCare.amount ?? 0,
            }
          : {}),
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleBuyNow = async () => {
    if (buyingNow) return;
    setBuyingNow(true);

    try {
      const user = await getAuthUser();
      if (user) {
        const cartPayload = {
          variant_id: productDetails?.product_variant_id,
          pre_owned_id: productDetails?.id,
          quantity,
          ...(productDetails?.booking_amount ? { booking_amount: productDetails.booking_amount } : {}),
          ...(productDetails?.purchase_point ? { purchase_point: productDetails.purchase_point } : {}),
        };
        if (selectedGift) cartPayload.gift_id = selectedGift;
        if (selectedCare?.care_id) cartPayload.care_id = selectedCare.care_id;
        await clientFetchAPI(`/customer/carts`, "POST", cartPayload);
      } else {
        saveToLocalCart(quantity);
      }
      router.push("/checkout");
    } catch (err) {
      console.error("Buy Now error:", err);
      saveToLocalCart(quantity);
      router.push("/checkout");
    } finally {
      setBuyingNow(false);
    }
  };

  const handleAddToCart = async () => {
    if (addingToCart || isAdded) return;
    setAddingToCart(true);

    try {
      const user = await getAuthUser();

      if (!user) {
        // User is not logged in - redirect to login
        router.push("/login");
        return;
      }

      const cartPayload = {
        variant_id: productDetails?.product_variant_id,
        pre_owned_id: productDetails?.id,
        quantity,
        ...(productDetails?.booking_amount ? { booking_amount: productDetails.booking_amount } : {}),
        ...(productDetails?.purchase_point ? { purchase_point: productDetails.purchase_point } : {}),
      };
      if (selectedGift) cartPayload.gift_id = selectedGift;
      if (selectedCare?.care_id) cartPayload.care_id = selectedCare.care_id;

      const response = await clientFetchAPI(`/customer/carts`, "POST", cartPayload);

      setIsAdded(true);
      fireCartAdded();
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("Add to Cart Error:", err);
      // Show error message to user
      alert(err.message || "Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (!productDetails) {
    return (
      <>
        <title>No Products Found - Tekzo</title>
        <Banner image={"/all-product-banner.webp"} title={"not found"} />
        <NoProductFound />
      </>
    );
  }

  if (!selectedVariant) {
    // productDetails resolved but has no purchasable variant at all —
    // not a loading state, so show the same not-found UI rather than a spinner
    return (
      <>
        <title>No Products Found - Tekzo</title>
        <Banner image={"/all-product-banner.webp"} title={"not found"} />
        <NoProductFound />
      </>
    );
  }

  const availability = true;
  return (
    <div className="">
      <Banner image={productDetails?.brand?.shop_banner} title={productDetails?.brand?.name} logo={productDetails?.brand?.primary_logo} />
      <div className="my-rounded-t mt-3 lg:mt-5 ">
        <div className="my-rounded lg:pb-0">
          <div className="bg-dark my-rounded-t p-4 lg:p-8  flex justify-between">
            <Breadcrumbs product={productDetails} from={"productDetails"} />
            <div className="hidden lg:block w-[44%] 2xl:w-[44.5%]">
              <ShareDetails selectedVariant={selectedVariant} quantity={quantity} supportPhone={supportPhone} />
            </div>
          </div>
          <div className="bg-[#E7E9EB] my-rounded-b  pb-5 lg:pb-0 overflow-hidden grid grid-cols-1 lg:grid-cols-3  ">
            {/* LEFT SIDE: Product Info */}
            <div className="  rounded-bl-[40px] bg-dark px-4 lg:px-8  space-y-3  order-2 lg:order-1 my-rounded-b">
              <h1 className="text-3xl text-gray-800">{productDetails?.product_name}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{productDetails?.headline}</p>

              <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-[#E7E9EB] text-sm font-medium text-slate-600">
                {/* Brand Section */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">Brand</span>
                  <Link prefetch={false} href="#" className="transition-opacity hover:opacity-80 inline-flex items-center">
                    {productDetails?.brand?.primary_logo ? (
                      <Image src={productDetails.brand.primary_logo} alt="brand icon" width={120} height={40} className="h-6 w-auto object-contain max-w-[80px] lg:max-w-[100px]" />
                    ) : (
                      <span className="font-semibold text-slate-800 text-sm">Generic</span>
                    )}
                  </Link>
                </div>

                {/* Visual Divider line for larger screens */}
                <div className="hidden sm:block h-4 w-px bg-slate-200" aria-hidden="true" />

                {/* Status Section */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                      productDetails?.is_stock ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${productDetails?.is_stock ? "bg-teal-500" : "bg-rose-500"}`} />
                    {productDetails?.is_stock ? "Available" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <PricingSelector
                productDetails={productDetails}
                selectedVariant={selectedVariant}
                quantity={quantity}
                setQuantity={setQuantity}
                selectedCare={selectedCare}
              />
              <div className="mb-4 lg:hidden">
                <ShippingDetailsUsedMobile></ShippingDetailsUsedMobile>
              </div>

              {/* VARIANTS LIST FOR MOBILE */}
              <div className="bg-gray-200 lg:shadow-sm z-10 rounded-xl p-4 lg:p-3 2xl:p-4 lg:hidden flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-300/70 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">
                      Variant Information
                    </span>
                  </div>
                  {selectedVariant?.attribute_value && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary truncate max-w-[140px]">
                      {selectedVariant.attribute_value}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] *:shadow-sm">
                  {productDetails?.battery_health && (
                    <div className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center">
                      <span className="font-semibold text-slate-700 mr-1">Battery Health:</span>
                      <span>{productDetails?.battery_health}%</span>
                    </div>
                  )}

                  {productDetails?.charging_time && (
                    <div className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center">
                      <span className="font-semibold text-slate-700 mr-1">Cycle Count:</span>
                      <span>{productDetails?.charging_time}</span>
                    </div>
                  )}

                  {productDetails?.is_box && (
                    <div className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center">
                      <span className="font-semibold text-slate-700">Original Box Available</span>
                    </div>
                  )}

                  {productDetails?.variants?.map((item) => (
                    <div key={item.id} className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-semibold text-slate-700 capitalize mr-1">{item?.name}:</span>
                        <span>{item?.value}</span>
                      </div>

                      {/* If the variant is a color, this renders the small color preview box from the image */}
                      {item?.name?.toLowerCase() === "color" && item?.color_code && (
                        <span className="w-4 h-4 rounded shadow-sm border border-gray-300 inline-block ml-2" style={{ backgroundColor: item.color_code }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* coupon */}
              <Coupon productDetails={productDetails}></Coupon>

              {/* gift */}
              <div className="lg:hidden">
                <GiftForUser productDetails={productDetails} onGiftSelect={handleGiftSelect}></GiftForUser>
              </div>

              <div className="hidden lg:block">
                <GiftForUser productDetails={productDetails} onGiftSelect={handleGiftSelect}></GiftForUser>
              </div>

              <div className="hidden lg:block pb-5">
                {/* Action Buttons */}
                {productDetails?.is_stock ? (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNow}
                      disabled={buyingNow}
                      className="bg-secondary text-white py-2.5 lg:py-4 2xl:py-7 rounded-[20px] font-semibold lg:font-bold transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-70"
                    >
                      {buyingNow ? "Processing..." : "Buy Now"}
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || isAdded}
                      className="bg-primary text-white py-2.5 lg:py-4 2xl:py-7 rounded-[20px] font-semibold lg:font-bold transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-70"
                    >
                      {addingToCart ? "Adding..." : isAdded ? "Added!" : "Add to Bag"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button disabled className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold cursor-not-allowed">
                      Out of Stock
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* MIDDLE: PHOTO SLIDER bg-dark */}
            <div className="relative bg-dark order-1 lg:order-2">
              <div className="  max-w-[480px] lg:max-w-[380px] 2xl:max-w-[480px] m-auto px-4 lg:px-0 pb-6 flex flex-col items-center justify-center  gap-4">
                <div className="relative w-full aspect-3/4  border border-gray-100 rounded-xl bg-white cursor-pointer group my-rounded overflow-hidden" onClick={() => setIsImageModalOpen(true)}>
                  <Swiper
                    modules={[Navigation]}
                    navigation={{
                      nextEl: ".swiper-button-next-custom",
                      prevEl: ".swiper-button-prev-custom",
                    }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className="w-full h-full"
                  >
                    {(() => {
                      // Fallback: if no images array, create one from product_image
                      const imagesArray =
                        productDetails?.images && productDetails.images.length > 0 ? productDetails.images : productDetails?.product_image ? [{ image_path: productDetails.product_image }] : [];

                      return imagesArray.map((item, i) => (
                        <SwiperSlide key={i} className="w-full h-full flex items-center justify-center overflow-hidden">
                          {!loadedImages.has(i) && <div className="skeleton absolute inset-0 rounded-none" />}
                          <Image
                            ref={(img) => {
                              // A cached image can finish loading before React
                              // attaches onLoad below, so that event never
                              // fires — check .complete as a fallback.
                              if (img?.complete) {
                                setLoadedImages((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
                              }
                            }}
                            src={item?.image_path?.includes("https://d2c2zgda4zwbg9.cloudfront.net/") ? item.image_path : "/placeholder.jpg"}
                            alt={`${productDetails.product_name} ${item?.attribute?.name}`}
                            fill
                            priority={i === 0}
                            fetchPriority={i === 0 ? "high" : "auto"}
                            onLoad={() => setLoadedImages((prev) => new Set(prev).add(i))}
                            className={`object-cover object-center transition-opacity duration-300 ease-in-out ${loadedImages.has(i) ? "opacity-100" : "opacity-0"}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </SwiperSlide>
                      ));
                    })()}
                  </Swiper>

                  {/* Zoom Indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to zoom</div>

                  {/* Custom Navigation Buttons */}
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Custom Pagination Outside Image */}
                {(() => {
                  const imagesArray =
                    productDetails?.images && productDetails.images.length > 0 ? productDetails.images : productDetails?.product_image ? [{ image_path: productDetails.product_image }] : [];

                  return imagesArray.length > 1 ? (
                    <div className="flex justify-center items-center gap-1 w-full px-4">
                      {imagesArray.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-sm transition-all cursor-pointer ${index === activeIndex ? "bg-primary w-12" : "bg-gray-300 w-4"}`}
                          onClick={() => {
                            const swiperInstance = document.querySelector(".swiper")?.swiper;
                            if (swiperInstance) {
                              swiperInstance.slideTo(index);
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* RIGHT SIDE: VARIANTS */}
            <div className="order-3 flex flex-col gap-3 pt-4 lg:pt-0 lg:pb-5 px-4 lg:px-8 lg:bg-dark rounded-br-[40px] lg:rounded-br-none">
              <div className="bg-[#E7E9EB] h-[300px] 2xl:min-h-[360px] z-10 rounded-[20px] p-4 lg:p-3 2xl:p-6 hidden lg:flex flex-col gap-2.5">
                {/* Header: Label and Logo / Icon for Variants */}
                <div className="flex items-center justify-between gap-2.5 shrink-0 pb-2 border-b border-slate-300/70">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-secondary stroke-[2.2]" />
                    </div>
                    <span className="text-xs sm:text-sm 2xl:text-base font-bold text-gray-900 tracking-tight whitespace-nowrap">
                      Variant Information
                    </span>
                  </div>
                  {selectedVariant?.attribute_value && (
                    <span className="text-[10px] 2xl:text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary truncate max-w-[140px]">
                      {selectedVariant.attribute_value}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto *:shadow-sm">
                  {productDetails?.battery_health && (
                    <div className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center">
                      <span className="font-semibold text-slate-700 mr-1">Battery Health:</span>
                      <span>{productDetails?.battery_health}%</span>
                    </div>
                  )}

                  {productDetails?.charging_time && (
                    <div className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center">
                      <span className="font-semibold text-slate-700 mr-1">Cycle Count:</span>
                      <span>{productDetails?.charging_time}</span>
                    </div>
                  )}

                  {productDetails?.is_box && (
                    <div className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center">
                      <span className="font-semibold text-slate-700">Original Box Available</span>
                    </div>
                  )}

                  {productDetails?.variants?.map((item) => (
                    <div key={item.id} className="text-left px-4 py-3 text-sm font-medium rounded-lg bg-slate-50 border border-slate-100 text-slate-800 break-all flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-semibold text-slate-700 capitalize mr-1">{item?.name}:</span>
                        <span>{item?.value}</span>
                      </div>

                      {/* If the variant is a color, this renders the small color preview box from the image */}
                      {item?.name?.toLowerCase() === "color" && item?.color_code && (
                        <span className="w-4 h-4 rounded shadow-sm border border-gray-300 inline-block ml-2" style={{ backgroundColor: item.color_code }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="flex lg:hidden items-center gap-3  py-2 rounded-2xl self-start lg:self-center whitespace-nowrap">
                <div className="text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">{productDetails?.avg_rating}</span>
                  <span className="text-xs font-medium text-indigo-400 font-sans">({productDetails?.total_review} Customers Reviews)</span>
                </div>
              </div>
              <div className="lg:hidden w-full">
                <ShareDetails selectedVariant={selectedVariant} quantity={quantity} supportPhone={supportPhone} />
              </div>
              {productDetails.description && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatHtml(productDetails.description),
                  }}
                  className="lg:hidden max-h-[180px] overflow-auto text-gray-600 text-sm border border-gray-300 rounded-xl p-3 -mb-1 rendered-html"
                ></div>
              )}
              <div className="lg:hidden -mb-1">
                <UsedWarrantyInfo></UsedWarrantyInfo>
              </div>
              {/* view count and others */}
              <div className=" space-y-2 lg:space-y-3 lg:hidden">
                <MobileTekzoCareCard
                  careData={productDetails?.cares}
                  selectedVariant={careVariant}
                  selectedCare={selectedCare}
                  onCareSelect={handleCareSelect}
                />
                <ProductBenefits productDetails={productDetails} product={productDetails}></ProductBenefits>
                <button className="lg:hidden bg-white w-full rounded-xl py-3 text-secondary font-semibold text-sm">Discount Amount: 0৳</button>
                <div className="lg:hidden">
                  {/* Action Buttons */}
                  {productDetails?.is_stock ? (
                    <div className="flex flex-col gap-2">
                      {/* Buy Now Button */}
                      <button
                        onClick={handleBuyNow}
                        disabled={buyingNow}
                        className="bg-secondary text-white py-3 text-sm font-semibold transition-all active:translate-y-0.5 rounded-xl flex items-center justify-center disabled:opacity-70"
                      >
                        {buyingNow ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          "Buy Now"
                        )}
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || isAdded}
                        className="bg-primary text-white py-3 text-sm font-semibold transition-all active:translate-y-0.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {addingToCart ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Adding...</span>
                          </>
                        ) : isAdded ? (
                          "Added!"
                        ) : (
                          <>
                            <ShoppingCart size={16} className="text-current" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="">
                      <button disabled className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-bold cursor-not-allowed">
                        Out of Stock
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden lg:block">
                <UsedWarrantyInfo></UsedWarrantyInfo>
              </div>
            </div>
          </div>

          {/* <DynamicPills productDetails={productDetails} /> */}
          {/* <UsedDetailsFooter
            productDetails={productDetails}
          ></UsedDetailsFooter> */}
          <div className="hidden lg:flex flex-col gap-6 py-4 bg-dark p-4 lg:p-8 rounded-b-[40px]">
            <div className="hidden lg:flex items-stretch gap-3">
              <div className="w-[31%]">
                <TekzoCareCard careData={productDetails?.cares} selectedVariant={careVariant} selectedCare={selectedCare} onCareSelect={handleCareSelect} productDetail={productDetails} />
              </div>

              <div className="flex-1 flex flex-col">
                <ProductBenefitsFooter productDetails={productDetails} product={productDetails} from={"bottom"} />
              </div>

              <button className="lg:hidden bg-white w-full rounded-xl py-3 text-secondary font-semibold text-sm">Discount Amount: 0৳</button>

              <div className="lg:hidden">
                {/* Action Buttons */}
                {productDetails?.is_stock ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleBuyNow}
                      disabled={buyingNow}
                      className="bg-secondary text-white py-3 text-sm font-semibold transition-all active:translate-y-0.5 rounded-xl flex items-center justify-center disabled:opacity-70"
                    >
                      {buyingNow ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        "Buy Now"
                      )}
                    </button>

                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || isAdded}
                      className="bg-primary text-white py-3 text-sm font-semibold transition-all active:translate-y-0.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {addingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : isAdded ? (
                        "Added!"
                      ) : (
                        <>
                          <ShoppingCart size={16} className="text-current" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <button disabled className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-bold cursor-not-allowed">
                      Out of Stock
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-7 ">
              {productDetails.description && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatHtml(productDetails.description),
                  }}
                  className="hidden lg:block max-h-[180px] overflow-auto text-gray-600 text-sm border border-gray-300 rounded-xl p-3 -mb-1 rendered-html"
                ></div>
              )}
            </div>
          </div>
        </div>
        {/* related product section */}
        <UsedRelatedProducts relatedProducts={relatedProducts} />
      </div>
      {/* <ProductVideo></ProductVideo> */}
      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={(() => {
          const imagesArray = productDetails?.images && productDetails.images.length > 0 ? productDetails.images : productDetails?.product_image ? [{ image_path: productDetails.product_image }] : [];

          return imagesArray.map((img) => ({
            image: img?.image_path?.includes("https://d2c2zgda4zwbg9.cloudfront.net/") ? img.image_path : "/placeholder.jpg",
          }));
        })()}
        initialIndex={activeIndex}
        productTitle={productDetails?.product_name}
      />
    </div>
  );
}
