"use client";

import { useState, useEffect, useRef } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import Link from "next/link";
import { fireCartRemoved, fireCartAdded } from "@/context/CounterContext";
import {
  FiShoppingBag,
  FiTrash2,
  FiArrowRight,
  FiCheck,
  FiShield,
  FiGift,
} from "react-icons/fi";

// --- Helpers ---
function formatBDT(amount) {
  return `৳${Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

function mapCartItem(item) {
  const mrp = item.maxRetailPrice ?? 0;
  const discountType = item.discountType ?? "none";
  const discountAmount = item.discountAmount ?? 0;

  let discountedPrice = mrp;
  if (discountType === "percent" && discountAmount > 0) {
    discountedPrice = mrp - (mrp * discountAmount) / 100;
  } else if (discountType === "fixed" && discountAmount > 0) {
    discountedPrice = mrp - discountAmount;
  }

  const flatDiscount = mrp - discountedPrice;

  return {
    id: item.id,
    name: item.product?.name || "Unknown Product",
    category: item.category?.name || "",
    brand: item.brand?.name || "",
    image: item.product?.image || "",
    price: mrp,
    discountedPrice,
    flatDiscount,
    quantity: item.quantity ?? 1,
    selected: item.isSelect === true || item.isSelect === 1,
    discountType,
    isPreOwned: item?.isPreOwned,
    discountAmount,
    total: item.total ?? discountedPrice * (item.quantity ?? 1),
    variants: item.variant || [],
    giftProduct: item.giftProduct || null,
    productCare: item.productCare || null,
  };
}

// --- Sub-components ---
function QuantityButton({ onClick, label, preOwned }) {
  return (
    <>
      {preOwned ? (
        <button
          title="Pre-owned items are limited to 1 per order"
          disabled={true}
          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {label}
        </button>
      ) : (
        <button
          onClick={onClick}
          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors font-bold text-xs cursor-pointer active:scale-95"
        >
          {label}
        </button>
      )}
    </>
  );
}

function VariantBadges({ variants }) {
  if (!variants || variants.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {variants.map((v) => (
        <span
          key={v.id}
          className="text-[10px] bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
        >
          {v.name}: <span className="font-bold text-slate-900 dark:text-white">{v.value}</span>
        </span>
      ))}
    </div>
  );
}

function ProductCard({ product, onRemove, onQuantityChange, onSelect }) {
  return (
    <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-white/15">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
          <button
            onClick={() => onSelect(product.id)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                product.selected
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-300 dark:border-white/20 group-hover:border-slate-400"
              }`}
            >
              {product.selected && <FiCheck size={12} />}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.selected ? "Selected for checkout" : "Select item"}
            </span>
          </button>
          <button
            onClick={() => onRemove(product.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove from bag"
          >
            <FiTrash2 size={15} />
          </button>
        </div>

        {/* Product Image */}
        <div className="bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-center h-48 p-4 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-40 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
          />
          {product.isPreOwned && (
            <span className="absolute top-3 left-3 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Pre-Owned
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {product.category}
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <VariantBadges variants={product.variants} />
        </div>
      </div>

      {/* Price & Quantity */}
      <div className="p-5 pt-0 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-white/[0.06]">
          <div>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {formatBDT(product.discountedPrice)}
            </span>
            {product.flatDiscount > 0 && (
              <span className="ml-2 text-xs text-slate-400 line-through">
                {formatBDT(product.price)}
              </span>
            )}
          </div>

          {/* Qty controls */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-xl px-2 py-1">
            <QuantityButton
              label="−"
              onClick={() => onQuantityChange(product.id, -1)}
              preOwned={product?.isPreOwned}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-5 text-center">
              {product.quantity}
            </span>
            <QuantityButton
              label="+"
              onClick={() => onQuantityChange(product.id, 1)}
              preOwned={product?.isPreOwned}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ products }) {
  const selectedProducts = products.filter((p) => p.selected);

  const subtotal = selectedProducts.reduce(
    (sum, p) => sum + p.discountedPrice * p.quantity,
    0,
  );

  const giftItems = selectedProducts
    .filter((p) => p.giftProduct)
    .map((p) => ({ ...p.giftProduct, quantity: p.quantity }));

  const careItems = selectedProducts.filter((p) => p.productCare);
  const totalCareCost = careItems.reduce((sum, p) => {
    const carePercentage = parseFloat(p.productCare?.value || 0);
    return sum + (carePercentage / 100) * p.price * p.quantity;
  }, 0);

  const computedGrandTotal = subtotal + totalCareCost;

  return (
    <div className="space-y-4 w-full">
      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Order Summary
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {selectedProducts.length} item{selectedProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid grid-cols-4 px-6 py-3 bg-slate-50/80 dark:bg-white/[0.02] text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="col-span-2">Product</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/[0.04] max-h-[360px] overflow-y-auto">
          {selectedProducts.length === 0 ? (
            <div className="px-6 py-8 text-xs text-slate-400 dark:text-slate-500 text-center">
              Select items in your bag to review total and checkout
            </div>
          ) : (
            <>
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-4 px-6 py-3.5 items-center"
                >
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {product.name}
                    </p>
                    {product.variants?.[0] && (
                      <p className="text-[11px] text-slate-400">
                        {product.variants[0].value}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
                    ×{product.quantity}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white text-right">
                    {formatBDT(product.discountedPrice * product.quantity)}
                  </span>
                </div>
              ))}

              {giftItems.length > 0 && (
                <>
                  {giftItems.map((gift, idx) => (
                    <div
                      key={`gift-${idx}`}
                      className="grid grid-cols-4 px-6 py-3 items-center bg-emerald-500/5"
                    >
                      <div className="col-span-2 flex items-center gap-1.5">
                        <FiGift className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1">
                          {gift.product_name || "Free Gift"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 text-center">×1</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        FREE
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Items Subtotal</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatBDT(subtotal)}
          </span>
        </div>

        {/* Product Care Items */}
        {careItems.length > 0 && (
          <>
            {careItems.map((item, idx) => {
              const carePercentage = parseFloat(item.productCare?.value || 0);
              const careCostPerUnit = (carePercentage / 100) * item.price;
              const careCostForQuantity = careCostPerUnit * item.quantity;
              return (
                <div
                  key={`care-${idx}`}
                  className="px-6 py-2.5 border-t border-slate-100 dark:border-white/[0.06] bg-sky-500/5 text-xs flex justify-between items-center"
                >
                  <span className="font-semibold text-sky-600 dark:text-sky-400 inline-flex items-center gap-1">
                    <FiShield className="w-3.5 h-3.5" />
                    {item.productCare?.name || "Care Plan"}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    +{formatBDT(careCostForQuantity)}
                  </span>
                </div>
              );
            })}
          </>
        )}

        {/* Grand Total */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02]">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Grand Total
          </span>
          <span className="text-base font-black text-sky-600 dark:text-sky-400">
            {formatBDT(computedGrandTotal)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <FiArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-white/5" />
      <div className="h-48 bg-slate-100 dark:bg-white/5" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
      </div>
      <div className="p-5 pt-0 space-y-3">
        <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-1/3" />
      </div>
    </div>
  );
}

// --- Main Component ---
export default function ShoppingBag() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await clientFetchAPI("/customer/carts", "GET");

        const payload = res?.data ?? {};
        const items = (payload.cartItems || []).map(mapCartItem);
        setProducts(items);
      } catch (err) {
        setError(err.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemove = async (id) => {
    const snapshot = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fireCartRemoved();
    try {
      await clientFetchAPI(`/customer/carts/${id}`, "DELETE");
    } catch (err) {
      setProducts(snapshot);
      fireCartAdded();
      setError("Failed to remove item. Please try again.");
    }
  };

  const handleSelect = async (id) => {
    const item = products.find((p) => p.id === id);
    if (!item) return;

    const newSelected = !item.selected;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: newSelected } : p)),
    );

    try {
      await clientFetchAPI("/customer/carts/item/select-toggle", "PATCH", {
        cart_item_id: id,
        is_select: newSelected,
      });
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, selected: item.selected } : p)),
      );
      setError("Failed to update selection. Please try again.");
    }
  };

  const qtyTimers = useRef({});

  const handleQuantityChange = (id, delta) => {
    let newQty;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        newQty = Math.min(10, Math.max(1, p.quantity + delta));
        return { ...p, quantity: newQty };
      }),
    );

    clearTimeout(qtyTimers.current[id]);
    qtyTimers.current[id] = setTimeout(async () => {
      setProducts((prev) => {
        const item = prev.find((p) => p.id === id);
        if (!item) return prev;

        clientFetchAPI(`/customer/carts/${id}`, "PATCH", {
          quantity: item.quantity,
        }).catch(() => {
          setError("Failed to update quantity. Please try again.");
        });

        return prev;
      });
    }, 500);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      <title>My Shopping Bag - Tekzo Dashboard</title>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Shopping Bag
            </h1>
            {!loading && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({products.length} item{products.length !== 1 ? "s" : ""})
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review selected gadgets and proceed to secure checkout
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl px-6 py-4 text-rose-600 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Product Cards */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-12 sm:p-16 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-4">
                <FiShoppingBag size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Your Bag is Empty
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-6 leading-relaxed">
                Explore the store for authentic smartphones, smartwatches, and accessories.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemove}
                  onQuantityChange={handleQuantityChange}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {products.length > 0 && (
          <div className="w-full lg:w-[380px] shrink-0 sticky top-20">
            <OrderSummary products={products} />
          </div>
        )}
      </div>
    </div>
  );
}
