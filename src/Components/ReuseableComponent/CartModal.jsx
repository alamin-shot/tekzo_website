"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { getAuthUser } from "@/utils/getAuthUser";
import { motion, AnimatePresence } from "framer-motion";
import { fireCartAdded } from "@/context/CounterContext";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

export default function CartModal({
  isModalOpen,
  setIsModalOpen,
  name,
  currentPrice,
  image,
  slug,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantOptions, setVariantOptions] = useState([]);
  const [colors, setColors] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setIsAdded(false);
      return;
    }

    const productSlug =
      slug || (name ? name.toLowerCase().replace(/\s+/g, "-") : "");
    if (!productSlug) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/product/${productSlug}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`fetch failed`);
        const json = await res.json();
        const data = json?.data;
        if (!data) throw new Error("No product data");

        const allVariants = Array.isArray(data.variants) ? data.variants : [];
        const allImages = Array.isArray(data.images) ? data.images : [];

        // 1. Map unique colors from images
        const colorOptions = allImages
          .filter((img) => img?.attribute?.id)
          .map((img) => ({
            id: img.attribute.id,
            color: img.attribute.color,
            image: img.image_path,
          }))
          .filter(
            (value, index, self) =>
              self.findIndex((v) => v.id === value.id) === index,
          );

        // 2. Identify which colors actually have stock
        const colorsWithStock = colorOptions.filter((color) =>
          allVariants.some(
            (v) =>
              v.attribute?.id === color.id &&
              (v.stock === true || v.stock === 1),
          ),
        );

        // 3. Logic: Show available first. Use a color with stock if available, else fallback to first color.
        const initialColor = colorsWithStock[0] || colorOptions[0];
        const initialColorId = initialColor?.id || null;

        // 4. Filter variants for that specific color
        const initialVariants = allVariants.filter(
          (v) => v.attribute?.id === initialColorId,
        );

        // 5. Pick the first in-stock variant within that color, or fallback to first overall
        const firstInStock =
          initialVariants.find((v) => v.stock === true || v.stock === 1) ||
          initialVariants[0];

        if (controller.signal.aborted) return;
        setProductData(data);
        setColors(colorOptions);
        setSelectedColorId(initialColorId);
        setVariantOptions(initialVariants);
        setSelectedVariant(firstInStock);
      } catch (error) {
        // The cleanup below cancels the request when the modal closes or the
        // product changes (and React Strict Mode runs effects twice in dev) —
        // that's expected, not an error.
        if (controller.signal.aborted || error?.name === "AbortError") return;
        console.error("CartModal Error:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadProduct();
    return () => controller.abort();
  }, [isModalOpen, slug, name]);

  const handleSelectColor = (colorId) => {
    if (!productData) return;
    const variantsForColor =
      productData.variants?.filter((v) => v.attribute?.id === colorId) || [];

    // Automatically select the first in-stock variant for the new color
    const bestVariant =
      variantsForColor.find((v) => v.stock === true || v.stock === 1) ||
      variantsForColor[0];

    setSelectedColorId(colorId);
    setVariantOptions(variantsForColor);
    setSelectedVariant(bestVariant);
  };

  const handleSelectVariant = (variantId) => {
    const active = productData.variants.find(
      (v) => String(v.id) === String(variantId),
    );
    if (active) setSelectedVariant(active);
  };

  const handleQuantity = (direction) => {
    setQuantity((prev) =>
      direction === "down" ? Math.max(1, prev - 1) : prev + 1,
    );
  };

  const handleAddToCart = async () => {
    if (addingToCart || isAdded || !productData || !selectedVariant) return;
    setAddingToCart(true);
    try {
      const user = await getAuthUser();
      if (user) {
        await clientFetchAPI("/customer/carts", "POST", {
          variant_id: selectedVariant.id,
          quantity,
        });
        const gtmPayload = {
          event: "add_to_cart",
          ecommerce: {
            currency: "BDT",
            value: selectedVariant?.regular_price || 0,
            items: [
              {
                item_id: productData?.id,
                item_name: productData?.product_name,
                item_brand: productData?.brand?.name,
                item_category: productData?.category?.name,
                item_sku: selectedVariant?.sku,
                item_variant: selectedVariant?.attribute_value ? selectedVariant.attribute_value.split(',').join('/') : "",
                quantity,
                price: selectedVariant?.regular_price || 0,
              },
            ],
          },
        };
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(gtmPayload);
        setIsAdded(true);
        fireCartAdded();
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        setIsModalOpen(false);
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!productData || !selectedVariant) return;
    setAddingToCart(true);
    try {
      const user = await getAuthUser();
      if (user) {
        await clientFetchAPI("/customer/carts", "POST", {
          variant_id: selectedVariant.id,
          quantity,
        });
      } else {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingIndex = cart.findIndex(
          (item) => item.variantId === selectedVariant.id,
        );
        const offerPrice =
          selectedVariant.final_price ||
          (selectedVariant.discount_amount > 0
            ? Math.max(0, (selectedVariant.regular_price || 0) - (selectedVariant.discount_amount || 0))
            : selectedVariant.regular_price) ||
          0;
        const cartItem = {
          slug: productData.slug,
          productId: productData.id,
          variantId: selectedVariant.id,
          quantity,
          productName: productData.product_name,
          productImage:
            selectedVariant.attribute?.image ||
            productData.product_image ||
            productData.images?.[0]?.image_path ||
            "",
          variantPrice: offerPrice,
          regularPrice: selectedVariant.regular_price || 0,
          maxRetailPrice:
            productData.max_retail_price ||
            productData.regular_price ||
            selectedVariant.regular_price ||
            0,
          variantAttr: selectedVariant.attribute_value || "",
          variantSku: selectedVariant?.sku || "",
          productBrand: productData?.brand?.name || "",
          productCategory: productData?.category?.name || "",
          bookingAmount: productData.booking_amount || 0,
        };
        if (existingIndex !== -1) {
          cart[existingIndex] = { ...cart[existingIndex], ...cartItem, quantity: cart[existingIndex].quantity + quantity };
        } else {
          cart.push(cartItem);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
      }
      setIsModalOpen(false);
      router.push("/checkout");
    } catch (error) {
      setIsModalOpen(false);
      router.push("/checkout");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewProduct = () => {
    if (productData) {
      setIsModalOpen(false);
      router.push(`/product/${productData.slug}`);
    }
  };

  const selectedImage =
    productData?.images?.find((img) => img.attribute?.id === selectedColorId)
      ?.image_path || image;
  const isOutOfStock =
    !selectedVariant ||
    (selectedVariant.stock !== true && selectedVariant.stock !== 1);

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-start md:items-center justify-center p-3 md:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-[#f0f1f5] rounded-3xl md:rounded-[45px] p-4 sm:p-6 md:p-12 shadow-2xl max-h-[78vh] lg:max-h-[90vh] overflow-y-auto overscroll-contain scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 md:right-8 md:top-8 z-10 text-gray-400 hover:text-black transition-colors"
            >
              <X size={26} />
            </button>

            {loading ? (
              <div className="animate-pulse grid grid-cols-1 md:grid-cols-12 gap-6 pt-8">
                <div className="md:col-span-3 space-y-4">
                  <div className="h-56 bg-gray-300 rounded-3xl" />
                </div>
                <div className="md:col-span-6 space-y-4">
                  <div className="h-10 w-3/4 bg-gray-300 rounded" />
                  <div className="h-56 bg-gray-300 rounded-3xl" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8"
              >
                {/* Left: Action Buttons & Large Image */}
                <div className="md:col-span-3 flex flex-col items-center gap-5">
                  <div className="relative w-full h-48 sm:h-56 md:h-72 mt-6 lg:mt-0">
                    <Image
                      src={
                        selectedImage.includes(
                          "https://d2c2zgda4zwbg9.cloudfront.net/",
                        )
                          ? selectedImage
                          : "/placeholder.jpg"
                      }
                      alt={name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="w-full space-y-3 hidden lg:block">
                    <button
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className={`block w-full text-center py-3 font-bold rounded-xl ${isOutOfStock ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-secondary text-white cursor-pointer"}`}
                    >
                      {isOutOfStock ? "Out of Stock" : "Buy Now"}
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || addingToCart || isAdded}
                      className={`block w-full text-center py-3 font-bold rounded-xl transition-all ${isOutOfStock ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-primary text-white cursor-pointer"}`}
                    >
                      {addingToCart
                        ? "Adding..."
                        : isAdded
                          ? "Added Successfully!"
                          : "Add To Cart"}
                    </button>
                    <button
                      onClick={handleViewProduct}
                      className="block w-full text-center py-3 bg-white rounded-xl cursor-pointer"
                    >
                      View Product
                    </button>
                  </div>
                </div>

                {/* Center: Details & Selection */}
                <div className="md:col-span-6 space-y-4">
                  <h2 className="text-2xl md:text-4xl font-bold">
                    {productData?.product_name || name}
                  </h2>
                  <p className="text-xl md:text-2xl font-semibold">
                    ৳{" "}
                    {selectedVariant?.final_price?.toLocaleString() ||
                      currentPrice}
                  </p>
                  <p className="text-sm text-gray-500">
                    Brand: {productData?.brand?.name || "N/A"}
                  </p>

                  <div className="space-y-3 mt-2">
                    <p className="text-sm font-medium">Choose Color</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const hasStock = productData?.variants?.some(
                          (v) =>
                            v.attribute?.id === color.id &&
                            (v.stock === true || v.stock === 1),
                        );
                        return (
                          <button
                            key={color.id}
                            onClick={() => handleSelectColor(color.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer ${
                              selectedColorId === color.id
                                ? "border-orange-500 bg-white shadow-sm"
                                : hasStock
                                  ? "border-gray-300 bg-white"
                                  : "border-gray-200 bg-gray-100 opacity-60"
                            }`}
                          >
                            <Image
                              // src={color.image}
                              src={
                                color?.image.includes(
                                  "https://d2c2zgda4zwbg9.cloudfront.net/",
                                )
                                  ? color?.image
                                  : "/placeholder.jpg"
                              }
                              alt={color.color}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Choose Variant
                    </label>
                    <div className="relative">
                      <select
                        value={selectedVariant?.id || ""}
                        onChange={(e) => handleSelectVariant(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        {variantOptions.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.attribute_value} — ৳{variant.final_price}{" "}
                            {variant.stock === true || variant.stock === 1
                              ? ""
                              : "(Out of Stock)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity */}

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ">
                      Quantity
                    </label>
                    <div className="flex items-center gap-1 ">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => handleQuantity("down")}
                          disabled={isOutOfStock || quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center disabled:text-gray-300"
                        >
                          −
                        </button>
                        <div className="w-12 h-10 flex items-center justify-center font-medium">
                          {quantity}
                        </div>
                        <button
                          onClick={() => handleQuantity("up")}
                          disabled={isOutOfStock}
                          className="w-10 h-10 flex items-center justify-center disabled:text-gray-300"
                        >
                          +
                        </button>
                      </div>
                      {isOutOfStock && (
                        <span className="ml-2 text-xs font-medium text-red-500 uppercase">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Small Info */}
                <div className="md:col-span-3 hidden lg:flex lg:flex-col  lg:items-end lg:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Color Selected</p>
                    <p
                      className={`font-medium ${isOutOfStock ? "text-red-500" : "text-blue-500"}`}
                    >
                      {colors.find((c) => c.id === selectedColorId)?.color ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="relative w-16 h-20 ml-4">
                    <Image
                      src={
                        selectedImage.includes(
                          "https://d2c2zgda4zwbg9.cloudfront.net/",
                        )
                          ? selectedImage
                          : "/placeholder.jpg"
                      }
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                {/* action button for sm device */}
                <div className="w-full space-y-3 lg:hidden">
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`block w-full text-center py-3 font-bold rounded-xl ${isOutOfStock ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-secondary text-white cursor-pointer"}`}
                  >
                    {isOutOfStock ? "Out of Stock" : "Buy Now"}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart || isAdded}
                    className={`block w-full text-center py-3 font-bold rounded-xl transition-all ${isOutOfStock ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-primary text-white cursor-pointer"}`}
                  >
                    {addingToCart
                      ? "Adding..."
                      : isAdded
                        ? "Added Successfully!"
                        : "Add To Cart"}
                  </button>
                  <button
                    onClick={handleViewProduct}
                    className="block w-full text-center py-3 bg-white rounded-xl cursor-pointer"
                  >
                    View Product
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
