"use client";

import { useEffect, useRef, useState } from "react";
import type { DeviceSidebarProps } from "@/types/props/product";
import { addJs, fieldsOf, isList, isRecord, lengthStrict, mapList, mapOpt, rec } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";

// `listing.images.length > 0` (throws without images; `>` converts to a number)
const hasImages = (listing: unknown): boolean => Number(lengthStrict(fieldsOf(listing).images)) > 0;
import { formatHtml } from "@/lib/formatHtml";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { X, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { getAuthUser } from "@/utils/getAuthUser";
import { fireCartAdded } from "@/context/CounterContext";
import ImageModal from "./ImageModal";

export default function DeviceSidebar({
  isOpen,
  onClose,
  listing,
  setIsSidebarOpen,
}: DeviceSidebarProps) {
  // `listing?.x` reads; non-optional `listing.x` reads use fieldsOf (throws for null, as before)
  const lst = rec(listing);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const quantity = 1;

  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) throw new TypeError("Cannot read properties of undefined (reading 'contains')");
      if (e.target.classList.contains("backdrop")) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const saveToLocalCart = (quantity = 1) => {
    const cart: unknown = JSON.parse(localStorage.getItem("cart") || "[]");
    // `cart.some` threw for a non-array cart; kept
    if (!isList(cart)) throw new TypeError("cart.some is not a function");
    const item0 = fieldsOf(listing);
    // `id?.toString()` (String() for a non-nullish id)
    const slug = item0.slug || (item0.id === null || item0.id === undefined ? undefined : String(item0.id));

    // Check if pre_owned_id already exists in cart
    const preOwnedExists = cart.some(
      (item) => fieldsOf(item).pre_owned_id === item0.id,
    );

    // If pre_owned_id already exists, don't add it again
    if (preOwnedExists) {
      return;
    }

    const existingIndex = cart.findIndex(
      (item) => fieldsOf(item).slug === slug && fieldsOf(item).variantId === item0.id,
    );
    if (existingIndex !== -1) {
      // `cart[i].quantity += quantity` (JS `+`); assigning on a non-object entry threw in strict mode
      const entry = cart[existingIndex];
      if (!isRecord(entry)) throw new TypeError("Cannot create property 'quantity' on a primitive cart entry");
      entry.quantity = addJs(entry.quantity, quantity);
    } else {
      cart.push({
        slug: slug,
        variantId: item0.id,
        quantity,
        pre_owned_id: item0.id,
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
        const response = await clientFetchAPI(`/customer/carts`, "POST", {
          variant_id: fieldsOf(listing).product_variant_id,
          pre_owned_id: lst?.id,
          quantity,
        });
      } else {
        saveToLocalCart(quantity);
      }
      router.push("/checkout");
    } catch (err) {
      console.error("Buy Now error:", err);
      saveToLocalCart(quantity);
      router.push("/checkout");
    } finally {
      setBuyingNow(false);
    }
  };

  const handleAddToCart = async () => {
    if (addingToCart || isAdded) return;
    setAddingToCart(true);

    try {
      const user = await getAuthUser();

      if (!user) {
        // User is not logged in - redirect to login
        router.push("/login");
        setAddingToCart(false);
        return;
      }

      // User is logged in - add to cart via API with complete product details
      const cartPayload = {
        variant_id: lst?.product_variant_id,
        quantity,
        product_id: lst?.product_id,
        product_name: lst?.product_name,
        price: lst?.regular_price || lst?.final_price,
        image: lst?.product_image,
        attributes: lst?.attributes,
      };

      const response = await clientFetchAPI(`/customer/carts`, "POST", {
        variant_id: lst?.product_variant_id,
        pre_owned_id: lst?.id,
        quantity,
      });
      setIsAdded(true);
      fireCartAdded();
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("Add to Cart Error:", err);
      // Fallback to local cart on error
      saveToLocalCart(quantity);
      setIsAdded(true);
      fireCartAdded();
      setTimeout(() => setIsAdded(false), 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (!listing) return null;

  const isOutOfStock = lst?.stock === false || lst?.stock === 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-9999 transition-all duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 backdrop ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Desktop Sidebar */}
        <div
          ref={sidebarRef}
          className={`hidden lg:flex absolute right-0 top-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-out transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } w-[30%] flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Device Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
            {/* Desktop Image Slider */}
            {lst?.images && hasImages(listing) ? (
              <div className="mb-6">
                <style>{`
                  .swiper-button-next,
                  .swiper-button-prev {
                    width: 44px;
                    height: 44px;
                    border-radius: 9999px;
                    color: #fe762d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    background-color: transparent;
                  }
                  .swiper-button-next:hover,
                  .swiper-button-prev:hover {
                    color: #e5692a;
                    transform: scale(1.1);
                  }
                  .swiper-button-next::after,
                  .swiper-button-prev::after {
                    font-size: 20px;
                  }
                `}</style>
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  className="rounded-2xl overflow-hidden bg-gray-50"
                >
                  {mapList(fieldsOf(listing).images, (img, idx) => (
                    <SwiperSlide key={idx}>
                      <div
                        className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors h-80"
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setIsImageModalOpen(true);
                        }}
                      >
                        <Image
                          src={str(rec(img)?.image || "/placeholder.jpg") ?? ""}
                          alt={`Product image ${idx + 1}`}
                          width={300}
                          height={300}
                          className="object-contain max-h-80"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div
                className="bg-gray-50 rounded-2xl p-6 mb-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors h-80"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setIsImageModalOpen(true);
                }}
              >
                <Image
                  src={str(lst?.product_image || "/placeholder.jpg") ?? ""}
                  alt={str(lst?.product_name) ?? ""}
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>
            )}

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {nodeOf(lst?.product_name)}
                  </h3>
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-primary mb-1">
                      ৳{nodeOf(lst?.regular_price)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isWishlisted
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  <Heart
                    size={20}
                    className={isWishlisted ? "fill-red-500" : ""}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {mapList(lst?.attributes, (a, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      {nodeOf(rec(a)?.name)}
                    </p>
                    <p className="text-lg font-bold text-secondary">
                      {nodeOf(rec(a)?.value)}
                    </p>
                  </div>
                ))}

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Battery Health
                  </p>
                  <p
                    className={`text-lg font-bold ${Number(lst?.battery_health) >= 85 ? "text-secondary" : Number(lst?.battery_health) >= 70 ? "text-amber-600" : "text-red-500"}`}
                  >
                    {nodeOf(lst?.battery_health)}%
                  </p>
                </div>
              </div>

              <section>
                <p className="pb-3 font-semibold text-gray-700">Description</p>
                <div
                  className="text-gray-600 leading-relaxed rendered-html"
                  dangerouslySetInnerHTML={{ __html: formatHtml(lst?.description) }}
                />
              </section>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                // Disabled if stock is explicitly false OR other loading/out-of-stock states are true
                disabled={
                  lst?.is_stock === false || isOutOfStock || buyingNow
                }
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  lst?.is_stock === false || isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : buyingNow
                      ? "bg-primary/70 text-white cursor-wait"
                      : "bg-primary text-white hover:bg-[#e5692a] active:scale-[0.98]"
                }`}
              >
                {buyingNow ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : lst?.is_stock === false || isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  "Buy Now"
                )}
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                // Disabled if stock is explicitly false OR other states are true
                disabled={
                  lst?.is_stock === false ||
                  isOutOfStock ||
                  addingToCart ||
                  isAdded
                }
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  lst?.is_stock === false ||
                  isOutOfStock ||
                  addingToCart ||
                  isAdded
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : isAdded ? (
                  "Added!"
                ) : lst?.is_stock === false || isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet */}
        <div
          className={`lg:hidden absolute bottom-0 left-0 right-0 bg-white shadow-2xl transition-transform duration-300 ease-out transform ${
            isOpen ? "translate-y-0" : "translate-y-full"
          } h-[90%] rounded-t-3xl flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900">
              Device Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
            {/* Mobile Image Slider */}
            {lst?.images && hasImages(listing) ? (
              <div className="mb-4">
                <style>{`
                  .swiper-button-next,
                  .swiper-button-prev {
                    width: 40px;
                    height: 40px;
                    border-radius: 9999px;
                    color: #fe762d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    background-color: transparent;
                  }
                  .swiper-button-next:hover,
                  .swiper-button-prev:hover {
                    color: #e5692a;
                    transform: scale(1.1);
                  }
                  .swiper-button-next::after,
                  .swiper-button-prev::after {
                    font-size: 18px;
                  }
                `}</style>
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  className="rounded-2xl overflow-hidden bg-gray-50"
                >
                  {mapList(fieldsOf(listing).images, (img, idx) => (
                    <SwiperSlide key={idx}>
                      <div
                        className="bg-gray-50 rounded-2xl p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors h-64"
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setIsImageModalOpen(true);
                        }}
                      >
                        <Image
                          src={str(rec(img)?.image || "/placeholder.jpg") ?? ""}
                          alt={`Product image ${idx + 1}`}
                          width={250}
                          height={250}
                          className="object-contain max-h-64"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div
                className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors h-64"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setIsImageModalOpen(true);
                }}
              >
                <Image
                  src={str(lst?.product_image || "/placeholder.jpg") ?? ""}
                  alt={str(lst?.product_name) ?? ""}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
            )}

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1">
                    {nodeOf(lst?.product_name)}
                  </h3>
                  <div className="mb-2">
                    <p className="text-lg sm:text-xl font-bold text-primary mb-1">
                      ৳{nodeOf(lst?.regular_price)}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {nodeOf(lst?.headline || "Original Region")}
                  </p>
                </div>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isWishlisted
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? "fill-red-500" : ""}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {mapOpt(lst?.attributes, (a, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-bold mb-1">
                      {nodeOf(rec(a)?.name)}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-secondary">
                      {nodeOf(rec(a)?.value)}
                    </p>
                  </div>
                ))}

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-bold mb-1">
                    Battery Health
                  </p>
                  <p
                    className={`text-sm sm:text-base font-bold ${Number(lst?.battery_health) >= 85 ? "text-secondary" : Number(lst?.battery_health) >= 70 ? "text-amber-600" : "text-red-500"}`}
                  >
                    {nodeOf(lst?.battery_health)}%
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Description
                </p>
                <div
                  className="text-[11px] sm:text-sm text-gray-600 leading-relaxed rendered-html"
                  dangerouslySetInnerHTML={{ __html: formatHtml(lst?.description) }}
                />
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-[10px] sm:text-sm text-gray-600">
                    Available:
                  </span>
                  <span
                    className={`text-[10px] sm:text-sm font-semibold ${isOutOfStock ? "text-red-500" : "text-green-600"}`}
                  >
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || buyingNow}
                className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : buyingNow
                      ? "bg-primary/70 text-white cursor-wait"
                      : "bg-primary text-white hover:bg-[#e5692a] active:scale-[0.98]"
                }`}
              >
                {buyingNow ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Processing...</span>
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  "Buy Now"
                )}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart || isAdded}
                className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isOutOfStock || addingToCart || isAdded
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Adding...</span>
                  </>
                ) : isAdded ? (
                  "Added!"
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={
          lst?.images && hasImages(listing)
            ? fieldsOf(listing).images
            : [{ image: lst?.product_image }]
        }
        initialIndex={selectedImageIndex}
        setIsSidebarOpen={setIsSidebarOpen}
        productTitle={lst?.product_name}
      />
    </>
  );
}
