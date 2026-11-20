"use client";

import dynamic from "next/dynamic";
import Category2 from "./Category2";

// swiper only ships to routes that actually render a slider
const Category1 = dynamic(() => import("./Category1"));

const FlashSaleCategory = ({ slidersData }) => {
  return (
    <div>
      <Category1 slidersData={slidersData}></Category1>
      <Category2 slidersData={slidersData}></Category2>
    </div>
  );
};

export default FlashSaleCategory;
