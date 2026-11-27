"use client";

import { useState } from "react";
import { formatHtml } from "@/lib/formatHtml";
import { motion, AnimatePresence } from "framer-motion";
import ProductSpecs from "./ProductSpecs";
import ProductReview from "./ProductReview";
import ProductDescription from "./ProductDescription";
import KeyFeatures from "@/Components/ReuseableComponent/ProductDetails/KeyFeatures";
import ProductVideo from "@/Components/ReuseableComponent/ProductDetails/ProductVideo";
import type { ProductDetailsProp } from "@/types/props/product";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function UsedDetailsFooter({ productDetails }: ProductDetailsProp) {
  const pd = rec(productDetails);
  const [activeTab, setActiveTab] = useState("specifications");

  const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "description", label: "Description" },
    { id: "reviews", label: "Reviews" },
    { id: "keyFeatures", label: "Key Features" },
  ];

  return (
    <div className="bg-white lg:bg-[#E7E9EB] pt-4 lg:p-10  rounded-b-[16px] lg:rounded-b-[40px] lg:mb-4">
      <div className="space-y-6">
        {/* Warranty Section */}
        {nodeOf(pd?.official_service_warranty && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Warranty
            </h3>
            <p className="text-gray-600">
              {nodeOf(pd?.official_service_warranty)}
            </p>
          </>
        ))}

          {/* Description Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </h3>
            <p
              className="text-gray-600 leading-relaxed rendered-html"
              dangerouslySetInnerHTML={{
                __html: formatHtml(pd?.description || "No Description Available"),
              }}
            />
          </div>
      </div>
    </div>
  );
}
