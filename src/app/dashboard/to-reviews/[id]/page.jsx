"use client";

import { useState, useRef, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import clientFetchAPI from "@/utils/clientFetchAPI";

export default function ReviewProductPage({ params }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const { id } = use(params);

  useEffect(() => {
    if (!id) {
      setError(
        "Product ID is missing in the route. Please check your URL or navigation.",
      );
      setProduct(null);
      return;
    }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await clientFetchAPI(
          `/customer/delivered-products/${id}`,
          "GET",
        );
        setProduct(res?.data || null);
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFileName(f.name);
    }
  };

  const handlePost = async () => {
    setError(null);
    setSuccess(false);
    if (!product) {
      setError("Product not loaded");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("order_detail_id", product.id);
      formData.append("rating", rating);
      if (feedback) formData.append("comment", feedback);

      if (file) {
        formData.append("review_image", file);
      }

      await clientFetchAPI(`/customer/reviews`, "POST", formData);
      setSuccess(true);
      setFeedback("");
      setFile(null);
      setFileName("");
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoveredRating || rating;

  const RATING_LABELS = {
    5: "Outstanding - 5 Stars",
    4: "Very Good - 4 Stars",
    3: "Average - 3 Stars",
    2: "Below Expectations - 2 Stars",
    1: "Poor - 1 Star",
  };

  return (
    <div className="w-full space-y-6">
      <title>Write a Review - Tekzo Dashboard</title>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/to-reviews"
          className="w-10 h-10 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f182c] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          title="Back to Pending Reviews"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Write a Review
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Share your rating and product photos with the community
          </p>
        </div>
      </div>

      {loading && !product && (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
          <span>✓ Review submitted successfully! Thank you for your feedback.</span>
          <Link
            href="/dashboard/review-history"
            className="underline font-extrabold uppercase tracking-wider ml-4"
          >
            View Review History →
          </Link>
        </div>
      )}

      {product && (
        <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Product Info & Rating */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-900 flex-shrink-0 shadow-sm">
                <Image
                  src={product.image}
                  alt={product.product_name}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {product.product_name}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 w-fit">
                  #{product.invoice_number || product.order_id || product.id}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400 w-fit uppercase tracking-wider bg-slate-100 dark:bg-white/10 mt-0.5">
                  {Array.isArray(product.attributes) && product.attributes.length > 0
                    ? product.attributes.map((attr) => attr.name).join(", ")
                    : "Standard Edition"}
                </span>
              </div>
            </div>

            {/* Interactive Stars */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Overall Rating
              </span>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.03] p-2 rounded-2xl border border-slate-200/60 dark:border-white/5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      size={26}
                      className={
                        star <= activeRating
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "fill-slate-200 dark:fill-white/10 text-slate-200 dark:text-white/10"
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {RATING_LABELS[activeRating] || `${activeRating} of 5 Stars`}
              </span>
            </div>
          </div>

          {/* Form: Feedback & Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Write Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="How was the build quality, speed, packaging, and overall value?"
              />
            </div>

            {/* Attach File */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Attach Product Photo (Optional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.01] h-[130px] group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 mb-1.5 transition-colors">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {fileName || "Click to upload an image"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG up to 5MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Link
              href="/dashboard/to-reviews"
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handlePost}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
