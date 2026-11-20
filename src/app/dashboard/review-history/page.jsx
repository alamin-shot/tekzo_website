"use client";

import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
import Link from "next/link";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={14} className={star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 dark:fill-white/10 text-slate-200 dark:text-white/10"} />
      ))}
    </div>
  );
}

function ScoreCard({ rating }) {
  return (
    <div className="bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12] rounded-2xl p-3.5 text-center w-full max-w-[110px] border border-emerald-500/20 shadow-sm">
      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{rating}.0</p>
      <div className="mt-1 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full py-0.5 px-2">
        <p className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">out of 5</p>
      </div>
    </div>
  );
}

function ReviewRow({ review, isLast }) {
  return (
    <div className={`group flex flex-col lg:flex-row items-stretch gap-6 py-6 transition-colors ${!isLast ? "border-b border-slate-100 dark:border-white/5" : ""}`}>
      {/* 1. Main Content Section */}
      <div className="flex-1 flex flex-col gap-3.5">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 flex-shrink-0 shadow-sm group-hover:border-emerald-500/30 transition-colors">
            <Image src={review.product.image} alt={review.product.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" sizes="64px" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {review.product.name}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/10 w-fit">
              {review.product.attribute || "Standard Edition"}
            </span>
          </div>
        </div>

        <StarRating rating={review.rating} />

        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Feedback</p>
          <div className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 shadow-sm">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">&quot;{review.comment || "No written comment provided."}&quot;</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-px h-px lg:h-auto bg-slate-100 dark:border-white/5" />

      {/* 2. Side Scores & Media */}
      <div className="flex divide-x divide-slate-100 dark:divide-white/5 lg:divide-x-0 gap-4 lg:gap-0">
        <div className="flex-1 lg:w-[150px] flex flex-col gap-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rating Score</p>
          <ScoreCard rating={review.rating} />
        </div>

        <div className="flex-1 lg:w-[150px] pl-4 lg:pl-0 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attached Media</p>
          {review.review_image ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm group/img cursor-pointer">
              <Image src={review.review_image} alt="Attached photo" fill className="object-cover group-hover/img:scale-105 transition-transform" sizes="64px" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.01]">
              <ImageIcon size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">None</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton
function SkeletonRow({ isLast }) {
  return (
    <div className={`flex flex-col lg:flex-row items-stretch gap-6 py-6 ${!isLast ? "border-b border-slate-100 dark:border-white/5" : ""}`}>
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-36 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-4 h-4 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-16 w-full bg-slate-200 dark:bg-white/10 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="w-full lg:w-px h-px lg:h-auto bg-slate-100 dark:bg-white/5" />

      <div className="flex divide-x divide-slate-100 dark:divide-white/5 lg:divide-x-0 gap-4 lg:gap-0">
        <div className="flex-1 lg:w-[150px] flex flex-col gap-3">
          <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-14 w-24 bg-slate-200 dark:bg-white/10 rounded-2xl animate-pulse" />
        </div>
        <div className="flex-1 lg:w-[150px] pl-4 lg:pl-0 flex flex-col gap-3">
          <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function MyReviewHistory() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await clientFetchAPI(`/customer/reviews?page=${currentPage}`, "GET");
        setReviews(res?.data?.data ?? []);
        setTotalPages(res?.data?.last_page ?? 1);
      } catch (err) {
        setError(err.message || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [currentPage]);

  return (
    <div className="w-full space-y-6">
      <title>Review History - Tekzo Dashboard</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Review History</h1>
            {!loading && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">Past feedback, product ratings, and uploaded photos</p>
        </div>

        <Link
          href="/dashboard/to-reviews"
          className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          View Pending Reviews →
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verified Purchase Feedback</p>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* List */}
        <div className="px-6 pb-4">
          {loading && [1, 2].map((i) => <SkeletonRow key={i} isLast={i === 2} />)}

          {error && (
            <div className="py-4 px-6 text-center text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-2xl my-4 border border-rose-200 dark:border-rose-500/20">{error}</div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-3 shadow-sm">
                <Star size={26} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No reviews submitted yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Once you rate and review your delivered orders, your feedback history will appear here.</p>
              <Link href="/dashboard/to-reviews" className="inline-block mt-4 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline">
                Check Pending Reviews
              </Link>
            </div>
          )}

          {!loading && !error && reviews.map((review, index) => <ReviewRow key={review.id} review={review} isLast={index === reviews.length - 1} />)}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end items-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === currentPage
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
