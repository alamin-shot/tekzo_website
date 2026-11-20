import React from "react";
import { formatHtml } from "@/lib/formatHtml";

export default function KeyFeatures({ productDetails }) {
  return (
    <div className="">
      {productDetails?.long_description ? (
        <div
          className="bg-1 my-rounded p-4 lg:p-10 rendered-html"
          dangerouslySetInnerHTML={{
            __html: formatHtml(productDetails?.short_description),
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
