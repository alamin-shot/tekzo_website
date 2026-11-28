"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiTag, FiShoppingBag, FiCheck, FiGift } from "react-icons/fi";
import type { FormEvent } from "react";
import type { CouponClaimMessage } from "@/types/props/dashboard";

export default function Coupons() {
  const [inputCode, setInputCode] = useState("");
  const [claimMsg, setClaimMsg] = useState<CouponClaimMessage | null>(null);

  const handleClaim = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setClaimMsg({
      type: "success",
      text: `Coupon "${inputCode.trim().toUpperCase()}" applied to your account!`,
    });
    setInputCode("");
    setTimeout(() => setClaimMsg(null), 4000);
  };

  return (
    <div className="w-full space-y-6">
      <title>Coupons & Discounts - Tekzo Dashboard</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Collect promotional vouchers and save on your next gadget orders
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <FiShoppingBag size={14} />
          <span>Shop Now</span>
        </Link>
      </div>

      {/* Claim Voucher Bar */}
      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-5 sm:p-6">
        <form onSubmit={handleClaim} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FiTag size={16} />
            </div>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter voucher or promo code..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto flex-shrink-0 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs uppercase tracking-widest px-7 py-3 rounded-2xl transition-all cursor-pointer"
          >
            Claim
          </button>
        </form>

        {claimMsg && (
          <div className="mt-3 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <FiCheck size={14} /> {claimMsg.text}
          </div>
        )}
      </div>

      {/* Empty Vouchers State */}
      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <FiGift size={22} />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          No coupons available yet
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          There are no active vouchers right now. Check back soon for new deals or enter a promo code above if you have one.
        </p>
      </div>
    </div>
  );
}