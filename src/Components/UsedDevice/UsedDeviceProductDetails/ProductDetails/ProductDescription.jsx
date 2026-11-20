"use client";

import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import { formatHtml } from "@/lib/formatHtml";

const ProductDescription = ({ productDetails }) => {
  return (
    <div className="">
      {productDetails?.long_description ? (
        <div
          className="bg-1 my-rounded p-4 lg:p-10 rendered-html"
          dangerouslySetInnerHTML={{ __html: formatHtml(productDetails?.long_description) }}
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
