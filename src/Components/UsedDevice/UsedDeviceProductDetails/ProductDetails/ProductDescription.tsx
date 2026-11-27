"use client";

import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import { formatHtml } from "@/lib/formatHtml";
import type { ProductDetailsProp } from "@/types/props/product";
import { rec } from "@/lib/json";

const ProductDescription = ({ productDetails }: ProductDetailsProp) => {
  const pd = rec(productDetails);
  return (
    <div className="">
      {pd?.long_description ? (
        <div
          className="bg-1 my-rounded p-4 lg:p-10 rendered-html"
          dangerouslySetInnerHTML={{ __html: formatHtml(pd?.long_description) }}
        ></div>
      ) : (
        <div className="bg-1 rounded-xl lg:rounded-[40px] py-15 text-center text-gray-600">
          No Description available
        </div>
      )}
    </div>
  );
};

export default ProductDescription;
