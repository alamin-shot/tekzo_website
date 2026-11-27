"use client";

import { isStockOut } from "@/utils/stock";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Truck, Minus, Plus, ChevronRight, Check, Loader2, Ticket, Gift, Copy, ChevronUp, X } from "lucide-react";
import PreFetchLink from "../CustomUIComponent/PreFetchLink";
import EmiModalContent from "./EMI/EmiModalContent";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { StickyBottomBarProps } from "@/types/props/product";
import { addJs, fieldsOf, findList, itemAt, lengthStrict, localeOpt, mapList, rec } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

// mouse targets are DOM nodes; `contains(null)` is false
const asNode = (target: EventTarget | null): Node | null => (target instanceof Node ? target : null);

const EmiModal = dynamic(() => import("./EMI/EmiModal"), { ssr: false });

export default function StickyBottomBar({
  productDetails,
  companySetting,
  selectedVariant,
  quantity = 1,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow,
  addingToCart = false,
  isAdded = false,
  buyingNow = false,
  selectedTekzoCare = null,
  selectedGiftId = "",
  onGiftSelect,
}: StickyBottomBarProps) {
  const pd = rec(productDetails);
  const variant = rec(selectedVariant);
  const setting = rec(companySetting);
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [hasOpenedEmi, setHasOpenedEmi] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isGiftPopupOpen, setIsGiftPopupOpen] = useState(false);
  const giftPopupRef = useRef<HTMLDivElement>(null);
  const giftButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isGiftPopupOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (giftPopupRef.current && !giftPopupRef.current.contains(asNode(e.target)) && giftButtonRef.current && !giftButtonRef.current.contains(asNode(e.target))) {
        setIsGiftPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGiftPopupOpen]);

  const couponData = rec(pd?.coupon);
  const couponCode = couponData?.code;
  const couponAmount = couponData?.amount;
  const hasCoupon = Boolean(couponCode);

  const giftProducts = pd?.gift_products || [];
  const hasGifts = Number(lengthStrict(giftProducts)) > 0;
  const activeGiftItem = findList(giftProducts, (g) => String(fieldsOf(g).gift_id) === String(selectedGiftId)) || itemAt(giftProducts, 0) || null;
  const activeGiftProduct = rec(rec(activeGiftItem)?.product || activeGiftItem);

  const showPromoBar = hasCoupon || hasGifts;

  const handleCopyCoupon = async (e?: ReactMouseEvent) => {
    e?.stopPropagation?.();
    if (!couponCode) return;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(String(couponCode));
        setCopiedCoupon(true);
        setTimeout(() => setCopiedCoupon(false), 2000);
        return;
      } catch (err) {
        console.warn("Modern clipboard API failed, trying fallback...", err);
      }
    }

    const textArea = document.createElement("textarea");
    textArea.value = String(couponCode);
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopiedCoupon(true);
        setTimeout(() => setCopiedCoupon(false), 2000);
      }
    } catch (err) {
      console.error("Fallback copy execution failed", err);
    }
    document.body.removeChild(textArea);
  };

  const isPreOrder = Boolean(variant?.is_prebook || pd?.is_prebook);
  const basePriceWithoutCare = variant?.regular_price || pd?.regular_price || 0;
  const baseFinalPrice = variant?.final_price || variant?.regular_price || pd?.final_price || pd?.regular_price || 0;
  const care = rec(selectedTekzoCare);
  const careAmount = care?.care_id ? care?.amount || 0 : 0;
  const regularPrice = addJs(basePriceWithoutCare, careAmount);
  const offerPrice = addJs(baseFinalPrice, careAmount);
  const hasOffer = Number(basePriceWithoutCare) > 0 && basePriceWithoutCare !== baseFinalPrice && Number(baseFinalPrice) > 0;
  const bookingAmount = pd?.booking_amount || 0;
  const displayPrice = isPreOrder ? bookingAmount : hasOffer ? offerPrice : regularPrice;

  // EMI disabled if product price is less than 5000
  const payablePrice = hasOffer ? offerPrice : regularPrice;
  const isEmiDisabled = Number(payablePrice) < 5000;

  const handleOpenEmi = () => {
    if (isEmiDisabled) return;
    setHasOpenedEmi(true);
    setIsEmiOpen(true);
  };

  const isOutOfStock = isStockOut(variant?.stock, Boolean(variant?.is_prebook || pd?.is_prebook));

  const emiProduct = {
    ...Object.assign({}, productDetails || {}),
    ...Object.assign({}, selectedVariant || {}),
    final_price: displayPrice,
    regular_price: regularPrice,
    discount_amount: hasOffer ? Number(regularPrice) - Number(displayPrice) : 0,
  };

  return (
    <>
      <aside
        aria-label="Product Purchase Actions"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_25px_rgba(0,0,0,0.04)] select-none font-sans"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Desktop Single Row */}
          <div className="hidden lg:flex items-center justify-between gap-3 xl:gap-5">
            {/* 1st: TEKZO Logo */}
            <PreFetchLink prefetch={false} href="/" aria-label="TEKZO Home" className=" flex items-center shrink-0">
              <Image
                src={str(setting?.company_logo || "/nav-logo.png") ?? ""}
                alt={str(setting?.company_name || "TEKZO") ?? ""}
                width={95}
                height={26}
                className="h-5.5 xl:h-6 w-auto max-w-[85px] xl:max-w-[95px] object-contain"
                priority
              />
            </PreFetchLink>

            <div className="h-8 w-px bg-slate-200/90 shrink-0" />

            {/* Coupon Section - Only show if coupon exists */}
            {hasCoupon && (
              <>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Ticket className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Coupon</span>
                      {Number(couponAmount) > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">Save ৳{nodeOf(couponAmount)}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <code className="text-xs font-mono font-bold tracking-wider text-slate-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-dashed border-amber-300 select-all">
                        {nodeOf(couponCode)}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyCoupon}
                        title="Copy coupon code"
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 ${
                          copiedCoupon ? "bg-emerald-600 text-white" : "bg-primary hover:bg-[#d04b33] text-white"
                        }`}
                      >
                        {copiedCoupon ? (
                          <>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 stroke-[2]" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200/90 shrink-0" />
              </>
            )}

            {/* Gift Section - Dropdown if multiple choices available */}
            <div className="relative shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    hasGifts ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  <Gift className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${hasGifts ? "text-emerald-700" : "text-slate-500"}`}>Free Gift</span>
                  {hasGifts ? (
                    Number(lengthStrict(giftProducts)) > 1 ? (
                      <button
                        ref={giftButtonRef}
                        type="button"
                        onClick={() => setIsGiftPopupOpen((prev) => !prev)}
                        className="flex items-center gap-2 mt-0.5 group cursor-pointer text-left rounded-lg hover:bg-slate-50 -ml-1 pl-1 pr-2 py-0.5 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="relative w-6 h-6 rounded bg-slate-100 border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={str(activeGiftProduct?.product_image || "/placeholder.jpg") ?? ""}
                            alt={str(activeGiftProduct?.product_name || "Gift") ?? ""}
                            width={24}
                            height={24}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[110px] xl:max-w-[160px] 2xl:max-w-[200px]" title={str(activeGiftProduct?.product_name)}>
                          {nodeOf(activeGiftProduct?.product_name || "Select Gift")}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">+{nodeOf(lengthStrict(giftProducts))}</span>
                        <ChevronUp className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isGiftPopupOpen ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="relative w-6 h-6 rounded bg-slate-100 border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={str(activeGiftProduct?.product_image || "/placeholder.jpg") ?? ""}
                            alt={str(activeGiftProduct?.product_name || "Gift") ?? ""}
                            width={24}
                            height={24}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[110px] xl:max-w-[160px] 2xl:max-w-[200px]" title={str(activeGiftProduct?.product_name)}>
                          {nodeOf(activeGiftProduct?.product_name)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">Free</span>
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-medium text-slate-500 mt-0.5">No Gift Available</span>
                  )}
                </div>
              </div>

              {/* Upward Selection Popup for Desktop */}
              {isGiftPopupOpen && hasGifts && (
                <div
                  ref={giftPopupRef}
                  className="absolute left-0 bottom-[calc(100%+14px)] w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Select Free Gift</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGiftPopupOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                    {mapList(giftProducts, (entry) => {
                      const item = fieldsOf(entry);
                      const product = rec(item.product || entry);
                      const isSelected = String(item.gift_id) === String(selectedGiftId) || String(product?.id) === String(activeGiftProduct?.id);
                      return (
                        <div
                          key={keyFrom(item.gift_id || product?.id)}
                          onClick={() => {
                            onGiftSelect?.(item.gift_id);
                            setIsGiftPopupOpen(false);
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                            isSelected ? "bg-emerald-50 border-emerald-400 text-slate-900 shadow-2xs" : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div className="relative w-8 h-8 rounded-md bg-slate-50 border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                            <Image src={str(product?.product_image || "/placeholder.jpg") ?? ""} alt={str(product?.product_name || "Gift") ?? ""} width={32} height={32} className="object-contain w-full h-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{nodeOf(product?.product_name)}</p>
                            <span className="text-[10px] font-bold text-emerald-600">Free with order</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200/90 shrink-0" />

            {/* Home Delivery */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Truck className="w-5 h-5 text-slate-800 stroke-[1.75] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-slate-900 tracking-tight leading-tight">Home Delivery</span>
                <span className="text-[11.5px] text-primary font-semibold leading-tight mt-0.5">Express: 4 hrs Dhaka</span>
                <span className="text-[11px] text-slate-500 font-normal leading-tight hidden xl:inline mt-0.5">Standard: 1–3 days</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200/90 shrink-0" />

            {/* Price & EMI */}
            <div className="flex flex-col justify-center min-w-[125px] shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] xl:text-[22px] font-bold text-slate-950 tracking-tight leading-tight">{localeOpt(displayPrice)} BDT</span>
                {hasOffer && !isPreOrder && <span className="text-xs text-slate-400 line-through">{localeOpt(regularPrice)} BDT</span>}
              </div>
              {isEmiDisabled ? (
                <span
                  title="EMI is only available for purchases of 5,000 BDT or more"
                  className="text-[12px] font-medium text-slate-400 leading-tight mt-0.5 flex items-center gap-1 cursor-not-allowed select-none w-fit"
                >
                  EMI Unavailable
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenEmi}
                  className="text-[12px] font-semibold text-secondary hover:text-[#0b6b71] leading-tight mt-0.5 flex items-center gap-1 cursor-pointer transition-colors group w-fit"
                >
                  <span className="underline underline-offset-2">EMI Available</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="flex items-center gap-2.5 xl:gap-3 shrink-0">
              <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-100/90 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={onDecrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-white text-slate-700 shadow-2xs hover:text-secondary hover:shadow-xs active:scale-90 flex items-center justify-center transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:text-slate-700 disabled:hover:shadow-none cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
                <span className="w-8 xl:w-9 text-center text-[13px] xl:text-[13.5px] font-bold text-slate-900 select-none tracking-tight">{quantity}</span>
                <button
                  type="button"
                  onClick={onIncrement}
                  aria-label="Increase quantity"
                  className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-white text-slate-700 shadow-2xs hover:text-secondary hover:shadow-xs active:scale-90 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>

              <button
                type="button"
                onClick={onAddToCart}
                disabled={addingToCart || isAdded || isOutOfStock}
                className="bg-primary hover:bg-[#d04b33] active:bg-[#bd3f28] text-white font-semibold text-xs xl:text-[13.5px] px-5 xl:px-7 py-2.5 xl:py-3 rounded-full transition-all duration-200 active:scale-[0.98] shadow-xs hover:shadow flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Adding...</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Added to cart</span>
                  </>
                ) : (
                  <span>Add to cart</span>
                )}
              </button>

              <button
                type="button"
                onClick={isOutOfStock ? undefined : onBuyNow}
                disabled={buyingNow || isOutOfStock}
                aria-disabled={buyingNow || isOutOfStock}
                className="bg-secondary hover:bg-[#0b6b71] active:bg-[#095b60] text-white font-semibold text-xs xl:text-[13.5px] px-6 xl:px-8 py-2.5 xl:py-3 rounded-full transition-all duration-200 active:scale-[0.98] shadow-xs hover:shadow flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {buyingNow ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Stock Out</span>
                ) : isPreOrder ? (
                  <span>Pre-Order Now</span>
                ) : (
                  <span>Buy Now</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex lg:hidden flex-col gap-2.5">
            <div className=" flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 text-[11px]">
              <PreFetchLink prefetch={false} href="/" aria-label="TEKZO Home" className="hidden">
                <Image
                  src={str(setting?.company_logo || "/nav-logo.png") ?? ""}
                  alt={str(setting?.company_name || "TEKZO") ?? ""}
                  width={65}
                  height={18}
                  className="h-3.5 sm:h-4 w-auto max-w-[60px] sm:max-w-[70px] object-contain"
                />
              </PreFetchLink>

              {/* Quantity with label (moved here from bottom row) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-slate-800 text-xs">Quantity:</span>
                <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-100/90 p-0.5 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={onDecrement}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-5.5 h-5.5 rounded-full bg-white text-slate-700 shadow-2xs hover:text-secondary active:scale-90 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-2.5 h-2.5 stroke-[2.2]" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900 select-none">{quantity}</span>
                  <button
                    type="button"
                    onClick={onIncrement}
                    aria-label="Increase quantity"
                    className="w-5.5 h-5.5 rounded-full bg-white text-slate-700 shadow-2xs hover:text-secondary active:scale-90 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              <div className="h-3 w-px bg-slate-200/80 shrink-0" />

              <div className="flex items-center gap-1.5 shrink-0">
                <Truck className="w-3.5 h-3.5 text-slate-800 shrink-0 stroke-[1.75]" />
                <div className="flex items-baseline gap-1">
                  <span className="text-primary font-semibold">4h Dhaka</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500">1–3d BD</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5">
              <div className="flex flex-col min-w-[95px] shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-tight">{localeOpt(displayPrice)} BDT</span>
                  {hasOffer && !isPreOrder && <span className="text-[11px] text-slate-400 line-through">{localeOpt(regularPrice)} BDT</span>}
                </div>
                {isEmiDisabled ? (
                  <span title="EMI is only available for purchases of 5,000 BDT or more" className="text-[11px] font-medium text-slate-400 cursor-not-allowed leading-none mt-1 select-none text-left">
                    EMI Unavailable
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenEmi}
                    className="text-[11px] font-semibold text-secondary hover:underline cursor-pointer leading-none mt-1 flex items-center gap-0.5 text-left"
                  >
                    <span>EMI Available</span>
                    <ChevronRight className="w-2.5 h-2.5 stroke-[2.5]" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={addingToCart || isAdded || isOutOfStock}
                  className="flex-1 max-w-[140px] bg-primary hover:bg-[#d04b33] text-white font-semibold text-xs sm:text-sm py-2 px-3 rounded-full transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {addingToCart ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : isAdded ? <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" /> : null}
                  <span className="truncate">{isAdded ? "Added" : "Add to cart"}</span>
                </button>

                <button
                  type="button"
                  onClick={isOutOfStock ? undefined : onBuyNow}
                  disabled={buyingNow || isOutOfStock}
                  aria-disabled={buyingNow || isOutOfStock}
                  className="flex-1 max-w-[150px] bg-secondary hover:bg-[#0b6b71] text-white font-semibold text-xs sm:text-sm py-2 px-3.5 rounded-full transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {buyingNow ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : null}
                  <span className="truncate">{isOutOfStock ? "Stock Out" : isPreOrder ? "Pre-Order" : "Buy Now"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {!isEmiDisabled && hasOpenedEmi && (
        <EmiModal isOpen={isEmiOpen} onClose={() => setIsEmiOpen(false)}>
          <div className="p-4 lg:p-6 cursor-auto">
            <EmiModalContent product={emiProduct} />
          </div>
        </EmiModal>
      )}
    </>
  );
}
