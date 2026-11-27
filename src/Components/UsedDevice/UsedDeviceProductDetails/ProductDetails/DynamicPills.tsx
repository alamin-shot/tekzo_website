"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductSpecs from "./ProductSpecs";
import ProductReview from "./ProductReview";
import ProductDescription from "./ProductDescription";
import KeyFeatures from "@/Components/ReuseableComponent/ProductDetails/KeyFeatures";
import ProductVideo from "@/Components/ReuseableComponent/ProductDetails/ProductVideo";
import type { ProductDetailsProp } from "@/types/props/product";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function DynamicPills({ productDetails }: ProductDetailsProp) {
  const pd = rec(productDetails);
  const [activeTab, setActiveTab] = useState("specifications");

  const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "description", label: "Description" },
    { id: "reviews", label: "Reviews" },
    { id: "keyFeatures", label: "Key Features" },
  ];

  return (
    <div className="w-full ">
      {/* Header Section */}
      <div className="bg-white lg:bg-[#E7E9EB] pt-4 lg:p-10 lg:pb-1 rounded-b-[16px] lg:rounded-b-[40px] lg:mb-4">
        {nodeOf(pd?.videos && (
          <ProductVideo productDetails={productDetails}></ProductVideo>
        ))}
        <div className="grid grid-cols-1 lg:grid-cols-3 mb-6 lg:mb-10 lg:gap-3">
          {/* Left: Product Info */}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              <span className=" text-gray-900">Category:</span>{" "}
              {nodeOf(rec(pd?.category)?.name)}
            </p>
            {nodeOf(pd?.warranty_text && (
              <p className="text-sm text-gray-500">
                <span className=" text-gray-900">TEKZO Warranty:</span>{" "}
                {nodeOf(pd?.warranty_text)}
              </p>
            ))}
          </div>

          {/* Center: Tab Navigation */}
          <div className="relative flex justify-center  gap-1 lg:gap-2 self-center order-3 lg:order-2 mt-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`bg-gray-100 p-1.5 relative px-3 lg:px-5 py-2.5 text-sm lg:text-base rounded-xl font-semibold cursor-pointer outline-none transition-colors duration-200 whitespace-nowrap
                    ${tab.id === "keyFeatures" && "hidden lg:block"}
                    ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {/* The Ultra-Smooth Runner */}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill-shadow"
                      layout // This is the secret for smooth end-of-animation
                      className="absolute inset-0 bg-secondary rounded-xl z-0"
                      transition={{
                        type: "tween",
                        ease: [0.25, 1, 0, 1], // Custom cubic-bezier for a silky finish
                        duration: 0.3,
                      }}
                    />
                  )}
                  {/* Label - Keep relative and z-10 for sharp rendering */}
                  <span className="relative z-10 block">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Summary Rating */}
          <div className="hidden lg:flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl self-start lg:self-center lg:ml-auto order-2 lg:order-3 whitespace-nowrap">
            <div className="text-indigo-600 inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">
                {nodeOf(pd?.avg_rating)}
              </span>
              <span className="text-xs font-medium text-indigo-400 font-sans">
                ({nodeOf(pd?.total_review)} reviews)
              </span>
            </div>
          </div>
        </div>
        {/* <div
          className="mb-10 hidden lg:block"
          dangerouslySetInnerHTML={{
            __html: pd?.short_description,
          }}
        ></div> */}
      </div>

      {/* Content Area with Animation */}
      <div className="relative ">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            {activeTab === "specifications" && (
              <ProductSpecs productSpecs={pd?.specifications} />
            )}
            {activeTab === "description" && (
              <ProductDescription productDetails={productDetails} />
            )}
            {activeTab === "reviews" && (
              <ProductReview slug={pd?.slug} />
            )}
            {activeTab === "keyFeatures" && (
              <KeyFeatures
                productDetails={productDetails}
                slug={pd?.slug}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
