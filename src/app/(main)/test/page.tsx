import CategorySliderSkeleton from "@/Components/Home/Categories/CategorySliderSkeleton";
import { FeatureProductsCategorySkeleton } from "@/Components/Home/FeaturesProduct/FeatureProductsCategory";
import PhotoGallarySkeletonLoader from "@/Components/ReuseableComponent/ProductDetails/PhotoGallarySkeletonLoader";
import Image from "next/image";
import React from "react";

const HonorProductCard = () => {
  return (
    <div className="">
      <div className="">
        <FeatureProductsCategorySkeleton></FeatureProductsCategorySkeleton>
      </div>
    </div>
  );
};

export default HonorProductCard;
