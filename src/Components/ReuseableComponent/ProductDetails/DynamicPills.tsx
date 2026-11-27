"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import ProductSpecs from "./ProductSpecs";
import ProductVideo from "./ProductVideo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { getAuthUser } from "@/utils/getAuthUser";
import { fireWishlistAdded } from "@/context/CounterContext";
import WarrantyInfo from "./WarrantyInfo";
import OrderReassurance from "./OrderReassurance";
import { CircleCheckBig } from "lucide-react";
import type { DynamicPillsProps } from "@/types/props/product";
import { itemAt, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";
import { pushDataLayer } from "@/tracking/dataLayer";

// A plain block instead of null while the chunk downloads — without this,
// the first click on any of these tabs rendered nothing for a moment (the
// AnimatePresence exit collapses the old tab first), then the content
// popped in all at once once the chunk arrived, reading as a jolt. Once a
// tab's chunk is cached, later clicks mount instantly and never show this.
const TabSkeleton = () => (
  <div className="min-h-[300px] animate-pulse space-y-3 p-4 lg:p-8">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="h-4 bg-gray-200 rounded w-full" />
    <div className="h-4 bg-gray-200 rounded w-5/6" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
  </div>
);

// "specifications" is the only tab active by default, so the other three
// only need their JS once the user actually clicks that tab — code-split
// instead of shipping all four tabs' code in the initial product-page bundle.
const ProductReview = dynamic(() => import("./ProductReview"), {
  loading: TabSkeleton,
});
const ProductDescription = dynamic(() => import("./ProductDescription"), {
  loading: TabSkeleton,
});
const KeyFeatures = dynamic(() => import("./KeyFeatures"), {
  loading: TabSkeleton,
});

export default function DynamicPills({
  productDetails,
  reviewsData,
  supportPhone,
  activeTab: externalActiveTab,
  setActiveTab: setExternalActiveTab,
}: DynamicPillsProps) {
  const pd = rec(productDetails);
  const [internalActiveTab, setInternalActiveTab] = useState("specifications");
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = setExternalActiveTab || setInternalActiveTab;
  const [wishlistAdding, setWishlistAdding] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const router = useRouter();

  const handleWishlist = async () => {
    if (wishlistAdding || wishlistAdded) return;
    const user = await getAuthUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!rec(rec(pd?.variants)?.[0])?.id) return;

    setWishlistAdding(true);
    try {
      const variant = rec(itemAt(pd?.variants, 0));
      await clientFetchAPI("/customer/wishlists", "POST", {
        variant_id: variant?.id,
        quantity: 1,
      });
      pushDataLayer({
        event: "add_to_wishlist",
        ecommerce: {
          currency: "BDT",
          value: variant?.regular_price || 0,
          items: [
            {
              item_id: variant?.id,
              item_name: pd?.product_name,
              item_brand: rec(pd?.brand)?.name,
              item_category: rec(pd?.category)?.name,
              quantity: 1,
              price: variant?.regular_price || 0,
            },
          ],
        },
      });
      setWishlistAdded(true);
      fireWishlistAdded();
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistAdding(false);
    }
  };

  const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "description", label: "Description" },
    { id: "reviews", label: "Reviews" },
    { id: "keyFeatures", label: "Key Features" },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="lg:bg-[#E7E9EB] lg:p-8 lg:pb-1 rounded-b-[16px] lg:rounded-b-[40px] mb-6 ">
        {nodeOf(pd?.videos && <ProductVideo productDetails={productDetails}></ProductVideo>)}
        <OrderReassurance supportPhone={supportPhone} />
        <div className="grid grid-cols-1 lg:grid-cols-3 mb-6 lg:mb-10">
          {/* Left: Product Info */}
          <WarrantyInfo productDetails={productDetails} supportPhone={supportPhone} />

          {/* Center: Tab Navigation */}
          <div
            id="product-reviews-section"
            className="relative flex justify-center gap-1 lg:gap-2 self-center order-3 lg:order-2 mt-4"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`bg-gray-100 p-1.5 relative px-3 2xl:px-5 py-2.5 text-sm lg:text-xs 2xl:text-base rounded-xl font-semibold cursor-pointer outline-none transition-colors duration-200 whitespace-nowrap
                    ${tab.id === "keyFeatures" && "hidden lg:block"}
                    ${isActive ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
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
          <div className="hidden lg:flex order-2 lg:order-3  self-start lg:self-center lg:ml-auto gap-3">
            {/* Wishlist Button - Desktop */}
            <div
              onClick={handleWishlist}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-br from-[#efb71e] to-[#c9952c] text-white cursor-pointer select-none ml-2"
            >
              <div className={wishlistAdding ? "opacity-50" : ""}>
                <Image src="/product-details/wishlist.svg" alt="Wishlist" width={32} height={32} className={`w-8 2xl:w-10 aspect-square ${wishlistAdded ? "animate-pulse" : ""}`} />
              </div>
              <span className="text-sm font-semibold">{wishlistAdding ? "..." : wishlistAdded ? "Added!" : "Wishlist"}</span>
            </div>
            <div className="hidden lg:flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl  whitespace-nowrap">
              <div className="text-indigo-600 inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">{nodeOf(pd?.avg_rating)}</span>
                <span className="text-xs font-medium text-indigo-400 font-sans">({nodeOf(pd?.total_review)} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        {/* <div
          className="mb-10 hidden lg:block"
          dangerouslySetInnerHTML={{
            __html: productDetails?.short_description,
          }}
        ></div> */}
      </div>
      {/* Content Area with Animation */}
      <div className="relative ">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0.5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.1, ease: "easeInOut" }}>
            {activeTab === "specifications" && <ProductSpecs productSpecs={pd?.specifications} />}
            {activeTab === "description" && <ProductDescription productDetails={productDetails} />}
            {activeTab === "reviews" && <ProductReview slug={pd?.slug} initialData={reviewsData} />}
            {activeTab === "keyFeatures" && <KeyFeatures productDetails={productDetails} slug={pd?.slug} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
