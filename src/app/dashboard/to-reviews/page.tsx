"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, Star } from "lucide-react";
import Link from "next/link";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { errMessage, fieldsOf, isList, lengthStrict, mapList, rec } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

export default function ToReviews() {
  const [orders, setOrders] = useState<unknown>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchDeliveredProducts = async () => {
      try {
        const res = await clientFetchAPI("/customer/delivered-products", "GET");
        setOrders(rec(res)?.data ?? []);
      } catch (err) {
        setError(errMessage(err) || "Failed to load delivered products.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveredProducts();
  }, []);

  return (
    <div className="w-full space-y-6">
      <title>Pending Reviews - Tekzo Dashboard</title>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              To Review
            </h1>
            {!loading && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {nodeOf(lengthStrict(orders))} {lengthStrict(orders) === 1 ? "order" : "orders"}
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Share your feedback on delivered items to help other shoppers
          </p>
        </div>

        <Link
          href="/dashboard/review-history"
          className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          View Review History →
        </Link>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Table Header: Visible only on Desktop */}
        <div className="hidden lg:grid grid-cols-[1fr_200px_180px] px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            Delivered Product
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            Order Invoice
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold text-right">
            Action
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {nodeOf(error && (
          <div className="m-6 p-4 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">
            {nodeOf(error)}
          </div>
        ))}

        {/* List of Orders */}
        {!loading && !error && (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {lengthStrict(orders) === 0 ? (
              <div className="p-12 sm:p-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
                  <Star size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Products Pending Review
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
                  When you receive delivered orders, they will appear here so you can share your experience and rate them.
                </p>
              </div>
            ) : (
              mapList(orders, (item) => (
                <div
                  key={idKey(item)}
                  className="group flex flex-col lg:grid lg:grid-cols-[1fr_200px_180px] items-start lg:items-center p-5 lg:px-6 lg:py-5 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors gap-4 lg:gap-0"
                >
                  {/* 1. Product Info Section */}
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 flex-shrink-0 shadow-sm group-hover:border-emerald-500/30 transition-colors">
                      <Image
                        src={str(fieldsOf(item).image) ?? ""}
                        alt={str(fieldsOf(item).product_name) ?? ""}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {nodeOf(fieldsOf(item).product_name)}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400 w-fit uppercase tracking-wider bg-slate-100 dark:bg-white/10">
                        {((attrs) => (isList(attrs) && attrs.length > 0
                          ? attrs.map((attr) => fieldsOf(attr).name).join(", ")
                          : "Standard Edition"))(fieldsOf(item).attributes)}
                      </span>
                    </div>
                  </div>

                  {/* 2. Order Number Section */}
                  <div className="flex flex-col lg:block">
                    <span className="text-[10px] uppercase text-slate-400 font-bold lg:hidden mb-1">
                      Order Invoice
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit">
                      #{nodeOf(fieldsOf(item).invoice_number)}
                    </span>
                  </div>

                  {/* 3. Action Button Section */}
                  <div className="flex justify-start lg:justify-end w-full lg:w-auto">
                    {fieldsOf(item).has_review ? (
                      <span className="inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider">
                        ✓ Reviewed
                      </span>
                    ) : (
                      <Link
                        href={`/dashboard/to-reviews/${String(rec(item)?.id)}`}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-widest shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Star size={13} fill="currentColor" />
                        <span>Write Review</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
