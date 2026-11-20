"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { formatHtml } from "@/lib/formatHtml";
import Image from "next/image";
import Breadcrumbs from "@/Components/ReuseableComponent/ProductDetails/ProductBreadcrumbs";
import Banner from "../Banner";
import PricingSelector from "./PricingSelector";
import DynamicPills from "@/Components/ReuseableComponent/ProductDetails/DynamicPills";
import RelatedProducts from "./RelatedProducts";
import StickyBottomBar from "./StickyBottomBar";
import { useRouter } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import fetchPublicAPI from "@/utils/fetchPublicAPI";
import { getAuthUser } from "@/utils/getAuthUser";
import ShareDetails from "./ShareDetails";
import { fireCartAdded, fireWishlistAdded } from "@/context/CounterContext";
import TekzoCareCard from "./TekzoCare/TekzoCareCard";
import ProductRatingReviewsCards from "./ProductRatingReviewsCards";
import ProductBenefits from "./ProductBenefits";
import ShippingDetails from "./ShippingDetails";
import GiftForUser from "./Gift/GiftForUser";
import { Layers, Menu, Search } from "lucide-react";
import SidebarFunction from "@/Components/Navbar/NavFunction/SidebarFunction";
import Coupon from "./Coupon";
import PreFetchLink from "../CustomUIComponent/PreFetchLink";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import styles from "./ProductDetails.module.css";
import { useCompare } from "@/context/CompareContext";
import SearchBar from "../SearchBar";

// Utility function to extract storage capacity and convert to bytes for sorting
const getStorageInBytes = (storageString) => {
  if (!storageString) return -1;

  const match = storageString.match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
  if (!match) return -1;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case "TB":
      return value * 1024 * 1024 * 1024 * 1024;
    case "GB":
      return value * 1024 * 1024 * 1024;
    case "MB":
      return value * 1024 * 1024;
    default:
      return -1;
  }
};

// Sort variants by storage capacity (largest first) then alphabetically
const sortVariantsByStorage = (variants) => {
  return variants;
  // return [...variants].sort((a, b) => {
  //   const aStorage = getStorageInBytes(a?.attribute_value || "");
  //   const bStorage = getStorageInBytes(b?.attribute_value || "");

  //   // If both have storage, sort by storage descending
  //   if (aStorage !== -1 && bStorage !== -1) {
  //     return bStorage - aStorage;
  //   }

  //   // If only a has storage, put it first
  //   if (aStorage !== -1) return -1;

  //   // If only b has storage, put it first
  //   if (bStorage !== -1) return 1;

  //   // If neither has storage, sort alphabetically
  //   return (a?.attribute_value || "").localeCompare(b?.attribute_value || "");
  // });
};

const DEFAULT_POLICIES = [
  { name: "Privacy Policy", type: "privacy-policy" },
  { name: "Terms & Conditions", type: "terms-condition" },
  { name: "Return Policy", type: "return-policy" },
  { name: "Refund Policy", type: "refund-policy" },
  { name: "Warranty Policy", type: "warranty-policy" },
  { name: "Exchange Policy", type: "exchange-policy" },
  { name: "Delivery Policy", type: "delivery-policy" },
  { name: "Pre-Order Policy", type: "preorder-policy" },
  { name: "Emi and Payment Policy", type: "emi-policy" },
  { name: "Care Policy", type: "care-policy" },
];

const ProductTopNav = ({ companySetting, policies }) => {
  const logoSrc = companySetting?.company_logo || "/nav-logo.png";
  const companyName = companySetting?.company_name || "TEKZO";
  const policiesList = policies && policies.length > 0 ? policies : DEFAULT_POLICIES;

  return (
    <div className="lg:hidden flex items-center justify-between bg-dark rounded-xl px-3 sm:px-3.5 h-11 sm:h-12 border border-gray-200/80 mb-3 shadow-none w-full gap-2 sm:gap-4">
      {/* 1. Logo at top left */}
      <PreFetchLink prefetch={false} href="/" aria-label={`${companyName} Home`} className="flex items-center shrink-0">
        <Image src={logoSrc} alt={companyName} width={100} height={24} className="h-5 sm:h-5.5 w-auto max-w-[85px] sm:max-w-[95px] object-contain" priority />
      </PreFetchLink>

      {/* 2. Policies - Desktop only with justify-between */}
      <nav aria-label="Policies" className="hidden lg:flex flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth items-center justify-between gap-1 sm:gap-2 px-1 ml-4">
        {policiesList.map((policy, idx) => (
          <PreFetchLink
            key={policy.type || idx}
            prefetch={false}
            href={`/policy/${policy.type}`}
            className="text-xs sm:text-[13px] font-medium text-slate-700 hover:text-primary transition-colors whitespace-nowrap px-1.5 sm:px-2 py-1 rounded-lg hover:bg-black/5 shrink-0"
          >
            {policy.name}
          </PreFetchLink>
        ))}
      </nav>

      {/* 3. Menu Button - Mobile only */}
      <div className="flex lg:hidden items-center">
        <SidebarFunction companySetting={companySetting}>
          <button
            type="button"
            aria-label="Open menu"
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-gray-100 active:scale-95 transition-all text-slate-800 text-xs font-semibold cursor-pointer border border-gray-200/80 select-none shrink-0"
          >
            <Menu className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
            <span>Menu</span>
          </button>
        </SidebarFunction>
      </div>
    </div>
  );
};

