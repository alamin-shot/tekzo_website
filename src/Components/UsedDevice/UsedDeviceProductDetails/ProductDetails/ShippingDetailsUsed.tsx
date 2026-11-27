"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

export default function ShippingDetailsUsed() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the popup if clicked anywhere outside of the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target instanceof Node ? event.target : null)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Main Card Trigger - Design completely untouched */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white lg:bg-[#E7E9EB] flex px-2 xl:px-4 py-1 gap-2 lg:gap-3 items-center rounded-xl lg:rounded-2xl cursor-pointer select-none h-full ${isOpen ? "border border-orange-400" : "border border-transparent"}`}
      >
        <div className="w-8 lg:w-8 2xl:w-10 shrink-0 text-primary">
          <Image
            src={"/product-details/truck.svg"}
            alt="tuck image"
            width={400}
            height={400}
            className="w-full"
          ></Image>
        </div>
        <div className="flex gap-1 items-center lg:justify-between w-full">
          <div className="flex flex-col lg:gap-1">
            <span className="text-[10px] 2xl:text-sm text-gray-700 font-semibold whitespace-nowrap">
              Shipping Details
            </span>
            <span className="text-[7px] 2xl:text-[10px]">
              0-3 Days Fast Delivery
            </span>
          </div>
          <IoIosArrowDown
            className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>

      {/* Contextual Popup */}
      <div
        className={`absolute left-0 right-0 lg:left-auto lg:right-0 top-[112%] w-full lg:w-[207%] z-50 bg-white/50 backdrop-blur-sm rounded-2xl p-4 lg:p-5 shadow-2xl transition-all duration-300 origin-top transform overflow-visible
  
    ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        <div className="">
          <div className="space-y-2">
            {/* Inside Dhaka (Fast) */}
            <div className="flex items-center justify-between shadow-sm p-4 lg:p-6 bg-white/30 backdrop-blur-xl rounded-xl border border-gray-100/50">
              <div className="space-y-1">
                <span className="text-[10px] lg:text-xs font-extrabold tracking-widest text-[#9ca3af] uppercase">
                  Inside Dhaka
                </span>
                <p className="text-base lg:text-xl  font-bold text-[#111827]">
                  24–48 Hours
                </p>
              </div>
              <span className="px-5 py-2 bg-[#ff8a00] text-white text-xs font-extrabold tracking-widest rounded-lg   uppercase">
                Fast
              </span>
            </div>

            {/* Outside Dhaka (Standard) */}
            <div className="flex items-center justify-between  shadow-sm p-4 lg:p-6 bg-white/30 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-gray-100/50">
              <div className="space-y-1">
                <span className="text-[10px] lg:text-xs  font-extrabold tracking-widest text-[#9ca3af] uppercase">
                  Outside Dhaka
                </span>
                <p className="text-base lg:text-xl  font-bold text-[#111827]">
                  3–5 Business Days
                </p>
              </div>
              <span className="px-5 py-2 bg-[#e5e7eb] text-[#374151] text-xs font-extrabold tracking-widest rounded-lg uppercase">
                Standard
              </span>
            </div>
          </div>

          {/* Disclaimer Text */}
          <p className="mt-6 text-center text-[10px] md:text-xs font-extrabold tracking-widest text-gray-500 leading-relaxed px-4">
            * DELIVERY CHARGES VARY BASED ON LOCATION AND PARCEL WEIGHT.
            STANDARD RATES APPLY.
          </p>
        </div>
      </div>
    </div>
  );
}
