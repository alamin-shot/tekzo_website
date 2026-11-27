"use client";

import Image from "next/image";
import React from "react";
import { FiShoppingCart } from "react-icons/fi";

const FlashSaleProduct = () => {
  return (
    <div className="lg:flex items-center justify-center gap-8 lg:gap-12 mt-12 xl:mt-0">
      <div className="flex flex-col-reverse xl:flex-row items-center gap-8 border-b md:border-b-0 border-gray-200 pb-3">
        <div className="flex xl:flex-col gap-2">
          <div className="bg-dark w-13 p-1 rounded-xl">
            <Image
              src="/flashsale/headphone-mini1.png"
              alt="headphone"
              className="cursor-pointer"
              width={200}
              height={200}
            />
          </div>
          <div className="bg-dark w-13 p-1 rounded-xl">
            <Image
              src="/flashsale/headphone-mini2.png"
              alt="headphone"
              className="cursor-pointer"
              width={200}
              height={200}
            />
          </div>
        </div>
        <div className="w-[90%] md:w-[55%] lg:w-[230] xl:w-67 ">
          <Image
            src="/flashsale/headphone.png"
            alt="headphone"
            className="w-full"
            width={200}
            height={200}
          />
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold uppercase">Edifire</h3>
        <h4 className="text-2xl font-semibold mt-3">Edifier W830NB</h4>
        <p className="text-sm mt-1">ANC Bluetooth Headphone</p>
        <div className="mt-4 flex gap-3 items-center">
          <p className="font-semibold text-xl">৳ 7,125</p>
          <p className="line-through text-gray-500">৳ 7,825</p>

          <p className="w-fit bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-full animate-bounce cursor-default border border-white/10">
            10.00% Off
          </p>
        </div>

        <div className="mt-4 flex xl:flex-col 2xl:flex-row *:self-start gap-3">
          {/* 1. Buy Now - Ultra Smooth Live Shine Effect */}
          <button className="relative px-8 py-3 bg-secondary text-white font-bold rounded-full overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer group">
            <span className="relative z-10">Buy Now</span>

            {/* The Smooth Running White Shadow/Shine */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 -left-[100%] h-full w-[60%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-[smoothShine_4s_infinite_ease-in-out]" />
            </div>
          </button>

          {/* 2. Add to Cart - Icon Tilt & Scale (No Button Scaling) */}
          <button className="group flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full transition-all duration-300 active:scale-95 cursor-pointer border-none">
            {/* Only Icon Scales & Tilts Back */}
            <div className="transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-125">
              <FiShoppingCart className="text-xl" />
            </div>

            <span>Add to Cart</span>
          </button>

          {/* Tailwind CSS keyframe for the Smooth Shine */}
          <style jsx global>{`
            @keyframes smoothShine {
              0% {
                left: -100%;
              }
              30% {
                left: 120%;
              }
              100% {
                left: 120%;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleProduct;
