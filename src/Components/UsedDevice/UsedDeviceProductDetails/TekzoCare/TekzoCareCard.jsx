"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import TekzoCarePopup from "./TekzoCarePopup";

export default function TekzoCareCard({
  careData,
  selectedVariant,
  selectedCare,
  onCareSelect,
  productDetail
}) {

  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const activeCare = Boolean(selectedCare?.care_id);
  const activePlanName =
    selectedCare?.planName ||
    "Select the right Tekzo Care protection plan for uninterrupted peace of mind.";
  const activePlanAmount = selectedCare?.amount
    ? `BDT ${selectedCare.amount.toLocaleString()}`
    : "BDT 0.00";

  // Automatically scroll only on mobile when popup opens
  useEffect(() => {
    if (isOpen && cardRef.current) {
      const isMobile = window.innerWidth < 1024; // matches your lg Tailwind breakpoint
      const isPC = window.innerWidth > 1024; // matches your lg Tailwind breakpoint
      if (isMobile) {
        // Wait a split second for layout calculation
        setTimeout(() => {
          const elementRect = cardRef.current.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;

          window.scrollTo({
            top: absoluteElementTop - 20, // leaves exactly 20px margin at the top
            behavior: "smooth",
          });
        }, 100);
      }
      if (isPC) {
        // Wait a split second for layout calculation
        setTimeout(() => {
          const elementRect = cardRef.current.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;

          window.scrollTo({
            top: absoluteElementTop - 100, // leaves exactly 20px margin at the top
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [isOpen]);

  // Close the popup when clicking anywhere outside of the component structure
  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    /* Added ref={cardRef} to trace position and handle click outside */
    <div
      ref={cardRef}
      className={`relative w-full bg-white lg:bg-[#E7E9EB] rounded-xl xl:rounded-2xl p-2 xl:p-3 text-gray-700 ${activeCare ? "border border-orange-400" : isOpen ? "border border-orange-400" : "border border-transparent"}`}
    >
      {/* Clickable Card Header Wrapper */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex gap-2 2xl:gap-4 *:shrink-0 cursor-pointer select-none"
        role="button"
        aria-expanded={isOpen}
      >
        {/* Left Column: Get Tekzo Care */}
        <div className="flex-4 flex flex-col justify-between">
          <h2 className="text-xs 2xl:text-lg font-medium tracking-tight">
            Get Tekzo Care
          </h2>
          <div className="w-full mt-2">
            <Image
              src="/product-details/tekzo-care.svg"
              alt="Tekzo Care 1 Year Protection"
              width={400}
              height={300}
              className="w-full"
            />
          </div>
        </div>

        {/* Right Column: Estimated Delivery & Pricing */}
        <div className="flex-6 flex flex-col justify-between">
          {/* Delivery Heading */}
          <h2 className="text-xs 2xl:text-lg font-medium tracking-tight text-end">
            Care That Enhance Your Purchase
          </h2>

          {/* Selection and Price Row */}
          <div className="flex items-start gap-1 2xl:gap-2 mt-2">
            {/* Check Circle Icon */}
            <div
              className={`shrink-0 mt-1 flex items-center justify-center w-3.5 h-3.5 2xl:w-5 2xl:h-5 p-[1px] rounded-full border ${activeCare ? "bg-[#00A88F] border-[#00A88F] text-white" : "border-[#b5b5b5] text-[#939399]"}`}
            >
              <Check className="stroke-[2.5]" />
            </div>

            {/* Content & Dropdown & Price */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="w-full">
                  <div className="flex gap-1">
                    <div>
                      {/* plane name */}
                      <p className="text-[7px] 2xl:text-[10px] text-[#939399] stroke-[2.5] leading-relaxed max-w-[280px]">
                        {activePlanName}
                      </p>
                      {/* plan cost */}

                      <p className="text-end text-sm 2xl:text-xl font-medium text-[#939399] mr-2 2xl:mr-3">
                        {activePlanAmount}
                      </p>
                    </div>
                    {/* Chevron Dropdown Trigger (Rotation reflects open state) */}
                    <div
                      className="shrink-0 flex items-center justify-center w-5 h-5 2xl:w-6 2xl:h-6 p-[1px] rounded-full bg-primary text-white transition-transform duration-300"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <ChevronDown className="stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TekzoCarePopup
        isOpen={isOpen}
        careData={careData}
        selectedVariant={selectedVariant}
        onSelectCare={onCareSelect}
      ></TekzoCarePopup>
    </div>
  );
}
