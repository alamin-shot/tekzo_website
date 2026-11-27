import React from "react";
import dynamic from "next/dynamic";
import Breadcrumbs from "../ReuseableComponent/Breadcrumbs";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import type { BrandProductsProps } from "@/types/props/brand";

// swiper only ships to routes that actually render a slider
const BrandProducts = dynamic(() => import("./BrandProducts"));

const SingleBrand = ({ products }: BrandProductsProps) => {
  const categories = [
    "All Products",
    "USB Cable",
    "Wall Charger",
    "Earbuds",
    "Stylus Pen",
    "Earphone",
    "Mac",
    "iPad",
    "iPhone",
  ];
  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between">
        <Breadcrumbs></Breadcrumbs>
        <div className="hidden  lg:flex gap-2 pb-7 lg:pt-7">
          <Link href={"/"} className="inline-block">
            <Image
              src="/play-store.png" // Replace with your logo in /public
              alt="play store logo"
              width={4000}
              height={3000}
              className="object-contain  w-25 h-auto"
            />
          </Link>
          <Link href={"/"} className="inline-block">
            <Image
              src="/app-store.png" // Replace with your logo in /public
              alt="app store logo"
              width={4000}
              height={3000}
              className="object-contain  w-25 h-auto"
            />
          </Link>
        </div>
      </div>
      <header className="w-full ">
        {/* Top Section */}
        <div className=" flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-2 lg:gap-5">
            {/* Circular Logo Container */}
            <div className="relative w-16 h-16 shrink-0 lg:w-26 lg:h-26 rounded-full border-2 lg:border-4 border-gray-200  flex items-center justify-center overflow-hidden bg-gray-50">
              <Image
                src="/Apple Logo white.png" // Replace with your logo in /public
                alt="Apple Logo"
                width={60}
                height={60}
                className="object-contain  w-12 h-12 lg:w-17 lg:h-17"
              />
            </div>

            <div className="w-full">
              <div className="flex lg:items-center gap-2 ">
                <div className="flex justify-between items-center lg:block  w-full">
                  <h1 className="text-[13px] lg:text-xl xl:text-2xl font-semibold text-gray-700">
                    Apple Official Store{" "}
                    <MdVerified className="inline-block text-blue-500 text-base lg:text-xl lg:ml-2" />
                  </h1>

                  <div className="flex lg:hidden gap-1">
                    <Link href={"/"} className="inline-block">
                      <Image
                        src="/play-store.png" // Replace with your logo in /public
                        alt="play store logo"
                        width={4000}
                        height={3000}
                        className="object-contain  w-13 h-auto"
                      />
                    </Link>
                    <Link href={"/"} className="inline-block">
                      <Image
                        src="/app-store.png" // Replace with your logo in /public
                        alt="app store logo"
                        width={4000}
                        height={3000}
                        className="object-contain  w-13 h-auto"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-xs lg:text-sm mt-0.5">
                Think Different
              </p>
              <div className="flex items-center gap-1">
                <div className="flex text-orange-400 text-sm lg:text-lg">
                  ★★★★<span className="text-gray-200">★</span>
                </div>
                <span className="text-gray-600 text-sm ml-1">4.8</span>
              </div>
            </div>
          </div>

          {/* Left Side: Logo & Info */}
          {/* Navigation Tabs */}
          <div className="flex flex-wrap xl:self-end gap-2 overflow-x-auto no-scrollbar">
            {categories.map((item, idx) => (
              <button
                key={idx}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  item === "All Products"
                    ? "bg-primary text-white shadow-md" // Brand orange
                    : "bg-[#F3F4F6] text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>
      <BrandProducts products={products}></BrandProducts>
    </div>
  );
};

export default SingleBrand;
