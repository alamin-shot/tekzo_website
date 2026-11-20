import dynamic from "next/dynamic";
import Title from "../../ReuseableComponent/Title";
import FeatureProductsCategory, { FeatureProductsCategorySkeleton } from "./FeatureProductsCategory";
import TitleHeading from "../../ReuseableComponent/TitleHeading";
import Section from "../../ReuseableComponent/Section";
import { getFeaturedProducts } from "@/lib/api";
import { Suspense } from "react";

import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

// swiper only ships to routes that actually render a slider
const FeatureProducts = dynamic(() => import("./FeatureProducts"));
const FeatureProductsCategory2 = dynamic(() => import("./FeatureProductsCategory2Lazy"));

const Features = async ({ slidersData, brands }) => {
  const products = await getFeaturedProducts();

  return (
    <Section>
      <Suspense fallback={<FeatureProductsCategorySkeleton />}>
        <FeatureProductsCategory slidersData={slidersData}></FeatureProductsCategory>
      </Suspense>
      <FeatureProducts products={products} slidersData={slidersData}></FeatureProducts>
      {/* <FeatureProductsCategory2 brands={brands}></FeatureProductsCategory2> */}
    </Section>
  );
};

export default Features;
