"use client";

import Banner from "@/Components/ReuseableComponent/Banner";
import { getAuthUser } from "@/utils/getAuthUser";
import clientFetchAPI from "@/utils/clientFetchAPI";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import AuthorizeUserAddress from "./AuthorizeUserAddress";
import { Loader2, X, Phone, PhoneCall, CircleStar, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import CheckoutTracker from "@/Components/Tracker/CheckoutTracker";
import { getSettings } from "@/lib/api";
import { fireCartRemoved } from "@/context/CounterContext";
import type { ChangeEvent, FormEvent } from "react";
import type { JsonRecord } from "@/types/json";
import type { CheckoutCartLine, CheckoutForm, CheckoutPayload, GuestCouponCartEntry, PhoneNormalizeResult, TimerHandle, TimerMap } from "@/types/props/checkout";
import { clearGuestCart, readGuestCart, toStorageItem, writeGuestCart } from "@/lib/guestCart";
import { errMessage, fieldsOf, filterList, findList, isList, itemOpt, lengthOpt, lengthStrict, mapList, mapOpt, rec, requireString } from "@/lib/json";
import { idKey, inputValue, keyFrom, nodeOf, str } from "@/lib/render";

const inputClass =
  "w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-secondary focus:bg-dark focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition-all";
const labelClass = "block text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5";

// toStorageItem (cart line → stored guest item) lives in lib/guestCart.

function normalizeApiCartItem(item: unknown): JsonRecord {
  const it = fieldsOf(item);
  const quantity = it.quantity ?? 1;
  const total = it.total ?? 0;

  // Try multiple ways to get the unit price
  let unitPrice: unknown = 0;

  if (total && quantity) {
    unitPrice = Number(total) / Number(quantity);
  } else if (it.price) {
    unitPrice = it.price;
  } else if (it.final_price) {
    unitPrice = it.final_price;
  } else if (rec(it.variant)?.final_price) {
    unitPrice = fieldsOf(it.variant).final_price;
  } else if (rec(it.variant)?.price) {
    unitPrice = fieldsOf(it.variant).price;
  } else if (rec(it.product)?.regular_price) {
    unitPrice = fieldsOf(it.product).regular_price;
  } else if (rec(it.product)?.final_price) {
    unitPrice = fieldsOf(it.product).final_price;
  } else if (rec(it.product)?.price) {
    unitPrice = fieldsOf(it.product).price;
  }

  const variantItems = isList(it.variant) ? it.variant : [];
  const attributeValue = variantItems
    .map((v) => fieldsOf(v).value)
    .filter(Boolean)
    .join(" | ");
  // API returns variant_id (not product_variant_id) as the actual product variant ID
  const variantId = rec(variantItems[0])?.variant_id;

  // `item.product || {}` (spread as-is below; read through rec())
  const productRaw = it.product || {};
  const product = rec(productRaw);
  const productImage = product?.image || product?.image_path || rec(itemOpt(product?.images, 0))?.image_path || product?.product_image || "";
  const productName = product?.product_name || product?.name || "Unknown Product";

  const giftProduct = it.giftProduct || null;
  const productCare = it.productCare || null;

  const giftFields = giftProduct
    ? {
        giftId: String(rec(giftProduct)?.id),
        giftProductName: rec(giftProduct)?.product_name || "",
        giftProductImage: rec(giftProduct)?.product_image || "",
      }
    : {};

  // productCare.value is a percentage of maxRetailPrice (e.g. "5.00" = 5%)
  const careFields = productCare
    ? {
        tekzoCareId: String(rec(productCare)?.id),
        tekzoCarePlanName: rec(productCare)?.name || "",
        tekzoCareAmount: it.maxRetailPrice ? Math.round((Number(it.maxRetailPrice) * parseFloat(String(rec(productCare)?.value || "0"))) / 100) : 0,
      }
    : {};

  // API uses camelCase — bookingAmount may come as item.bookingAmount
  const bookingAmount = it.bookingAmount || it.booking_amount || product?.booking_amount || 0;

  return {
    ...it,
    variantId,
    quantity,
    ...(it.isPreOwned ? { pre_owned_id: it.id } : {}),
    bookingAmount,
    ...giftFields,
    ...careFields,
    product: {
      ...Object.assign({}, productRaw),
      product_name: productName,
      product_image: productImage,
      booking_amount: bookingAmount,
      images: product?.images && Number(lengthStrict(product.images)) > 0 ? product.images : productImage ? [{ image_path: productImage }] : [],
    },
    variant: {
      id: variantId,
      attribute_value: attributeValue || rec(it.variant)?.attribute_value || "",
      final_price: unitPrice,
      sku: rec(variantItems[0])?.sku || rec(it.variant)?.sku || it.sku || "",
    },
  };
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [payOption, setPayOption] = useState("total");
  const [isPaymentMethodLoaded, setIsPaymentMethodLoaded] = useState(false);
  const [cartItems, setCartItems] = useState<JsonRecord[]>([]);
  const [apiBookingTotal, setApiBookingTotal] = useState(0);

  // Track if we've initialized payment method based on booking amount
  const paymentInitializedRef = useRef(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<unknown>("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Dynamic Location States
  const [districtsList, setDistrictsList] = useState<unknown>([]);
  const [areasList, setAreasList] = useState<unknown>([]);
  const [district, setDistrict] = useState<unknown>(""); // ID
  const [area, setArea] = useState<unknown>(""); // ID
  const [districtSearch, setDistrictSearch] = useState<unknown>(""); // Text
  const [areaSearch, setAreaSearch] = useState<unknown>(""); // Text
  const [showDistList, setShowDistList] = useState(false);
  const [showAreaList, setShowAreaList] = useState(false);
  const [isAreasLoading, setIsAreasLoading] = useState(false);

  const distRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const [agreed, setAgreed] = useState(true);
  const [errors, setErrors] = useState<unknown[]>([]);
  const [emailError, setEmailError] = useState("");
  const [bannerImage, setBannerImage] = useState<unknown>("/loginPage/contact-about-bg.webp");
  const [companySetting, setCompanySetting] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<unknown>(null);
  const [user, setUser] = useState<unknown>(null);
  const [selectedAddr, setSelectedAddr] = useState<unknown>("");
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<unknown>("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  // True from the first frame of a Place Order click until the request
  // settles: disables the button (no double orders) and shows progress.
  const [placingOrder, setPlacingOrder] = useState(false);
  const [couponError, setCouponError] = useState<unknown>("");
  const [note, setNote] = useState("");

  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    phone: "",
    fullName: "",
    street: "",
    secondaryPhone: "",
    newsletter: false,
    thana: "",
    postcode: "",
  });

  const router = useRouter();

  useEffect(() => {
    let timer: TimerHandle | undefined;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__CHECKOUT_BANNER__) {
      setBannerImage(window.__CHECKOUT_BANNER__);
    }
    if (typeof window !== "undefined" && window.__COMPANY_SETTING__) {
      setCompanySetting(window.__COMPANY_SETTING__);
    }
    getSettings()
      .then((data) => {
        if (data) setCompanySetting(data);
      })
      .catch((err) => console.error("Error loading company settings:", err));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Clean up stale keys from older sessions
    ["userGiftData", "checkoutGiftId", "checkoutGiftProductName", "checkoutGiftProductImage", "checkoutTekzoCareId", "checkoutTekzoCareAmount", "checkoutTekzoCarePlanName"].forEach((k) =>
      localStorage.removeItem(k),
    );
  }, []);

  // Restore guest coupon on page reload
  useEffect(() => {
    if (typeof window === "undefined" || user) return;
    const savedCode = localStorage.getItem("guestCouponCode");
    if (savedCode) {
      setCouponCode(savedCode);
      setCouponApplied(true);
      const savedDiscount = localStorage.getItem("guestCouponDiscount");
      if (savedDiscount) setDiscount(Number(savedDiscount) || 0);
    }
  }, [user]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Mouse targets are DOM nodes; `contains(null)` is false.
      const target = e.target instanceof Node ? e.target : null;
      if (distRef.current && !distRef.current.contains(target)) setShowDistList(false);
      if (areaRef.current && !areaRef.current.contains(target)) setShowAreaList(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // 1. Fetch Districts
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/districts`)
      .then((res) => res.json())
      .then((result: unknown) => setDistrictsList(fieldsOf(result).data || []))
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch Areas when district ID changes
  useEffect(() => {
    if (!district) {
      setAreasList([]);
      return;
    }
    const fetchAreas = async () => {
      setIsAreasLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas/${String(district)}`);
        const result: unknown = await res.json();
        setAreasList(fieldsOf(result).data || []);
      } finally {
        setIsAreasLoading(false);
      }
    };
    fetchAreas();
  }, [district]);

  const handleDistrictSelect = (d: unknown) => {
    setDistrict(fieldsOf(d).id);
    setDistrictSearch(fieldsOf(d).name);
    setShowDistList(false);
    // Reset area
    setArea("");
    setAreaSearch("");
    setForm((prev) => ({ ...prev, thana: "", postcode: "" }));
  };

  const handleAreaSelect = (a: unknown) => {
    setArea(fieldsOf(a).id);
    setAreaSearch(fieldsOf(a).name);
    setShowAreaList(false);
    // Auto-fill according to your API image
    setForm((prev) => ({
      ...prev,
      thana: fieldsOf(a).thana || "",
      postcode: fieldsOf(a).postcode || "",
    }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Calculate booking total dynamically based on current cart quantities
  const bookingTotal = cartItems.reduce((sum, item) => sum + Number(item.bookingAmount || rec(item.product)?.booking_amount || 0) * Number(item.quantity), 0);

  // COD disabled when booking amount only is selected
  const payTabs = [
    {
      id: "cod",
      label: "Cash on Delivery",
      disabled: bookingTotal > 0 ? true : payOption === "booking",
    },
    { id: "online", label: "SSL COMMERZ", image: "/ssl-commarz-icon.png" },
    { id: "bkash", label: "bKash", image: "/ecommerce-brand-logo/bkash.svg" },
    {
      id: "emi",
      label: "EMI",
      image: "/emi.svg",
      disabled: true,
      hidden: bookingTotal > 0,
    },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (name === "email") {
      const trimmedEmail = value.trim();
      if (!trimmedEmail) {
        setEmailError("Email is required.");
      } else if (!validateEmail(trimmedEmail)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }

    if (errors.length > 0) setErrors([]);
  };

  const handlePayOption = (option: string) => {
    setPayOption(option);
    if (option === "booking" && paymentMethod === "cod") {
      setPaymentMethod("online");
    }
  };

  const handleApplyCoupon = async () => {
    if (!requireString(couponCode).trim()) return;
    if (!user) {
      setCouponLoading(true);
      setCouponError("");
      try {
        const guestCarts = cartItems.map((item) => {
          const cartEntry: GuestCouponCartEntry = {
            product_id: item.productId || item.product_id || rec(item.variant)?.product_id,
            product_variant_id: item.productVariantId || item.product_variant_id || rec(item.variant)?.id || item.variantId,
            quantity: Number(item.quantity) || 1,
          };
          if (item.pre_owned_id) cartEntry.pre_owned_id = item.pre_owned_id;
          return cartEntry;
        });
        const res = await clientFetchAPI("/customer/gust-check-coupon", "POST", {
          coupon_code: requireString(couponCode).trim(),
          carts: guestCarts,
        });
        const discountAmount = Number(rec(rec(res)?.data)?.discount_amount || 0);
        setDiscount(discountAmount);
        setCouponApplied(true);
        localStorage.setItem("guestCouponCode", requireString(couponCode).trim());
        localStorage.setItem("guestCouponDiscount", String(discountAmount));
      } catch (err) {
        setCouponError(errMessage(err) || "Invalid coupon code.");
        setCouponApplied(false);
        setDiscount(0);
      } finally {
        setCouponLoading(false);
      }
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await clientFetchAPI("/customer/apply-coupon", "POST", {
        code: requireString(couponCode).trim(),
      });
      setDiscount(Number(rec(rec(res)?.data)?.discount_amount || 0));
      setCouponApplied(true);
    } catch (err) {
      setCouponError(errMessage(err) || "Invalid coupon code.");
      setCouponApplied(false);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponError("");
    setDiscount(0);
    localStorage.removeItem("guestCouponCode");
    localStorage.removeItem("guestCouponDiscount");
    if (user) {
      try {
        await clientFetchAPI("/customer/remove-coupon", "DELETE", {});
      } catch (_) {}
    }
  };

  // Auto-activate booking option when cart has booking amount
  useEffect(() => {
    const total = apiBookingTotal || cartItems.reduce((sum, item) => sum + Number(item.bookingAmount || rec(item.product)?.booking_amount || 0) * Number(item.quantity), 0);

    // Only initialize payment method once, when data loads
    if (!paymentInitializedRef.current && !loading) {
      if (total > 0) {
        setPayOption("booking");
        // Set payment method to online immediately (no flash)
        setPaymentMethod("online");
      }
      paymentInitializedRef.current = true;
      setIsPaymentMethodLoaded(true);
    } else if (!loading) {
      // Data loaded but we already initialized
      setIsPaymentMethodLoaded(true);
    }
  }, [cartItems, apiBookingTotal, loading]);

  const loadCartData = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getAuthUser();
      setUser(u);
      if (u) {
        const response = await clientFetchAPI("/customer/carts", "GET");
        const responseData = rec(rec(response)?.data);
        setCartItems(mapList(responseData?.cartItems || [], normalizeApiCartItem));
        setApiBookingTotal(Number(responseData?.totalBookingAmount) || 0);
        // Always sync coupon state from API — clears it if backend invalidated it
        if (responseData?.couponCode) {
          setCouponCode(responseData.couponCode);
          setCouponApplied(true);
          setDiscount(Number(responseData.couponDiscount) || 0);
        } else {
          setCouponCode("");
          setCouponApplied(false);
          setDiscount(0);
        }
        return;
      }
      const cart = readGuestCart();
      const items = await Promise.all(
        mapList(cart, async (entry): Promise<JsonRecord | null> => {
          // a null entry threw on `item.pre_owned_id`, as fieldsOf() does
          const item = fieldsOf(entry);
          // Use cached product data when available (set by ProductDetails saveToLocalCart)
          // Skip fast path for pre-owned items without a valid product_id (old localStorage format)
          // so they fall through to the API fetch and get correct product_id / product_variant_id.
          const hasValidPreOwnedIds = !item.pre_owned_id || (item.productId && item.productVariantId);
          if (item.productName && item.variantPrice !== undefined && hasValidPreOwnedIds) {
            return {
              ...item,
              // Expose for coupon validation (handleApplyCoupon uses item.product_id)
              product_id: item.productId || 0,
              product_variant_id: item.productVariantId || 0,
              product: {
                product_name: item.productName,
                product_image: item.productImage || "",
                final_price: item.variantPrice,
                regular_price: item.regularPrice || item.variantPrice,
                booking_amount: item.bookingAmount || 0,
                images: item.productImage ? [{ image_path: item.productImage }] : [],
                brand: { name: item.productBrand || "" },
                category: { name: item.productCategory || "" },
              },
              variant: {
                // For pre-owned: use product_variant_id (not the pre-owned id)
                id: item.productVariantId || item.variantId,
                attribute_value: item.variantAttr || "",
                final_price: item.variantPrice,
                sku: item.variantSku || "",
              },
            };
          }

          // Fallback: fetch from API (for older cart items without cached data)
          try {
            let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pre-owneds/${String(item.slug)}/products`);
            if (res.ok) {
              const result: unknown = await res.json();
              const preOwneds = rec(fieldsOf(result).data)?.preOwneds;
              if (isList(preOwneds)) {
                const product = rec(preOwneds.find((p) => String(fieldsOf(p).id) === String(item.variantId)));
                if (product) {
                  return {
                    ...item,
                    id: product.id,
                    slug: product.slug,
                    product_id: product.product_id,
                    product_variant_id: product.product_variant_id,
                    price: product.regular_price || product.final_price,
                    product: {
                      product_name: product.product_name,
                      regular_price: product.regular_price,
                      final_price: product.final_price,
                      product_image: product.product_image,
                      images:
                        Number(lengthOpt(product.images)) > 0
                          ? mapList(product.images, (img) => ({
                              image_path: fieldsOf(img).image || fieldsOf(img).image_path,
                            }))
                          : product.product_image
                            ? [{ image_path: product.product_image }]
                            : [],
                      booking_amount: 0,
                    },
                    variant: {
                      id: product.product_variant_id,
                      product_id: product.product_id,
                      attribute_value: mapOpt(product.attributes, (a) => fieldsOf(a).value)?.join(" | ") || "",
                      final_price: product.regular_price || product.final_price || 0,
                    },
                  };
                }
              }
            }

            res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${String(item.slug)}`);
            if (!res.ok) return null;

            const result: unknown = await res.json();
            const variants = rec(fieldsOf(result).data)?.variants;
            return {
              ...item,
              product: fieldsOf(result).data,
              variant: variants === null || variants === undefined ? undefined : findList(variants, (v) => String(fieldsOf(v).id) === String(item.variantId)),
            };
          } catch (error) {
            console.error(`Error fetching product ${String(item.slug)}:`, error);
            return null;
          }
        }),
      );
      setCartItems(items.filter((x): x is JsonRecord => Boolean(x)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  const handleDeleteItem = async (variantId: unknown) => {
    // Just mark as deleting, DON'T update cartItems yet
    setIsDeleting(true);
    setDeletingId(variantId);

    try {
      const itemToDelete = cartItems.find((i) => String(i.variantId) === String(variantId));

      if (!user) {
        // Guest user - update localStorage, preserve all fields including gift/care
        const updatedCart = cartItems.filter((item) => String(item.variantId) !== String(variantId));
        writeGuestCart(updatedCart.map(toStorageItem));
        fireCartRemoved();

        // Re-validate coupon against the updated cart
        if (couponApplied && requireString(couponCode).trim() && updatedCart.length > 0) {
          try {
            const guestCarts = updatedCart.map((item) => {
              const cartEntry: GuestCouponCartEntry = {
                product_id: item.productId || item.product_id,
                product_variant_id: item.productVariantId || item.product_variant_id || item.variantId,
                quantity: Number(item.quantity) || 1,
              };
              if (item.pre_owned_id) cartEntry.pre_owned_id = item.pre_owned_id;
              return cartEntry;
            });
            const res = await clientFetchAPI("/customer/gust-check-coupon", "POST", {
              coupon_code: requireString(couponCode).trim(),
              carts: guestCarts,
            });
            const newDiscount = Number(rec(rec(res)?.data)?.discount_amount || 0);
            setDiscount(newDiscount);
            localStorage.setItem("guestCouponDiscount", String(newDiscount));
          } catch {
            // Coupon no longer valid for updated cart — remove it
            setCouponCode("");
            setCouponApplied(false);
            setDiscount(0);
            localStorage.removeItem("guestCouponCode");
            localStorage.removeItem("guestCouponDiscount");
          }
        } else if (updatedCart.length === 0) {
          setCouponCode("");
          setCouponApplied(false);
          setDiscount(0);
          localStorage.removeItem("guestCouponCode");
          localStorage.removeItem("guestCouponDiscount");
        }
      } else {
        // Logged in user - call API
        if (itemToDelete?.id) {
          await clientFetchAPI(`/customer/carts/${String(itemToDelete.id)}`, "DELETE");
        }
        fireCartRemoved();
        // If a coupon was applied, remove it since the cart changed
        if (couponApplied) {
          try {
            await clientFetchAPI("/customer/remove-coupon", "DELETE", {});
          } catch (_) {}
          setCouponCode("");
          setCouponApplied(false);
          setDiscount(0);
        }
      }

      // Success - reload the cart data from source
      await loadCartData();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Quantity change handlers (supports guest localStorage and logged-in API)
  const qtyTimers = useRef<TimerMap>({});

  const handleChangeQty = (variantId: unknown, delta: number) => {
    const target = cartItems.find((i) => String(i.variantId) === String(variantId));
    if (!target) return;
    // If pre-owned product, quantity must remain 1
    if (target.pre_owned_id) return;

    // Compute new quantity (min 1, cap 10)
    const newQty = Math.max(1, Math.min(10, Number(target.quantity || 1) + delta));

    // Optimistic UI update
    setCartItems((prev) => prev.map((i) => (String(i.variantId) === String(variantId) ? { ...i, quantity: newQty } : i)));

    // Persist change
    if (!user) {
      // update localStorage for guest, preserve all fields including gift/care
      const updatedCart = cartItems.map((i) => (String(i.variantId) === String(variantId) ? { ...i, quantity: newQty } : i)).map(toStorageItem);
      writeGuestCart(updatedCart);
      return;
    }

    // For logged-in user, debounce API patch
    clearTimeout(qtyTimers.current[String(variantId)]);
    qtyTimers.current[String(variantId)] = setTimeout(async () => {
      try {
        // Find the cart item id (server-side id)
        const item = cartItems.find((i) => String(i.variantId) === String(variantId));
        const cartItemId = item?.id;
        if (!cartItemId) return;
        await clientFetchAPI(`/customer/carts/${String(cartItemId)}`, "PATCH", {
          quantity: newQty,
        });
      } catch (err) {
        console.error("Failed to update quantity:", err);
      }
    }, 400);
  };

  const normalizePhoneNumber = (rawPhone: string): PhoneNormalizeResult => {
    const digits = rawPhone.toString().replace(/\D/g, "");

    if (digits.length === 11) {
      return { normalized: digits };
    }

    if (digits.length === 13 && digits.startsWith("88")) {
      return { normalized: digits.slice(-11) };
    }

    if (digits.length > 13 && digits.startsWith("88")) {
      return {
        error: "Phone number cannot be longer than +88 plus 11 digits.",
      };
    }

    return {
      error: "Phone number must be 11 digits or +88 followed by 11 digits.",
    };
  };

  const handleSendOtp = async () => {
    if (user) return; // only for unauthorised users
    if (otpCountdown > 0) return;

    const { normalized, error } = normalizePhoneNumber(form.phone);
    if (error) {
      setOtpError(error);
      return;
    }

    const phone_number = normalized ?? "";

    setForm((prev) => ({ ...prev, phone: phone_number }));
    setOtpError("");
    setIsSendingOtp(true);

    try {
      await clientFetchAPI("/customer/gust-phone-verify-request", "POST", {
        phone_number,
      });
      setOtpSent(true);
      setOtpCountdown(60);
    } catch (error) {
      setOtpError(errMessage(error) || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) {
      setOtpError("Please enter the OTP code.");
      return;
    }

    const { normalized, error } = normalizePhoneNumber(form.phone);
    if (error) {
      setOtpError(error);
      return;
    }

    try {
      setOtpError("");
      await clientFetchAPI("/customer/gust-phone-verify", "POST", {
        phone_number: normalized,
        code: otpInput.trim(),
      });
      setOtpVerified(true);
      setOtpCountdown(0);
      setOtpError("");
    } catch (error) {
      setOtpError(errMessage(error) || "Failed to verify OTP.");
    }
  };

  const buildCheckoutPayload = () => {
    const payload: CheckoutPayload = {
      payment_method: paymentMethod,
      district_id: district,
      area_id: area,
      email: form.email,
      phone: form.phone,
      full_name: form.fullName,
      address: form.street,
      is_agree: agreed ? 1 : 0,
    };

    if (requireString(couponCode).trim()) {
      payload.coupon_code = requireString(couponCode).trim();
    }

    if (note && String(note).trim()) {
      payload.note = String(note).trim();
    }

    payload.booking_amount_only = payOption === "booking" && bookingTotal > 0 ? 1 : 0;

    // carts.* — backend validates: product_id, product_variant_id, pre_owned_id, quantity, care_id, gift_id
    payload.carts = cartItems.map((item) => {
      const cartItem: CheckoutCartLine = {
        product_id: item.product_id || item.productId || rec(item.variant)?.product_id,
        product_variant_id: rec(item.variant)?.id || item.variantId,
        quantity: item.pre_owned_id ? 1 : Math.min(10, Number(item.quantity) || 1),
      };

      if (item.pre_owned_id) {
        cartItem.pre_owned_id = item.pre_owned_id;
      }

      // Guest: giftId is stored in cart item
      // Logged-in: gift_id comes from server cart item (via API response) or state fallback
      const itemGiftId = item.giftId || item.gift_id || null;
      if (itemGiftId) cartItem.gift_id = itemGiftId;

      // Guest: tekzoCareId is stored in cart item
      // Logged-in: care_id comes from server cart item or state fallback
      const itemCareId = item.tekzoCareId || item.care_id || null;
      if (itemCareId) cartItem.care_id = itemCareId;

      return cartItem;
    });

    if (user && rec(selectedAddr)?.id) {
      payload.shipping_address_id = fieldsOf(selectedAddr).id;
    }

    return payload;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0 || !agreed) return;

    // Address validation
    const validationErrors: string[] = [];
    if (user) {
      if (!rec(selectedAddr)?.id) {
        validationErrors.push("Please select a delivery address before placing your order.");
      }
    } else {
      if (!form.email.trim()) {
        validationErrors.push("Email is required.");
      } else if (!validateEmail(form.email)) {
        validationErrors.push("Please enter a valid email address.");
        setEmailError("Please enter a valid email address.");
      }
      if (!form.fullName.trim()) validationErrors.push("Full name is required.");
      if (!district) validationErrors.push("Please select a district.");
      if (!area) validationErrors.push("Please select an area.");
      if (!form.street.trim()) validationErrors.push("Street address is required.");
    }

    // Validate pre_owned items - quantity must be 1
    const preOwnedWithInvalidQty = cartItems.filter((item) => item.pre_owned_id && Number(item.quantity) > 1);
    if (preOwnedWithInvalidQty.length > 0) {
      validationErrors.push("Pre-owned items can only have a quantity of 1. Please adjust the quantity in your cart.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (placingOrder) return;
    setPlacingOrder(true);
    let redirecting = false;
    try {
      const payload = buildCheckoutPayload();
      const endpoint = user ? "/customer/checkouts" : "/customer/gust-buy-now";

      const response = await clientFetchAPI(endpoint, "POST", payload);

      if (!user) {
        clearGuestCart();
        localStorage.removeItem("guestCouponCode");
        localStorage.removeItem("guestCouponDiscount");
        setCartItems([]);
      }
      if (payload.payment_method === "online" || payload.payment_method === "bkash") {
        window.location.href = String(rec(response)?.url);
      } else {
        const invoiceNumber = rec(rec(response)?.data)?.invoice_number;
        router.push(`/order/successful?invoice=${encodeURIComponent(String(invoiceNumber))}`);
      }
      // Keep the button locked while the browser leaves for the payment
      // gateway / success page, so it can't be tapped again meanwhile.
      redirecting = true;
    } catch (error) {
      setErrors([errMessage(error) || "Failed to place order."]);
    } finally {
      if (!redirecting) setPlacingOrder(false);
    }
  };

  // Always use offer/final price for product subtotal; care is a separate add-on
  const subtotal = cartItems.reduce((sum, item) => sum + Number(rec(item.variant)?.final_price || 0) * Number(item.quantity), 0);

  const careTotalFromItems = cartItems.reduce((sum, item) => {
    const amt = Number(item.tekzoCareAmount ?? item.tekzo_care_amount ?? 0);
    const qty = Number(item.quantity || 1);
    return sum + amt * qty;
  }, 0);

  const careTotal = cartItems.length > 0 ? careTotalFromItems : 0;

  // Logged-in customers pick a saved address (its own shipping_charge comes
  // pre-resolved from /customer/addresses); guests pick district/area directly.
  const shippingCharge = user ? Number(rec(selectedAddr)?.shipping_charge) || 0 : Number(rec(findList(areasList, (a) => fieldsOf(a).id === area))?.shipping_charge) || 0;

  const totalAmount = subtotal + careTotal + shippingCharge - discount;
  const isGuestEmailValid = user || (form.email.trim() && validateEmail(form.email));

  const supportPhone = rec(companySetting)?.primary_phone_number || rec(companySetting)?.phone || rec(companySetting)?.secondary_phone_number || "+8801897-715222";
  const cleanPhone = supportPhone ? requireString(supportPhone).replace(/[^0-9+]/g, "") : "";

  return (
    <div className="">
      <CheckoutTracker cartItems={cartItems} />

      <Banner h1="Checkout" image={bannerImage} title={"checkout"} />

      <div className="max-w-7xl mx-auto mt-6 lg:mt-10 ">
        {loading && cartItems.length === 0 ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-secondary" size={36} />
            <span className="text-sm text-gray-500 font-medium">Loading checkout...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-6 my-8 bg-gray-50/70 rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-5 text-secondary">
              <ShoppingBag size={40} className="stroke-[1.5]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Product Added to Checkout</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mb-8">Your checkout is currently empty. Explore our shop and add your desired products to proceed with your order.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-secondary text-white font-semibold text-base rounded-xl shadow-md shadow-secondary/20 hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>Shop Now</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl mb-6 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                    <PhoneCall size={20} className="text-secondary" />
                  </div>
                  <p className="text-gray-800 text-sm sm:text-base font-medium">অর্ডার সংক্রান্ত যেকোনো প্রয়োজনে কথা বলুন আমাদের কাস্টমার সার্ভিস প্রতিনিধির সাথে।</p>
                </div>
                {nodeOf(supportPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-semibold text-sm rounded-xl shadow-md hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Phone size={16} />
                    <span>{nodeOf(supportPhone)}</span>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                  <CircleStar size={20} className="text-secondary" />
                </div>
                <p className="text-gray-800 text-sm sm:text-base font-medium">সফল অর্ডারের প্রসেসিং ও কুরিয়ার সুরক্ষার জন্য ন্যূনতম বুকিং মানি প্রযোজ্য।</p>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                {errors.map((err, i) => (
                  <p key={i} className="text-red-600 text-sm font-medium">
                    • {nodeOf(err)}
                  </p>
                ))}
              </div>
            )}
            {!user && !loading && (
              <p className="mb-4 text-sm text-gray-500">
                Checking out as a guest. <Link href="/login?redirect=/checkout" className="text-secondary font-semibold underline">Log in for saved addresses</Link>
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-8 pb-20">
                <div className={`lg:flex-7 space-y-6 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
                  {/* Payment */}
                  <div className="bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm">
                    <p className={labelClass}>Payment Method</p>
                    {!isPaymentMethodLoaded ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="animate-spin text-secondary mr-3" size={20} />
                        <span className="text-sm text-gray-600">Loading payment methods...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5 ">
                        {payTabs
                          .filter((tab) => !tab.hidden)
                          .map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              disabled={tab.disabled}
                              onClick={() => setPaymentMethod(tab.id)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                tab.disabled
                                  ? "opacity-30 cursor-not-allowed"
                                  : paymentMethod === tab.id
                                    ? "bg-secondary border-secondary text-white shadow-md shadow-secondary/20"
                                    : "bg-dark border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              {tab.image && <Image src={tab.image} alt={tab.label || "icon"} width={400} height={200} className={`h-auto ${tab.id === "online" ? "w-5" : "w-10 "}`} />}

                              {(!tab.image || tab.id === "online") && <span>{tab.label}</span>}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Option — only shown when product has booking amount */}
                  {bookingTotal > 0 && (
                    <div className="bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm">
                      <p className={labelClass}>Payment Option</p>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          {
                            id: "booking",
                            label: `Pay Booking Amount Only (৳${bookingTotal.toLocaleString()})`,
                          },
                          {
                            id: "total",
                            label: `Pay Full Amount (৳${totalAmount.toLocaleString()})`,
                          },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handlePayOption(opt.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                              payOption === opt.id ? "bg-secondary border-secondary text-white shadow-md shadow-secondary/20" : "bg-dark border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {user ? (
                    <AuthorizeUserAddress
                      onAddressSelect={(addr: unknown) => {
                        setSelectedAddr(addr);
                        if (errors.length > 0) setErrors([]);
                      }}
                    />
                  ) : (
                    <>
                      <div className="bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm">
                        <p className={labelClass}>Contact</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className={labelClass}>Email</label>
                            <input
                              type="email"
                              name="email"
                              placeholder="Enter Your Email"
                              value={form.email}
                              onChange={handleChange}
                              className={inputClass + (emailError ? " border-red-500 ring-1 ring-red-200" : "")}
                            />
                            {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
                          </div>
                          <div>
                            <label className={labelClass}>Phone *</label>
                            <div className="flex gap-2">
                              <input
                                type="tel"
                                name="phone"
                                placeholder="11 Digits Phone No"
                                value={form.phone}
                                onChange={handleChange}
                                disabled={otpVerified}
                                className={inputClass + (otpVerified ? " opacity-60" : "")}
                              />
                              {otpVerified ? (
                                <div className="px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold flex items-center whitespace-nowrap">✓ Verified</div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={otpCountdown > 0 || isSendingOtp}
                                  className={`px-4 py-2.5 rounded-xl text-white text-sm font-semibold whitespace-nowrap ${otpCountdown > 0 || isSendingOtp ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-black"}`}
                                >
                                  {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : otpSent ? "Resend OTP" : "Send OTP"}
                                </button>
                              )}
                            </div>
                            {nodeOf(otpError && <p className="mt-2 text-sm text-red-500">{nodeOf(otpError)}</p>)}
                            {otpSent && !otpVerified && (
                              <div className="mt-2 flex gap-2">
                                <input type="text" placeholder="Ex. 123456" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className={inputClass} />
                                <button type="button" onClick={handleVerifyOtp} className="px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold">
                                  Verify
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm ${!otpVerified ? "opacity-50 pointer-events-none" : ""}`}>
                        <p className={labelClass}>Delivery</p>

                        <div className="mb-4">
                          <label className={labelClass}>Full Name *</label>
                          <input type="text" name="fullName" placeholder="Enter Your Full Name" value={form.fullName} onChange={handleChange} className={inputClass} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="relative" ref={distRef}>
                            <label className={labelClass}>District *</label>
                            <input
                              type="text"
                              placeholder="Search District..."
                              value={inputValue(districtSearch)}
                              onFocus={() => setShowDistList(true)}
                              onChange={(e) => {
                                setDistrictSearch(e.target.value);
                                setShowDistList(true);
                              }}
                              className={inputClass}
                            />
                            {showDistList && (
                              <div className="absolute z-50 w-full mt-1 bg-dark border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filterList(districtsList, (d) => requireString(fieldsOf(d).name).toLowerCase().includes(requireString(districtSearch).toLowerCase()))
                                  .map((d) => (
                                    <div key={idKey(d)} onClick={() => handleDistrictSelect(d)} className="px-4 py-3 hover:bg-secondary/10 cursor-pointer text-sm">
                                      {nodeOf(fieldsOf(d).name)}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div className="relative" ref={areaRef}>
                            <label className={labelClass}>Upazila / Area *</label>
                            <input
                              type="text"
                              placeholder={district ? "Search Area..." : "Select district first"}
                              value={inputValue(areaSearch)}
                              disabled={!district || isAreasLoading}
                              onFocus={() => setShowAreaList(true)}
                              onChange={(e) => {
                                setAreaSearch(e.target.value);
                                setShowAreaList(true);
                              }}
                              className={inputClass + " disabled:opacity-50"}
                            />
                            {isAreasLoading && <Loader2 size={14} className="absolute right-4 top-10 animate-spin text-secondary" />}
                            {showAreaList && (
                              <div className="absolute z-50 w-full mt-1 bg-dark border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filterList(areasList, (a) => requireString(fieldsOf(a).name).toLowerCase().includes(requireString(areaSearch).toLowerCase()))
                                  .map((a) => (
                                    <div key={idKey(a)} onClick={() => handleAreaSelect(a)} className="px-4 py-3 hover:bg-secondary/10 cursor-pointer text-sm">
                                      {nodeOf(fieldsOf(a).name)}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className={labelClass}>Thana </label>
                            <input type="text" name="thana" placeholder="Enter Your Thana" value={inputValue(form.thana)} readOnly className={inputClass + " bg-gray-100"} />
                          </div>
                          <div>
                            <label className={labelClass}>Postcode </label>
                            <input type="text" name="postcode" placeholder="Enter Your Postcode" value={inputValue(form.postcode)} readOnly className={inputClass + " bg-gray-100"} />
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Street Address *</label>
                          <input type="text" name="street" placeholder="Street Address" value={form.street} onChange={handleChange} className={inputClass} />
                        </div>
                      </div>
                      <div className="bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm">
                        <div className="flex gap-1">
                          <label className={labelClass}>note</label> <span className="capitalize text-[11px] tracking-widest  text-gray-400">(optional)</span>
                        </div>
                        <textarea
                          name="note"
                          id="note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full min-h-25 lg:min-h-30 border border-gray-100 resize-none outline-0 rounded-2xl p-4 text-sm text-gray-700"
                          placeholder="Write a note..."
                        ></textarea>
                      </div>
                    </>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer group px-2">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 accent-secondary rounded" />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      I agree to the <span className="text-secondary underline">Terms and Conditions</span>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={placingOrder || cartItems.length === 0 || !agreed || (user ? !rec(selectedAddr)?.id : !isGuestEmailValid || !district || !area || !form.fullName.trim() || !form.street.trim())}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all ${
                      cartItems.length === 0 || !agreed || (user ? !rec(selectedAddr)?.id : !isGuestEmailValid || !district || !area || !form.fullName.trim() || !form.street.trim())
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-secondary hover:bg-[#15a084]"
                    }`}
                  >
                    {placingOrder ? "Placing order…" : <>Place Order — ৳{payOption === "booking" ? bookingTotal.toLocaleString() : totalAmount.toLocaleString()}</>}
                  </button>
                </div>

                <div className="lg:flex-5 flex flex-col gap-6">
                  <div className="bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm order-2 lg:order-1">
                    <p className={labelClass}>Apply Coupon</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={inputValue(couponCode)}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          if (couponApplied) handleRemoveCoupon();
                        }}
                        disabled={couponApplied}
                        className={`${inputClass} flex-1 bg-dark ${couponApplied ? "opacity-60" : ""}`}
                      />
                      {couponApplied ? (
                        <button type="button" onClick={handleRemoveCoupon} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 flex items-center gap-1">
                          <X size={14} /> Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !requireString(couponCode).trim()}
                          className="px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-[#15a084] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {couponLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                          Apply
                        </button>
                      )}
                    </div>
                    {couponApplied && (
                      <p className="mt-2 text-sm text-green-600 font-medium">
                        ✓ Coupon applied
                        {user && discount > 0 ? ` — ৳${discount.toLocaleString()} off` : ""}
                      </p>
                    )}
                    {nodeOf(couponError && <p className="mt-2 text-sm text-red-500">{nodeOf(couponError)}</p>)}
                  </div>
                  <div className="lg:sticky lg:top-6 bg-dark rounded-2xl p-7 border border-gray-100 shadow-sm order-1 lg:order-2">
                    <p className={labelClass}>Order Summary</p>

                    <div className="space-y-4 mt-4">
                      {loading ? (
                        <div className="py-10 flex justify-center">
                          <Loader2 className="animate-spin text-secondary" />
                        </div>
                      ) : cartItems.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">No items in order.</div>
                      ) : (
                        cartItems.map((item) => {
                          const isBeingDeleted = String(deletingId) === String(item.variantId);

                          if (isBeingDeleted) return null;

                          const itemCareAmount = Number(item.tekzoCareAmount ?? item.tekzo_care_amount ?? 0);

                          return (
                            <div key={keyFrom(item.variantId)}>
                              {/* Product row */}
                              <div className="flex gap-4 pb-4 border-b border-gray-50 relative">
                                <Image
                                  src={str(rec(itemOpt(rec(item.product)?.images, 0))?.image_path || rec(item.product)?.product_image || "/placeholder.jpg") ?? ""}
                                  alt="p"
                                  width={55}
                                  height={55}
                                  className="rounded-lg object-cover border border-gray-50"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{nodeOf(rec(item.product)?.product_name)}</h4>
                                    <button type="button" onClick={() => handleDeleteItem(item.variantId)} disabled={isDeleting} className="text-gray-400 hover:text-red-500 disabled:opacity-50">
                                      <X size={16} />
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-gray-600 font-medium uppercase mt-0.5">{nodeOf(rec(item.variant)?.attribute_value)}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-dark shadow-sm">
                                      <button
                                        type="button"
                                        onClick={() => handleChangeQty(item.variantId, -1)}
                                        disabled={Boolean(item.pre_owned_id) || Number(item.quantity || 1) <= 1}
                                        className={`px-2.5 py-1 text-sm font-medium transition-colors duration-150 select-none ${
                                          item.pre_owned_id || Number(item.quantity || 1) <= 1
                                            ? "text-gray-300 bg-gray-50/50 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50 active:bg-gray-100 hover:text-gray-700"
                                        }`}
                                      >
                                        —
                                      </button>
                                      <div className="px-3 py-1 text-sm font-semibold text-gray-800 min-w-8 text-center bg-gray-50/30 select-none border-x border-gray-100 tabular-nums">
                                        {nodeOf(item.quantity || 1)}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleChangeQty(item.variantId, 1)}
                                        disabled={Boolean(item.pre_owned_id) || Number(item.quantity || 1) >= 10}
                                        className={`px-2.5 py-1 text-sm font-medium transition-colors duration-150 select-none ${
                                          item.pre_owned_id || Number(item.quantity || 1) >= 10
                                            ? "text-gray-300 bg-gray-50/50 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50 active:bg-gray-100 hover:text-gray-700"
                                        }`}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <span className="ml-auto font-bold text-gray-900">৳{(Number(rec(item.variant)?.final_price || 0) * Number(item.quantity)).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Gift for this item */}
                              {nodeOf(item.giftId && item.giftProductName && (
                                <div className="flex gap-4 pb-4 border-b border-gray-50 relative">
                                  <Image src={str(item.giftProductImage || "/placeholder.jpg") ?? ""} alt="gift" width={55} height={55} className="rounded-lg object-cover border border-gray-50" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{nodeOf(item.giftProductName)}</h4>
                                    <p className="text-[10px] text-white bg-secondary inline-block px-2 py-0.5 rounded-full font-medium uppercase mt-0.5">GIFT</p>
                                    <div className="flex items-center mt-0.5">
                                      <span className="ml-auto text-xs font-bold text-gray-900">FREE</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Care for this item */}
                              {nodeOf(item.tekzoCareId && itemCareAmount > 0 && (
                                <div className="flex gap-4 pb-4 border-b border-gray-50 relative">
                                  <div className="flex justify-center items-center shrink-0 w-[55px] h-[55px]">
                                    <Image src="/product-details/tekzo-care.svg" alt="Tekzo Care" width={55} height={55} className="object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{nodeOf(item.tekzoCarePlanName || "Tekzo Care")}</h4>
                                    <div className="flex items-center mt-0.5">
                                      <span className="ml-auto text-xs font-bold text-gray-900">৳{itemCareAmount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span className="text-gray-900 font-medium">৳{subtotal.toLocaleString()}</span>
                      </div>
                      {cartItems.length > 0 && careTotal > 0 ? (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Tekzo Care</span>
                          <span className="text-gray-900 font-medium">৳{careTotal.toLocaleString()}</span>
                        </div>
                      ) : null}
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-red-500">
                          <span>Discount {couponCode ? `(${String(couponCode)})` : ""}</span>
                          <span className="font-medium">-৳{discount.toLocaleString()}</span>
                        </div>
                      )}
                      {!user && couponApplied && discount === 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Coupon ({nodeOf(couponCode)})</span>
                          <span className="font-medium">Applied ✓</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        {shippingCharge > 0 ? <span className="text-gray-900 font-medium">৳{shippingCharge.toLocaleString()}</span> : <span className="text-green-500 font-bold">0</span>}
                      </div>
                      <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                        <span>Grand Total</span>
                        <span className="text-secondary">৳{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