const MobileProductTopNav = ProductTopNav;

export default function ProductDetails({ productDetails, relatedProductsData, reviewsData, supportPhone, companySetting, policies = [] }) {
  const [internalSetting, setInternalSetting] = useState(companySetting || null);
  const [internalPolicies, setInternalPolicies] = useState(policies?.length ? policies : null);

  useEffect(() => {
    if (!companySetting && !internalSetting) {
      fetchPublicAPI("/settings")
        .then((res) => {
          if (res?.data) setInternalSetting(res.data);
        })
        .catch(() => {});
    }
  }, [companySetting, internalSetting]);

  useEffect(() => {
    if ((!policies || !policies.length) && !internalPolicies) {
      fetchPublicAPI("/policies")
        .then((res) => {
          if (res?.data) setInternalPolicies(res.data);
        })
        .catch(() => {});
    }
  }, [policies, internalPolicies]);

  const activeCompanySetting = companySetting || internalSetting;
  const activePolicies = policies?.length ? policies : internalPolicies?.length ? internalPolicies : DEFAULT_POLICIES;
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (!productDetails?.variants?.length) return null;
    const inStock = productDetails.variants.filter((v) => v.stock === true || v.stock === 1);
    return inStock.length > 0 ? inStock[0] : productDetails.variants[0];
  });
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!productDetails?.variants?.length || !productDetails?.images) return 0;
    const inStock = productDetails.variants.filter((v) => v.stock === true || v.stock === 1);
    const defaultVariant = inStock.length > 0 ? inStock[0] : productDetails.variants[0];
    const idx = productDetails.images.findIndex((img) => img.attribute?.id === defaultVariant?.attribute?.id);
    return idx !== -1 ? idx : 0;
  });
  // Starts true so the initial (priority/LCP) image isn't hidden behind the
  // opacity-0 fade — Chrome excludes opacity:0 elements from LCP candidacy,
  // so gating the very first paint on a JS onLoad + CSS transition round
  // trip was measurably delaying LCP beyond when the image bytes actually
  // arrived. The skeleton/fade is still used for later variant switches.
  const [mainImageLoaded, setMainImageLoaded] = useState(true);
  const mainImageRef = useRef(null);
  const isFirstImageRender = useRef(true);

  // reset the skeleton whenever the shown image changes (thumbnail click, variant switch)
  useEffect(() => {
    if (isFirstImageRender.current) {
      isFirstImageRender.current = false;
      return;
    }
    setMainImageLoaded(false);
    // If the browser already has this image cached, it can finish loading
    // before React attaches the onLoad listener below, so that event never
    // fires and the skeleton gets stuck. Checking .complete here covers that.
    if (mainImageRef.current?.complete) {
      setMainImageLoaded(true);
    }
  }, [activeIndex]);
  const [selectedGiftId, setSelectedGiftId] = useState(() => productDetails?.gift_products?.[0]?.gift_id || "");
  const variantContainerDesktopRef = useRef(null);
  const variantContainerRef = useRef(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTekzoCare, setSelectedTekzoCare] = useState(null);
  const [compareAdded, setCompareAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [wishlistAdding, setWishlistAdding] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const router = useRouter();
  const { addToCompare } = useCompare();
  const [activePillTab, setActivePillTab] = useState("specifications");

  const availableVariants = useMemo(() => {
    const variants = productDetails?.variants?.filter((v) => v.stock === true || v.stock === 1) || [];
    return sortVariantsByStorage(variants);
  }, [productDetails?.variants]);

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };
  useEffect(() => {
    if (productDetails?.variants?.length > 0) {
      const inStockVariants = productDetails.variants.filter((v) => v.stock === true || v.stock === 1);

      // 2. fallback: variant
      const defaultVariant = inStockVariants.length > 0 ? inStockVariants[0] : productDetails.variants[0];

      setSelectedVariant(defaultVariant);

      // image sync
      if (productDetails?.images) {
        const matchingImgIndex = productDetails.images.findIndex((img) => img.attribute?.id === defaultVariant.attribute?.id);
        if (matchingImgIndex !== -1) setActiveIndex(matchingImgIndex);
      }
    }
  }, [productDetails]);

  useEffect(() => {
    const activeImgColorId = productDetails?.images?.[activeIndex]?.attribute?.id;
    if (!activeImgColorId) return;

    if (selectedVariant?.attribute?.id === activeImgColorId) return;

    const colorVariants = productDetails?.variants?.filter((v) => v.attribute?.id === activeImgColorId);

    if (colorVariants.length > 0) {
      const inStock = colorVariants.find((v) => v.stock === true || v.stock === 1);
      setSelectedVariant(inStock || colorVariants[0]);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (selectedVariant) setQuantity(1);
  }, [selectedVariant?.id]);

  useEffect(() => {
    const ref = variantContainerDesktopRef.current || variantContainerRef.current;
    if (selectedVariant && ref) {
      const activeElement = ref.querySelector(`[data-id="${selectedVariant.id}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedVariant]);

  useEffect(() => {
    localStorage.removeItem("userGiftData");
  }, []);

  useEffect(() => {
    if (!selectedGiftId && productDetails?.gift_products?.length > 0) {
      setSelectedGiftId(productDetails.gift_products[0]?.gift_id || "");
    }
  }, [productDetails, selectedGiftId]);

  const saveToLocalCart = (quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => item.slug === productDetails.slug && item.variantId === selectedVariant.id);

    const selectedGiftObj = selectedGiftId ? productDetails?.gift_products?.find((g) => String(g.gift_id) === String(selectedGiftId)) : null;

    const isPrebook = selectedVariant?.is_prebook || productDetails?.is_prebook;

    const cartItem = {
      slug: productDetails.slug,
      productId: productDetails.id,
      variantId: selectedVariant.id,
      quantity: quantity, // Use actual quantity for pre-booking
      // Cache product info so checkout page doesn't need to re-fetch from API
      productName: productDetails.product_name,
      productImage: selectedVariant.attribute?.image || productDetails.product_image || productDetails.images?.[0]?.image_path || "",
      variantPrice:
        selectedVariant.final_price ||
        (selectedVariant.discount_amount > 0 ? Math.max(0, (selectedVariant.regular_price || 0) - (selectedVariant.discount_amount || 0)) : selectedVariant.regular_price) ||
        0,
      regularPrice: selectedVariant.regular_price || 0,
      maxRetailPrice: productDetails.max_retail_price || productDetails.regular_price || selectedVariant.regular_price || 0,
      variantAttr: selectedVariant.attribute_value || "",
      variantSku: selectedVariant?.sku || "",
      productBrand: productDetails?.brand?.name || "",
      productCategory: productDetails?.category?.name || "",
      bookingAmount: productDetails.booking_amount || 0,
      ...(isPrebook ? { is_prebook: true } : {}),
      ...(selectedGiftId
        ? {
            giftId: String(selectedGiftId),
            // Gift product data stored in cart item — no separate localStorage key needed
            giftProductName: selectedGiftObj?.product?.product_name || "",
            giftProductImage: selectedGiftObj?.product?.product_image || "",
          }
        : {}),
      ...(selectedTekzoCare?.care_id
        ? {
            tekzoCareId: selectedTekzoCare.care_id,
            tekzoCareAmount: selectedTekzoCare.amount,
            tekzoCarePlanName: selectedTekzoCare.planName,
          }
        : {}),
    };

    if (existingIndex !== -1) {
      cart[existingIndex] = cartItem;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleBuyNow = async () => {
    if (buyingNow) return;
    setBuyingNow(true);

    try {
      const user = await getAuthUser();
      const isPrebook = selectedVariant?.is_prebook || productDetails?.is_prebook;

      if (user) {
        await clientFetchAPI(`/customer/carts`, "POST", {
          variant_id: selectedVariant.id,
          quantity: quantity, // Use actual quantity for pre-booking
          ...(isPrebook || productDetails?.booking_amount ? { booking_amount: productDetails.booking_amount || 0 } : {}),
          ...(productDetails?.purchase_point ? { purchase_point: productDetails.purchase_point } : {}),
          ...(selectedGiftId ? { gift_id: selectedGiftId } : {}),
          ...(selectedTekzoCare?.care_id ? { care_id: selectedTekzoCare.care_id } : {}),
          ...(isPrebook ? { is_prebook: true } : {}),
        });
      } else {
        // Guest: cart item includes giftId, giftProductName, giftProductImage, tekzoCare* — no separate keys needed
        saveToLocalCart(quantity);
      }

      // Only redirect to checkout if successful
      router.push("/checkout");
    } catch (err) {
      console.error("Buy Now error:", err);
      // Show error message to user
      alert(err.message || "Failed to process pre-order. Please try again or contact support.");
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
        router.push("/login");
        return;
      }

      const isPrebook = selectedVariant?.is_prebook || productDetails?.is_prebook;

      const response = await clientFetchAPI(`/customer/carts`, "POST", {
        variant_id: selectedVariant.id,
        quantity: quantity, // Use actual quantity for pre-booking
        ...(isPrebook || productDetails?.booking_amount ? { booking_amount: productDetails.booking_amount || 0 } : {}),
        ...(productDetails?.purchase_point ? { purchase_point: productDetails.purchase_point } : {}),
        ...(selectedGiftId ? { gift_id: selectedGiftId } : {}),
        ...(selectedTekzoCare?.care_id ? { care_id: selectedTekzoCare.care_id } : {}),
        ...(isPrebook ? { is_prebook: true } : {}),
      });

      // GTM Event
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "BDT",
          value: isPrebook ? productDetails.booking_amount || 0 : selectedVariant?.regular_price || 0,
          items: [
            {
              item_id: productDetails?.id,
              item_name: productDetails?.product_name,
              item_brand: productDetails?.brand?.name,
              item_category: productDetails?.category?.name,
              item_variant: selectedVariant?.sku,
              quantity: quantity,
              price: isPrebook ? productDetails.booking_amount || 0 : selectedVariant?.regular_price || 0,
            },
          ],
        },
      });

      setIsAdded(true);
      fireCartAdded();
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("Add to Cart Error:", err);
      // Show error message to user
      alert(err.message || "Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleVariantClick = (variant) => {
    setSelectedVariant(variant);
    if (productDetails?.images) {
      const matchingImgIndex = productDetails.images.findIndex((img) => img.attribute?.id === variant.attribute?.id);
      if (matchingImgIndex !== -1) setActiveIndex(matchingImgIndex);
    }
  };

  const handleAddToCompare = () => {
    addToCompare(productDetails);
    setCompareAdded(true);
    router.push("/compare");
    setTimeout(() => setCompareAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (wishlistAdding || wishlistAdded) return;
    const user = await getAuthUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!selectedVariant?.id) return;
    setWishlistAdding(true);
    try {
      await clientFetchAPI("/customer/wishlists", "POST", {
        variant_id: selectedVariant.id,
        quantity,
      });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_to_wishlist",
        ecommerce: {
          currency: "BDT",
          value: selectedVariant?.regular_price || 0,
          items: [
            {
              item_id: selectedVariant?.id,
              item_name: productDetails?.product_name,
              item_brand: productDetails?.brand?.name,
              item_category: productDetails?.category?.name,
              quantity: quantity,
              price: selectedVariant?.regular_price || 0,
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

  const currentActiveColorId = useMemo(() => productDetails?.images?.[activeIndex]?.attribute?.id, [productDetails?.images, activeIndex]);

  // Pricing & offer calculation (following PricingSelector.jsx)
  const isPreOrder = Boolean(selectedVariant?.is_prebook || productDetails?.is_prebook);
  const basePriceWithoutCare = selectedVariant?.regular_price || productDetails?.regular_price || 0;
  const baseFinalPrice = selectedVariant?.final_price || selectedVariant?.regular_price || productDetails?.final_price || productDetails?.regular_price || 0;
  const actualCareAmount = selectedTekzoCare?.care_id ? selectedTekzoCare?.amount || 0 : 0;
  const regularPrice = basePriceWithoutCare + actualCareAmount;
  const offerPrice = baseFinalPrice + actualCareAmount;
  const hasOffer = basePriceWithoutCare > 0 && basePriceWithoutCare !== baseFinalPrice && baseFinalPrice > 0;
  const hasCoupon = Boolean(productDetails?.coupon?.code);
  const hasGifts = Boolean(productDetails?.gift_products && productDetails.gift_products.length > 0);

  if (!productDetails) {
    return (
      <>
        <title>No Products Found - Tekzo</title>
        <ProductTopNav companySetting={activeCompanySetting} policies={activePolicies} />
        <Banner image={"/all-product-banner.webp"} title={"not found"} />
        <NoProductFound></NoProductFound>
      </>
    );
  }

  // if (!selectedVariant) {
  //   return <Loader />;
  // }

  return (
    <div className="">
      <ProductTopNav companySetting={activeCompanySetting} policies={activePolicies} />
      {/* <div className="lg:hidden"> 
      <SearchBar />
      </div> */}
      <div className="hidden lg:block">
      <Banner image={productDetails?.brand?.shop_banner || "/all-product-banner.webp"} title={productDetails?.brand?.name} logo={productDetails?.brand?.primary_logo} />
      </div>

      <div className="my-rounded-t   lg:bg-[#E7E9EB] mt-3 lg:mt-5">
        <div className="my-rounded  bg-[#E7E9EB] lg:bg-dark pb-4 lg:pb-0">
          <div className="bg-dark my-rounded-t p-4 lg:p-8">
            <Breadcrumbs product={productDetails} from={"productDetails"} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:pb-5">
            {/* LEFT SIDE: Product Info */}
            <div className=" bg-dark px-4 lg:px-8  space-y-3 lg:space-y-4 order-2 lg:order-1 my-rounded-b">
              <h1 className="text-3xl text-gray-800">{productDetails?.product_name}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{productDetails?.headline}</p>
              <div className="w-full mt-3 flex items-center justify-between gap-2 sm:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-[#E7E9EB] text-xs sm:text-sm font-medium text-slate-600">
                <button onClick={handleAddToCompare} className="flex gap-1 items-center px-2 sm:px-3 py-1 rounded-xl cursor-pointer">
                  <span className="font-semibold text-gray-700">{compareAdded ? "Added!" : "Compare"}</span>
                  <Image src={"/sidebar-icons/compare.png"} alt="compare icon" width={72} height={72} className="w-7 sm:w-8 2xl:w-9 h-auto" />
                </button>

                <p className="whitespace-nowrap">
                  <span className="font-semibold text-gray-700">Status:</span>{" "}
                  <span className={`font-bold ${selectedVariant?.is_prebook || productDetails?.is_prebook ? "text-blue-600" : selectedVariant?.stock ? "text-green-600" : "text-red-500"}`}>
                    {selectedVariant?.is_prebook || productDetails?.is_prebook ? "Pre-Book" : selectedVariant?.stock ? "Available" : "Out of Stock"}
                  </span>
                </p>

                <div className="flex gap-2 items-center">
                  <span className="font-semibold text-[#7B7BFF]">Brand:</span>{" "}
                  <PreFetchLink prefetch={false} href={`/brands/${productDetails?.brand?.slug}`} className="inline-block">
                    <Image src={productDetails?.brand?.primary_logo} alt="brand icon" width={128} height={96} className="w-12 sm:w-14 2xl:w-15 h-auto" />
                  </PreFetchLink>
                </div>
              </div>
              <PricingSelector
                selectedVariant={selectedVariant}
                quantity={quantity}
                setQuantity={setQuantity}
                careAmount={selectedTekzoCare?.amount || 0}
                hasCare={Boolean(selectedTekzoCare?.care_id)}
                isPreOrder={isPreOrder}
                bookingAmount={productDetails?.booking_amount || 0}
              />

              {/* Benefits Row (Purchase Points, Booking Money, EMI Details) - Moved to left side after PricingSelector */}
              <ProductBenefits productDetails={productDetails} product={selectedVariant} />
              {/* variant for small screen */}
              <div className="lg:hidden bg-black/5 z-10 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">Variants</span>
                  </div>
                  {selectedVariant?.attribute_value && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary truncate max-w-[140px]">{selectedVariant.attribute_value}</span>
                  )}
                </div>
                <div ref={variantContainerRef} className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px]">
                  {sortVariantsByStorage(availableVariants.filter((v) => v.attribute?.id === currentActiveColorId)).map((item) => {
                    const isSelected = selectedVariant?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        data-id={item.id}
                        onClick={() => handleVariantClick(item)}
                        className={`flex items-center justify-center text-center p-3 text-xs font-medium rounded-lg transition-all cursor-pointer break-all whitespace-normal overflow-hidden border border-secondary shrink-0
                    ${isSelected ? "bg-secondary" : "bg-transparent text-gray-800"}`}
                      >
                        <div className="flex gap-1 w-full">
                          {" "}
                          {/* Added w-full here to ensure inner content spreads correctly */}
                          <div className="w-[20%] p-0.5 flex bg-[#D9D9D9] rounded-md">
                            <Image src={item?.attribute?.image} alt="variant image" width={150} height={150} className="object-cover" />
                          </div>
                          <div className="w-[80%] grid grid-cols-2 gap-1 content-center">
                            {item?.attribute_values.map((i) => (
                              <span key={i.id} className="bg-[#D9D9D9] py-1 px-1.5 rounded-md break-all flex justify-center items-center">
                                <span>{i?.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount Section - Mobile only (hidden if no coupon and no gifts) */}
              {(hasCoupon || hasGifts) && (
                <div className="lg:hidden space-y-3">
                  {hasCoupon && <Coupon productDetails={productDetails} />}
                  {hasGifts && <GiftForUser productDetails={productDetails} onGiftSelect={setSelectedGiftId} />}
                </div>
              )}

              {/* Action Buttons - Desktop */}
              {selectedVariant?.stock || selectedVariant?.is_prebook || productDetails?.is_prebook ? (
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 ">
                  <button
                    onClick={handleBuyNow}
                    disabled={buyingNow}
                    className="bg-secondary text-white py-2.5 lg:py-4 2xl:py-7 rounded-[20px] font-semibold lg:font-bold transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-70"
                  >
                    {buyingNow ? "Processing..." : selectedVariant?.is_prebook || productDetails?.is_prebook ? `Pre Order (${productDetails.booking_amount || 0}৳)` : "Buy Now"}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || isAdded}
                    className=" rounded-[20px] bg-primary overflow-hidden transition-all active:translate-y-0.5 w-full group disabled:opacity-70"
                  >
                    <div className=" rounded-[20px] w-full h-full py-2.5 lg:py-4 flex justify-center items-center ">
                      <span className="font-semibold lg:font-bold text-white">{addingToCart ? "Adding..." : isAdded ? "Added!" : "Add to Bag"}</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="mb-4 hidden lg:block">
                  <button disabled className="w-full bg-gray-300 text-gray-600 py-2.5 lg:py-4 2xl:py-7 rounded-xl lg:rounded-[20px] font-bold cursor-not-allowed">
                    Out of Stock
                  </button>
                </div>
              )}

              {/* Share Details - Large screen only (after Buy Now) */}
              <div className="hidden lg:block pt-1">
                <ShareDetails selectedVariant={selectedVariant} quantity={quantity} supportPhone={supportPhone} />
              </div>
            </div>

            {/* PHOTO GALLERY FOR MOBILE*/}
            <div className="relative overflow-hidden bg-dark  flex flex-col items-center justify-center order-1 lg:order-2 ">
              {/* price bar badge */}
              <div className="absolute top-0 left-4 md:top-2 md:left-4 lg:top-4 lg:left-4 xl:top-6 xl:left-6 2xl:top-8 2xl:left-8 z-10 select-none pointer-events-none">
                <Image
                  src={"/product-details/price-tag-for-website.webp"}
                  alt="price badge"
                  width={190}
                  height={80}
                  priority={false}
                  className="w-36 sm:w-40 md:w-44 lg:w-40 xl:w-48 2xl:w-52 h-auto"
                />
                <div className="absolute left-[15%] right-[19%] top-[8%] h-[56%] flex flex-col justify-center text-white select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {isPreOrder ? (
                    <>
                      <label className="text-[8.5px] sm:text-[9px] md:text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px] text-white/85 leading-none whitespace-nowrap">Pre-Book Price:</label>
                      <span className="text-xs sm:text-[13px] md:text-sm lg:text-xs xl:text-sm 2xl:text-base font-bold text-white leading-tight whitespace-nowrap mt-0.5 tracking-tight">
                        Tk. {(productDetails?.booking_amount || 0).toLocaleString()}
                      </span>
                    </>
                  ) : hasOffer ? (
                    <>
                      <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] md:text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px] text-white/80 leading-none whitespace-nowrap">
                        <span>Regular:</span>
                        <span className="line-through text-white/65">Tk. {(basePriceWithoutCare || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-baseline gap-1 text-white leading-tight whitespace-nowrap mt-0.5">
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-amber-200">Offer:</span>
                        <span className="text-xs sm:text-[13px] md:text-sm lg:text-xs xl:text-sm 2xl:text-base font-bold text-white tracking-tight">Tk. {(baseFinalPrice || 0).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="text-[8.5px] sm:text-[9px] md:text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px] text-white/85 leading-none whitespace-nowrap">Regular Price:</label>
                      <span className="text-xs sm:text-[13px] md:text-sm lg:text-xs xl:text-sm 2xl:text-base font-bold text-white leading-tight whitespace-nowrap mt-0.5 tracking-tight">
                        Tk. {(basePriceWithoutCare || 0).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* warranty badge */}
              {productDetails?.official_warranty && (
                <Image
                  src={"/official-logoo.webp"}
                  alt="warranty logo"
                  width={120}
                  height={120}
                  className="w-25 lg:w-[100px] 2xl:w-[120px] absolute top-0 right-4 lg:top-4 lg:right-4 2xl:top-8 2xl:right-8  z-10"
                />
              )}
              {productDetails?.is_unofficial && (
                <Image
                  src={"/unofficial-iconn.webp"}
                  alt="warranty logo"
                  width={120}
                  height={120}
                  className="w-25 lg:w-[100px] 2xl:w-[120px] absolute top-0 right-4 lg:top-4 lg:right-4 2xl:top-8 2xl:right-8  z-10"
                />
              )}
              {productDetails?.is_chinese && (
                <Image
                  src={"/Chinese.svg"}
                  alt="warranty logo"
                  width={120}
                  height={120}
                  className="w-25 lg:w-[100px] 2xl:w-[120px] absolute top-0 right-4 lg:top-4 lg:right-4 2xl:top-8 2xl:right-8  z-10"
                />
              )}
              {(productDetails?.is_refurbished || productDetails?.is_Refurbished) && (
                <Image
                  src={"/Refurbish.webp"}
                  alt="warranty logo"
                  width={120}
                  height={120}
                  className="w-25 lg:w-[100px] 2xl:w-[120px] absolute top-0 right-4 lg:top-4 lg:right-4 2xl:top-8 2xl:right-8  z-10"
                />
              )}
              <div className="relative w-full aspect-square mt-4 lg:mt-0 px-6 pb-6 pt-12 md:pt-16 lg:px-6 lg:pb-4 lg:pt-20 xl:px-12 xl:pb-8 xl:pt-28 2xl:px-20 2xl:pb-12 2xl:pt-32 transition-all duration-300">
                <div className={`${styles.imageContainer} relative w-full h-full xl:p-4`}>
                  {!mainImageLoaded && <div className="skeleton absolute inset-0 rounded-none" />}
                  <Image
                    ref={mainImageRef}
                    src={productDetails?.images?.[activeIndex]?.image_path.includes("https://d2c2zgda4zwbg9.cloudfront.net/") ? productDetails?.images?.[activeIndex]?.image_path : "/placeholder.jpg"}
                    alt={productDetails.product_name}
                    width={1000}
                    height={1000}
                    priority
                    fetchPriority="high"
                    onLoad={() => setMainImageLoaded(true)}
                    className={`w-full h-full object-contain transition-opacity duration-300 ease-in-out ${mainImageLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                  <div className={styles.lightSweep}></div>
                </div>
              </div>
              <div className="w-full max-w-full mt-8 lg:mt-0 overflow-x-auto pb-4 scroll-smooth px-4">
                <div className="flex justify-center items-start gap-3 sm:gap-4 flex-nowrap w-max mx-auto pt-1">
                  {productDetails?.images?.map((item, i) => {
                    const colorName = item?.attribute?.color || item?.color || item?.attribute?.name || "";
                    const isSelected = activeIndex === i;
                    return (
                      <div key={i} onClick={() => setActiveIndex(i)} className="group flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" title={colorName}>
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl p-1.5 transition-all bg-white flex items-center justify-center border ${
                            isSelected ? "border-secondary ring-2 ring-secondary/25 shadow-xs scale-105" : "border-slate-200/90 hover:border-slate-400 shadow-2xs"
                          }`}
                        >
                          <Image
                            src={item?.image_path?.includes("https://d2c2zgda4zwbg9.cloudfront.net/") ? item.image_path : "/placeholder.jpg"}
                            alt={colorName || productDetails?.product_name || "product"}
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        {Boolean(colorName) && (
                          <span
                            className={`text-[10px] sm:text-[11px] leading-tight text-center max-w-[72px] sm:max-w-[80px] line-clamp-2 transition-colors ${
                              isSelected ? "font-bold text-secondary" : "font-medium text-slate-600 group-hover:text-slate-900"
                            }`}
                          >
                            {colorName}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: VARIANTS */}
            <div className="order-3 flex flex-col gap-3 pt-4 lg:pt-0 px-4 lg:px-8 lg:bg-dark rounded-br-[40px]">
              {/* shipping and view count */}
              <div className="hidden relative lg:flex gap-2 lg:gap-3 w-full">
                {/* Viewers Card - Took 50% width */}
                <div className="w-[50%] bg-white lg:bg-[#E7E9EB] flex px-2 2xl:px-4 py-2 2xl:py-3 gap-2 lg:gap-3 items-center rounded-xl lg:rounded-2xl">
                  <div className="w-6 lg:w-8 2xl:w-9 shrink-0 text-indigo-500">
                    <Image src={"/product-details/view-icon.svg"} alt="tuck image" width={400} height={400} className="w-full"></Image>
                  </div>
                  <span className="text-[10px] 2xl:text-xs font-semibold text-gray-700">{productDetails?.total_visit} peoples are viewing this product</span>
                </div>

                {/* Shipping Details Component - Took perfect 50% width */}
                <div className="w-[50%] ">
                  <ShippingDetails />
                </div>
              </div>
              {/* variants for desktop */}
              <div className="w-full bg-[#E7E9EB] z-10 rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-2.5 2xl:p-3 hidden lg:flex flex-col text-gray-700 lg:h-[210px] 2xl:h-[245px]">
                {/* Header: Label and Logo / Icon for Variants */}
                <div className="flex items-center justify-between gap-2.5 mb-2 lg:mb-1.5 2xl:mb-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-secondary stroke-[2.2]" />
                    </div>
                    <span className="text-xs sm:text-sm 2xl:text-base font-bold text-gray-900 tracking-tight whitespace-nowrap">Variants</span>
                  </div>

                  {selectedVariant?.attribute_value && (
                    <span className="text-[10px] 2xl:text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary truncate max-w-[140px]">{selectedVariant.attribute_value}</span>
                  )}
                </div>

                <div
                  ref={variantContainerDesktopRef}
                  className="flex-1 min-h-0 grid grid-cols-2 items-start content-start gap-1.5 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {sortVariantsByStorage(availableVariants.filter((v) => v.attribute?.id === currentActiveColorId)).map((item) => (
                    <div
                      key={item.id}
                      data-id={item.id}
                      onClick={() => handleVariantClick(item)}
                      className={`flex items-center justify-between text-center  text-[10px] font-medium p-1.5 rounded-lg  transition-all cursor-pointer break-all border border-secondary
                        ${selectedVariant?.id === item.id ? "bg-secondary " : "bg-transparent   text-gray-800 "}`}
                    >
                      {/* <span className="w-full px-1">{item?.attribute_value}</span> */}
                      <div className="flex gap-1">
                        <div className="w-12 p-0.5 flex justify-center items-center bg-[#D9D9D9] rounded-md">
                          <Image src={item?.attribute?.image} alt="variant image" width={150} height={150} className=""></Image>
                        </div>
                        <div className="flex gap-1 flex-wrap ">
                          {item?.attribute_values.map((i) => (
                            <span key={i.id} className="bg-[#D9D9D9] py-1 px-1.5 rounded-md whitespace-nowrap flex-1/3 ">
                              <span>{i?.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end whitespace-nowrap lg:hidden">
                {/* Wishlist Button - Mobile */}
                <button
                  type="button"
                  onClick={handleWishlist}
                  disabled={wishlistAdding}
                  className="ml-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#efb71e] to-[#c9952c] px-3 py-2 text-white shadow-sm transition-opacity active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className={wishlistAdding ? "opacity-50" : ""}>
                    <Image src="/product-details/wishlist.svg" alt="Wishlist icon" width={32} height={32} className={`aspect-square w-6 ${wishlistAdded ? "animate-pulse" : ""}`} />
                  </div>
                  <span className="text-sm font-semibold">{wishlistAdding ? "..." : wishlistAdded ? "Added!" : "Wishlist"}</span>
                </button>
              </div>
              {productDetails?.short_description && (
                <div className="lg:hidden text-gray-600 text-sm border border-gray-300 rounded-xl p-3 ">
                  <span className="inline-block text-xs py-2 px-3 mb-3 bg-gray-100 rounded-lg">Key Features</span>
                  <div
                    className="text-xs rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: formatHtml(productDetails?.short_description),
                    }}
                  ></div>
                </div>
              )}
              <div className="space-y-2 lg:space-y-3">
                {/* shipping and view count */}
                <div className="lg:hidden relative flex gap-2 lg:gap-3 w-full">
                  {/* Viewers Card - Took 50% width */}
                  <div className="w-[50%] bg-white lg:bg-[#E7E9EB] flex px-2 2xl:px-4 py-2 2xl:py-3 gap-2 lg:gap-3 items-center rounded-xl lg:rounded-2xl">
                    <div className="w-6 lg:w-8 2xl:w-9 shrink-0 text-indigo-500">
                      <Image src={"/product-details/view-icon.svg"} alt="tuck image" width={400} height={400} className="w-full"></Image>
                    </div>
                    <span className="text-[10px] 2xl:text-xs font-semibold text-gray-700">{productDetails?.total_visit} peoples are viewing this product</span>
                  </div>

                  {/* Shipping Details Component - Took perfect 50% width */}
                  <div className="w-[50%] ">
                    <ShippingDetails />
                  </div>
                </div>
                <TekzoCareCard careData={productDetails?.cares} selectedVariant={selectedVariant} selectedCare={selectedTekzoCare} onCareSelect={setSelectedTekzoCare}></TekzoCareCard>
                {/* Exchange and Rating Cards */}
                <ProductRatingReviewsCards productDetails={productDetails} />
                {/* buy now button - Mobile */}
                {selectedVariant?.stock || selectedVariant?.is_prebook || productDetails?.is_prebook ? (
                  <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4">
                    <button
                      onClick={handleBuyNow}
                      disabled={buyingNow}
                      className="bg-secondary text-white py-3 text-sm font-semibold transition-all active:translate-y-0.5 rounded-xl flex items-center justify-center disabled:opacity-70"
                    >
                      {buyingNow ? "Processing..." : selectedVariant?.is_prebook || productDetails?.is_prebook ? `Pre Order (${productDetails.booking_amount || 0}৳)` : "Buy Now"}
                    </button>

                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || isAdded}
                      className="relative rounded-xl bg-primary overflow-hidden transition-all active:translate-y-0.5 w-full group disabled:opacity-70 flex"
                    >
                      <div className=" rounded-[11px] w-full py-3 flex justify-center items-center relative">
                        <span className="font-semibold text-sm text-white">{addingToCart ? "Adding..." : isAdded ? "Added!" : "Add to Bag"}</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="lg:hidden">
                    <button disabled className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm cursor-not-allowed flex items-center justify-center">
                      Out of Stock
                    </button>
                  </div>
                )}

                {/* Share Details - Mobile (after Buy Now & Add to Bag) */}
                <div className="lg:hidden pt-1">
                  <ShareDetails selectedVariant={selectedVariant} quantity={quantity} supportPhone={supportPhone} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <DynamicPills productDetails={productDetails} reviewsData={reviewsData} supportPhone={supportPhone} activeTab={activePillTab} setActiveTab={setActivePillTab} />
      </div>

      <RelatedProducts relatedProductsData={relatedProductsData} />
      <div className="h-20 lg:h-24 w-full" />
      <StickyBottomBar
        productDetails={productDetails}
        companySetting={activeCompanySetting}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        addingToCart={addingToCart}
        isAdded={isAdded}
        buyingNow={buyingNow}
        selectedTekzoCare={selectedTekzoCare}
        selectedGiftId={selectedGiftId}
        onGiftSelect={setSelectedGiftId}
      />
    </div>
  );
}
