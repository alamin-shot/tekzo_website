"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import ProductSelectorPopup from "./ProductSelectorPopup";
import type { GiftPopupProps } from "@/types/props/product";
import { firstOf, rec } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";

export default function GiftPopup({ productDetails, onSelectGift }: GiftPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  // `productDetails?.[0]` (a string list gives its first character, as before)
  const [selectedGift, setSelectedGift] = useState<unknown>(
    (productDetails === null || productDetails === undefined ? undefined : firstOf(productDetails)) || null,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedGift) {
      onSelectGift?.(rec(selectedGift)?.gift_id);
    }
  }, [selectedGift, onSelectGift]);

  // Global click outside to dismiss the popup panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // mouse targets are DOM nodes; `contains(null)` is false
      if (cardRef.current && !cardRef.current.contains(event.target instanceof Node ? event.target : null)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show fallback if no product is selected
  if (!selectedGift) {
    return (
      <div className="relative w-full  text-gray-800">
        <span className="pl-8 lg:pl-14 text-xs lg:text-sm 2xl:text-base text-gray-500">
          No Gift Available
        </span>
      </div>
    );
  }

  const activeGiftProduct = rec(rec(selectedGift)?.product || selectedGift);

  return (
    <div
      ref={cardRef}
      className={`relative w-full p-4 text-gray-800 transition-all duration-300 z-20`}
    >
      {/* Clickable Header Trigger (Displays Primary Active Product) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 sm:gap-6 pl-4 lg:pl-8">
          {/* Main Product Image */}
          <div className="relative w-8 h-8 lg:w-10 lg:h-10 2xl:w-12 2xl:h-12 shrink-0 flex items-center justify-center">
            <Image
              src={str(activeGiftProduct?.product_image || "/placeholder.jpg") ?? ""}
              alt={str(activeGiftProduct?.product_name || "Gift Product") ?? ""}
              width={120}
              height={120}
              className="object-contain max-h-full max-w-full"
              priority
              fetchPriority="high"
            />
          </div>

          {/* Main Product Title */}
          <h2 className="text-xs lg:text-sm 2xl:text-base font-medium tracking-tight text-gray-800">
            {nodeOf(activeGiftProduct?.product_name || "Select a Gift")}
          </h2>
        </div>

        {/* Orange Circular Dropdown Arrow */}
        <div
          className="shrink-0 flex items-center justify-center w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-[#F26522] text-white shadow-sm transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <IoIosArrowDown className="text-lg lg:text-base stroke-[1.5]" />
        </div>
      </div>

      {/* Embedded Absolute Selection Popup Panel */}
      <ProductSelectorPopup
        isOpen={isOpen}
        products={productDetails || []}
        selectedId={activeGiftProduct?.id}
        onSelectProduct={(giftItem) => {
          setSelectedGift(giftItem);
          onSelectGift?.(rec(giftItem)?.gift_id);
          setIsOpen(false);
        }}
      />
    </div>
  );
}
