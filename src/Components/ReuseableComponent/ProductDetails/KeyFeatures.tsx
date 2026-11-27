import React from "react";
import { formatHtml } from "@/lib/formatHtml";
import type { ProductDetailsProp } from "@/types/props/product";
import { rec } from "@/lib/json";

export default function KeyFeatures({ productDetails }: ProductDetailsProp) {
  const pd = rec(productDetails);
  return (
    <div className="">
      {pd?.long_description ? (
        <div
          className="bg-1 my-rounded p-4 lg:p-10 rendered-html"
          dangerouslySetInnerHTML={{
            __html: formatHtml(pd?.short_description),
          }}
        ></div>
      ) : (
        <div className="bg-1 rounded-xl lg:rounded-[40px] py-15 text-center text-gray-600">
          No Key Features available
        </div>
      )}
    </div>
  );
}
