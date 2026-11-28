"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductSidebarProps } from "@/types/props/product";
import type { GuestCartItem } from "@/types/cart";
import { incrementOrAddGuestItem, readGuestCartList, writeGuestCart } from "@/lib/guestCart";
import { fieldsOf, itemAt, itemOpt, lengthStrict, mapOpt, rec } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";
import { useRouter } from "next/navigation";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { getAuthUser } from "@/utils/getAuthUser";
import { fireCartAdded } from "@/context/CounterContext";

// Icons
const IconSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <circle cx="6" cy="6" r="4.5" />
    <path d="M9.5 9.5l3 3" />
  </svg>
);

const SPECS = [
  { label: "Display", value: '6.7" OLED' },
  { label: "Chip", value: "A17 Pro" },
  { label: "Camera", value: "48 MP Triple" },
  { label: "Battery", value: "4,422 mAh" },
  { label: "OS", value: "iOS 17" },
  { label: "Build", value: "Titanium Frame" },
];

export default function ProductSidebar({ products }: ProductSidebarProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<unknown>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const quantity = 1;

  // Set first product as selected by default
  useState(() => {
    if (products && Number(lengthStrict(products)) > 0) {
      setSelectedProduct(itemAt(products, 0));
    }
  });

  const saveToLocalCart = (quantity = 1) => {
    if (!selectedProduct) return;
    const cart = readGuestCartList("findIndex");
    const sp = fieldsOf(selectedProduct);
    // Use product.id as slug if slug doesn't exist (for pre-owned products)
    const slug = sp.slug || (sp.id === null || sp.id === undefined ? undefined : String(sp.id));
    const matchesItem = (item: unknown) => fieldsOf(item).slug === slug && fieldsOf(item).variantId === sp.id;
    incrementOrAddGuestItem(cart, matchesItem, quantity, (): GuestCartItem => ({
}));
    writeGuestCart(cart);
  };

  const handleBuyNow = async () => {
    if (buyingNow || !selectedProduct) return;
    setBuyingNow(true);

    try {
      const user = await getAuthUser();
      if (user) {
        await clientFetchAPI(`/customer/carts`, "POST", {
          variant_id: fieldsOf(selectedProduct).id,
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
    if (addingToCart || isAdded || !selectedProduct) return;
    setAddingToCart(true);

    try {
      const user = await getAuthUser();
      if (user) {
        await clientFetchAPI(`/customer/carts`, "POST", {
          variant_id: fieldsOf(selectedProduct).id,
          quantity,
        });
        setIsAdded(true);
        fireCartAdded();
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        // F1: guests add to the guest cart instead of being sent to /login
        saveToLocalCart(1);
        setIsAdded(true);
        fireCartAdded();
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (err) {
      console.error("Add to Cart Error:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (!products || lengthStrict(products) === 0) {
    return (
      <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0 lg:border-r border-gray-100 sticky top-0 left-0">
        <div className="lg:p-5 lg:pr-7">
          <div className="text-center py-10">
            <p className="text-gray-500">Loading product information...</p>
          </div>
        </div>
      </aside>
    );
  }

  const product = rec(itemAt(products, 0));
  const isOutOfStock = product?.stock === false || product?.stock === 0;
  return (
    <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0  lg:border-r border-gray-100 sticky top-0 left-0">
      <div className="lg:p-5 lg:pr-7">
        <h1 className="text-2xl xl:text-4xl font-extrabold text-gray-900 leading-[1.1] mb-5">
          {nodeOf(product?.product_name || "iPhone 15 Pro Max")}
        </h1>

        {/* Main photo */}
        <div className="relative bg-gray-50 border border-gray-100 rounded-2xl aspect-4/5 overflow-hidden mb-3 group">
          <span className="absolute top-3 left-3 z-10 bg-secondary text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">
            Pre-Owned
          </span>
          <Image
            src={str(product?.product_image || "/placeholder.jpg") ?? ""}
            alt={str(product?.product_name || "Product") ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {mapOpt(product?.specifications, (section) => {
            // `section.group_values?.[0]` (throws for a null section, as before)
            const firstRaw = itemOpt(fieldsOf(section).group_values, 0);

            if (!firstRaw) return null;
            const firstItem = rec(firstRaw);

            return (
              <div
                key={idKey(section)}
                className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center cursor-pointer"
                title={str(firstItem?.details)}
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">
                  {nodeOf(firstItem?.name)}
                </span>
                <span className="text-[13px] font-bold text-gray-700 truncate ">
                  {nodeOf(firstItem?.details)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-gray-100" />
      </div>
    </aside>
  );
}
