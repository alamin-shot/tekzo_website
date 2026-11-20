"use client";

import { useState, useEffect } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import {
  fireCartAdded,
  fireWishlistAdded,
  fireWishlistRemoved,
} from "@/context/CounterContext";
import { FiHeart, FiTrash2, FiShoppingCart } from "react-icons/fi";
import Link from "next/link";

// --- Helpers ---
function formatBDT(amount) {
  return `৳ ${Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
  })}`;
}

function mapWishlistItem(item) {
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

  const variantId =
    item.variant_id ??
    item.variant?.[0]?.variant_id ??
    item.variant?.[0]?.id ??
    null;

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
    discountType,
    discountAmount,
    variants: item.variant || [],
    variantId,
  };
}

// --- Sub-components ---
function VariantBadges({ variants }) {
  if (!variants || variants.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {variants.map((v) => (
        <span
          key={v.id}
          className="text-[10px] bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium border border-slate-200/60 dark:border-white/5"
        >
          {v.name}: <span className="font-bold text-slate-900 dark:text-white">{v.value}</span>
        </span>
      ))}
    </div>
  );
}

function WishlistCard({ product, onRemove, onAddToCart }) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartError, setCartError] = useState(null);

  const handleAddToCart = async () => {
    if (addingToCart || cartAdded) return;
    setCartError(null);
    setAddingToCart(true);
    try {
      await onAddToCart(product);
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2000);
    } catch (err) {
      setCartError(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
            {product.brand || product.category || "Wishlist"}
          </span>
          <button
            onClick={() => onRemove(product.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove from wishlist"
          >
            <FiTrash2 size={15} />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative bg-gradient-to-b from-slate-50/70 to-transparent dark:from-white/[0.02] dark:to-transparent flex items-center justify-center h-52 p-6 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-40 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {product.category}
          </p>
          <VariantBadges variants={product.variants} />
        </div>
      </div>

      {/* Price & Action */}
      <div className="p-5 pt-0 space-y-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-sm font-extrabold px-3 py-1 rounded-xl">
            {formatBDT(product.discountedPrice)}
          </span>
          {product.flatDiscount > 0 && (
            <>
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                {formatBDT(product.price)}
              </span>
              <span className="text-[11px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg font-bold">
                -{product.discountType === "percent" ? `${product.discountAmount}%` : formatBDT(product.flatDiscount)}
              </span>
            </>
          )}
        </div>

        {cartError && (
          <p className="text-xs text-rose-500 text-center font-medium bg-rose-50 dark:bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-200 dark:border-rose-500/20">
            {cartError}
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={addingToCart || cartAdded}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 transition-all cursor-pointer"
        >
          <FiShoppingCart size={15} />
          <span>
            {addingToCart
              ? "Adding to Bag..."
              : cartAdded
                ? "Added to Bag! ✓"
                : "Add to Bag"}
          </span>
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-white/5" />
      <div className="h-52 bg-slate-50 dark:bg-white/[0.02]" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg w-1/2" />
      </div>
      <div className="p-5 pt-0 space-y-3">
        <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-1/3" />
        <div className="h-12 bg-slate-200 dark:bg-white/10 rounded-xl w-full" />
      </div>
    </div>
  );
}

// --- Main Page ---
export default function MyWishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await clientFetchAPI("/customer/wishlists", "GET");

      const payload = res?.data ?? res ?? {};
      const rawItems =
        payload.wishlists ??
        payload.wishlistItems ??
        payload.cartItems ??
        payload.items ??
        payload.data ??
        (Array.isArray(payload) ? payload : []);

      setProducts(rawItems.map(mapWishlistItem));
    } catch (err) {
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    const snapshot = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fireWishlistRemoved();
    try {
      await clientFetchAPI(`/customer/wishlists/${id}`, "DELETE");
    } catch (err) {
      setProducts(snapshot);
      fireWishlistAdded();
      setError("Failed to remove item. Please try again.");
      console.error("[Wishlist] remove error:", err);
    }
  };

  const handleAddToCart = async (product) => {
    if (!product.variantId) {
      throw new Error("Variant not found for this item");
    }
    await clientFetchAPI("/customer/carts", "POST", {
      variant_id: product.variantId,
      quantity: product.quantity,
    });
    fireCartAdded();
  };

  return (
    <div className="w-full space-y-6">
      <title>My Wishlist - Tekzo Dashboard</title>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Wishlist
            </h1>
            {!loading && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {products.length} {products.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Saved gadgets and accessories you are keeping an eye on
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          + Continue Browsing
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl px-6 py-4 text-rose-600 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 p-12 sm:p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
            <FiHeart size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto mb-6">
            Explore our featured gadgets and save the ones you love for fast tracking and checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-7 py-3.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
