"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiTag, FiShoppingBag, FiCopy, FiCheck, FiGift, FiClock } from "react-icons/fi";
import type { FormEvent } from "react";
import type { CouponClaimMessage } from "@/types/props/dashboard";

const AVAILABLE_VOUCHERS = [
  {
    id: "welcome-10",
    code: "WELCOME10",
    discount: "10% OFF",
    title: "Welcome Gift Voucher",
    description: "Enjoy 10% off your first order with no minimum purchase requirement.",
    minSpend: "৳ 1,000",
    expiresIn: "Valid until end of month",
    category: "Storewide",
  },
  {
    id: "freeship",
    code: "FREESHIP",
    discount: "FREE SHIPPING",
    title: "Zero Delivery Fee",
    description: "Complimentary delivery inside Dhaka on any order of accessories or gadgets.",
    minSpend: "৳ 2,500",
    expiresIn: "Active",
    category: "Delivery",
  },
  {
    id: "elite-deal",
    code: "ELITE500",
    discount: "৳ 500 OFF",
    title: "Elite Member Exclusive",
    description: "Special seasonal cashback voucher for authenticated club members.",
    minSpend: "৳ 10,000",
    expiresIn: "Limited Time",
    category: "Smartphones",
  },
];

export default function Coupons() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [claimMsg, setClaimMsg] = useState<CouponClaimMessage | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaim = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setClaimMsg({ type: "success", text: `Coupon "${inputCode.trim().toUpperCase()}" applied to your account!` });
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

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AVAILABLE_VOUCHERS.map((voucher) => {
          const isCopied = copiedCode === voucher.code;
          return (
            <div
              key={voucher.id}
              className="relative group bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Decorative side notches */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold px-3 py-1 rounded-xl">
                    <FiGift size={12} /> {voucher.discount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                    {voucher.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {voucher.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {voucher.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                  <span>Min. Spend: <strong className="text-slate-700 dark:text-slate-300">{voucher.minSpend}</strong></span>
                  <span className="flex items-center gap-1">
                    <FiClock size={11} /> {voucher.expiresIn}
                  </span>
                </div>
              </div>

              {/* Dotted coupon divider */}
              <div className="relative flex items-center px-6">
                <div className="w-full border-t border-dashed border-slate-200 dark:border-white/10" />
              </div>

              {/* Code Box & Copy CTA */}
              <div className="p-6 pt-4 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="font-mono text-xs font-black tracking-wider text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                  {voucher.code}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(voucher.code)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    isCopied
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <FiCheck size={13} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
