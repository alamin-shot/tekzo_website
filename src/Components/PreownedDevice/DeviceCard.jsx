"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PreFetchLink from "../ReuseableComponent/CustomUIComponent/PreFetchLink";
import { useRouter } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { getAuthUser } from "@/utils/getAuthUser";

// only mounts after a user opens it, and swiper only ships to routes that
// actually render this
const DeviceSidebar = dynamic(() => import("./DeviceSidebar"), {
  ssr: false,
});

const QUALITY_STYLE = {
  Excellent: "bg-teal-50 text-teal-700 border-teal-100",
  Good: "bg-blue-50 text-blue-600 border-blue-100",
  Fair: "bg-orange-50 text-secondary border-teal-100",
  Low: "bg-red-50 text-red-500 border-red-100",
};

export default function DeviceCard({ listing, from, className }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const router = useRouter();

  // If from homepage, treat is_stock as always true
  // Same out-of-stock rule as the listing modal (DeviceSidebar): a listing is
  // out of stock when is_stock is false or its stock is false / 0.
  const isOutOfStock = listing?.stock === false || listing?.stock === 0;
  const isStock = from === "homePage" ? true : Boolean(listing?.is_stock) && !isOutOfStock;

  // Extract quality level from condition (e.g., "Excellent - Pre-Owned" -> "Excellent")
  const getQualityLevel = () => {
    const conditionAttr = listing?.attributes.find(
      (a) => a.name === "Condition",
    );
    if (!conditionAttr) return null;
    const quality = conditionAttr.value.split(" - ")[0]; // Extract "Excellent" from "Excellent - Pre-Owned"
    return quality;
  };

  const qualityLevel = getQualityLevel();

  const regularPrice = Math.trunc(Number(listing?.regular_price) || 0);
  const finalPrice = Math.trunc(
    Number(listing?.final_price ?? listing?.regular_price) || 0,
  );
  const hasDiscount =
    Number(listing?.discount_amount) > 0 && !!listing?.discount_label;

  const saveToLocalCart = (quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const slug = listing?.slug || listing?.id?.toString();

    // Check if pre_owned_id already exists in cart
    const preOwnedExists = cart.some(
      (item) => item.pre_owned_id === listing?.id,
    );

    // If pre_owned_id already exists, don't add it again
    if (preOwnedExists) {
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => item.slug === slug && item.variantId === listing?.id,
    );
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      const productImage = listing?.product_image || "";
      cart.push({
        slug: slug,
        productId: listing?.product_id || 0,
        variantId: listing?.id,
        productVariantId: listing?.product_variant_id || 0,
        quantity,
        pre_owned_id: listing?.id,
        productName: listing?.product_name || "",
        productImage,
        variantPrice: listing?.final_price ?? listing?.regular_price ?? 0,
        regularPrice: listing?.regular_price ?? listing?.final_price ?? 0,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleBuyNow = async () => {
    if (buyingNow) return;
    setBuyingNow(true);

    try {
      const user = await getAuthUser();
      if (user) {
        const cartPayload = {
          variant_id: listing?.product_variant_id,
          pre_owned_id: listing?.id,
          quantity: 1,
          ...(listing?.booking_amount
            ? { booking_amount: listing.booking_amount }
            : {}),
          ...(listing?.purchase_point
            ? { purchase_point: listing.purchase_point }
            : {}),
        };
        await clientFetchAPI(`/customer/carts`, "POST", cartPayload);
      } else {
        saveToLocalCart(1);
      }
      router.push("/checkout");
    } catch (err) {
      console.error("Buy Now error:", err);
      saveToLocalCart(1);
      router.push("/checkout");
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <>
      <div
        // onClick={handleCardClick}
        className={`${className} ${from === "homePage" && "lg:rounded-4xl"} group flex flex-col overflow-hidden rounded-2xl border border-gray-100 shadow bg-white transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_12px_32px_rgba(254,118,45,0.12)]`}
      >
        {/* stock:{listing?.is_stock ? "available" : "stock out"} */}
        {/* Image Section */}
        <PreFetchLink
          prefetch={false}
          href={`/used-device/product/${listing?.slug}?preOwnedId=${listing?.id}`}
          className="relative aspect-square shrink-0 overflow-hidden group" // Added group in case you want to trigger the hover scale
        >
          {!imageLoaded && (
            <div className="skeleton absolute inset-0 rounded-none" />
          )}
          <Image
            ref={imageRef}
            src={listing?.product_image || "/placeholder.jpg"}
            alt={listing?.product_name || "Product image"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            onLoad={() => setImageLoaded(true)}
            className={`object-cover transition-all duration-300 ease-in-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />

          {listing?.is_box && (
            <div className="absolute bottom-0 left-0 z-10 rounded-tr-lg lg:rounded-tr-2xl bg-dark text-primary text-[7px] lg:text-[9px] 2xl:text-[10px] font-medium px-1.5 lg:px-2.5 py-0.5 lg:py-1 pr-2 lg:pr-4 tracking-wide uppercase">
              {listing?.is_box ? "Original Box Available" : ""}
            </div>
          )}
        </PreFetchLink>
        {/* Body Section */}
        <div className="p-2 md:p-4 flex flex-col flex-1 ">
          <h3 className="mb-2 text-lg lg:text-2xl font-semibold">
            {listing?.product_name}
          </h3>
          {/* Specs Box Container (from image idea) */}
          <div className="flex flex-col gap-2 pb-3 bg-dark p-2 lg:p-4  rounded-xl lg:rounded-2xl">
            {/* Storage */}
            {listing?.attributes.find((a) => a.name === "Storage") && (
              <div className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-gray-900">
                <span className="text-gray-700 font-semibold">Storage:</span>
                <span className="text-secondary">
                  {listing.attributes.find((a) => a.name === "Storage").value}
                </span>
              </div>
            )}
            {/* Battery Health */}
            {listing?.battery_health && (
              <div className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-gray-900">
                <span className="text-gray-700 font-semibold">
                  Battery Health:
                </span>
                <span
                  className={
                    listing?.battery_health >= 85
                      ? "text-secondary"
                      : "text-amber-600"
                  }
                >
                  {listing?.battery_health}%
                </span>
              </div>
            )}
            {/* charging cycle count */}
            {listing?.charging_time && (
              <div className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-gray-900">
                <span className="text-gray-700 font-semibold">
                  Cycle Count:
                </span>
                <span>{listing?.charging_time}</span>
              </div>
            )}

            {/* Condition / Quality Badge */}
            {qualityLevel && (
              <div className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-gray-900">
                <span className="text-gray-700 font-semibold">Condition:</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] uppercase border ${QUALITY_STYLE[qualityLevel]}`}
                >
                  {qualityLevel}
                </span>
              </div>
            )}
            {/* Remaining Attributes */}
            {listing?.attributes
              .filter((a) => a.name !== "Storage" && a.name !== "Condition")
              .map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-gray-900"
                >
                  <span className="text-gray-700 font-semibold">
                    {a?.name}:
                  </span>
                  <span className="capitalize">{a?.value}</span>
                </div>
              ))}
            {listing?.official_service_warranty && (
              <div className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-gray-900">
                <span className="text-gray-700 font-semibold">
                  Official Warranty:
                </span>
                <span>{listing?.official_service_warranty}</span>
              </div>
            )}
          </div>

          {/* Price & Stock Section */}
          <div className=" pt-3 mb-3">
            <div className="flex flex-col gap-1">
              {/* Main Price */}
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-none">
                ৳{finalPrice.toLocaleString()}
              </p>

              {/* Discount row right below price */}
              {hasDiscount && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs lg:text-sm text-gray-600 line-through font-semibold">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                  <span className="rounded bg-teal-50 text-teal-600 text-[10px] lg:text-xs font-semibold px-2 py-0.5 uppercase tracking-wide">
                    {listing.discount_label || "-22%"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons with 50/50 width split */}

          {isStock ? (
            <div className="mt-auto flex gap-2">
              <button
                onClick={handleBuyNow}
                disabled={buyingNow}
                className={`${from === "homePage" ? "rounded-full" : "rounded-lg"} flex-1 bg-primary text-white py-1.5 text-xs 2xl:text-sm whitespace-nowrap font-semibold cursor-pointer disabled:opacity-70 transition-all`}
              >
                {buyingNow ? "Processing..." : "Buy Now"}
              </button>
              <Link
                prefetch={false}
                href={`/used-device/product/${listing?.slug}?preOwnedId=${listing?.id}`}
                className={`${from === "homePage" ? "rounded-full" : "rounded-lg"}  flex-1 bg-secondary text-white py-1.5 text-xs 2xl:text-sm whitespace-nowrap cursor-pointer inline-block text-center`}
              >
                View Details
              </Link>
            </div>
          ) : (
            <button className="mt-auto bg-gray-400 text-white rounded-lg py-1.5 text-xs lg:text-sm cursor-pointer">
              Out of Stock
            </button>
          )}
        </div>
      </div>

      {/* Device Sidebar — only mount when open to avoid stacking fixed layers per card */}
      {isSidebarOpen && (
        <DeviceSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          listing={listing}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
    </>
  );
}
