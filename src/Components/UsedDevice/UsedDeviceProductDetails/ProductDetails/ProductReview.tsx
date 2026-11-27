"use client";

import React, { useEffect, useState } from "react";
import {
  ListFilter,
  ArrowUpDown,
  MessageSquareOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import type { ProductReviewProps, StarRatingProps } from "@/types/props/product";
import { fieldsOf, filterList, firstOf, itemAt, lengthOpt, mapList, rec, spreadList, toDateInput, valuesOf } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

// `new Date(x)` for a raw value; `a - b` on Dates subtracts their times.
const timeOf = (value: unknown): number => new Date(toDateInput(value)).getTime();
import { getProductReviews } from "@/lib/api";

const StarRating = ({ rating, size = "text-sm" }: StarRatingProps) => (
  <div className={`flex text-primary ${size}`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Number(rating) ? "opacity-100" : "opacity-20"}>
        ★
      </span>
    ))}
  </div>
);

const ProductReview = ({ slug }: ProductReviewProps) => {
  // the fetched payload (raw); `data?.x` reads go through rec
  const [reviewData, setData] = useState<unknown>(null);
  const data = rec(reviewData);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  const [filterStar, setFilterStar] = useState(0);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const perPage = 5;

  useEffect(() => {
    if (!slug) return;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const reviews = await getProductReviews(slug);
        setData(reviews);
      } catch (e) {
        console.error("Failed to fetch reviews", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [slug]);

  const average = data?.average ?? 0;
  const total = data?.total ?? 0;
  const stars = data?.stars ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const allReviews = rec(data?.reviews)?.data ?? [];

  // Filter by star
  const filtered =
    filterStar > 0
      ? filterList(allReviews, (r) => fieldsOf(r).rating === filterStar)
      : allReviews;

  // Sort
  const sorted = spreadList(filtered).sort((a, b) => {
    if (sortBy === "highest") return Number(fieldsOf(b).rating) - Number(fieldsOf(a).rating);
    if (sortBy === "lowest") return Number(fieldsOf(a).rating) - Number(fieldsOf(b).rating);
    return timeOf(fieldsOf(b).created_at) - timeOf(fieldsOf(a).created_at); // latest
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const formatDate = (dateStr: unknown) => {
    const d = new Date(toDateInput(dateStr));
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const maxStarCount = Math.max(...valuesOf(stars).map(Number), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-gray-800 rounded-[32px] bg-2 overflow-hidden">
      {/* TOP SUMMARY CARD */}
      <div className="p-4  ">
        <div className="bg-white p-4 lg:p-8 rounded-[26px] flex flex-col md:flex-row justify-between items-center shadow-sm border border-gray-100 ">
          <div className=" flex flex-col items-center md:items-start">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">
                {Number(average).toFixed(1)}
              </span>
              <span className="text-gray-400 text-2xl font-medium">/ 5</span>
              <span className="ml-4 text-gray-400 text-sm">
                {nodeOf(total)} Ratings
              </span>
            </div>
            <StarRating rating={Math.round(Number(average))} size="text-2xl" />
          </div>

          <div className="w-full md:w-72 space-y-3 mt-8 md:mt-0">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = itemAt(stars, s) ?? 0;
              const pct = Math.round((Number(count) / maxStarCount) * 100);
              return (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStar(filterStar === s ? 0 : s);
                    setPage(1);
                  }}
                  className={`flex items-center gap-3 text-xs w-full text-left transition-opacity ${filterStar > 0 && filterStar !== s ? "opacity-40" : ""}`}
                >
                  <StarRating rating={s} size="text-sm" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-5 text-right font-medium text-gray-600">
                    {nodeOf(count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="overflow-hidden  p-4 lg:p-8 shadow-sm lg:border lg:border-gray-100">
        {/* Header and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="text-xl font-bold text-gray-700">
            Product Reviews
            {filterStar > 0 && (
              <span className="ml-2 text-sm font-normal text-primary">
                ({filterStar} star)
              </span>
            )}
          </h2>
          <div className="flex gap-3 relative">
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowFilterMenu(false);
                }}
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <ArrowUpDown size={16} className="text-gray-400" />
                <span>
                  Sort:{" "}
                  <span className="font-bold text-gray-900 capitalize">
                    {sortBy}
                  </span>
                </span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                  {["latest", "highest", "lowest"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setShowSortMenu(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-gray-50 ${sortBy === opt ? "font-bold text-primary" : "text-gray-700"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu);
                  setShowSortMenu(false);
                }}
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <ListFilter size={16} className="text-gray-400" />
                <span>
                  Filter:{" "}
                  <span className="font-bold text-gray-900">
                    {filterStar > 0 ? `${filterStar} Star` : "All"}
                  </span>
                </span>
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => {
                      setFilterStar(0);
                      setShowFilterMenu(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${filterStar === 0 ? "font-bold text-primary" : "text-gray-700"}`}
                  >
                    All Stars
                  </button>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilterStar(s);
                        setShowFilterMenu(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${filterStar === s ? "font-bold text-primary" : "text-gray-700"}`}
                    >
                      {s} Star
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="space-y-8">
              {paginated.map((entry, index) => {
                // `review.x` — the key read already threw for a null review
                const review = fieldsOf(entry);
                const customer = rec(review.customer);
                return (
                <div
                  key={idKey(entry)}
                  className={`${index !== 0 ? "border-t border-gray-100 pt-8" : ""}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      {customer?.profile_picture ? (
                        <Image
                          src={str(customer.profile_picture) ?? ""}
                          alt={str(customer.name) ?? ""}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            if (e.target instanceof HTMLImageElement) e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-gray-500 font-bold text-lg">
                          {nodeOf((customer?.name === null || customer?.name === undefined ? undefined : firstOf(customer.name)) ?? "?")}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {nodeOf(customer?.name ?? "Anonymous")}
                        </h3>
                        <StarRating rating={review.rating} size="text-sm" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-tighter">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="bg-green-500 rounded-full p-0.5">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                      Verified Purchase
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-[1.8] mb-5 max-w-3xl">
                    {nodeOf(review.comment)}
                  </p>

                  {/* Attachments */}
                  {Number(lengthOpt(customer?.attachments)) > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {mapList(customer?.attachments, (att, i) => (
                        <div
                          key={i}
                          className="w-24 h-24 rounded-2xl border border-gray-100 overflow-hidden"
                        >
                          <Image
                            src={str(att) ?? ""}
                            alt="review attachment"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        page === p
                          ? "bg-primary text-white shadow-lg shadow-orange-200"
                          : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquareOff size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No reviews yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mt-2">
              {filterStar > 0
                ? `No ${filterStar}-star reviews found.`
                : "Be the first to share your thoughts about this product!"}
            </p>
            {filterStar > 0 && (
              <button
                onClick={() => setFilterStar(0)}
                className="mt-4 px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReview;
